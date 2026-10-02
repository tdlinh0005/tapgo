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
- Eight advanced typing sets after the 12 basic games (games 13–20, `Nâng cao 1–8`): home row, top row, bottom row, long words, two words with Space, numbers with words, three-word sentences, and longer sentences ending with Enter. Each set has 11–12 items and 6 rounds, and items get longer from set to set. Space shows as ␣, Enter as ⏎, and `Nghe yêu cầu` reads the sentence with Vietnamese accents.
- Eight advanced mouse sets after the typing sets (games 21–28, `Chuột nâng cao 1–8`): click 3 pictures in any order, click 4 or 5 numbered pictures from 1 up (a wrong number hints `Click số X trước nhé`), click 5 small 56px pictures, double-click to open an object (a lone click hints `Bấm nhanh hai lần nhé` after 500ms), a long trail of 9–12 smaller points, drag 3 items into one place, sort 4 items into the right one of two places, and a trail of 6–8 points with the left button held (releasing midway anywhere, even outside the play area, counts one miss and sends it back to the start with `Giữ chặt nút chuột nhé`). Each set has 6 rounds and 8–13 items (`MOUSE_DRILL_SETS`); pictures in sets 1–4 sit in a seeded 4×2 grid inside the safe area so they never overlap. Not yet measured in a real browser.
- Five police mission click games after the mouse sets (games 29–33, `Nhiệm vụ 1–5`): the child is a little police officer catching masked raccoon thieves, and each caught raccoon turns into the snack or toy it took (no weapons, no timers). Catch 2 or 3 raccoons in the park; catch 3 at the market without clicking 2 good friends (a friend click hints `Đó là bạn thỏ, bạn tốt đấy`); peek into 5 hiding spots for free to find 2 raccoons; catch 4 small 56px raccoons among 3 small friends; and catch the boss raccoon with 3 hits while it hops to another free slot after each hit. Each mission has a clay-style scene behind the play area (`src/assets/art/scene-*.webp`, 1280×720), its own icon, and drawn raccoon, boss and hiding-spot pictures; built by `createMissionGame` from `MISSION_SETS`. There are now 33 games and 99 stars. Checked in Chrome.
- Progress reset for parents: `Bắt đầu lại từ đầu` at the bottom of the progress screen asks once more (`Không xoá` is focused, `Xoá hết, bắt đầu lại` confirms), then clears every star, completion and play count back to the default progress, saves it, and locks the learning path to game 1 again. The button is disabled while nothing has been played. Checked in Chrome.
- Five fun park games after the police missions (games 34–38, `Vui chơi 1–5`), each on its own clay-style scene: pop 3 or 4 floating balloons by pressing the letter on each one in any order (`Nổ bóng bay chữ`, sky); catch 3 or 4 fish by pressing their numbers 1–9 so they jump into a bucket (`Câu cá số`, pond); flip cards to find 3 or 4 pairs of animals, where a mismatched pair stays face up until the next click and only mismatches beyond the number of pairs count as misses (`Lật thẻ tìm cặp`); drag 4 foods to the two hungry animals that like them (`Cho thú ăn`, farm); and drag 4 quarter pieces onto a faint picture to rebuild one of 6 clay paintings (`Ghép tranh`). No timers. The balloon and fishing games are keyboard games, the rest mouse games; built by `createPopKeysGame`, `createMemoryGame`, `createPuzzleGame` and `createMultiDragGame` from `FUN_SETS`, with new icons, food, fish, bucket and card-back pictures. There are now 38 games and 114 stars. Checked in Chrome.
- Five more fun park games after `Ghép tranh` (games 39–43, `Vui chơi 6–10`), each on its own clay-style scene: play one of 6 short tunes on a 7-key toy piano (A S D F G H J, Đô to Si) by pressing the lit key, each key playing a soft note through the new `playNote` and unlit piano keys playing for free (`Đàn piano nhí`, stage); type a 2-, 3- or 4-letter animal name written without accents, one wagon per letter (`Tàu chở chữ`, rail); click the one mole that peeks out of 6 holes and waits, leaving a star in its hole, with 3–5 moles per round and a rabbit friend to leave alone from round 3 (`Chuột chũi ló đầu`, garden); drag 3 or 4 animals onto their own dark shadows (`Tìm bóng con vật`); and pick a colour, then click each part of one of 6 line drawings to paint it like the small sample, where a click before picking a colour only hints and is not counted (`Tô màu tranh`). No timers. Space and held keys are ignored; in the piano game only a key off the piano counts as a miss, in the train game any wrong letter. The piano and train games are keyboard games, the rest mouse games; built by `createPianoGame`, `createTrainGame`, `createMoleGame`, `createShadowGame` and `createPaintGame` from `FUN_SETS`, with new icons, scenes, and mole, hole, wagon and animal pictures. Not yet checked in a real browser. There are now 43 games and 129 stars.

