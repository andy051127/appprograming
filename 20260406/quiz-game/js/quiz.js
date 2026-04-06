/* ═══════════════════════════════════════════════
   quiz.js — UI 렌더링 & 이벤트 바인딩
═══════════════════════════════════════════════ */

const Quiz = (() => {

  // ── DOM 참조 ───────────────────────────────
  const screens = {
    home:        document.getElementById('screen-home'),
    quiz:        document.getElementById('screen-quiz'),
    result:      document.getElementById('screen-result'),
    leaderboard: document.getElementById('screen-leaderboard')
  };
  const overlayFeedback   = document.getElementById('overlay-feedback');
  const toast             = document.getElementById('toast');
  const modalConfirm      = document.getElementById('modal-confirm');

  // 문제 화면
  const elCategory   = document.getElementById('quiz-category');
  const elProgress   = document.getElementById('quiz-progress');
  const elProgressBar = document.getElementById('progress-bar');
  const elScore      = document.getElementById('quiz-score');
  const elQuestion   = document.getElementById('question-text');
  const elChoices    = document.getElementById('choices');

  // 피드백
  const elFeedbackHeader   = document.getElementById('feedback-header');
  const elFeedbackChoices  = document.getElementById('feedback-choices');
  const elFeedbackExplain  = document.getElementById('feedback-explanation');
  const btnNext            = document.getElementById('btn-next');

  // 결과 화면
  const elResultScore    = document.getElementById('result-score');
  const elResultMax      = document.getElementById('result-max');
  const elResultAccuracy = document.getElementById('result-accuracy');
  const elAchievSection  = document.getElementById('achievement-section');
  const elAchievBars     = document.getElementById('achievement-bars');
  const nicknameInput    = document.getElementById('nickname-input');
  const nicknameError    = document.getElementById('nickname-error');
  const btnSaveScore     = document.getElementById('btn-save-score');
  const btnRestart       = document.getElementById('btn-restart');
  const btnChangeCategory = document.getElementById('btn-change-category');

  // 홈 화면
  const difficultyToggle = document.getElementById('difficulty-toggle');
  const btnLeaderboard   = document.getElementById('btn-leaderboard');

  // 순위 화면
  const btnHome = document.getElementById('btn-home');

  // 모달
  const btnModalCancel  = document.getElementById('modal-cancel');
  const btnModalConfirm = document.getElementById('modal-confirm-btn');

  // ── 닉네임 유효성 정규식 ───────────────────
  const NICKNAME_RE = /^[a-zA-Z0-9가-힣]{1,10}$/;

  // ── 현재 선택된 난이도 ─────────────────────
  let selectedDifficulty = 'mixed';

  // ── 토스트 타이머 ──────────────────────────
  let toastTimer = null;

  // ══════════════════════════════════════════
  //  화면 전환
  // ══════════════════════════════════════════
  function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    overlayFeedback.classList.add('hidden');
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
  }

  // ══════════════════════════════════════════
  //  문제 화면 렌더링
  // ══════════════════════════════════════════
  function renderQuestion() {
    showScreen('screen-quiz');

    // 다음 문제 slide-in 애니메이션
    const quizCard = document.querySelector('.quiz-card');
    quizCard.classList.remove('slide-in');
    void quizCard.offsetWidth; // reflow 강제
    quizCard.classList.add('slide-in');

    const { questions, currentIndex, score } = session;
    const q = questions[currentIndex];
    const total = questions.length;

    // 헤더
    elCategory.textContent  = q.category;
    elProgress.textContent  = `${currentIndex + 1} / ${total}`;
    elProgressBar.style.width = `${((currentIndex) / total) * 100}%`;
    elScore.textContent     = score;

    // 문제 텍스트
    elQuestion.textContent = q.question;

    // 선택지 버튼 생성
    elChoices.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.textContent = `${['①','②','③','④'][idx]} ${choice}`;
      btn.addEventListener('click', () => {
        // 모든 버튼 즉시 비활성화 (중복 클릭 방지)
        elChoices.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
        submitAnswer(idx);
      });
      elChoices.appendChild(btn);
    });
  }

  // ══════════════════════════════════════════
  //  피드백 오버레이
  // ══════════════════════════════════════════
  function showFeedback(selectedIndex, correct, points) {
    const q = session.questions[session.currentIndex];

    // 헤더
    elFeedbackHeader.className = `feedback-header ${correct ? 'correct' : 'wrong'}`;
    elFeedbackHeader.textContent = correct
      ? `✔ 정답입니다!  (+${points}점)`
      : `✘ 오답입니다!  (+0점)`;

    // 선택지 재렌더링
    elFeedbackChoices.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const div = document.createElement('div');
      const prefix = ['①','②','③','④'][idx];

      if (idx === q.answer && idx === selectedIndex) {
        // 정답이고 내가 선택
        div.className = 'feedback-choice correct';
        div.textContent = `${prefix} ${choice}  ✔`;
      } else if (idx === q.answer) {
        // 정답 (내가 틀렸을 때 정답 표시)
        div.className = 'feedback-choice correct';
        div.textContent = `${prefix} ${choice}  ✔ (정답)`;
      } else if (idx === selectedIndex) {
        // 내가 선택했지만 오답
        div.className = 'feedback-choice wrong';
        div.textContent = `${prefix} ${choice}  ✘`;
      } else {
        div.className = 'feedback-choice neutral';
        div.textContent = `${prefix} ${choice}`;
      }
      elFeedbackChoices.appendChild(div);
    });

    // 해설
    elFeedbackExplain.textContent = `해설: ${q.explanation}`;

    // 마지막 문제면 버튼 텍스트 변경
    const isLast = session.currentIndex === session.questions.length - 1;
    btnNext.textContent = isLast ? '결과 보기 →' : '다음 문제 →';

    // 오버레이 표시
    overlayFeedback.classList.remove('hidden');
  }

  // ══════════════════════════════════════════
  //  결과 화면
  // ══════════════════════════════════════════
  function showResult() {
    showScreen('screen-result');

    const maxScore = getMaxScore();
    const correctCount = session.answers.filter(a => a.correct).length;
    const total = session.questions.length;
    const accuracy = Math.round((correctCount / total) * 100);

    // 점수 카운트업 애니메이션
    animateCount(elResultScore, 0, session.score, 800);
    elResultMax.textContent     = `/ ${maxScore}점`;
    elResultAccuracy.textContent = `정답 ${correctCount}/${total}문제  ·  정답률 ${accuracy}%`;

    // 닉네임 초기화
    nicknameInput.value = '';
    nicknameInput.classList.remove('invalid');
    nicknameError.classList.add('hidden');
    btnSaveScore.disabled = true;

    // 전체 모드 성취도 바
    if (session.category === '전체') {
      elAchievSection.classList.remove('hidden');
      renderAchievementBars();
    } else {
      elAchievSection.classList.add('hidden');
    }
  }

  function animateCount(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(from + (to - from) * progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderAchievementBars() {
    const categories = ['한국사', '과학', '지리', '일반상식'];
    elAchievBars.innerHTML = '';

    categories.forEach(cat => {
      const catQuestions = session.questions.filter(q => q.category === cat);
      const catAnswers   = session.answers.filter((a, i) =>
        session.questions[i]?.category === cat
      );
      const correct = catAnswers.filter(a => a.correct).length;
      const total   = catQuestions.length;
      const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

      const item = document.createElement('div');
      item.className = 'achievement-item';
      item.innerHTML = `
        <div class="achievement-label">
          <span>${cat}</span>
          <span>${correct}/${total}  ${pct}%</span>
        </div>
        <div class="achievement-bar-wrap">
          <div class="achievement-bar" data-pct="${pct}"></div>
        </div>
      `;
      elAchievBars.appendChild(item);
    });

    // 바 채움 애니메이션 (DOM 반영 후 적용)
    requestAnimationFrame(() => {
      elAchievBars.querySelectorAll('.achievement-bar').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    });
  }

  // ══════════════════════════════════════════
  //  토스트 알림
  // ══════════════════════════════════════════
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  // ══════════════════════════════════════════
  //  확인 모달
  // ══════════════════════════════════════════
  function showConfirmModal(onConfirm) {
    modalConfirm.classList.remove('hidden');
    // 이전 리스너 제거 후 재등록
    const newConfirmBtn = btnModalConfirm.cloneNode(true);
    btnModalConfirm.parentNode.replaceChild(newConfirmBtn, btnModalConfirm);
    newConfirmBtn.addEventListener('click', () => {
      modalConfirm.classList.add('hidden');
      onConfirm();
    });
  }

  // ══════════════════════════════════════════
  //  이벤트 바인딩
  // ══════════════════════════════════════════

  // 난이도 토글
  difficultyToggle.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    difficultyToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDifficulty = btn.dataset.difficulty;
  });

  // 카테고리 버튼 (그리드 + 전체)
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      startGame(btn.dataset.category, selectedDifficulty);
    });
  });

  // 순위 기록 보기
  btnLeaderboard.addEventListener('click', () => {
    gameState = STATE.LEADERBOARD;
    Leaderboard.show();
  });

  // 다음 문제 버튼
  btnNext.addEventListener('click', () => {
    overlayFeedback.classList.add('hidden');
    nextQuestion();
  });

  // 닉네임 유효성 검사
  nicknameInput.addEventListener('input', () => {
    const val = nicknameInput.value.trim();
    const valid = NICKNAME_RE.test(val);
    if (val.length === 0) {
      nicknameInput.classList.remove('invalid');
      nicknameError.classList.add('hidden');
      btnSaveScore.disabled = true;
    } else if (!valid) {
      nicknameInput.classList.add('invalid');
      nicknameError.classList.remove('hidden');
      btnSaveScore.disabled = true;
    } else {
      nicknameInput.classList.remove('invalid');
      nicknameError.classList.add('hidden');
      btnSaveScore.disabled = false;
    }
  });

  // 순위 저장
  btnSaveScore.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (!NICKNAME_RE.test(nickname)) return;
    Leaderboard.saveScore(nickname, session);
  });

  // 다시 하기
  btnRestart.addEventListener('click', () => restartGame());

  // 카테고리 변경
  btnChangeCategory.addEventListener('click', () => goHome());

  // 홈으로 (순위 화면)
  btnHome.addEventListener('click', () => goHome());

  // 모달 취소
  btnModalCancel.addEventListener('click', () => {
    modalConfirm.classList.add('hidden');
  });

  // ── 뒤로가기/새로고침 처리 ─────────────────
  window.addEventListener('popstate', () => {
    if (gameState === STATE.PLAYING || gameState === STATE.FEEDBACK) {
      history.pushState(null, '', location.href); // 뒤로가기 차단
      showConfirmModal(() => goHome());
    }
  });

  // 초기 pushState (popstate 감지를 위해)
  history.pushState(null, '', location.href);

  // ── Public API ─────────────────────────────
  return { showScreen, renderQuestion, showFeedback, showResult, showToast };

})();
