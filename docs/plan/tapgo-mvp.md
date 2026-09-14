# TapGo MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng TapGo, web app desktop cho trẻ khoảng 6 tuổi luyện bàn phím và chuột qua 10 mini-game, có lộ trình, chơi tự do, speech tiếng Việt và tiến độ lưu localStorage.

**Architecture:** React app chạy hoàn toàn client-side. `GameShell` sở hữu session state, star scoring, feedback và persistence; mỗi mini-game chỉ xử lý luật chơi của mình qua một interface chung. App dùng view state thay vì router, localStorage thay backend và Web Speech/Web Audio API với graceful fallback.

**Tech Stack:** React + Vite + TypeScript, Vitest, React Testing Library, user-event, CSS thuần với design tokens.

**Spec:** `docs/feat/tapgo-mvp.md`

## Global Constraints

- Target: desktop/laptop; viewport dưới 900 px hiện desktop gate.
- Không backend, login, telemetry hoặc dữ liệu cá nhân.
- Persistence key: `tapgo.progress.v1`.
- Không countdown hoặc chấm tốc độ.
- Learning Path unlock tuần tự; Free Play luôn mở cả 10 game.
- 1 sao khi hoàn thành, 2 sao khi accuracy >= 0.75, 3 sao khi accuracy >= 0.90.
- Speech dùng `vi-VN`, có nút nghe lại và phải fail-open nếu API unavailable.
- Sai thao tác dùng phản hồi nhẹ “Thử lại nhé!”, không failure screen.
- Click/drag target tối thiểu 72 x 72 CSS px.
- Mỗi game dùng `GameShell`; mini-game không tự ghi localStorage.
- Dùng Pointer Events cho drag, không dùng HTML5 Drag and Drop.
- Native emoji là asset gameplay của MVP; không thêm image pipeline hay animation library.

---

## File map

```text
/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── docs/
│   ├── index.md
│   ├── feat/tapgo-mvp.md
│   └── plan/tapgo-mvp.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.test.tsx
    ├── styles/
    │   ├── theme.css
    │   └── app.css
    ├── test/setup.ts
    ├── game/
    │   ├── types.ts
    │   ├── registry.ts
    │   ├── registry.test.ts
    │   ├── scoring.ts
    │   ├── scoring.test.ts
    │   ├── progress.ts
    │   ├── progress.test.ts
    │   ├── path.ts
    │   ├── path.test.ts
    │   ├── GameShell.tsx
    │   └── GameShell.test.tsx
    ├── hooks/
    │   ├── useSpeech.ts
    │   ├── useSpeech.test.ts
    │   ├── useFeedbackTone.ts
    │   └── usePointerDrag.ts
    ├── components/
    │   ├── ActionButton.tsx
    │   ├── DesktopGate.tsx
    │   ├── ProgressBar.tsx
    │   ├── StarRating.tsx
    │   └── GameCard.tsx
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── LearningPathScreen.tsx
    │   ├── FreePlayScreen.tsx
    │   └── ProgressScreen.tsx
    └── games/
        ├── LetterKeyGame.tsx
        ├── NumberKeyGame.tsx
        ├── WordTypingGame.tsx
        ├── FindKeyGame.tsx
        ├── SequenceTypingGame.tsx
        ├── ClickTargetGame.tsx
        ├── PickPictureGame.tsx
        ├── MouseTrailGame.tsx
        ├── DragSortGame.tsx
        └── DragMatchGame.tsx
```

### Shared interfaces

```ts
export type GameId =
  | 'letters'
  | 'numbers'
  | 'words'
  | 'find-key'
  | 'sequence'
  | 'click-target'
  | 'pick-picture'
  | 'mouse-trail'
  | 'drag-sort'
  | 'drag-match';

export type RoundOutcome = {
  correct: number;
  attempts: number;
};

export type MiniGameProps = {
  roundIndex: number;
  totalRounds: number;
  onRoundComplete: (outcome: RoundOutcome) => void;
  speak: (text: string) => void;
};

export type GameDefinition = {
  id: GameId;
  title: string;
  category: 'keyboard' | 'mouse';
  order: number;
  rounds: number;
  intro: string;
  emoji: string;
  component: React.ComponentType<MiniGameProps>;
};
```

---

### Task 1: Project foundation and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`
- Create: `src/styles/theme.css`
- Create: `src/styles/app.css`

