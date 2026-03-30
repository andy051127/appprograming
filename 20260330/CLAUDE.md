# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

날짜(YYYYMMDD) 폴더 단위로 프로젝트를 관리한다. 각 폴더는 독립된 앱이다.

```
AppPrograming/
├── 20260316/          # 포트폴리오 (정적 HTML)
│   └── portfolio.html
├── 20260323/          # MNIST 손글씨 숫자 인식 (PyTorch)
│   ├── desktop_version/   # tkinter GUI
│   ├── web_version/       # Flask 웹서버
│   ├── digit_model.pth    # 두 버전 공유 학습 모델
│   └── CLAUDE.md          # 해당 프로젝트 상세 가이드
└── 20260330/          # Todo Manager (Vanilla JS)
    ├── index.html         # 단일 파일 앱 (HTML + CSS + JS 인라인)
    ├── ToDo-PRD.md        # 요구사항 문서
    └── ToDo-Prompts.md    # 단계별 구현 프롬프트 + 결과 기록
```

## Projects

### 20260316 — 포트폴리오
- 단일 `portfolio.html`, 외부 의존성 없음
- 한국어 UI, 대상: 김찬희 백엔드 개발자

### 20260323 — MNIST 손글씨 인식
- 실행: `cd desktop_version && python app.py` 또는 `cd web_version && python app.py`
- 웹 버전 브라우저: `http://127.0.0.1:5000`
- 자세한 내용은 `20260323/CLAUDE.md` 참조

### 20260330 — Todo Manager
- 실행: `index.html`을 브라우저에서 직접 열기 (서버 불필요)
- 빌드/번들 과정 없음, 외부 라이브러리 없음
- 데이터는 `localStorage` key `"todos"`에 자동 저장

## Todo Manager 아키텍처 (20260330)

`index.html` 한 파일에 HTML/CSS/JS가 모두 인라인으로 포함된다.

**JS 실행 흐름:**
```
페이지 로드
  → loadTodos()          # localStorage 복원
  → renderTodos('전체')  # 래핑 함수 (아래 3개 자동 연쇄)
      ├─ updateTabs()        # 탭 배지 + active 클래스
      ├─ updateProgress()    # 프로그레스 바 + 카테고리 통계 칩
      └─ updateClearBtn()    # 완료 항목 유무로 버튼 disabled
```

**전역 상태:** `todos[]`, `activeFilter`

**데이터 모델:**
```js
{ id: Date.now(), text, category, completed, createdAt }
// category: "업무" | "개인" | "공부"
```

**인라인 편집 패턴:** 텍스트 더블클릭 → `startEdit(li, todo)` → span을 `<input>`으로 교체 → Enter/blur 확정, Escape 취소

## Convention

- 새 프로젝트는 `YYYYMMDD/` 폴더를 만들어 시작
- 정적 웹앱은 단일 HTML 파일, CDN 금지
- `.bat` 파일에 `chcp 65001` 사용 금지 (UTF-8 배치 파일에서 명령어 깨짐)
