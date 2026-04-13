import os
import sys
import requests
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding="utf-8")

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_TEXT = "meta-llama/llama-4-scout:free"
MODEL_IMAGE = "nvidia/nemotron-nano-12b-v2-vl:free"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

def test_text():
    print("=" * 50)
    print("[텍스트 생성 테스트]")
    payload = {
        "model": MODEL_TEXT,
        "messages": [
            {"role": "user", "content": "파이썬이란 무엇인지 한 문장으로 설명해줘."}
        ]
    }
    resp = requests.post(BASE_URL, headers=HEADERS, json=payload)
    if resp.status_code == 200:
        answer = resp.json()["choices"][0]["message"]["content"]
        print(f"응답: {answer}")
    else:
        print(f"오류 {resp.status_code}: {resp.text}")

def test_image():
    import base64
    print("=" * 50)
    print("[이미지 인식 테스트]")
    # 이미지를 직접 다운로드 후 base64 인코딩
    image_url = "https://picsum.photos/id/237/320/240"  # 공개 테스트 이미지 (강아지)
    img_resp = requests.get(image_url, headers={"User-Agent": "Mozilla/5.0"})
    if img_resp.status_code != 200:
        print(f"이미지 다운로드 실패: {img_resp.status_code}")
        return
    b64 = base64.b64encode(img_resp.content).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{b64}"

    payload = {
        "model": MODEL_IMAGE,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "이 이미지에 무엇이 있는지 한국어로 설명해줘."},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ]
    }
    resp = requests.post(BASE_URL, headers=HEADERS, json=payload)
    if resp.status_code == 200:
        answer = resp.json()["choices"][0]["message"]["content"]
        print(f"응답: {answer}")
    else:
        print(f"오류 {resp.status_code}: {resp.text}")

if __name__ == "__main__":
    print(f"텍스트 모델: {MODEL_TEXT}")
    print(f"이미지 모델: {MODEL_IMAGE}\n")
    test_text()
    print()
    test_image()
    print("=" * 50)
