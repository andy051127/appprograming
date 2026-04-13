import os
import re
import json
import sqlite3
import requests
from datetime import datetime
from flask import Flask, request, jsonify, render_template, g
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("OPENROUTER_API_KEY")
DB_PATH = os.path.join(os.path.dirname(__file__), "favorites.db")


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_name TEXT NOT NULL UNIQUE,
                ingredients TEXT,
                steps       TEXT,
                tips        TEXT,
                cooking_time TEXT,
                difficulty  TEXT,
                saved_at    DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


init_db()
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
IMAGE_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free"
TEXT_MODEL  = "openai/gpt-oss-20b:free"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    image_data = data.get("image")

    if not image_data:
        return jsonify({"error": "이미지가 없습니다."}), 400

    prompt = (
        "이 냉장고 사진에서 보이는 모든 식재료를 한국어로 나열해줘. "
        "반드시 JSON 배열 형식으로만 반환해. "
        "예시: [\"달걀\", \"당근\", \"두부\"] "
        "설명 없이 JSON 배열만 출력해."
    )

    payload = {
        "model": IMAGE_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_data}},
                ],
            }
        ],
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            return jsonify({"error": f"AI 분석 실패 (코드: {resp.status_code})"}), 502

        content = resp.json()["choices"][0]["message"]["content"].strip()

        # JSON 배열 파싱 (```json ... ``` 형태도 처리)
        match = re.search(r"\[.*?\]", content, re.DOTALL)
        if match:
            ingredients = json.loads(match.group())
        else:
            ingredients = [item.strip(" -•·") for item in content.splitlines() if item.strip()]

        return jsonify({"ingredients": ingredients})

    except requests.Timeout:
        return jsonify({"error": "요청 시간이 초과되었습니다. 다시 시도해주세요."}), 504
    except Exception as e:
        return jsonify({"error": "이미지 분석 중 오류가 발생했습니다."}), 500


@app.route("/recipes")
def recipes_page():
    return render_template("recipes.html")


def call_text_api(prompt):
    """텍스트 모델 공통 호출 함수. 응답 문자열 반환."""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": TEXT_MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }
    resp = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"API 오류 ({resp.status_code}): {resp.text}")
    return resp.json()["choices"][0]["message"]["content"].strip()


def parse_json_from_text(text):
    """응답 텍스트에서 JSON 객체/배열 추출."""
    # ```json ... ``` 블록 우선 처리
    block = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if block:
        return json.loads(block.group(1).strip())
    # 중괄호 객체
    obj = re.search(r"\{[\s\S]*\}", text)
    if obj:
        return json.loads(obj.group())
    # 대괄호 배열
    arr = re.search(r"\[[\s\S]*\]", text)
    if arr:
        return json.loads(arr.group())
    raise ValueError("JSON을 찾을 수 없습니다.")


@app.route("/api/recipes", methods=["POST"])
def get_recipes():
    data = request.get_json()
    ingredients = data.get("ingredients", [])
    if not ingredients:
        return jsonify({"error": "재료 목록이 없습니다."}), 400

    ing_str = ", ".join(ingredients)
    prompt = f"""다음 재료로 만들 수 있는 한국 요리 레시피 3가지를 추천해줘.
재료: {ing_str}

아래 JSON 형식으로만 반환해. 설명 없이 JSON만 출력해.
{{
  "recipes": [
    {{
      "id": 1,
      "name": "요리 이름",
      "cooking_time": "15분",
      "difficulty": "쉬움",
      "available_ingredients": ["재료1", "재료2"],
      "missing_ingredients": ["재료3"],
      "description": "한 줄 설명"
    }}
  ]
}}
난이도는 반드시 쉬움/보통/어려움 중 하나로 표기해."""

    try:
        content = call_text_api(prompt)
        result = parse_json_from_text(content)

        # 재료 일치율 기준 정렬
        for r in result.get("recipes", []):
            avail = len(r.get("available_ingredients", []))
            total = avail + len(r.get("missing_ingredients", []))
            r["match_ratio"] = f"{avail}/{total}" if total else "0/0"

        result["recipes"].sort(
            key=lambda r: len(r.get("available_ingredients", [])), reverse=True
        )
        return jsonify(result)

    except requests.Timeout:
        return jsonify({"error": "요청 시간이 초과되었습니다. 다시 시도해주세요."}), 504
    except Exception as e:
        return jsonify({"error": f"레시피 추천 중 오류가 발생했습니다: {str(e)}"}), 500