**Interfaces:**
- Produces: Vite React TypeScript app with `npm run dev`, `npm run build`, `npm test`.
- Produces: one design-token source in `src/styles/theme.css`.

- [x] **Step 1: Initialize repository and npm package**

Run:

```bash
git init
npm init -y
npm install react react-dom
npm install -D vite typescript @types/react @types/react-dom @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Then set scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [x] **Step 2: Write the failing app smoke test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the TapGo home heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'TapGo' })).toBeInTheDocument();
  });
});
```

- [x] **Step 3: Run test and verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because `App` or test setup is not implemented.

- [x] **Step 4: Add minimal Vite/test setup and home shell**

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>TapGo</h1>
    </main>
  );
}
```

`src/styles/theme.css` defines one semantic token source:

```css
:root {
  --color-bg: #fff8e8;
  --color-surface: #ffffff;
  --color-primary: #4f46e5;
  --color-primary-soft: #e8e7ff;
  --color-success: #15803d;
  --color-text: #202124;
  --color-muted: #687078;
  --radius-card: 24px;
  --radius-pill: 999px;
  --shadow-card: 0 10px 30px rgb(32 33 36 / 10%);
  --motion-fast: 180ms;
  --motion-feedback: 520ms;
}
```

- [x] **Step 5: Run test and production build**

Run: `npm test -- src/App.test.tsx && npm run build`

Expected: PASS and Vite build succeeds.

- [x] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src
git commit -m "chore: scaffold TapGo React app"
```

---

### Task 2: Game domain, scoring, progress persistence, and unlock logic

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/scoring.ts`
- Create: `src/game/scoring.test.ts`
- Create: `src/game/progress.ts`
- Create: `src/game/progress.test.ts`
- Create: `src/game/path.ts`
- Create: `src/game/path.test.ts`

**Interfaces:**
- Produces: `calculateStars(outcomes): 1 | 2 | 3`.
- Produces: `loadProgress()`, `saveProgress(state)`, `recordCompletion(state, gameId, stars)`.
- Produces: `isPathUnlocked(gameId, progress)`.

- [x] **Step 1: Write failing scoring tests**

```ts
it('returns 1 star for completed low-accuracy session', () => {
  expect(calculateStars([{ correct: 4, attempts: 8 }])).toBe(1);
});

it('returns 2 stars at 75 percent accuracy', () => {
  expect(calculateStars([{ correct: 6, attempts: 8 }])).toBe(2);
});

it('returns 3 stars at 90 percent accuracy', () => {
  expect(calculateStars([{ correct: 9, attempts: 10 }])).toBe(3);
});
```

- [x] **Step 2: Write failing persistence and path tests**

Cover these exact cases:

```ts
expect(loadProgressFrom(null)).toEqual(createDefaultProgress());
expect(loadProgressFrom('{bad json')).toEqual(createDefaultProgress());

const completed = recordCompletion(createDefaultProgress(), 'letters', 2);
expect(completed.games.letters.bestStars).toBe(2);
expect(recordCompletion(completed, 'letters', 1).games.letters.bestStars).toBe(2);

expect(isPathUnlocked('letters', createDefaultProgress())).toBe(true);
expect(isPathUnlocked('numbers', createDefaultProgress())).toBe(false);
expect(isPathUnlocked('numbers', completed)).toBe(true);
```

- [x] **Step 3: Run tests and verify failures**

Run: `npm test -- src/game/scoring.test.ts src/game/progress.test.ts src/game/path.test.ts`

Expected: FAIL because functions do not exist.

- [x] **Step 4: Implement exact progress schema**

```ts
export type GameProgress = {
  plays: number;
  bestStars: 0 | 1 | 2 | 3;
  completed: boolean;
  lastPlayedAt: string | null;
};

export type ProgressState = {
  version: 1;
  lastGameId: GameId | null;
  games: Record<GameId, GameProgress>;
};

