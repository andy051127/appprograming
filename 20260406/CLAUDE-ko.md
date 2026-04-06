# CLAUDE-ko.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

---

## 프로젝트 구성

루트에 기획 문서와 구현 결과물이 함께 있다.

```
20260406/
├── prd.md           # 상품 요구사항 문서 (기능/화면/데이터 명세)
├── prompts.md       # 3단계 Claude Code 구현 프롬프트
├── checklist.md     # 단계별 구현 확인 체크리스트 (각 20개)
└── quiz-game/       # 실제 구현체 (서버 불필요, 브라우저에서 직접 실행)
    ├── index.html
    ├── css/style.css
    ├── data/questions.js
    └── js/
        ├── game.js
        ├── quiz.js
        └── leaderboard.js
```

## 실행 방법

별도 빌드 도구 없음. `quiz-game/index.html`을 브라우저에서 직접 열면 된다.

```bash
# Windows
start quiz-game/index.html

# 또는 로컬 서버가 필요한 경우
npx serve quiz-game
python -m http.server 8080 --directory quiz-game
```

---

## 아키텍처

### 스크립트 로드 순서 (의존성 순서 고정)
```
data/questions.js  →  js/game.js  →  js/quiz.js  →  js/leaderboard.js
```
`QUESTIONS` 전역 배열과 `POINTS`, `STATE`, `session` 전역 변수는 `game.js`에서 선언되며, `quiz.js`와 `leaderboard.js`가 이를 직접 참조한다.

### 전역 공개 API
| 이름 | 위치 | 역할 |
|------|------|------|
| `QUESTIONS` | `data/questions.js` | 40개 문제 배열 (전역 `const`) |
| `STATE`, `gameState`, `session`, `POINTS` | `game.js` | 게임 상태 및 세션 데이터 (전역 `let`/`const`) |
| `startGame()`, `submitAnswer()`, `nextQuestion()`, `restartGame()`, `goHome()`, `getMaxScore()` | `game.js` | 게임 로직 함수 (전역) |
| `Quiz` | `quiz.js` | UI 모듈 (IIFE, `showScreen`, `renderQuestion`, `showFeedback`, `showResult`, `showToast` 노출) |
| `Leaderboard` | `leaderboard.js` | 순위 모듈 (IIFE, `show`, `saveScore`, `getLeaderboard` 노출) |

### 상태 머신
```
IDLE → PLAYING → FEEDBACK → PLAYING (반복)
                           → RESULT → LEADERBOARD → IDLE
IDLE → LEADERBOARD → IDLE
```
상태 전환은 `game.js`의 함수들이 담당하고, 화면 렌더링은 `Quiz.*` 메서드를 호출하는 방식으로 분리되어 있다.

### 문제 데이터 스키마
```js
{
  id: number,
  category: "한국사" | "과학" | "지리" | "일반상식",
  subtopic: string,
  difficulty: "easy" | "medium" | "hard",
  question: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,   // 0-based 인덱스
  explanation: string
}
```
`answer`는 원본 `choices` 배열 기준 인덱스다. `buildQuestionPool()` 내부에서 `shuffleChoices()`가 선택지를 셔플하면서 `answer`를 새 위치로 갱신한다.

### 점수 계산
- `easy` +5점 / `medium` +10점 / `hard` +15점
- 카테고리 단독(혼합 10문제) 최고점 = 4×5 + 4×10 + 2×15 = **90점**
- 전체 모드 최고점 = 90 × 4 = **360점**

### 순위 저장
- `localStorage` 키: `"quiz_leaderboard"`
- 구조: `{ "한국사": [...], "과학": [...], "지리": [...], "일반상식": [...], "전체": [...] }`
- 카테고리별 점수 내림차순 정렬, 상위 10개만 유지
- `QuotaExceededError` 발생 시 전체 데이터에서 가장 오래된 항목 1개를 삭제 후 재시도

---

## 문제 데이터 수정 시 주의사항

`data/questions.js`에서 문제를 추가/수정할 때 지켜야 할 규칙:
- `answer`는 **원본 `choices` 배열** 기준 0-based 인덱스여야 한다 (셔플 전)
- 카테고리별 난이도 배분 유지: easy 4 + medium 4 + hard 2 = 10문제
- 전체 모드 라운드 로빈이 균등하게 동작하려면 카테고리별 문제 수가 동일해야 한다

### 퀴즈 문제 교차 검증 가이드라인
문제 추가 전 반드시 확인:
1. **정답이 하나뿐인가?** — 다른 해석 가능 시 조건 명시 (예: 면적 기준, 2024년 기준)
2. **최상급 표현에 기준이 있는가?** — '가장 큰', '최초의' 등 표현에 측정 기준 명시
3. **시간과 범위가 명확한가?** — 변할 수 있는 정보는 시점 명시, 지리적·분류적 범위 한정
4. **교차 검증했는가?** — 의심스러운 정보는 2개 이상 출처 확인, 논란 있는 내용은 주류 학설 기준

---

## CSS 구조

CSS 변수는 `:root`에 집중 정의되어 있다. 색상 변경 시 `--color-*` 변수만 수정하면 된다.

```css
--color-primary / --color-primary-light / --color-primary-hover
--color-correct / --color-correct-light
--color-wrong   / --color-wrong-light
--color-bg / --color-card / --color-text / --color-text-sub / --color-border
```

화면 전환은 `.hidden { display: none !important }` 클래스 토글로 처리한다. 피드백 오버레이(`#overlay-feedback`)는 `position: fixed`로 다른 화면 위에 겹쳐 표시된다.
