import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import Emoji from '../components/Emoji';
import ListenButton from '../components/ListenButton';
import { artUrl } from '../game/art';
import { pickRound } from '../game/pickRound';
import { RETRY_PREFIX } from '../game/retryCopy';
import type { MiniGameProps } from '../game/types';
import type { ArrowsSet, GridCell } from './funGames';
import { TRAIL_THEMES } from './MouseTrailGame';

export const ARROW_KEYS = [
  { key: 'ArrowUp', glyph: '↑', name: 'lên', step: [0, -1] },
  { key: 'ArrowLeft', glyph: '←', name: 'sang trái', step: [-1, 0] },
  { key: 'ArrowDown', glyph: '↓', name: 'xuống', step: [0, 1] },
  { key: 'ArrowRight', glyph: '→', name: 'sang phải', step: [1, 0] },
] as const;

export const ARROWS_ONLY_HINT = `${RETRY_PREFIX} Dùng các phím mũi tên ← ↑ → ↓ nhé.`;
const TREE = '🌳';

const sameCell = (a: GridCell, b: GridCell) => a[0] === b[0] && a[1] === b[1];

/** Breadth-first shortest walk from `from` to `goal` (both included), or null when trees wall the goal off. */
export function shortestPath(from: GridCell, goal: GridCell, columns: number, rows: number, trees: readonly GridCell[]): GridCell[] | null {
  const key = ([column, row]: GridCell) => row * columns + column;
  const cameFrom = new Map<number, GridCell | null>([[key(from), null]]);
  const queue: GridCell[] = [from];
  while (queue.length > 0) {
    const cell = queue.shift()!;
    if (sameCell(cell, goal)) {
      const path: GridCell[] = [];
      for (let step: GridCell | null = cell; step; step = cameFrom.get(key(step)) ?? null) path.unshift(step);
      return path;
    }
    for (const { step } of ARROW_KEYS) {
      const next: GridCell = [cell[0] + step[0], cell[1] + step[1]];
      const blocked = next[0] < 0 || next[1] < 0 || next[0] >= columns || next[1] >= rows || trees.some((tree) => sameCell(tree, next));
      if (blocked || cameFrom.has(key(next))) continue;
      cameFrom.set(key(next), cell);
      queue.push(next);
    }
  }
  return null;
}

export function createArrowsGame({ title, scene, columns, rows, mazes }: ArrowsSet): ComponentType<MiniGameProps> {
  const sceneUrl = artUrl(`scene-${scene}`);

  return function ArrowsGame({ roundIndex, sessionSeed, onRoundComplete, onRetry, speak, assistLevel = 0 }: MiniGameProps) {
    const maze = mazes[roundIndex % mazes.length];
    const theme = pickRound(TRAIL_THEMES, roundIndex, sessionSeed);
    const [position, setPosition] = useState<GridCell>(maze.start);
    const [visited, setVisited] = useState<readonly GridCell[]>([]);
    const misses = useRef(0);
    const path = shortestPath(position, maze.goal, columns, rows, maze.trees);
    const nextStep = path && path.length > 1 ? ARROW_KEYS.find(({ step }) => sameCell([position[0] + step[0], position[1] + step[1]], path[1])) : undefined;

    useEffect(() => {
      const miss = (hint: string) => {
        misses.current += 1;
        onRetry?.(hint);
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        const arrow = ARROW_KEYS.find(({ key }) => key === event.key);
        if (!arrow) {
          if (event.key.length !== 1) return;
          event.preventDefault();
          if (event.key !== ' ') miss(ARROWS_ONLY_HINT);
          return;
        }
        event.preventDefault();
        const next: GridCell = [position[0] + arrow.step[0], position[1] + arrow.step[1]];
        if (next[0] < 0 || next[1] < 0 || next[0] >= columns || next[1] >= rows) {
          miss(`${RETRY_PREFIX} Hết đường rồi. Đi hướng khác nhé.`);
          return;
        }
        if (maze.trees.some((tree) => sameCell(tree, next))) {
          miss(`${RETRY_PREFIX} Có cây chặn đường. Đi vòng qua cây nhé.`);
          return;
        }
        if (sameCell(next, maze.goal)) {
          const shortest = shortestPath(maze.start, maze.goal, columns, rows, maze.trees)!.length - 1;
          onRoundComplete({ correct: shortest, attempts: shortest + misses.current });
          return;
        }
        setVisited([...visited, position]);
        setPosition(next);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [position, visited, maze, onRoundComplete, onRetry]);

    const cells = Array.from({ length: columns * rows }, (_, index): GridCell => [index % columns, Math.floor(index / columns)]);

    return (
      <>
        <p className="game-prompt">Đưa <Emoji char={theme.start} /> tới <Emoji char={theme.finish} /></p>
        <ListenButton text={`Bấm các phím mũi tên để đưa ${theme.mover} tới ${theme.goal}. Tránh cây nhé`} speak={speak} />
        <section className="click-play-area arrows-area" data-testid="play-area" data-scene={scene} aria-label={title} style={sceneUrl ? { backgroundImage: `url(${sceneUrl})` } : undefined}>
          <div className="arrows-board" style={{ '--arrow-columns': columns } as CSSProperties}>
            {cells.map((cell) => {
              const isMover = sameCell(cell, position);
              const isGoal = sameCell(cell, maze.goal);
              const isTree = maze.trees.some((tree) => sameCell(tree, cell));
              const kind = isMover ? 'mover' : isGoal ? 'goal' : isTree ? 'tree' : undefined;
              return (
                <span
                  key={`${cell[0]}-${cell[1]}`}
                  className="arrow-cell"
                  data-kind={kind}
                  data-state={visited.some((step) => sameCell(step, cell)) ? 'visited' : undefined}
                  role={isMover || isGoal ? 'img' : undefined}
                  aria-label={isMover ? theme.mover : isGoal ? theme.goal : undefined}
                  aria-hidden={isMover || isGoal ? undefined : true}
                >
                  {isMover ? <Emoji char={theme.start} /> : isGoal ? <Emoji char={theme.finish} /> : isTree ? <Emoji char={TREE} /> : null}
                </span>
              );
            })}
          </div>
          <div className="arrow-pad" aria-label="Các phím mũi tên">
            {ARROW_KEYS.map(({ key, glyph, name }) => (
              <span key={key} className="arrow-key" data-key={key} data-assist={key === nextStep?.key ? assistLevel || undefined : undefined} role="img" aria-label={`Phím mũi tên ${name}`}>
                {glyph}
              </span>
            ))}
          </div>
        </section>
      </>
    );
  };
}