export const PROGRESS_KEY = 'tapgo.progress.v1';
```

`saveProgress` wraps `localStorage.setItem` in `try/catch`; a write failure must not throw into UI.

- [x] **Step 5: Implement scoring and unlock rules**

```ts
export function calculateStars(outcomes: RoundOutcome[]): 1 | 2 | 3 {
  const correct = outcomes.reduce((sum, item) => sum + item.correct, 0);
  const attempts = outcomes.reduce((sum, item) => sum + item.attempts, 0);
  const accuracy = attempts === 0 ? 0 : correct / attempts;
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.75) return 2;
  return 1;
}
```

Path order is the exact ten-game order from the spec. Game 1 is always unlocked; each later game checks `completed` on its immediate predecessor.

- [x] **Step 6: Run tests**

Run: `npm test -- src/game`

Expected: PASS.

- [x] **Step 7: Commit**

```bash
git add src/game
git commit -m "feat: add TapGo game progress model"
```

---

### Task 3: Speech, feedback sound, and GameShell

**Files:**
- Create: `src/hooks/useSpeech.ts`
- Create: `src/hooks/useSpeech.test.ts`
- Create: `src/hooks/useFeedbackTone.ts`
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/StarRating.tsx`
- Create: `src/game/GameShell.tsx`
- Create: `src/game/GameShell.test.tsx`

**Interfaces:**
- Produces: `useSpeech(): { speak(text: string): void; supported: boolean }`.
- Produces: `useFeedbackTone(): { correct(): void; retry(): void }`.
- Produces: `GameShell` consuming one `GameDefinition` and completing a session.

- [x] **Step 1: Write failing speech fallback tests**

```ts
it('does not throw when speechSynthesis is unavailable', () => {
  Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
  const { result } = renderHook(() => useSpeech());
  expect(() => result.current.speak('Hãy bấm chữ A')).not.toThrow();
  expect(result.current.supported).toBe(false);
});
```

- [x] **Step 2: Write failing GameShell round-flow test**

Use a fake mini-game that calls `onRoundComplete({ correct: 1, attempts: 1 })`. Assert:

```ts
expect(screen.getByText('1 / 2')).toBeInTheDocument();
await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
expect(screen.getByText('2 / 2')).toBeInTheDocument();
```

After second round, assert `3 sao` and an `onComplete` callback.

- [x] **Step 3: Run tests and verify failure**

Run: `npm test -- src/hooks/useSpeech.test.ts src/game/GameShell.test.tsx`

Expected: FAIL.

- [x] **Step 4: Implement speech wrapper**

```ts
export function speakVietnamese(text: string) {
  if (!('speechSynthesis' in window) || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
```

- [x] **Step 5: Implement feedback tones without audio assets**

Use a lazily-created `AudioContext`. `correct()` plays two short oscillator tones; `retry()` plays one short low-volume tone. Every Audio API call is inside `try/catch` and returns silently on unsupported browsers.

- [x] **Step 6: Implement GameShell**

GameShell must:
- speak `definition.intro` from the listen button
- display `roundIndex + 1 / totalRounds`
- aggregate `RoundOutcome[]`
- render the mini-game component from `definition.component`
- calculate stars after last round
- call `onComplete(gameId, stars)`
- render buttons `Chơi lại`, `Bài tiếp theo`, `Về nhà`

- [x] **Step 7: Run tests**

Run: `npm test -- src/hooks src/game/GameShell.test.tsx`

Expected: PASS.

- [x] **Step 8: Commit**

```bash
git add src/hooks src/components src/game/GameShell.tsx src/game/GameShell.test.tsx
git commit -m "feat: add shared game session shell"
```

---

### Task 4: App navigation, Home, Path, Free Play, Progress, and desktop gate

**Files:**
- Create: `src/components/ActionButton.tsx`
- Create: `src/components/DesktopGate.tsx`
- Create: `src/components/GameCard.tsx`
- Create: `src/screens/HomeScreen.tsx`
- Create: `src/screens/LearningPathScreen.tsx`
- Create: `src/screens/FreePlayScreen.tsx`
- Create: `src/screens/ProgressScreen.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Produces: `AppView = 'home' | 'path' | 'free-play' | 'progress' | 'game'`.
- Consumes: progress functions and game registry.
- Produces: end-to-end navigation without a router dependency.

- [x] **Step 1: Write failing navigation tests**

Assert exact flows:
- Home -> `Bắt đầu lộ trình` -> Learning Path.
- Home -> `Chơi tự do` -> all 10 cards visible.
- Home -> `Tiến độ` -> total best stars visible.
- incomplete game 2 is disabled in Path but enabled in Free Play.

- [x] **Step 2: Run tests and verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL.

- [x] **Step 3: Implement view state**

```ts
type AppView =
  | { name: 'home' }
  | { name: 'path' }
  | { name: 'free-play' }
  | { name: 'progress' }
  | { name: 'game'; gameId: GameId };
