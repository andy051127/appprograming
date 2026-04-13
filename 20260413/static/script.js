const dropzone = document.getElementById("dropzone");
const dropzoneContent = document.getElementById("dropzone-content");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const analyzeBtn = document.getElementById("analyzeBtn");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const ingredientSection = document.getElementById("ingredientSection");
const ingredientList = document.getElementById("ingredientList");
const newIngredientInput = document.getElementById("newIngredient");
const addBtn = document.getElementById("addBtn");
const nextBtn = document.getElementById("nextBtn");

let imageBase64 = null;
let ingredients = [];

// 클릭으로 파일 선택
dropzone.addEventListener("click", () => fileInput.click());

// 파일 선택
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// 드래그&드롭
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (!file.type.match(/image\/(jpeg|png|webp)/)) {
    showError("JPG, PNG, WEBP 형식만 지원합니다.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError("파일 크기는 10MB 이하여야 합니다.");
    return;
  }

  hideError();
  const reader = new FileReader();
  reader.onload = (e) => {
    imageBase64 = e.target.result;
    preview.src = imageBase64;
    preview.style.display = "block";
    dropzoneContent.style.display = "none";
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

// 분석 버튼
analyzeBtn.addEventListener("click", async () => {
  if (!imageBase64) return;

  hideError();
  ingredientSection.style.display = "none";
  loading.style.display = "block";
  analyzeBtn.disabled = true;

  try {
    const resp = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      showError(data.error || "분석 중 오류가 발생했습니다.");
      return;
    }

    ingredients = data.ingredients || [];
    renderIngredients();
    ingredientSection.style.display = "block";
  } catch (err) {
    showError("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    loading.style.display = "none";
    analyzeBtn.disabled = false;
  }
});

// 재료 목록 렌더링
function renderIngredients() {
  ingredientList.innerHTML = "";
  ingredients.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `✅ ${item} <button class="del-btn" data-idx="${idx}">✕</button>`;
    ingredientList.appendChild(li);
  });

  // 삭제 버튼 이벤트
  ingredientList.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.idx);
      ingredients.splice(idx, 1);
      renderIngredients();
    });
  });
}

// 재료 추가
addBtn.addEventListener("click", addIngredient);
newIngredientInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addIngredient();
});

function addIngredient() {
  const value = newIngredientInput.value.trim();
  if (!value) return;
  if (ingredients.includes(value)) {
    showError(`"${value}"은(는) 이미 목록에 있습니다.`);
    return;
  }
  ingredients.push(value);
  renderIngredients();
  newIngredientInput.value = "";
  hideError();
}

// 레시피 추천 페이지로 이동
nextBtn.addEventListener("click", () => {
  if (ingredients.length === 0) {
    showError("재료가 없습니다. 재료를 추가해주세요.");
    return;
  }
  sessionStorage.setItem("ingredients", JSON.stringify(ingredients));
  window.location.href = "/recipes";
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

function hideError() {
  errorMsg.style.display = "none";
}