### Changed

- Game icons and the mascot are now clay-style illustrations instead of emoji: one drawing per game (28, on the game card, learning-path stop, progress sticker and game header) and three for `Mèo Tapi` (idle, cheer, encourage). They are 256px (mascot 320px) WebP files in `src/assets/art/`, about 140 KB in total; a game with no drawing keeps its emoji.
- Pictures inside the games are clay-style drawings too: 143 in-play emoji (targets, answer options, drag pieces and zones, trail start and finish, typing pictures, count items, and the home hero) render through `Emoji`, which shows `src/assets/art/play/e-<code points>.webp` (192px, transparent, about 1 MB in total) at the emoji's own size and keeps the emoji as `alt`; an emoji with no drawing still shows as text. Checked in Chrome.

- `Chơi ngay` moves on to the advanced sets once the 12 basic games are done: typing sets 1–8, then mouse sets 1–8. After every game is done, it picks an advanced set (typing or mouse) under 3 stars before a basic game under 3 stars. There are now 28 games and 84 stars in total.
- `MouseTrailGame` is built by `createMouseTrailGame` (trails, checkpoint size, hold) and shared by the basic trail and mouse sets 5 and 8; the basic game behaves as before. `ADVANCED_GAME_IDS` is now `TYPING_DRILL_IDS` followed by `MOUSE_DRILL_IDS`; `roundSeed` lives in `pickRound.ts` and the mouse layout helpers (`targetSlots`, `MAX_CLICK_TARGETS`, `joinNames`) in `mouseLayout.ts`; and theme tokens `--target-medium` (96px) and `--target-small` (56px) size the new targets.
- A missed Space or Enter is named in the retry hint (`Tìm phím cách…`, `Tìm phím Enter…`) by one shared helper for every round that expects them.
- The play area always fits the screen in every game, even with the hint and guide open; the guide toggle is a round ❓ button next to the coach bubble.
- Keyboard and mouse games have their own colours (`data-category`), a rounded self-hosted Vietnamese font (Nunito), toy-like cards and keys drawn like real keys.
- The learning path is a winding road of stations with the mascot at the recommended one; progress is a sticker album with a star jar.
- Larger content pools: letters and find key cover A–Z between them, 28 words with pictures, more sequences, pictures, trails, sort and match items; click target changes its picture each round, mouse trail has themed start/finish pairs, and sequences show a row picture.
- `useKeySequence` accepts Enter (as `\n`) and Space only when the round expects them, and then stops them from pressing a focused button.
- Feature spec matches shipped behaviour: shared `data-assist` levels, drag snap radius, `Nghe yêu cầu` and guide buttons, review rounds, parent recommendation, theme tokens, and a testing strategy that points to real test files.
- Radii, title/prompt/target font sizes, gaps and feedback timings come from theme tokens (`--radius-sm/lg`, `--font-*`, `--space-*`, `--motion-pop/shake`); radii 18–22px become 20px and 28–36px become 32px.
- Keyboard games share one `useKeySequence` hook and the single-key games share `KeyTargetStage`; both drag games share `useDragRound`.
- Drag tests cover the snap distance (24px, plus 16px per assist level) and pointer cancel for both drag games.
- Tests pin the assist thresholds (level 1 after 2 retries, level 2 after 3), the spoken intro on mount and the spoken hint on the second retry.
- Tests cover the recommendation fallback, a throwing `localStorage`, and Path sessions of 10 rounds versus 5 in Guided Play.
- Find-key and number games are tested for wrong keys: the round stays, and the retry hint names the key.
- Assistance after repeated mistakes works the same way in every game: the real target gets `data-assist="1"` (outline) or `"2"` (outline and enlarged), including word, sequence, key and picture games.
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
- Spoken instructions use a Vietnamese system voice instead of the browser's default (usually English) voice; the first line waits for the voice list to load, and the app stays silent rather than reading Vietnamese with a foreign voice when no Vietnamese voice is installed.
