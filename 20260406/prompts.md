# 상식 퀴즈 게임 — Claude Code 구현 프롬프트

> PRD(`prd.md`) 기반으로 3단계에 걸쳐 구현합니다.
> 각 단계 프롬프트를 순서대로 Claude Code에 붙여넣어 실행하세요.

---

## 단계 개요

| 단계 | 범위 | 산출물 |
|------|------|--------|
| Step 1 | 문제 데이터 + 프로젝트 기반 구조 | `data/questions.js`, `index.html`, `css/style.css` 뼈대 |
| Step 2 | 게임 핵심 로직 + 상태 관리 | `js/game.js`, `js/quiz.js` — 퀴즈 플로우 완성 |
| Step 3 | 결과/순위 + UI 완성 + 반응형 | `js/leaderboard.js`, CSS 완성, 전체 통합 |

---

## Step 1 — 문제 데이터 & 프로젝트 기반 구조

```
다음 스펙에 맞는 상식 퀴즈 게임의 기반 구조를 만들어줘.

## 목표
- 프로젝트 폴더 구조 생성
- 40문제 데이터 파일 작성
- HTML/CSS 기본 골격 생성

## 프로젝트 구조
quiz-game/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── game.js
│   ├── quiz.js
│   └── leaderboard.js
└── data/
    └── questions.js

## 문제 데이터 스펙 (data/questions.js)
각 문제 객체는 다음 구조를 따른다:
{
  id: number,
  category: "한국사" | "과학" | "지리" | "일반상식",
  subtopic: string,          // 서브토픽 (예: "고대", "물리")
  difficulty: "easy" | "medium" | "hard",
  question: string,          // 문제 텍스트
  choices: [string, string, string, string],  // 4개 선택지
  answer: 0 | 1 | 2 | 3,    // 정답 인덱스 (0-based)
  explanation: string        // 해설
}

카테고리별 10문제씩 총 40문제를 작성하되, 각 카테고리의 서브토픽 배분은 아래를 따른다:

한국사 (10문제):
- 고대(삼국·통일신라·발해): 2문제 — 초급 1, 중급 1
- 고려: 2문제 — 초급 1, 중급 1
- 조선: 3문제 — 초급 1, 중급 1, 고급 1
- 근현대: 3문제 — 초급 1, 중급 1, 고급 1

과학 (10문제):
- 물리: 3문제 — 초급 1, 중급 1, 고급 1
- 화학: 2문제 — 초급 1, 중급 1
- 생물: 3문제 — 초급 1, 중급 1, 고급 1
- 지구과학: 2문제 — 초급 1, 중급 1

지리 (10문제):
- 세계 수도: 3문제 — 초급 1, 중급 1, 고급 1
- 지형·자연환경: 3문제 — 초급 1, 중급 1, 고급 1
- 국가·문화권: 2문제 — 초급 1, 중급 1
- 한국 지리: 2문제 — 초급 1, 중급 1

일반상식 (10문제):
- 사회·경제: 3문제 — 초급 1, 중급 1, 고급 1
- 문화·예술: 2문제 — 초급 1, 중급 1
- 스포츠: 2문제 — 초급 1, 중급 1
- 시사·과학기술: 3문제 — 초급 1, 중급 1, 고급 1

## index.html 스펙
- 단일 HTML 파일, 5개의 화면을 div로 구성 (기본적으로 hidden)
  - #screen-home     : 시작 화면
  - #screen-quiz     : 문제 화면
  - #overlay-feedback: 피드백 오버레이 (quiz 위에 표시)
  - #screen-result   : 결과 화면
  - #screen-leaderboard: 순위 기록 화면
- <link>로 css/style.css 연결
- <script>로 data/questions.js, js/game.js, js/quiz.js, js/leaderboard.js 순서대로 로드

## css/style.css 스펙
- CSS 변수(--color-*)로 컬러 팔레트 정의
  - --color-primary: #4F46E5 (인디고)
  - --color-correct: #16A34A (초록)
  - --color-wrong:   #DC2626 (빨강)
  - --color-bg:      #F8FAFC
  - --color-card:    #FFFFFF
- 기본 reset (box-sizing, margin, padding)
- 공통 카드 컴포넌트 (.card), 버튼 (.btn, .btn-primary, .btn-secondary) 스타일
- 화면 전환용 .hidden 클래스 (display: none)
- 피드백 오버레이: position fixed, 전체 화면 덮음
- 모바일 우선 기본 레이아웃 (max-width: 480px, 중앙 정렬)

js/ 파일들은 이 단계에서 빈 파일로만 생성한다.
```

---

## Step 2 — 게임 핵심 로직 & 상태 관리

