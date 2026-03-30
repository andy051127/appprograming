# Todo Manager — Claude Code 단계별 구현 프롬프트 + 구현 결과

> **사용법**: 아래 5개 프롬프트를 순서대로 Claude Code에 붙여넣어 실행한다.
> 각 단계는 이전 단계의 결과물 위에 누적 구축된다.
> 참조 파일: `ToDo-PRD.md`

---

## Step 1 — HTML 뼈대 + CSS 스타일링

### 프롬프트

```
ToDo-PRD.md를 참고해서 index.html 파일을 새로 만들어줘.
이 단계에서는 JavaScript 로직 없이 HTML 구조와 CSS 스타일만 작성해.

요구사항:
- 단일 index.html 파일 (외부 라이브러리, CDN 사용 금지)
- HTML 구조:
  1. 헤더: 앱 타이틀 "Todo Manager" + 진행률 표시 영역 (progress bar + "0/0 (0%)" 텍스트)
  2. 필터 탭: [전체] [업무] [개인] [공부] 버튼 4개
  3. 입력 영역: 텍스트 input + 카테고리 select (업무/개인/공부) + 추가 버튼
  4. 할 일 목록: <ul id="todo-list"> 빈 컨테이너
- CSS 스타일:
  - 전체 max-width: 600px, 가운데 정렬
  - 카테고리별 색상 구분: 업무(파란계열), 개인(초록계열), 공부(주황계열)
  - 완료된 항목은 취소선 + 회색 처리
  - 활성 필터 탭은 하이라이트
  - 깔끔하고 심플한 디자인 (과도한 장식 없이)
- 검증: 브라우저에서 index.html을 열었을 때 레이아웃이 깨지지 않아야 함
```

### 구현 결과

- `index.html` 단일 파일 생성 (외부 의존성 없음)
- HTML 구조: 헤더 카드 / 필터 탭 바 / 입력+목록 카드 3영역
- 주요 DOM ID: `#progress-fill`, `#progress-text`, `#todo-list`, `#todo-input`, `#category-select`, `#add-btn`, `#clear-btn`
- 탭 배지 슬롯: `#badge-전체`, `#badge-업무`, `#badge-개인`, `#badge-공부`
- 카테고리 색상: 업무 `.cat-업무` (파랑 `#dbeafe`), 개인 `.cat-개인` (초록 `#dcfce7`), 공부 `.cat-공부` (주황 `#ffedd5`)
- 완료 항목: `.completed` 클래스 → `text-decoration: line-through` + 투명도 0.65
- 수정/삭제 버튼: 호버 시 `opacity: 1` 전환 (기본 숨김)
- 프로그레스 바: 그라데이션 (`#4a90e2` → `#7b5ea7`), `transition: width 0.3s`

---

## Step 2 — 데이터 레이어 (localStorage CRUD)

### 프롬프트

```
index.html의 </body> 직전에 <script> 태그를 추가해서
데이터 관리 레이어를 구현해줘. UI 렌더링은 이 단계에서 하지 않아도 돼.

데이터 모델:
{
  id: Date.now(),          // 고유 ID (timestamp)
  text: "할 일 내용",
  category: "업무",        // "업무" | "개인" | "공부"
  completed: false,
  createdAt: "2026-03-30"  // YYYY-MM-DD 형식
}

구현할 함수:
- loadTodos()   : localStorage에서 todos 배열 로드, 없으면 [] 반환
- saveTodos()   : todos 배열을 localStorage key "todos"에 JSON으로 저장
- addTodo(text, category)  : 새 항목 생성 후 저장
- deleteTodo(id)           : id로 항목 찾아 삭제 후 저장
- toggleTodo(id)           : completed 값 반전 후 저장
- editTodo(id, newText)    : text 수정 후 저장

추가 요구사항:
- 페이지 로드 시 loadTodos() 자동 실행
- todos 변수를 전역으로 유지해서 다음 단계에서 참조 가능하게 할 것
- 검증: 브라우저 콘솔에서 addTodo("테스트", "업무") 실행 후
  localStorage에 데이터가 저장되는지 확인
```

