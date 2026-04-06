/* ═══════════════════════════════════════════════
   leaderboard.js — 순위 관리
═══════════════════════════════════════════════ */

const Leaderboard = (() => {

  const STORAGE_KEY = 'quiz_leaderboard';
  const CATEGORIES  = ['전체', '한국사', '과학', '지리', '일반상식'];
  const MAX_ENTRIES = 10;

  // 방금 저장된 항목 ID (강조 표시용)
  let lastSavedId = null;

  // ── DOM 참조 ────────────────────────────────
  const elTabs    = document.getElementById('leaderboard-tabs');
  const elBody    = document.getElementById('leaderboard-body');
  const elEmpty   = document.getElementById('leaderboard-empty');

  // ── 현재 활성 탭 ────────────────────────────
  let activeTab = '전체';

  // ══════════════════════════════════════════
  //  스토리지 헬퍼
  // ══════════════════════════════════════════
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') return false;
      return false;
    }
  }

  // ── 가장 오래된 항목 1개 삭제 ───────────────
  function evictOldest(data) {
    let oldest = null;
    let oldestCat = null;
    let oldestIdx = -1;

    CATEGORIES.forEach(cat => {
      const entries = data[cat] || [];
      entries.forEach((entry, idx) => {
        if (!oldest || entry.date < oldest.date) {
          oldest    = entry;
          oldestCat = cat;
          oldestIdx = idx;
        }
      });
    });

    if (oldestCat !== null && oldestIdx !== -1) {
      data[oldestCat].splice(oldestIdx, 1);
    }
    return data;
  }

  // ══════════════════════════════════════════
  //  점수 저장
  // ══════════════════════════════════════════
  function saveScore(nickname, sess) {
    const data = load();
    const cat  = sess.category;
    if (!data[cat]) data[cat] = [];

    const maxScore     = sess.questions.reduce((s, q) => s + POINTS[q.difficulty], 0);
    const correctCount = sess.answers.filter(a => a.correct).length;
    const accuracy     = Math.round((correctCount / sess.questions.length) * 100);
    const entryId      = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const entry = {
      id:        entryId,
      nickname,
      score:     sess.score,
      maxScore,
      accuracy,
      total:     sess.questions.length,
      difficulty: sess.difficulty,
      date:      new Date().toISOString().slice(0, 10)   // "YYYY-MM-DD"
    };

    data[cat].push(entry);
    data[cat].sort((a, b) => b.score - a.score);
    data[cat] = data[cat].slice(0, MAX_ENTRIES);

    // 저장 시도 → 용량 초과 시 가장 오래된 항목 삭제 후 재시도
    let success = save(data);
    if (!success) {
      const trimmed = evictOldest(data);
      success = save(trimmed);
      if (success) {
        Quiz.showToast('저장 공간이 부족하여 오래된 기록 1개를 삭제했습니다.');
      } else {
        Quiz.showToast('순위 저장에 실패했습니다.');
        return;
      }
    }

    lastSavedId = entryId;
    activeTab   = cat;
    show();
  }

  // ══════════════════════════════════════════
  //  순위 조회
  // ══════════════════════════════════════════
  function getLeaderboard(category) {
    const data = load();
    return data[category] || [];
  }

  // ══════════════════════════════════════════
  //  순위 화면 렌더링
  // ══════════════════════════════════════════
  function renderTable(category) {
    const entries = getLeaderboard(category);

    // 탭 active 상태 업데이트
    elTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === category);
    });

    elBody.innerHTML = '';

    if (entries.length === 0) {
      elEmpty.classList.remove('hidden');
      return;
    }
    elEmpty.classList.add('hidden');

    const medals = ['🥇', '🥈', '🥉'];

    entries.forEach((entry, idx) => {
      const rank = idx + 1;
      const tr   = document.createElement('tr');

      if (entry.id === lastSavedId) tr.classList.add('highlight');

      const dateStr = entry.date
        ? entry.date.slice(5).replace('-', '/')   // "MM/DD"
        : '-';

      const diffLabel = { easy: '초급', mixed: '혼합', hard: '고급' }[entry.difficulty] || '-';

      tr.innerHTML = `
        <td>${medals[idx] ?? rank}</td>
        <td><strong>${escapeHtml(entry.nickname)}</strong></td>
        <td>${entry.score}<small>/${entry.maxScore}</small></td>
        <td>${entry.accuracy}%</td>
        <td>${dateStr}</td>
      `;
      elBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ══════════════════════════════════════════
  //  화면 표시
  // ══════════════════════════════════════════
  function show() {
    Quiz.showScreen('screen-leaderboard');
    renderTable(activeTab);
  }

  // ══════════════════════════════════════════
  //  탭 이벤트
  // ══════════════════════════════════════════
  elTabs.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    activeTab = btn.dataset.tab;
    renderTable(activeTab);
  });

  return { show, saveScore, getLeaderboard };

})();