```
Step 1에서 만든 quiz-game 프로젝트에 게임 핵심 로직을 구현해줘.
구현 전에 반드시 기존 파일들(index.html, data/questions.js, css/style.css)을 읽고 시작해.

## 목표
js/game.js, js/quiz.js를 완성하여 시작 화면 → 문제 화면 → 피드백 → (반복) 흐름을 완전히 동작시킨다.

## js/game.js — 게임 상태 관리자

### 상태 정의
const STATE = { IDLE, PLAYING, FEEDBACK, RESULT, LEADERBOARD }
let gameState = STATE.IDLE

### GameSession 객체
{
  category: string,       // "한국사" | "과학" | "지리" | "일반상식" | "전체"
  difficulty: string,     // "easy" | "mixed" | "hard"
  questions: [],          // 셔플된 문제 배열
  currentIndex: 0,
  score: 0,
  answers: []             // { questionId, selected, correct, points }
}

### 핵심 함수
- startGame(category, difficulty): 세션 초기화, 문제 풀 구성 및 셔플, STATE → PLAYING 전환
- submitAnswer(selectedIndex): 정답 채점, points 계산, answers에 기록, STATE → FEEDBACK 전환
- nextQuestion(): currentIndex 증가, 마지막 문제면 STATE → RESULT, 아니면 STATE → PLAYING
- restartGame(): 동일 category/difficulty로 세션 재초기화
- goHome(): STATE → IDLE

### 문제 풀 구성 규칙
- difficulty "easy": questions에서 difficulty === "easy"인 것만 사용
- difficulty "hard": questions에서 difficulty === "hard"인 것만 사용
- difficulty "mixed": 카테고리별 easy 4개 + medium 4개 + hard 2개 (비율 유지)
- 전체 모드: 4개 카테고리를 라운드 로빈 순서로 배치 후 각 카테고리 내부는 셔플
- 선택지 순서: 각 문제의 choices를 Fisher-Yates로 셔플하되, answer 인덱스를 새 위치로 갱신

### 점수 계산
- easy 정답: +5점
- medium 정답: +10점
- hard 정답: +15점
- 오답: 0점

### 예외 처리
- 뒤로가기/새로고침 방지: PLAYING, FEEDBACK 상태일 때 window beforeunload 이벤트로 확인 모달 표시
- FEEDBACK 상태에서 history.back() 차단

## js/quiz.js — UI 렌더링 & 이벤트 바인딩

### 시작 화면 (#screen-home)
- 난이도 토글 버튼 3개 (초급/혼합/고급), 기본값 혼합
- 카테고리 버튼 5개 클릭 시 game.startGame(category, difficulty) 호출
- 순위 기록 버튼 클릭 시 leaderboard.show() 호출

### 문제 화면 (#screen-quiz)
renderQuestion(session) 함수:
- 카테고리 태그, "현재문제/전체" 표시
- 진행 바 width = (currentIndex / questions.length) * 100 + "%"
- 누적 점수 표시
- 문제 텍스트 렌더링
- 4개 선택지 버튼 렌더링, 각 버튼 클릭 시 game.submitAnswer(index) 호출
- 선택 후 모든 버튼 즉시 disabled 처리 (중복 클릭 방지)

### 피드백 오버레이 (#overlay-feedback)
showFeedback(session, lastAnswer) 함수:
- 정답이면: 헤더 초록 배경, "✔ 정답입니다! (+N점)" 표시
- 오답이면: 헤더 빨간 배경, "✘ 오답입니다! (+0점)" 표시
- 선택지 4개 재렌더링:
  - 정답 선택지: 초록 배경 + ✔ 아이콘
  - 사용자가 틀리게 선택한 것: 빨간 배경 + ✘ 아이콘
  - 나머지: 기본 스타일
- 해설 텍스트 표시
- "다음 문제 →" 버튼: game.nextQuestion() 호출
- 오버레이 등장: CSS transition으로 0.15초 fade-in

### 화면 전환
showScreen(screenId) 함수: 모든 화면 hidden 처리 후 해당 화면만 표시
```

---

## Step 3 — 결과/순위 화면 + UI 완성 + 반응형

