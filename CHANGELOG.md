# Changelog

All notable changes to TapGo are recorded here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semver.

## [Unreleased]

### Added

- TapGo MVP: shared game shell, learning path, free play, progress screen, 1-3 star scoring saved to localStorage, and 10 mini-games (letters, numbers, words, find key, sequence typing, click target, mouse trail, pick picture, drag sort, drag match).
- Guided Play: `Chơi ngay` on Home opens the first unfinished game as a quick session of at most 5 rounds, then offers `Bài tiếp theo`.
- Adaptive retry hints: games report wrong actions through `onRetry`, the shell reads the hint aloud and opens the guide after two retries, and passes an `assistLevel` that makes targets and drop zones easier to hit.
- Review rounds: a round finished with mistakes is replayed once without changing its score.
- Parent practice recommendation on the progress screen.
- Child-friendly visual system: large type, 72px action buttons, soft feedback animations, and reduced-motion support.
- Game 11 `Phím cách và Enter` (`space-enter`): a wide Space key and an Enter key, 5 rounds each, shuffled per session.
- Game 12 `Đếm rồi bấm số` (`count-keys`): count 1–9 pictures and press that number (top row or numpad).
- Mascot `Mèo Tapi` in a single coach bubble that replaces the intro, hint, review and guide lines; it cheers on correct answers and encourages on retries.
- Correct-answer star burst over the play area, a confetti celebration on the result screen (≤ 1.5s, never blocks `Bài tiếp theo`, static with reduced motion), and decorative background emoji on wide screens.
- Difficulty levels from best stars (0–1★ easy, 2★ medium, 3★ hard; Guided Play always easy) for pick picture, drag match and sequence typing.
- Per-session shuffling (`sessionSeed` + `pickRound`): replays no longer repeat the same rounds, and answer positions move.

### Changed

- The play area always fits the screen in every game, even with the hint and guide open; the guide toggle is a round ❓ button next to the coach bubble.
- Keyboard and mouse games have their own colours (`data-category`), a rounded self-hosted Vietnamese font (Nunito), toy-like cards and keys drawn like real keys.
- The learning path is a winding road of stations with the mascot at the recommended one; progress is a sticker album with a star jar. Total stars are now 36.
- Larger content pools: letters and find key cover A–Z between them, 28 words with pictures, more sequences, pictures, trails, sort and match items; click target changes its picture each round, mouse trail has themed start/finish pairs, and sequences show a row picture.
- `useKeySequence` accepts Enter (as `\n`) and Space only when the round expects them, and then stops them from pressing a focused button.
- Feature spec matches shipped behaviour: shared `data-assist` levels, drag snap radius, `Nghe yêu cầu` and guide buttons, review rounds, parent recommendation, theme tokens, and a testing strategy that points to real test files.
- Radii, title/prompt/target font sizes, gaps and feedback timings come from theme tokens (`--radius-sm/lg`, `--font-*`, `--space-*`, `--motion-pop/shake`); radii 18–22px become 20px and 28–36px become 32px.
- Keyboard games share one `useKeySequence` hook and the single-key games share `KeyTargetStage`; both drag games share `useDragRound`.
- Drag tests cover the snap distance (24px, plus 16px per assist level) and pointer cancel for both drag games.
- Tests pin the assist thresholds (level 1 after 2 retries, level 2 after 3), the spoken intro on mount and the spoken hint on the second retry.
- Tests cover the recommendation fallback, a throwing `localStorage`, and Path sessions of 10 rounds versus 5 in Guided Play.
- Find-key and number games are tested for wrong keys: the round stays, and the retry hint names the key.
- Assistance after repeated mistakes works the same way in all 10 games: the real target gets `data-assist="1"` (outline) or `"2"` (outline and enlarged), including word, sequence, key and picture games.
- Every game has a `Nghe yêu cầu` button that reads the goal of the current round; the header speaker button is now labelled `Nghe lại cách chơi`.
- The round prompt is now the largest text in every game (44px+, title 28px); click and mouse-trail games show their own prompt above the play area.
- Vitest runs in the `vmThreads` pool so jsdom setup no longer dominates test time (~2s full run).
- Dependencies are pinned to caret ranges of the locked versions instead of `latest`.
- In Guided Play, `Bài tiếp theo` opens the next recommended game (never the one just played) instead of the next game in path order.
- Sequence typing uses 3 to 5 key sequences that differ from the word game, and find key uses letters the letter game does not teach.
- Word and sequence games mark typed characters as done in green, so the child sees how far they have got.
- Guided Play quick sessions no longer add review rounds, so they end after at most 5 rounds.
- Click target places each target at a random position inside the safe area instead of a fixed sequence.
- Drag match asks the child to drop a picture on its shadow instead of on a written word.
- The progress screen offers a `Chơi <bài>` button for the recommended game (opened as a quick session) and shows best stars with the star rating.
- Every retry hint starts with `Thử lại nhé!`; keyboard games point to the key on the keyboard, and the sequence game now gives a hint for the current key.
- Game cards show a `Chơi` button labelled with the game title, and locked cards say `Xong bài trước để mở`.

### Removed

- Unused `PlaceholderGame` and dead CSS/class names (`result-secondary-action`, `find-key-game`, `progress-screen`).

### Fixed

- The retry hint stays visible after the shake animation until the round completes.
- Tapping a draggable item without moving it no longer counts as a wrong drop.
- Saved progress keeps every valid game when one game entry is corrupt or missing, instead of resetting all progress.
- The retry hint is read aloud and the guide reopens only on the second mistake, not on every later one.
- Feedback tones reuse one audio context and resume it when suspended, instead of creating a new context per tone.
- Speech stops when leaving a game instead of reading the intro to the end.
- Progress is saved from an effect after each change, so StrictMode no longer writes it twice.
- Drags start only from the primary mouse button and reset when pointer capture is lost.
- A drop inside a wrong zone next to the correct zone counts as wrong; snapping to the correct zone applies only outside every zone.
- Mouse trail counts entering a checkpoint out of order as a mistake, so it reports real attempts and triggers retry hints and assist.
- Mouse trail rounds now have a start point, 4-6 checkpoints and a finish, with a guide line drawn through the actual checkpoints.
- Home, replay, `Xem cách chơi` and `Nghe yêu cầu` buttons are at least 72px.
- The desktop gate no longer scrolls sideways on screens narrower than 900px.
- Star ratings, key targets, word targets and trail checkpoints expose their labels to screen readers with `role="img"`.
- Space no longer counts as a mistake in keyboard games, and in word and sequence games it no longer presses the focused button.
- Mouse trail no longer counts checkpoints crossed before the start as mistakes, so opening the game with the mouse or moving back from the previous finish keeps 3 stars.
- Click target and mouse trail play areas fill the remaining screen height (at least 320px) instead of a fixed 500px, so they fit a 1366×768 laptop without scrolling, and their `Nghe yêu cầu` button is no longer stretched full width.
