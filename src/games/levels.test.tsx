import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { pickRound } from '../game/pickRound';
import type { GameLevel } from '../game/types';
import { shownText } from '../test/shownText';
import DragMatchGame, { MATCH_ROUNDS, matchGroup, matchOptions } from './DragMatchGame';
import PickPictureGame, { PICTURE_ROUNDS, pictureOptions } from './PickPictureGame';
import SequenceTypingGame, { SEQUENCES_BY_LEVEL } from './SequenceTypingGame';

const SEED = 12345;
const LEVELS: GameLevel[] = [0, 1, 2];
const baseProps = { totalRounds: 10, onRoundComplete: vi.fn(), onRetry: vi.fn(), speak: vi.fn() };

function themeOf(emoji: string) {
  return PICTURE_ROUNDS.find(({ answer }) => answer === emoji)?.theme;
}

describe('game levels', () => {
  it('pick-picture shows 3 options when easy and 4 with same-theme decoys when harder', () => {
    PICTURE_ROUNDS.forEach((round, roundIndex) => {
      expect(pictureOptions(round, 0, roundIndex, SEED)).toEqual(round.options);

      const medium = pictureOptions(round, 1, roundIndex, SEED);
      expect(medium).toHaveLength(4);
      expect(new Set(medium).size).toBe(4);
      expect(medium).toContain(round.answer);
      expect(medium.filter((option) => option !== round.answer && themeOf(option) === round.theme).length).toBeGreaterThanOrEqual(1);

      const hard = pictureOptions(round, 2, roundIndex, SEED);
      expect(hard).toHaveLength(4);
      expect(new Set(hard).size).toBe(4);
      expect(hard).toContain(round.answer);
      expect(hard.every((option) => themeOf(option) === round.theme)).toBe(true);
    });
  });

  it('renders the pick-picture option count for each level', () => {
    for (const level of LEVELS) {
      const { unmount } = render(<PickPictureGame {...baseProps} roundIndex={2} sessionSeed={SEED} level={level} />);
      const shown = screen.getAllByRole('button').filter((button) => button.classList.contains('picture-option'));
      expect(shown, `level ${level}`).toHaveLength(level === 0 ? 3 : 4);
      expect(shown.map((button) => shownText(button))).toContain(pickRound(PICTURE_ROUNDS, 2, SEED).answer);
      unmount();
    }
  });

  it('groups every drag-match shadow', () => {
    for (const round of MATCH_ROUNDS) {
      for (const [emoji] of round.options) expect(matchGroup(emoji), emoji).toBeDefined();
    }
  });

  it('drag-match uses shadows from the same group as the level rises', () => {
    MATCH_ROUNDS.forEach((round, roundIndex) => {
      const group = matchGroup(round.source);
      const sameGroupDecoys = (level: GameLevel) => {
        const options = matchOptions(round, level, roundIndex, SEED);
        expect(options).toHaveLength(3);
        expect(new Set(options.map(([, label]) => label)).size).toBe(3);
        expect(options).toContainEqual([round.source, round.answer]);
        return options.filter(([emoji, label]) => label !== round.answer && matchGroup(emoji) === group).length;
      };

      expect(matchOptions(round, 0, roundIndex, SEED)).toEqual(round.options);
      const easy = sameGroupDecoys(0);
      const medium = sameGroupDecoys(1);
      expect(medium).toBeGreaterThanOrEqual(Math.max(easy, 1));
      expect(sameGroupDecoys(2)).toBe(2);
    });
  });

  it('renders the harder drag-match shadows', () => {
    render(<DragMatchGame {...baseProps} roundIndex={0} level={2} />);
    const zones = screen.getAllByRole('img').filter((zone) => zone.hasAttribute('data-match-label'));
    expect(zones.map((zone) => matchGroup(shownText(zone)))).toEqual(['animal', 'animal', 'animal']);
  });

  it('sequence length grows from 3 to 5 keys with the level', () => {
    LEVELS.forEach((level) => {
      const pool = SEQUENCES_BY_LEVEL[level];
      expect(pool.length).toBeGreaterThan(8);
      expect(new Set(pool).size).toBe(pool.length);
      for (const sequence of pool) expect(sequence).toHaveLength(level + 3);

      const { container, unmount } = render(<SequenceTypingGame {...baseProps} roundIndex={0} sessionSeed={SEED} level={level} />);
      expect(container.querySelectorAll('.typing-sequence span')).toHaveLength(level + 3);
      unmount();
    });
  });
});
