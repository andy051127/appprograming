const favList      = document.getElementById("favList");
const emptyState   = document.getElementById("emptyState");
const searchInput  = document.getElementById("searchInput");
const detailModal  = document.getElementById("detailModal");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal   = document.getElementById("closeModal");
const detailTitle  = document.getElementById("detailTitle");
const detailMeta   = document.getElementById("detailMeta");
const stepsList    = document.getElementById("stepsList");
const tipsBox      = document.getElementById("tipsBox");
const tipsText     = document.getElementById("tipsText");
const toast        = document.getElementById("toast");

let allFavorites = [];

// 목록 불러오기
async function loadFavorites() {
  const resp = await fetch("/api/favorites");
  const data = await resp.json();
  allFavorites = data.favorites || [];
  renderList(allFavorites);
}

// 카드 렌더링
function renderList(items) {
  favList.innerHTML = "";

  if (items.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  items.forEach(item => {
    const diffClass = { "쉬움": "easy", "보통": "medium", "어려움": "hard" }[item.difficulty] || "medium";
    const savedDate = item.saved_at ? item.saved_at.slice(0, 10) : "";

    const card = document.createElement("div");
    card.className = "fav-card";
    card.innerHTML = `
      <div class="card-header">
        <h3 class="recipe-name">⭐ ${item.recipe_name}</h3>
        <span class="difficulty ${diffClass}">${item.difficulty || ""}</span>
      </div>
      <div class="card-meta">
        <span>⏱ ${item.cooking_time || "-"}</span>
        <span>📅 저장: ${savedDate}</span>
      </div>
      <div class="fav-card-actions">
        <button class="btn-view" data-id="${item.id}">조리법 보기</button>
        <button class="btn-delete" data-id="${item.id}" data-name="${item.recipe_name}">삭제</button>
      </div>
    `;
    favList.appendChild(card);
  });

  favList.querySelectorAll(".btn-view").forEach(btn => {
    btn.addEventListener("click", () => openDetail(parseInt(btn.dataset.id)));
  });
  favList.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteFavorite(parseInt(btn.dataset.id), btn.dataset.name));
  });
}

// 조리법 상세 모달
async function openDetail(id) {
  stepsList.innerHTML = "";
  tipsBox.style.display = "none";
  detailTitle.textContent = "불러오는 중...";
  detailMeta.textContent = "";
  detailModal.style.display = "block";
  modalOverlay.style.display = "block";

  const resp = await fetch(`/api/favorites/${id}`);
  const data = await resp.json();

  detailTitle.textContent = data.recipe_name;
  detailMeta.innerHTML = `<span>⏱ ${data.cooking_time || "-"}</span> &nbsp;
    <span class="difficulty ${{ "쉬움":"easy","보통":"medium","어려움":"hard" }[data.difficulty]||"medium"}">
      ${data.difficulty || ""}
    </span>`;

  (data.steps || []).forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });

  if (data.tips) {
    tipsText.textContent = data.tips;
    tipsBox.style.display = "flex";
  }
}

// 즐겨찾기 삭제
async function deleteFavorite(id, name) {
  if (!confirm(`"${name}"을(를) 즐겨찾기에서 삭제할까요?`)) return;

  const resp = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
  const data = await resp.json();

  if (resp.ok) {
    showToast("🗑 즐겨찾기에서 삭제되었습니다.");
    await loadFavorites();
  } else {
    showToast(data.error || "삭제에 실패했습니다.");
  }
}

// 검색 (클라이언트 사이드)
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = keyword
    ? allFavorites.filter(f => f.recipe_name.toLowerCase().includes(keyword))
    : allFavorites;
  renderList(filtered);
});

// 모달 닫기
closeModal.addEventListener("click", closeDetailModal);
modalOverlay.addEventListener("click", closeDetailModal);
function closeDetailModal() {
  detailModal.style.display = "none";
  modalOverlay.style.display = "none";
}

function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

loadFavorites();
