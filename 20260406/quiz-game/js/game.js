/* ═══════════════════════════════════════════════
   game.js — 게임 상태 관리자
═══════════════════════════════════════════════ */

// ── 상태 정의 ─────────────────────────────────
const STATE = {
  IDLE:        'IDLE',
  PLAYING:     'PLAYING',
  FEEDBACK:    'FEEDBACK',
  RESULT:      'RESULT',
  LEADERBOARD: 'LEADERBOARD'
};

let gameState = STATE.IDLE;

// ── 세션 객체 ─────────────────────────────────
let session = null;

// ── 점수 테이블 ───────────────────────────────
const POINTS = { easy: 5, medium: 10, hard: 15 };

// ── Fisher-Yates 셔플 ─────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 선택지 셔플 (answer 인덱스 갱신 포함) ────
function shuffleChoices(question) {
  const originalAnswer = question.choices[question.answer];
  const shuffledChoices = shuffle(question.choices);
  return {
    ...question,
    choices: shuffledChoices,
    answer: shuffledChoices.indexOf(originalAnswer)
  };
}

// ── 문제 풀 구성 ──────────────────────────────
function buildQuestionPool(category, difficulty) {
  const categories = ['한국사', '과학', '지리', '일반상식'];

  // 카테고리별 문제 가져오기
  function getByCategory(cat) {
    return QUESTIONS.filter(q => q.category === cat);
  }

  // 난이도별 필터 + 혼합 구성
  function filterByDifficulty(pool, diff) {
    if (diff === 'easy') return pool.filter(q => q.difficulty === 'easy');
    if (diff === 'hard') return pool.filter(q => q.difficulty === 'hard');
    // mixed: easy 40% + medium 40% + hard 20% (10문제 기준: easy 4, medium 4, hard 2)
    const easy   = shuffle(pool.filter(q => q.difficulty === 'easy')).slice(0, 4);
    const medium = shuffle(pool.filter(q => q.difficulty === 'medium')).slice(0, 4);
    const hard   = shuffle(pool.filter(q => q.difficulty === 'hard')).slice(0, 2);
    return shuffle([...easy, ...medium, ...hard]);
  }

  let pool = [];

  if (category === '전체') {
    // 라운드 로빈: 한국사→과학→지리→일반상식 순으로 각 카테고리 풀 구성 후 인터리브
    const perCat = categories.map(cat => filterByDifficulty(getByCategory(cat), difficulty));
    const maxLen = Math.max(...perCat.map(p => p.length));
    for (let i = 0; i < maxLen; i++) {
      perCat.forEach(catPool => { if (catPool[i]) pool.push(catPool[i]); });
    }
  } else {
    pool = filterByDifficulty(getByCategory(category), difficulty);
  }

  // 각 문제의 선택지 순서 셔플
  return pool.map(shuffleChoices);
}

// ── 게임 시작 ─────────────────────────────────
function startGame(category, difficulty) {
  const questions = buildQuestionPool(category, difficulty);

  session = {
    category,
    difficulty,
    questions,
    currentIndex: 0,
    score: 0,
    answers: []
  };

  gameState = STATE.PLAYING;
  setupBeforeUnload();
  Quiz.renderQuestion();
}

// ── 답변 제출 ─────────────────────────────────
function submitAnswer(selectedIndex) {
  if (gameState !== STATE.PLAYING) return;

  const question = session.questions[session.currentIndex];
  const correct  = selectedIndex === question.answer;
  const points   = correct ? POINTS[question.difficulty] : 0;

  session.score += points;
  session.answers.push({
    questionId: question.id,
    selected:   selectedIndex,
    correct,
    points
  });

  gameState = STATE.FEEDBACK;
  Quiz.showFeedback(selectedIndex, correct, points);
}

// ── 다음 문제 ─────────────────────────────────
function nextQuestion() {
  session.currentIndex++;

  if (session.currentIndex >= session.questions.length) {
    gameState = STATE.RESULT;
    removeBeforeUnload();
    Quiz.showResult();
  } else {
    gameState = STATE.PLAYING;
    Quiz.renderQuestion();
  }
}

// ── 재시작 (동일 조건) ────────────────────────
function restartGame() {
  startGame(session.category, session.difficulty);
}

// ── 홈으로 ───────────────────────────────────
function goHome() {
  gameState = STATE.IDLE;
  removeBeforeUnload();
  Quiz.showScreen('screen-home');
}

// ── 최고 점수 계산 ────────────────────────────
function getMaxScore() {
  return session.questions.reduce((sum, q) => sum + POINTS[q.difficulty], 0);
}

// ── beforeunload 등록/해제 ────────────────────
function handleBeforeUnload(e) {
  e.preventDefault();
  e.returnValue = '';
}

function setupBeforeUnload() {
  window.addEventListener('beforeunload', handleBeforeUnload);
}

function removeBeforeUnload() {
  window.removeEventListener('beforeunload', handleBeforeUnload);
}