```

Do not add React Router.

- [x] **Step 4: Implement desktop gate**

At `window.matchMedia('(max-width: 899px)')`, render:

```text
Hãy mở TapGo trên máy tính để luyện bàn phím và chuột.
```

Do not block 900 px and above.

- [x] **Step 5: Implement progress integration**

On game completion:
1. call `recordCompletion`
2. update React state
3. call `saveProgress`
4. leave session result visible until user chooses next action

- [x] **Step 6: Run app tests and build**

Run: `npm test -- src/App.test.tsx && npm run build`

Expected: PASS.

- [x] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/components src/screens
git commit -m "feat: add TapGo learning navigation"
```

---

### Task 5: Vertical slice keyboard game — Gõ chữ cái

**Files:**
- Create: `src/games/LetterKeyGame.tsx`
- Create: `src/games/LetterKeyGame.test.tsx`
- Modify: `src/game/registry.ts`
- Modify: `src/game/registry.test.ts`

**Interfaces:**
- Produces: game id `letters`, 10 rounds.
- Consumes: `MiniGameProps`.

- [x] **Step 1: Write failing interaction tests**

Round 0 target is `A`.

```ts
await user.keyboard('x');
expect(onRoundComplete).not.toHaveBeenCalled();

await user.keyboard('a');
expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
```

- [x] **Step 2: Run and verify failure**

Run: `npm test -- src/games/LetterKeyGame.test.tsx`

Expected: FAIL.

- [x] **Step 3: Implement deterministic target sequence**

```ts
const LETTERS = ['A', 'M', 'S', 'L', 'P', 'E', 'B', 'C', 'N', 'T'] as const;
```

Listen on `window.keydown` only while mounted. Normalize with `event.key.toUpperCase()`. Ignore modifier-only keys.

- [x] **Step 4: Register game**

```ts
{
  id: 'letters',
  title: 'Gõ chữ cái',
  category: 'keyboard',
  order: 1,
  rounds: 10,
  intro: 'Hãy bấm chữ đang hiện trên màn hình.',
  emoji: '🔤',
  component: LetterKeyGame,
}
```

- [x] **Step 5: Run game tests and registry tests**

Run: `npm test -- src/games/LetterKeyGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add src/games/LetterKeyGame.tsx src/games/LetterKeyGame.test.tsx src/game/registry.ts src/game/registry.test.ts
git commit -m "feat: add letter keyboard game"
```

---

### Task 6: Vertical slice mouse game — Click mục tiêu lớn

**Files:**
- Create: `src/games/ClickTargetGame.tsx`
- Create: `src/games/ClickTargetGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: game id `click-target`, 12 rounds.
- Validates: pointer gameplay, attempt counting, shared GameShell flow.

- [x] **Step 1: Write failing tests**

Assert background click increments attempt but does not complete; target click completes:

```ts
await user.click(screen.getByTestId('play-area'));
expect(onRoundComplete).not.toHaveBeenCalled();

await user.click(screen.getByRole('button', { name: 'Mục tiêu' }));
expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
```

- [x] **Step 2: Run and verify failure**

Run: `npm test -- src/games/ClickTargetGame.test.tsx`

Expected: FAIL.

- [x] **Step 3: Implement safe target positions**

Use a fixed normalized position table indexed by round, not `Math.random()`, so tests and repeat sessions are deterministic:

```ts
const POSITIONS = [
  [15, 20], [70, 18], [42, 32], [20, 58], [74, 56], [48, 72],
  [28, 38], [62, 40], [14, 72], [80, 70], [50, 18], [36, 62],
] as const;
```

Use percentages within an inset play area so the 72 px target never clips.

- [x] **Step 4: Register game**

Set order 6, 12 rounds, intro `Hãy click vào ngôi sao.`, emoji `⭐`.

- [x] **Step 5: Run tests and full vertical-slice flow**

Run: `npm test && npm run build`

Expected: all current tests PASS.

- [x] **Step 6: Commit**

```bash
git add src/games/ClickTargetGame.tsx src/games/ClickTargetGame.test.tsx src/game/registry.ts
git commit -m "feat: add click target mouse game"
```

---

### Task 7: Gõ số

**Files:**
- Create: `src/games/NumberKeyGame.tsx`
- Create: `src/games/NumberKeyGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: game id `numbers`, 10 rounds.

- [ ] **Step 1: Write failing test**

Round 0 target `1`; pressing `2` then `1` produces `{ correct: 1, attempts: 2 }`.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/NumberKeyGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement number sequence**

