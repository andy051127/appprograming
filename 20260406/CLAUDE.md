# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Structure

Planning documents and implementation are co-located at the root.

```
20260406/
├── prd.md           # Product requirements document (features, screens, data spec)
├── prompts.md       # 3-step Claude Code implementation prompts
├── checklist.md     # Per-step verification checklist (20 items each)
└── quiz-game/       # Implementation (no server needed — open directly in browser)
    ├── index.html
    ├── css/style.css
    ├── data/questions.js
    └── js/
        ├── game.js
        ├── quiz.js
        └── leaderboard.js
```

## Running the App

No build tools required. Open `quiz-game/index.html` directly in a browser.

```bash
# Windows
start quiz-game/index.html

# Local server (if needed for fetch/module restrictions)
npx serve quiz-game
python -m http.server 8080 --directory quiz-game
```

---

## Architecture

### Script Load Order (dependency order is fixed)
```
data/questions.js  →  js/game.js  →  js/quiz.js  →  js/leaderboard.js
```
The `QUESTIONS` global array and `POINTS`, `STATE`, `session` globals are declared in `game.js`. Both `quiz.js` and `leaderboard.js` reference them directly.

### Global Public API
| Name | File | Role |
|------|------|------|
| `QUESTIONS` | `data/questions.js` | Array of 40 question objects (global `const`) |
| `STATE`, `gameState`, `session`, `POINTS` | `game.js` | Game state and session data (global `let`/`const`) |
| `startGame()`, `submitAnswer()`, `nextQuestion()`, `restartGame()`, `goHome()`, `getMaxScore()` | `game.js` | Game logic functions (global) |
| `Quiz` | `quiz.js` | UI module (IIFE — exposes `showScreen`, `renderQuestion`, `showFeedback`, `showResult`, `showToast`) |
| `Leaderboard` | `leaderboard.js` | Ranking module (IIFE — exposes `show`, `saveScore`, `getLeaderboard`) |

### State Machine
```
IDLE → PLAYING → FEEDBACK → PLAYING (repeat)
                           → RESULT → LEADERBOARD → IDLE
IDLE → LEADERBOARD → IDLE
```
State transitions are owned by `game.js` functions. Screen rendering is delegated to `Quiz.*` methods, keeping logic and UI separate.

### Question Data Schema
```js
{
  id: number,
  category: "한국사" | "과학" | "지리" | "일반상식",
  subtopic: string,
  difficulty: "easy" | "medium" | "hard",
  question: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,   // 0-based index into the original choices array
  explanation: string
}
```
`answer` references the **pre-shuffle** `choices` index. `buildQuestionPool()` calls `shuffleChoices()` which shuffles the choices array and recalculates `answer` to the new position.

### Scoring
- `easy` +5 pts / `medium` +10 pts / `hard` +15 pts
- Max score per category (mixed, 10 questions) = 4×5 + 4×10 + 2×15 = **90 pts**
- Max score for full mode = 90 × 4 = **360 pts**

### Leaderboard Storage
- `localStorage` key: `"quiz_leaderboard"`
- Structure: `{ "한국사": [...], "과학": [...], "지리": [...], "일반상식": [...], "전체": [...] }`
- Each category list is sorted by score descending, capped at 10 entries
- On `QuotaExceededError`: delete the oldest entry across all categories, then retry once

---

## Editing Question Data

Rules to follow when adding or modifying questions in `data/questions.js`:
- `answer` must be the 0-based index into the **original (pre-shuffle) `choices` array**
- Keep the per-category difficulty distribution: easy 4 + medium 4 + hard 2 = 10 questions
- Keep the question count equal across all four categories so the full-mode round-robin stays balanced

### Question Cross-Validation Guidelines
Before adding any question, verify:
1. **Single unambiguous answer** — if multiple interpretations exist, add a qualifying condition (e.g., "by area", "as of 2024")
2. **Superlatives have a stated basis** — phrases like "largest" or "first" must specify the measurement criterion
3. **Time and scope are explicit** — information that can change must include a reference date; geographic or taxonomic scope must be bounded
4. **Cross-verified** — uncertain facts should be confirmed against two or more sources; contested content should follow the mainstream academic consensus

---

## CSS Structure

All color tokens are defined as CSS variables in `:root`. Change only `--color-*` variables to restyle the entire app.

```css
--color-primary / --color-primary-light / --color-primary-hover
--color-correct / --color-correct-light
--color-wrong   / --color-wrong-light
--color-bg / --color-card / --color-text / --color-text-sub / --color-border
```

Screen switching is handled by toggling `.hidden { display: none !important }`. The feedback overlay (`#overlay-feedback`) uses `position: fixed` to layer on top of the quiz screen without replacing it.