@app.route("/api/recipe/detail", methods=["POST"])
def get_recipe_detail():
    data = request.get_json()
    recipe_name = data.get("recipe_name", "")
    ingredients = data.get("ingredients", [])
    if not recipe_name:
        return jsonify({"error": "레시피 이름이 없습니다."}), 400

    ing_str = ", ".join(ingredients)
    prompt = f""""{recipe_name}" 요리의 단계별 조리법을 알려줘.
보유 재료: {ing_str}

아래 JSON 형식으로만 반환해. 설명 없이 JSON만 출력해.
{{
  "recipe_name": "{recipe_name}",
  "steps": ["1단계 내용", "2단계 내용"],
  "tips": "요리 팁 (없으면 빈 문자열)"
}}"""

    try:
        content = call_text_api(prompt)
        result = parse_json_from_text(content)
        return jsonify(result)

    except requests.Timeout:
        return jsonify({"error": "요청 시간이 초과되었습니다. 다시 시도해주세요."}), 504
    except Exception as e:
        return jsonify({"error": f"조리법 조회 중 오류가 발생했습니다: {str(e)}"}), 500


@app.route("/favorites")
def favorites_page():
    return render_template("favorites.html")


@app.route("/api/favorites", methods=["POST"])
def add_favorite():
    data = request.get_json()
    recipe_name = data.get("recipe_name", "").strip()
    if not recipe_name:
        return jsonify({"error": "레시피 이름이 없습니다."}), 400

    db = get_db()
    existing = db.execute(
        "SELECT id FROM favorites WHERE recipe_name = ?", (recipe_name,)
    ).fetchone()
    if existing:
        return jsonify({"error": "이미 즐겨찾기에 저장된 레시피입니다.", "id": existing["id"]}), 409

    cursor = db.execute(
        """INSERT INTO favorites
           (recipe_name, ingredients, steps, tips, cooking_time, difficulty)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            recipe_name,
            json.dumps(data.get("ingredients", []), ensure_ascii=False),
            json.dumps(data.get("steps", []), ensure_ascii=False),
            data.get("tips", ""),
            data.get("cooking_time", ""),
            data.get("difficulty", ""),
        ),
    )
    db.commit()
    return jsonify({"message": "즐겨찾기에 저장되었습니다.", "id": cursor.lastrowid}), 201


@app.route("/api/favorites", methods=["GET"])
def list_favorites():
    db = get_db()
    rows = db.execute(
        "SELECT id, recipe_name, cooking_time, difficulty, saved_at FROM favorites ORDER BY saved_at DESC"
    ).fetchall()
    return jsonify({"favorites": [dict(r) for r in rows]})


@app.route("/api/favorites/<int:fav_id>", methods=["GET"])
def get_favorite(fav_id):
    db = get_db()
    row = db.execute("SELECT * FROM favorites WHERE id = ?", (fav_id,)).fetchone()
    if not row:
        return jsonify({"error": "즐겨찾기를 찾을 수 없습니다."}), 404
    item = dict(row)
    item["ingredients"] = json.loads(item["ingredients"] or "[]")
    item["steps"]       = json.loads(item["steps"] or "[]")
    return jsonify(item)


@app.route("/api/favorites/<int:fav_id>", methods=["DELETE"])
def delete_favorite(fav_id):
    db = get_db()
    row = db.execute("SELECT id FROM favorites WHERE id = ?", (fav_id,)).fetchone()
    if not row:
        return jsonify({"error": "즐겨찾기를 찾을 수 없습니다."}), 404
    db.execute("DELETE FROM favorites WHERE id = ?", (fav_id,))
    db.commit()
    return jsonify({"message": "즐겨찾기가 삭제되었습니다."})


@app.route("/api/favorites/check", methods=["GET"])
def check_favorite():
    name = request.args.get("name", "").strip()
    if not name:
        return jsonify({"saved": False})
    db = get_db()
    row = db.execute(
        "SELECT id FROM favorites WHERE recipe_name = ?", (name,)
    ).fetchone()
    return jsonify({"saved": row is not None, "id": row["id"] if row else None})


@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)