```ts
const NUMBERS = ['1', '5', '9', '2', '8', '3', '7', '4', '6', '0'] as const;
```

Use the same keyboard-event pattern as LetterKeyGame without extracting a generic hook unless the duplicated code reaches a clear stable interface during implementation.

- [ ] **Step 4: Register order 2 and run tests**

Run: `npm test -- src/games/NumberKeyGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/games/NumberKeyGame.tsx src/games/NumberKeyGame.test.tsx src/game/registry.ts
git commit -m "feat: add number keyboard game"
```

---

### Task 8: Gõ từ ngắn

**Files:**
- Create: `src/games/WordTypingGame.tsx`
- Create: `src/games/WordTypingGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: game id `words`, 8 rounds.
- Words: `ME`, `BA`, `CON`, `MEO`, `CHO`, `NHA`, `XE`, `CA`.

- [ ] **Step 1: Write failing tests**

For `ME`:
- `m` highlights second character but does not complete.
- wrong `x` increments attempts and keeps same position.
- `e` completes with correct count 2 and total attempts including mistakes.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/WordTypingGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement character cursor**

Keep:
```ts
const [charIndex, setCharIndex] = useState(0);
const [attempts, setAttempts] = useState(0);
```

A correct key advances `charIndex`; wrong key leaves it unchanged. Completion reports `correct: word.length`.

- [ ] **Step 4: Register order 3 and run tests**

Run: `npm test -- src/games/WordTypingGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/games/WordTypingGame.tsx src/games/WordTypingGame.test.tsx src/game/registry.ts
git commit -m "feat: add short word typing game"
```

---

### Task 9: Tìm phím đúng

**Files:**
- Create: `src/games/FindKeyGame.tsx`
- Create: `src/games/FindKeyGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: game id `find-key`, 10 rounds.
- Targets: `A M S L P E B C N T`.

- [ ] **Step 1: Write failing test**

Assert visible instruction `Hãy bấm chữ M` for the matching round and correct physical key completes it.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/FindKeyGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement instruction-first presentation**

The screen must show one large sentence and one large keycap visual. Call `speak('Hãy bấm chữ M')` when the game-specific listen control is activated; do not auto-loop speech after every wrong key.

- [ ] **Step 4: Register order 4, run tests, commit**

Run: `npm test -- src/games/FindKeyGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

```bash
git add src/games/FindKeyGame.tsx src/games/FindKeyGame.test.tsx src/game/registry.ts
git commit -m "feat: add find key game"
```

---

### Task 10: Gõ chuỗi phím

**Files:**
- Create: `src/games/SequenceTypingGame.tsx`
- Create: `src/games/SequenceTypingGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: game id `sequence`, 8 rounds.
- Sequences: `ASD`, `JKL`, `QWE`, `RTY`, `ABC`, `MEO`, `CON`, `NHA`.

- [ ] **Step 1: Write failing cursor behavior tests**

Assert:
- correct key advances highlight
- wrong key does not reset progress
- final key completes round with `correct = sequence.length`

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/SequenceTypingGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement sequence cursor**

Render each character as a large key chip. Apply `data-active="true"` only to current character so CSS owns the visual variant.

- [ ] **Step 4: Register order 5, run tests, commit**

Run: `npm test -- src/games/SequenceTypingGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

```bash
git add src/games/SequenceTypingGame.tsx src/games/SequenceTypingGame.test.tsx src/game/registry.ts
git commit -m "feat: add key sequence game"
```

---

### Task 11: Click đúng hình

**Files:**
- Create: `src/games/PickPictureGame.tsx`
- Create: `src/games/PickPictureGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: game id `pick-picture`, 10 rounds.

- [ ] **Step 1: Write failing choice tests**

Use exact first round:

```ts
{
  prompt: 'Click con mèo',
  answer: '🐱',
  options: ['🐱', '🐶', '🐰']
}
```

Wrong choice does not complete; correct choice reports attempts including the wrong click.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/PickPictureGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement ten deterministic rounds**

Use these prompts/answers:

```ts
[
  ['Click con mèo', '🐱', ['🐱', '🐶', '🐰']],
  ['Click ô tô', '🚗', ['🚌', '🚗', '🚲']],
  ['Click tên lửa', '🚀', ['⭐', '🚀', '🌙']],
  ['Click quả táo', '🍎', ['🍌', '🍎', '🍇']],
  ['Click con cá', '🐟', ['🐟', '🐸', '🐦']],
  ['Click quả bóng', '⚽', ['🎈', '⚽', '🧸']],
  ['Click ngôi sao', '⭐', ['🌙', '☀️', '⭐']],
  ['Click xe đạp', '🚲', ['🚲', '🚗', '🚂']],
  ['Click con thỏ', '🐰', ['🐻', '🐰', '🐱']],
  ['Click mặt trời', '☀️', ['⭐', '☀️', '🌙']],
]
```

- [ ] **Step 4: Register order 7, run tests, commit**

Run: `npm test -- src/games/PickPictureGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

```bash
git add src/games/PickPictureGame.tsx src/games/PickPictureGame.test.tsx src/game/registry.ts
git commit -m "feat: add picture choice mouse game"
```

---

### Task 12: Rê chuột theo đường

**Files:**
- Create: `src/games/MouseTrailGame.tsx`
- Create: `src/games/MouseTrailGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: game id `mouse-trail`, 6 rounds.
- Uses pointer enter/move only; no mouse button required.

- [ ] **Step 1: Write failing checkpoint test**

Render five checkpoints with `data-checkpoint="0"..."4"`. Entering checkpoint 1 before checkpoint 0 must not advance. Entering 0,1,2,3,4 in order completes with `{ correct: 5, attempts: 5 }`.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/MouseTrailGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement normalized trail patterns**

Create six arrays of 5 points using percentage coordinates. Only the next checkpoint is active. Leaving the visual path does not reset progress.

- [ ] **Step 4: Register order 8, run tests, commit**

Run: `npm test -- src/games/MouseTrailGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

```bash
git add src/games/MouseTrailGame.tsx src/games/MouseTrailGame.test.tsx src/game/registry.ts
git commit -m "feat: add mouse trail game"
```

---

### Task 13: Shared Pointer Events drag primitive + Kéo thả phân loại

**Files:**
- Create: `src/hooks/usePointerDrag.ts`
- Create: `src/games/DragSortGame.tsx`
- Create: `src/games/DragSortGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Produces: `usePointerDrag` with `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`, and current translation.
- Produces: game id `drag-sort`, 8 rounds.

- [ ] **Step 1: Write failing pointer tests**

Assert pointer down -> move -> pointer up over wrong zone resets transform and does not complete. Repeating over correct zone completes with attempts 2.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/DragSortGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement reusable drag hook**

The hook must:
- call `setPointerCapture(pointerId)`
- store start and current coordinates
- expose CSS transform values
- on cancel, reset to `0,0`
- never know game-specific target rules

- [ ] **Step 4: Implement deterministic sort rounds**

```ts
[
  { item: '🍎', target: '🧺', label: 'Kéo quả táo vào giỏ' },
  { item: '🍌', target: '🧺', label: 'Kéo quả chuối vào giỏ' },
  { item: '🚗', target: '🅿️', label: 'Kéo ô tô vào chỗ đỗ' },
  { item: '🚲', target: '🅿️', label: 'Kéo xe đạp vào chỗ đỗ' },
  { item: '🐱', target: '🏠', label: 'Kéo mèo về nhà' },
  { item: '🐶', target: '🏠', label: 'Kéo chó về nhà' },
  { item: '🚀', target: '🌌', label: 'Kéo tên lửa lên trời' },
  { item: '⭐', target: '🌌', label: 'Kéo ngôi sao lên trời' },
]
```

- [ ] **Step 5: Register order 9, run tests, commit**

Run: `npm test -- src/games/DragSortGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

```bash
git add src/hooks/usePointerDrag.ts src/games/DragSortGame.tsx src/games/DragSortGame.test.tsx src/game/registry.ts
git commit -m "feat: add drag sorting game"
```

---

### Task 14: Kéo thả ghép cặp

**Files:**
- Create: `src/games/DragMatchGame.tsx`
- Create: `src/games/DragMatchGame.test.tsx`
- Modify: `src/game/registry.ts`

**Interfaces:**
- Consumes: `usePointerDrag`.
- Produces: game id `drag-match`, 8 rounds.

- [ ] **Step 1: Write failing match test**

First round has source `🐱` and three destination cards labeled `Mèo`, `Chó`, `Thỏ`. Wrong drop resets; correct drop completes and includes both attempts.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- src/games/DragMatchGame.test.tsx`

Expected: FAIL.

- [ ] **Step 3: Implement eight pair rounds**