### 구현 결과

- 전역 변수: `const STORAGE_KEY = 'todos'`, `let todos = []`, `let activeFilter = '전체'`
- 구현 함수 6개:

| 함수 | 동작 |
|------|------|
| `loadTodos()` | `localStorage` 파싱, 실패 시 `[]` 폴백 |
| `saveTodos()` | `JSON.stringify(todos)` → `localStorage` 저장 |
| `addTodo(text, category)` | 빈 문자열 무시, `Date.now()` ID 부여 후 push |
| `deleteTodo(id)` | `filter`로 해당 id 제거 |
| `toggleTodo(id)` | `completed` 불리언 반전 |
| `editTodo(id, newText)` | 빈 문자열 무시, 텍스트 교체 |
| `clearCompleted()` | `completed: true` 항목 전체 제거 (Step 5용 선탑재) |

- 페이지 로드 시 `loadTodos()` 자동 실행

---

## Step 3 — 할 일 렌더링 + CRUD UI 연결

### 프롬프트

```
index.html의 script에 렌더링 함수와 이벤트 핸들러를 추가해줘.
Step 2에서 만든 데이터 함수들을 활용해.

구현할 내용:

1. renderTodos(filter = "전체") 함수:
   - filter 값에 따라 todos 배열 필터링 ("전체"면 전부 표시)
   - #todo-list를 초기화하고 필터된 항목들을 <li>로 렌더링
   - 각 <li> 구조:
     [체크박스] [할 일 텍스트] [카테고리 뱃지] [수정 버튼] [삭제 버튼]
   - 완료된 항목은 li에 "completed" 클래스 추가

2. 이벤트 핸들러:
   - 추가 버튼 클릭 / input에서 Enter: addTodo() 호출 후 renderTodos()
   - 체크박스 클릭: toggleTodo(id) 후 renderTodos()
   - 삭제 버튼 클릭: deleteTodo(id) 후 renderTodos()
   - 할 일 텍스트 더블클릭: 해당 텍스트를 <input>으로 교체,
     Enter 또는 포커스 아웃 시 editTodo(id, newText) 후 renderTodos()

3. 페이지 로드 시 renderTodos() 자동 실행

검증:
- 할 일 추가 → 목록에 표시되는지 확인
- 체크박스 클릭 → 취소선 표시되는지 확인
- 삭제 버튼 → 목록에서 제거되는지 확인
- 텍스트 더블클릭 → 인라인 수정 가능한지 확인
```

### 구현 결과

- `renderTodos(filter)`: `#todo-list` 전체 초기화 후 재렌더링
- 각 `<li>` 구성: 체크박스 → 텍스트 span → 카테고리 뱃지 → 액션(수정/삭제) 버튼
- `startEdit(li, todo)`: 텍스트 span을 `<input>`으로 교체, `Enter` 확정 / `Escape` 취소 / blur 확정
- 입력 유효성: 빈 문자열 → `input.focus()`만 실행, 추가 안 함
- 이벤트: `#add-btn` click, `#todo-input` keydown(Enter), `#clear-btn` click

---

## Step 4 — 카테고리 필터 탭 연결

### 프롬프트

```
index.html의 script에 필터 탭 기능을 추가해줘.
Step 3의 renderTodos(filter) 함수를 활용해.

구현할 내용:

1. activeFilter 전역 변수 (기본값: "전체")

2. 필터 탭 이벤트:
   - [전체] [업무] [개인] [공부] 탭 클릭 시 activeFilter 업데이트
   - activeFilter에 해당하는 탭 버튼에 "active" 클래스 추가
   - renderTodos(activeFilter) 재호출

3. 각 탭에 미완료 건수 배지 표시:
   - 예: [업무 3] — 해당 카테고리의 미완료(completed: false) 개수
   - [전체] 탭은 전체 미완료 건수
   - 미완료가 0이면 배지 숨김

4. renderTodos() 호출할 때마다 탭 배지도 업데이트

검증:
- 탭 클릭 시 해당 카테고리 항목만 표시되는지 확인
- 항목 완료 체크 시 탭 배지 숫자가 줄어드는지 확인
- 활성 탭이 시각적으로 구분되는지 확인
```

