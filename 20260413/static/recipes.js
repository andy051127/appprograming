// 재료 불러오기 (Step 1에서 sessionStorage에 저장한 값)
const ingredients = JSON.parse(sessionStorage.getItem("ingredients") || "[]");
let currentRecipe = null;  // 현재 선택된 레시피 (Step 3 즐겨찾기용)

const ingredientTags  = document.getElementById("ingredientTags");
const getRecipesBtn   = document.getElementById("getRecipesBtn");
const loading         = document.getElementById("loading");
const errorMsg        = document.getElementById("errorMsg");
const recipesSection  = document.getElementById("recipesSection");
const recipeCards     = document.getElementById("recipeCards");
const detailModal     = document.getElementById("detailModal");
const modalOverlay    = document.getElementById("modalOverlay");
const closeModal      = document.getElementById("closeModal");
const detailTitle     = document.getElementById("detailTitle");
const detailLoading   = document.getElementById("detailLoading");
const detailBody      = document.getElementById("detailBody");
const stepsList       = document.getElementById("stepsList");
const tipsBox         = document.getElementById("tipsBox");
const tipsText        = document.getElementById("tipsText");
const favoriteBtn     = document.getElementById("favoriteBtn");
const toast           = document.getElementById("toast");

// 재료 태그 렌더링
if (ingredients.length === 0) {
  ingredientTags.innerHTML = '<span class="no-ingredient">재료가 없습니다. <a href="/">돌아가서 재료를 인식해주세요.</a></span>';
  getRecipesBtn.disabled = true;
} else {
  ingredients.forEach(item => {
    const tag = document.createElement("span");
    tag.className = "ing-tag";
    tag.textContent = item;
    ingredientTags.appendChild(tag);
  });
}

// 레시피 추천 요청
getRecipesBtn.addEventListener("click", async () => {
  hideError();
  recipesSection.style.display = "none";
  loading.style.display = "block";
  getRecipesBtn.disabled = true;

  try {
    const resp = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });
    const data = await resp.json();

    if (!resp.ok) {
      showError(data.error || "레시피 추천 중 오류가 발생했습니다.");
      return;
    }

    renderRecipeCards(data.recipes || []);
    recipesSection.style.display = "block";
  } catch (err) {
    showError("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    loading.style.display = "none";
    getRecipesBtn.disabled = false;
  }
});

// 레시피 카드 렌더링
function renderRecipeCards(recipes) {
  recipeCards.innerHTML = "";

  if (recipes.length === 0) {
    recipeCards.innerHTML = "<p>추천 레시피가 없습니다.</p>";
    return;
  }

  recipes.forEach(recipe => {
    const diffClass = { "쉬움": "easy", "보통": "medium", "어려움": "hard" }[recipe.difficulty] || "medium";

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <div class="card-header">
        <h3 class="recipe-name">${recipe.name}</h3>
        <span class="difficulty ${diffClass}">${recipe.difficulty}</span>
      </div>
      <div class="card-meta">
        <span>⏱ ${recipe.cooking_time}</span>
        <span>📦 재료 일치 ${recipe.match_ratio}</span>
      </div>
      <p class="recipe-desc">${recipe.description}</p>
      ${recipe.missing_ingredients?.length
        ? `<p class="missing">부족한 재료: <span>${recipe.missing_ingredients.join(", ")}</span></p>`
        : `<p class="all-good">✅ 모든 재료 보유</p>`}
      <button class="btn-detail" data-name="${recipe.name}">조리법 보기</button>
    `;
    recipeCards.appendChild(card);
  });

  // 조리법 버튼 이벤트
  recipeCards.querySelectorAll(".btn-detail").forEach(btn => {
    btn.addEventListener("click", () => openDetail(btn.dataset.name));
  });
}

// 조리법 상세 모달 열기
async function openDetail(recipeName) {
  detailTitle.textContent = recipeName;
  stepsList.innerHTML = "";
  tipsBox.style.display = "none";
  detailBody.style.display = "none";
  detailLoading.style.display = "block";
  detailModal.style.display = "block";
  modalOverlay.style.display = "block";
  favoriteBtn.dataset.name = recipeName;
  favoriteBtn.textContent = "⭐ 즐겨찾기 추가";
  favoriteBtn.dataset.saved = "false";
  favoriteBtn.disabled = false;

  // 이미 저장된 레시피인지 확인
  fetch(`/api/favorites/check?name=${encodeURIComponent(recipeName)}`)
    .then(r => r.json())
    .then(d => {
      if (d.saved) {
        favoriteBtn.textContent = "✅ 즐겨찾기 저장됨 (목록 보기)";
        favoriteBtn.dataset.saved = "true";
      }
    });

  try {
    const resp = await fetch("/api/recipe/detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_name: recipeName, ingredients }),
    });
    const data = await resp.json();

    if (!resp.ok) {
      stepsList.innerHTML = `<li class="error-step">${data.error || "조리법을 불러오지 못했습니다."}</li>`;
      detailBody.style.display = "block";
      return;
    }

    currentRecipe = data;

    (data.steps || []).forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      stepsList.appendChild(li);
    });

    if (data.tips) {
      tipsText.textContent = data.tips;
      tipsBox.style.display = "flex";
    }

    detailBody.style.display = "block";
  } catch (err) {
    stepsList.innerHTML = "<li>서버 연결에 실패했습니다.</li>";
    detailBody.style.display = "block";
  } finally {
    detailLoading.style.display = "none";
  }
}

// 모달 닫기
closeModal.addEventListener("click", closeDetailModal);
modalOverlay.addEventListener("click", closeDetailModal);
function closeDetailModal() {
  detailModal.style.display = "none";
  modalOverlay.style.display = "none";
  currentRecipe = null;
}

// 즐겨찾기 버튼
favoriteBtn.addEventListener("click", async () => {
  if (!currentRecipe) return;

  // 이미 저장된 경우 목록 페이지로 이동
  if (favoriteBtn.dataset.saved === "true") {
    window.location.href = "/favorites";
    return;
  }

  favoriteBtn.disabled = true;
  const resp = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentRecipe),
  });
  const data = await resp.json();
  favoriteBtn.disabled = false;

  if (resp.status === 201) {
    favoriteBtn.textContent = "✅ 즐겨찾기 저장됨 (목록 보기)";
    favoriteBtn.dataset.saved = "true";
    showToast("⭐ 즐겨찾기에 저장되었습니다!");
  } else if (resp.status === 409) {
    favoriteBtn.textContent = "✅ 즐겨찾기 저장됨 (목록 보기)";
    favoriteBtn.dataset.saved = "true";
    showToast("이미 저장된 레시피입니다.");
  } else {
    showToast(data.error || "저장에 실패했습니다.");
  }
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}
function hideError() {
  errorMsg.style.display = "none";
}
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}
