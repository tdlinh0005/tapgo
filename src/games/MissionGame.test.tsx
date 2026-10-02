import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { artUrl, emojiArtUrl } from '../game/art';
import { MISSION_IDS } from '../game/types';
import { createMissionGame } from './MissionGame';
import { FRIENDS, HIDEOUTS, LOOT, MISSION_SETS } from './missions';
import { MAX_CLICK_TARGETS } from './mouseLayout';

const ParkGame = createMissionGame(MISSION_SETS['mission-park']);
const MarketGame = createMissionGame(MISSION_SETS['mission-market']);
const HideGame = createMissionGame(MISSION_SETS['mission-hide']);
const SmallGame = createMissionGame(MISSION_SETS['mission-small']);
const BossGame = createMissionGame(MISSION_SETS['mission-boss']);

const baseProps = { totalRounds: 6, speak: vi.fn() };
const thieves = () => screen.queryAllByRole('button', { name: 'gấu mèo trộm' });
const targets = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.mission-target'));

describe('police missions', () => {
  it('fits every round, including boss hops, into the click slots', () => {
    for (const id of MISSION_IDS) {
      const set = MISSION_SETS[id];
      const spots = Math.max(...set.thiefCounts) + set.friendCount + Math.max(set.hideoutCount - Math.max(...set.thiefCounts), 0);
      expect(spots + set.thief.hits - 1).toBeLessThanOrEqual(MAX_CLICK_TARGETS);
    }
  });

  it('has a drawn scene and drawn pictures for every mission', () => {
    expect(MISSION_IDS.filter((id) => !artUrl(`scene-${MISSION_SETS[id].scene}`))).toEqual([]);
    const emojis = [...MISSION_IDS.map((id) => MISSION_SETS[id].thief.emoji), ...FRIENDS, ...LOOT, ...HIDEOUTS].map((item) => (typeof item === 'string' ? item : item.emoji));
    expect(emojis.filter((emoji) => !emojiArtUrl(emoji))).toEqual([]);
  });

  it('turns each caught thief into the item it took back and counts background misses', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<ParkGame {...baseProps} roundIndex={0} onRoundComplete={onRoundComplete} onRetry={onRetry} />);
    expect(screen.getByTestId('play-area')).toHaveAttribute('data-scene', 'park');
    expect(thieves()).toHaveLength(2);

    fireEvent.click(thieves()[0]);
    expect(screen.getByRole('button', { name: /^Đã lấy lại / })).toHaveAttribute('data-state', 'done');
    fireEvent.click(screen.getByRole('button', { name: /^Đã lấy lại / }));
    fireEvent.click(screen.getByTestId('play-area'));
    expect(onRetry).toHaveBeenCalledTimes(1);

    fireEvent.click(thieves()[0]);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 3 });
  });

  it('alternates two and three thieves in the park', () => {
    render(<ParkGame {...baseProps} roundIndex={1} onRoundComplete={vi.fn()} />);
    expect(thieves()).toHaveLength(3);
  });

  it('tells the child a friend is not a thief', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    const { container } = render(<MarketGame {...baseProps} roundIndex={0} onRoundComplete={onRoundComplete} onRetry={onRetry} />);
    const friends = targets(container).filter((target) => target.dataset.kind === 'friend');
    expect(friends).toHaveLength(2);
    expect(thieves()).toHaveLength(3);

    fireEvent.click(friends[0]);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining(`Đó là ${friends[0].getAttribute('aria-label')}, bạn tốt đấy`));
    expect(friends[0]).not.toHaveAttribute('data-state');

    for (let caught = 0; caught < 3; caught += 1) fireEvent.click(thieves()[0]);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });

  it('lets the child peek into hiding spots for free before catching', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<HideGame {...baseProps} roundIndex={0} onRoundComplete={onRoundComplete} onRetry={onRetry} />);
    const spots = screen.getAllByRole('button', { name: /^Tìm trong / });
    expect(spots).toHaveLength(5);
    expect(thieves()).toHaveLength(0);

    spots.forEach((spot) => fireEvent.click(spot));
    expect(thieves()).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: / không có ai$/ })).toHaveLength(3);
    fireEvent.click(screen.getAllByRole('button', { name: / không có ai$/ })[0]);
    expect(onRetry).not.toHaveBeenCalled();

    fireEvent.click(thieves()[0]);
    fireEvent.click(thieves()[0]);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 2 });
  });

  it('points assist at a hiding spot that really holds a thief', () => {
    const { container } = render(<HideGame {...baseProps} roundIndex={0} onRoundComplete={vi.fn()} assistLevel={1} />);
    fireEvent.click(container.querySelector<HTMLElement>('[data-assist]')!);
    expect(container.querySelector('[data-assist]')).toBe(thieves()[0]);
  });

  it('shrinks the tiny thieves and mixes in three friends', () => {
    const { container } = render(<SmallGame {...baseProps} roundIndex={0} onRoundComplete={vi.fn()} />);
    expect(thieves()).toHaveLength(4);
    expect(targets(container).filter((target) => target.dataset.kind === 'friend')).toHaveLength(3);
    targets(container).forEach((target) => expect(target).toHaveAttribute('data-size', 'small'));
  });

  it('makes the boss hop to a free spot after each of three hits', () => {
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<BossGame {...baseProps} roundIndex={0} onRoundComplete={onRoundComplete} onRetry={onRetry} />);
    const boss = () => screen.getByRole('button', { name: 'trùm Gấu Mèo' });
    const spot = () => `${boss().style.left},${boss().style.top}`;
    const seen = [spot()];
    expect(boss()).toHaveTextContent('3');

    fireEvent.click(boss());
    expect(boss()).toHaveTextContent('2');
    seen.push(spot());
    fireEvent.click(boss());
    seen.push(spot());
    expect(new Set(seen).size).toBe(3);
    expect(onRoundComplete).not.toHaveBeenCalled();

    fireEvent.click(boss());
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
    expect(onRetry).not.toHaveBeenCalled();
  });
});