Use:
- 🐱 -> Mèo
- 🐶 -> Chó
- 🐰 -> Thỏ
- 🚗 -> Ô tô
- 🚲 -> Xe đạp
- 🚀 -> Tên lửa
- 🍎 -> Táo
- ⚽ -> Bóng

Each round shows three large destination cards with exactly one correct label.

- [ ] **Step 4: Register order 10, run tests, commit**

Run: `npm test -- src/games/DragMatchGame.test.tsx src/game/registry.test.ts`

Expected: PASS.

```bash
git add src/games/DragMatchGame.tsx src/games/DragMatchGame.test.tsx src/game/registry.ts
git commit -m "feat: add drag matching game"
```

---

### Task 15: Visual polish, accessibility-safe feedback, and full acceptance flow

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `src/styles/app.css`
- Modify: `src/components/ActionButton.tsx`
- Modify: `src/components/GameCard.tsx`
- Modify: `src/game/GameShell.tsx`
- Modify: `src/App.test.tsx`
- Modify: `docs/index.md`
- Modify: `docs/feat/tapgo-mvp.md` only if implementation intentionally changes a specified behavior

**Interfaces:**
- Produces: consistent child-friendly visual system and final verified MVP.

- [ ] **Step 1: Add failing integration tests**

Add exact tests:
1. Complete `letters` with perfect input -> 3 stars -> localStorage contains `bestStars: 3`.
2. Re-render App -> `numbers` is unlocked in Learning Path.
3. Free Play opens `drag-match` even when Path has not unlocked it.
4. Delete `window.speechSynthesis` -> open a game -> app does not crash.
5. Seed corrupt localStorage -> App renders Home and resets to default progress.

- [ ] **Step 2: Run integration tests and verify failures where wiring is incomplete**

Run: `npm test -- src/App.test.tsx`

Expected: any missing end-to-end wiring is exposed before polish.

- [ ] **Step 3: Apply the visual system**

Use only theme tokens for app-wide values. Required visible behaviors:
- action buttons at least 72 px tall
- game targets at least 72 x 72 px
- current prompt visually dominant
- focus-visible outline remains visible for keyboard users
- correct feedback uses a short scale/pop animation
- retry feedback uses a short shake under 700 ms
- no full-screen red state
- `prefers-reduced-motion: reduce` disables nonessential transforms

- [ ] **Step 4: Verify all ten registry entries**

Registry must contain exactly 10 IDs in this order:

```ts
[
  'letters',
  'numbers',
  'words',
  'find-key',
  'sequence',
  'click-target',
  'pick-picture',
  'mouse-trail',
  'drag-sort',
  'drag-match',
]
```

- [ ] **Step 5: Run complete automated verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests PASS; TypeScript has no errors; Vite production build succeeds.

- [ ] **Step 6: Run manual desktop acceptance checklist**

Start: `npm run dev`

Check in current Chrome and Edge desktop:
- Home has exactly three primary choices.
- Path starts with only game 1 unlocked.
- Free Play exposes all 10 games.
- Each keyboard game responds to physical keys.
- Click targets never clip outside play area.
- Mouse trail can be completed without holding a button.
- Both drag games recover after a cancelled/wrong drag.
- Listen button speaks Vietnamese where system voice exists.
- App remains usable with browser speech disabled.
- Completing each game reaches result screen and persists stars.
- Reload preserves progress.
- At width 899 px, desktop gate appears.
- At width 900 px, app appears.
- No countdown exists anywhere.

- [ ] **Step 7: Sync docs and close plan execution**

If implementation matches the spec, leave `docs/feat/tapgo-mvp.md` unchanged except its required verification stamp after the project has a real commit/version source. Move this plan to `docs/plan/done/tapgo-mvp.md` only after all acceptance checks pass.

- [ ] **Step 8: Commit**

```bash
git add src docs
git commit -m "feat: complete TapGo MVP"
```

## Self-review

- Spec coverage: all product decisions are mapped to Tasks 1-15.
- No backend/mobile/account scope is introduced.
- Shared framework is validated with one keyboard and one mouse vertical slice before the remaining games.
- Timer was deliberately removed; round progress is the only session pacing mechanism.
- Star scoring, progress schema, path unlock, speech fallback and pointer cancel behavior have explicit tests.
- Each of the 10 game IDs has one implementation task and one interaction-test requirement.
- Placeholder scan is clean; every implementation and error-handling step is explicit.
