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

### Fixed

- The retry hint stays visible after the shake animation until the round completes.
- Tapping a draggable item without moving it no longer counts as a wrong drop.
- Saved progress keeps every valid game when one game entry is corrupt or missing, instead of resetting all progress.
- Drags start only from the primary mouse button and reset when pointer capture is lost.
- A drop inside a wrong zone next to the correct zone counts as wrong; snapping to the correct zone applies only outside every zone.
- Home, replay, `Xem cách chơi` and `Nghe yêu cầu` buttons are at least 72px.
