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

### Changed

- Dependencies are pinned to caret ranges of the locked versions instead of `latest`.
- In Guided Play, `Bài tiếp theo` opens the next recommended game (never the one just played) instead of the next game in path order.
- Sequence typing uses 3 to 5 key sequences that differ from the word game, and find key uses letters the letter game does not teach.
- Word and sequence games mark typed characters as done in green, so the child sees how far they have got.
- Guided Play quick sessions no longer add review rounds, so they end after at most 5 rounds.
- Click target places each target at a random position inside the safe area instead of a fixed sequence.
- Drag match asks the child to drop a picture on its shadow instead of on a written word.

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
- Space no longer counts as a mistake in keyboard games, and in word and sequence games it no longer presses the focused button.