```
Step 2까지 완성된 quiz-game 프로젝트에 결과 화면, 순위 기능, UI 완성, 반응형을 구현해줘.
구현 전에 반드시 기존 파일 전체(index.html, css/style.css, js/game.js, js/quiz.js)를 읽고 시작해.

## 목표
1. js/leaderboard.js 완성 (순위 저장/조회)
2. js/quiz.js에 결과 화면 렌더링 추가
3. css/style.css 완성 (애니메이션, 반응형, 전체 화면 스타일)
4. 전체 흐름 통합 검증

## js/leaderboard.js — 순위 관리

### localStorage 키: "quiz_leaderboard"
저장 구조: 카테고리별 배열
{
  "한국사": [ { nickname, score, maxScore, accuracy, date, difficulty }, ... ],
  "과학":   [ ... ],
  "지리":   [ ... ],
  "일반상식": [ ... ],
  "전체":   [ ... ]
}

### 핵심 함수
- saveScore(nickname, session): 해당 카테고리 배열에 추가, 점수 내림차순 정렬, 상위 10개만 유지
  - nickname 유효성: 1~10자, 영문/한글/숫자만 허용 (/^[a-zA-Z0-9가-힣]{1,10}$/)
  - localStorage 용량 초과(QuotaExceededError) 시: 전체 카테고리에서 가장 오래된 항목 1개 삭제 후 재시도, 토스트 알림 표시
- getLeaderboard(category): 해당 카테고리 상위 10개 반환 ("전체"면 전체 배열)
- show(highlightId): 순위 화면 표시, 방금 저장된 항목 강조

### 순위 화면 (#screen-leaderboard) 렌더링
- 필터 탭 5개 (전체/한국사/과학/지리/일반상식), 탭 클릭 시 해당 카테고리 목록 재렌더링
- 순위 테이블: 순위, 닉네임, 점수, 정답률, 날짜
- 1~3위는 메달 아이콘 (🥇🥈🥉) 표시
- 방금 저장된 행은 --color-primary 연한 배경으로 강조
- "홈으로" 버튼: game.goHome() 호출

## js/quiz.js — 결과 화면 추가

showResult(session) 함수:
- 최종 점수 / 최고 점수 표시 (애니메이션 카운트업: 0에서 최종 점수까지 0.8초)
- 정답률 % 계산 및 표시
- 전체 모드일 때만 카테고리별 성취도 바 차트 표시
  - 각 카테고리의 맞춘 문제 수 / 카테고리별 총 문제 수로 % 계산
  - CSS width 트랜지션으로 바 채움 애니메이션
- 닉네임 입력 필드:
  - 입력값 실시간 유효성 검사 (정규식 /^[a-zA-Z0-9가-힣]{1,10}$/)
  - 유효하지 않으면 저장 버튼 disabled + 에러 메시지 표시
- "순위에 저장하기" 버튼: leaderboard.saveScore(nickname, session) → leaderboard.show() 호출
- "다시 하기" 버튼: game.restartGame() 호출
- "카테고리 변경" 버튼: game.goHome() 호출

## css/style.css 완성

### 추가할 스타일
1. 시작 화면
   - 카테고리 버튼 2×2 그리드 + 전체 버튼 풀 너비
   - 버튼 hover: translateY(-2px) + box-shadow 증가
   - 선택된 카테고리 버튼: --color-primary 배경, 흰 텍스트

2. 문제 화면
   - 진행 바: height 8px, border-radius 4px, transition width 0.3s ease
   - 선택지 버튼: 전체 너비, 텍스트 왼쪽 정렬, padding 14px 16px, 최소 높이 52px
   - 선택지 hover: background #EEF2FF, border-color --color-primary

3. 피드백 오버레이
   - fade-in 애니메이션: @keyframes fadeIn { from opacity:0 to opacity:1 }, duration 0.15s
   - 정답 헤더: background --color-correct, 흰 텍스트
   - 오답 헤더: background --color-wrong, 흰 텍스트
   - 정답 선택지: background #DCFCE7, border --color-correct
   - 오답 선택지: background #FEE2E2, border --color-wrong
   - slide-left 전환: 다음 문제 전환 시 @keyframes slideLeft 0.2s

4. 결과 화면
   - 점수 카운트업: 숫자 폰트 크기 48px, font-weight 700
   - 성취도 바: height 12px, border-radius 6px, transition width 0.6s ease 0.2s

5. 순위 화면
   - 필터 탭: flex row, 선택된 탭 border-bottom 2px solid --color-primary
   - 테이블 행: hover background #F1F5F9
   - 하이라이트 행: background #EEF2FF

6. 반응형
   - 모바일 기본: max-width 480px, padding 16px
   - 데스크톱 (min-width: 768px): max-width 600px, padding 32px
   - 폰트 크기 조정: 문제 텍스트 모바일 18px → 데스크톱 20px

7. 공통
   - 토스트 알림: position fixed, bottom 20px, 중앙 정렬, 3초 후 fade-out
   - 확인 모달: position fixed, backdrop blur, 중앙 카드

## 통합 검증 체크리스트
모든 구현 완료 후 다음을 확인하고 문제가 있으면 수정해:
- [ ] 시작 화면에서 카테고리 + 난이도 선택 후 게임 시작
- [ ] 문제 화면에서 선택지 클릭 → 피드백 오버레이 표시
- [ ] "다음 문제" 클릭 → 다음 문제 렌더링
- [ ] 마지막 문제 후 결과 화면 이동
- [ ] 닉네임 입력 유효성 검사 동작
- [ ] 순위 저장 후 순위 화면으로 이동, 방금 저장된 항목 강조
- [ ] "다시 하기"로 동일 조건 재시작
- [ ] "카테고리 변경"으로 시작 화면 복귀
- [ ] PLAYING 상태에서 새로고침 시 확인 모달 표시
- [ ] 모바일(480px) / 데스크톱(768px+) 레이아웃 정상 표시
```

---

## 실행 방법

각 Step 완료 후 `quiz-game/index.html`을 브라우저에서 열어 동작을 확인한 뒤 다음 Step을 진행하세요.

```bash
# 로컬 서버 없이 파일 직접 열기 (Chrome/Edge)
start quiz-game/index.html

# 또는 VS Code Live Server 확장 사용
```