### 구현 결과

- `updateTabs()`: 카테고리별 미완료 건수 계산 → 배지 텍스트/표시 토글 → `.active` 클래스 갱신
- `renderTodos` 래핑 패턴: 원본 함수를 `_renderTodos`로 보존 후, 호출마다 `updateTabs()` + `updateProgress()` + `updateClearBtn()` 자동 연쇄 실행
- `updateClearBtn()`: 완료 항목 유무로 `#clear-btn` `disabled` 속성 제어
- 배지 0이면 `display: none` 처리

---

## Step 5 — 진행률 표시 + 마무리 polish

### 프롬프트

```
index.html의 script에 진행률 업데이트 함수를 추가하고,
UX를 개선하는 마무리 작업을 해줘.

구현할 내용:

1. updateProgress() 함수:
   - 전체 진행률: 완료 수 / 전체 수 × 100% (정수 반올림)
   - HTML의 progress bar 너비를 % 값으로 업데이트
   - "완료수/전체수 (퍼센트%)" 텍스트 업데이트
   - todos가 비어있으면 0/0 (0%) 표시
   - renderTodos() 호출 시마다 updateProgress()도 함께 호출

2. 빈 상태 메시지:
   - 필터 결과가 없을 때 #todo-list에 "할 일이 없습니다" 메시지 표시

3. 완료 항목 일괄 삭제 버튼:
   - 입력 영역 아래 또는 목록 상단에 "완료 항목 삭제" 버튼 추가
   - 클릭 시 completed: true인 항목 전체 삭제 후 renderTodos()
   - 완료 항목이 없으면 버튼 비활성화(disabled)

4. 입력 유효성 검사:
   - 빈 텍스트로 추가 시도 시 input에 포커스만 주고 추가하지 않음

검증 (최종 통합 테스트):
1. 할 일 3개 추가 (카테고리 각각 다르게)
2. 1개 완료 체크 → 진행률 바 업데이트 확인
3. 카테고리 탭 필터링 확인
4. 페이지 새로고침 → 데이터 그대로 유지 확인
5. "완료 항목 삭제" 버튼으로 완료된 항목 일괄 삭제 확인
```

### 구현 결과

- `updateProgress()`:
  - `완료 수 / 전체 수 × 100%` 계산 → `#progress-fill` width 업데이트
  - `#progress-text` → `"완료/전체 (N%)"` 텍스트 갱신
  - 헤더에 카테고리별 통계 칩 렌더링 (`#cat-stats`) — 항목 없는 카테고리는 숨김
- 카테고리 통계 칩 예시: `업무 2/5`, `개인 1/3`, `공부 0/2`
- 빈 상태: 필터 결과 0개이면 `<li class="empty-state">할 일이 없습니다</li>` 표시
- "완료 항목 삭제" 버튼: 완료 항목 없으면 `disabled`, 클릭 시 `clearCompleted()` 호출

---

## 최종 함수 구조 요약

```
[데이터 레이어]
  loadTodos()        saveTodos()
  addTodo()          deleteTodo()
  toggleTodo()       editTodo()
  clearCompleted()

[렌더링]
  renderTodos(filter)   ← activeFilter 기반, 래핑으로 아래 3개 자동 연쇄
    └─ updateTabs()
    └─ updateProgress()
    └─ updateClearBtn()
  startEdit(li, todo)

[전역 상태]
  todos[]            activeFilter
```

## 완성 후 파일 구조

```
C:\AppPrograming\20260330\
  index.html       ← 단일 파일로 브라우저에서 바로 실행
  ToDo-PRD.md      ← 요구사항 문서
  ToDo-Prompts.md  ← 이 파일
```
