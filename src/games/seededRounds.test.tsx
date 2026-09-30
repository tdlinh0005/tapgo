import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { pickRound, shuffleWithSeed } from '../game/pickRound';
import { gameRegistry } from '../game/registry';
import { MATCH_ROUNDS } from './DragMatchGame';
import DragSortGame, { SORT_ROUNDS } from './DragSortGame';
import { TARGETS } from './FindKeyGame';
import { LETTERS } from './LetterKeyGame';
import { TRAILS } from './MouseTrailGame';
import PickPictureGame, { PICTURE_ROUNDS } from './PickPictureGame';
import { SEQUENCES } from './SequenceTypingGame';
import { WORDS } from './WordTypingGame';

const SEED = 12345;
const baseProps = { totalRounds: 10, onRoundComplete: vi.fn(), onRetry: vi.fn(), speak: vi.fn() };

describe('seeded rounds', () => {
  it('has a pool larger than the number of rounds for every content game', () => {
    const pools: Record<string, readonly unknown[]> = {
      letters: LETTERS,
      'find-key': TARGETS,
      words: WORDS,
      sequence: SEQUENCES,
      'pick-picture': PICTURE_ROUNDS,
      'mouse-trail': TRAILS,
      'drag-sort': SORT_ROUNDS,
      'drag-match': MATCH_ROUNDS,
    };
    for (const [id, pool] of Object.entries(pools)) {
      const definition = gameRegistry.find((game) => game.id === id);
      expect(definition, id).toBeDefined();
      expect(pool.length, id).toBeGreaterThan(definition!.rounds);
    }
  });

  it('picks the pick-picture round from the seed and shuffles its answer position', () => {
    const round = pickRound(PICTURE_ROUNDS, 3, SEED);
    render(<PickPictureGame {...baseProps} roundIndex={3} sessionSeed={SEED} />);

    expect(screen.getByText(round.prompt)).toBeInTheDocument();
    const shown = screen.getAllByRole('button').filter((button) => button.classList.contains('picture-option')).map((button) => button.textContent);
    expect(shown).toEqual(shuffleWithSeed(round.options, SEED + 3));
  });

  it('moves the correct pick-picture answer across positions over a session', () => {
    const positions = new Set<number>();
    for (let roundIndex = 0; roundIndex < 10; roundIndex += 1) {
      const round = pickRound(PICTURE_ROUNDS, roundIndex, SEED);
      positions.add(shuffleWithSeed(round.options, SEED + roundIndex).indexOf(round.answer));
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  it('orders the drag-sort zones by the seed', () => {
    const orders = new Set<string>();
    for (let roundIndex = 0; roundIndex < 8; roundIndex += 1) {
      const { unmount } = render(<DragSortGame {...baseProps} roundIndex={roundIndex} sessionSeed={SEED} />);
      expect(screen.getByText(pickRound(SORT_ROUNDS, roundIndex, SEED).label)).toBeInTheDocument();
      orders.add(screen.getAllByTestId(/-zone$/).map((zone) => zone.dataset.testid).join(','));
      unmount();
    }
    expect(orders.size).toBe(2);
  });
});
