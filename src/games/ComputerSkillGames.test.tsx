import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MiniGameProps } from '../game/types';
import { ARROW_KEYS, ARROWS_ONLY_HINT, createArrowsGame, shortestPath } from './ArrowsGame';
import { createCloseWindowGame, windowLayout } from './CloseWindowGame';
import { BACKSPACE_HINT, createEraserGame, eraserStart } from './EraserGame';
import { ARROW_MAZES, FUN_SETS, SEA_FRIENDS, SEARCH_TWO_WORDS, TRAIN_WORDS_2, TRAIN_WORDS_3, type ArrowsSet, type CloseSet, type EraserSet, type ScrollSet, type SearchSet } from './funGames';
import { createScrollGame } from './ScrollGame';
import { CLICK_BOX_HINT, createSearchBoxGame, normalizeSearch } from './SearchBoxGame';

const EraserGame = createEraserGame(FUN_SETS['fun-eraser'] as EraserSet);
const ScrollGame = createScrollGame(FUN_SETS['fun-scroll'] as ScrollSet);
const ArrowsGame = createArrowsGame(FUN_SETS['fun-arrows'] as ArrowsSet);
const CloseWindowGame = createCloseWindowGame(FUN_SETS['fun-close'] as CloseSet);
const SearchBoxGame = createSearchBoxGame(FUN_SETS['fun-search'] as SearchSet);

const renderGame = (Game: ComponentType<MiniGameProps>, roundIndex = 0, sessionSeed?: number) => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const { container } = render(<Game roundIndex={roundIndex} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} sessionSeed={sessionSeed} />);
  return { container, onRoundComplete, onRetry };
};

const press = (key: string, options: { repeat?: boolean } = {}) => fireEvent.keyDown(window, { key, ...options });

describe('EraserGame', () => {
  it('erases the red wrong letters with Backspace and stops at the right word', () => {
    const { container, onRoundComplete, onRetry } = renderGame(EraserGame);
    const target = TRAIN_WORDS_3.find(({ name }) => screen.queryByText(`Sửa tên ${name}`, { exact: false }))!;
    const wrong = () => container.querySelectorAll('.eraser-letter[data-state="wrong"]');
    expect(wrong()).toHaveLength(1);

    press('A');
    expect(onRetry).toHaveBeenCalledWith(BACKSPACE_HINT);
    const backspace = fireEvent.keyDown(window, { key: 'Backspace' });
    expect(backspace).toBe(false);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
    expect(target.word).toHaveLength(3);
  });

  it('ignores held-down Backspace so one press erases one letter', () => {
    const { container, onRoundComplete } = renderGame(EraserGame, 1, 99);
    expect(container.querySelectorAll('.eraser-letter[data-state="wrong"]')).toHaveLength(2);
    press('Backspace');
    press('Backspace', { repeat: true });
    expect(container.querySelectorAll('.eraser-letter[data-state="wrong"]')).toHaveLength(1);
    press('Backspace');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 2 });
  });

  it('makes the child type the missing letters again on retype rounds', () => {
    const { container, onRoundComplete, onRetry } = renderGame(EraserGame, 2);
    const target = TRAIN_WORDS_2.find(({ name }) => screen.queryByText(`Sửa tên ${name}`, { exact: false }))!;
    expect(container.querySelector('.eraser-box')).toHaveTextContent(new RegExp(`^${target.word[0]}[XQZKPY]$`));
    press('Backspace');
    expect(container.querySelector('[data-key="letter"]')).toHaveTextContent(target.word[1]);
    press('Backspace');
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining(`Gõ chữ ${target.word[1]}`));
    press(target.word[1].toLowerCase());
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 3 });
  });

  it('never uses a wrong letter that is in the word', () => {
    for (const seed of [1, 2, 3, 4, 5]) expect(eraserStart('KHI', 2, false, seed)).toMatch(/^KHI[XQZPY]{2}$/);
    expect(eraserStart('NGUA', 2, true, 7)).toMatch(/^NG[XQZKPY]{2}$/);
  });
});

describe('ScrollGame', () => {
  it('finds the friend at the bottom of the sea and counts clicks on the water', () => {
    const { container, onRoundComplete, onRetry } = renderGame(ScrollGame);
    const target = SEA_FRIENDS.find(({ name }) => screen.queryByText(`Tìm ${name}`, { exact: false }))!;
    const sea = screen.getByTestId('play-area');
    expect(sea).toHaveClass('scroll-sea');
    expect(sea.firstElementChild).toHaveStyle({ height: '720px' });

    fireEvent.click(container.querySelector('.scroll-water')!);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('Lăn bánh xe chuột'));
    fireEvent.click(screen.getByRole('button', { name: target.name }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });

  it('names the decoy when the child clicks the wrong friend', () => {
    const { container, onRoundComplete, onRetry } = renderGame(ScrollGame, 3, 7);
    expect(screen.getByTestId('play-area')).toHaveAttribute('data-start', 'bottom');
    const decoy = container.querySelector<HTMLElement>('.sea-friend:not([data-target])')!;
    fireEvent.click(decoy);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining(`Đó là ${decoy.getAttribute('aria-label')}`));
    fireEvent.click(container.querySelector('.sea-friend[data-target]')!);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});

describe('ArrowsGame', () => {
  const { columns, rows } = FUN_SETS['fun-arrows'] as ArrowsSet;
  const walk = (maze: (typeof ARROW_MAZES)[number]) => {
    const path = shortestPath(maze.start, maze.goal, columns, rows, maze.trees)!;
    return path.slice(1).map((cell, index) => ARROW_KEYS.find(({ step }) => path[index][0] + step[0] === cell[0] && path[index][1] + step[1] === cell[1])!.key);
  };

  it('walks the mover to the goal along the shortest path', () => {
    const { container, onRoundComplete, onRetry } = renderGame(ArrowsGame);
    const keys = walk(ARROW_MAZES[0]);
    expect(keys).toEqual(['ArrowRight', 'ArrowRight', 'ArrowRight']);
    expect(fireEvent.keyDown(window, { key: keys[0] })).toBe(false);
    expect(container.querySelector('.arrow-cell[data-state="visited"]')).not.toBeNull();
    press(keys[1], { repeat: true });
    for (const key of keys.slice(1)) press(key);
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
  });

  it('counts bumps into trees, the edge and letter keys', () => {
    const { onRoundComplete, onRetry } = renderGame(ArrowsGame, 4);
    press('ArrowLeft');
    expect(onRetry).toHaveBeenLastCalledWith(expect.stringContaining('Hết đường'));
    press('ArrowRight');
    press('ArrowRight');
    expect(onRetry).toHaveBeenLastCalledWith(expect.stringContaining('Có cây'));
    press('W');
    expect(onRetry).toHaveBeenLastCalledWith(ARROWS_ONLY_HINT);
    press(' ');
    expect(onRetry).toHaveBeenCalledTimes(3);
    for (const key of ['ArrowUp', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowDown']) press(key);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 6, attempts: 9 });
  });

  it('can finish the hardest maze', () => {
    const { onRoundComplete } = renderGame(ArrowsGame, 5);
    const keys = walk(ARROW_MAZES[5]);
    for (const key of keys) press(key);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: keys.length, attempts: keys.length });
  });
});

describe('CloseWindowGame', () => {
  it('cascades overlapping windows up and to the right so each one covers the ✕ corner of the one under it', () => {
    const spots = windowLayout(4, true, 1);
    spots.slice(1).forEach((spot, index) => {
      const under = spots[index];
      expect(spot.left).toBeGreaterThan(under.left);
      expect(spot.top).toBeLessThan(under.top);
    });
  });

  it('closes side-by-side windows in any order', () => {
    const { onRoundComplete, onRetry } = renderGame(CloseWindowGame, 1);
    expect(screen.getAllByRole('group', { name: /^Cửa sổ/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole('group', { name: 'Cửa sổ 1' }));
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('dấu ✕'));
    fireEvent.click(screen.getByRole('button', { name: 'Đóng cửa sổ 1' }));
    expect(screen.queryByRole('group', { name: 'Cửa sổ 1' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng cửa sổ 2' }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 3 });
  });

  it('closes overlapping windows from the top one down', () => {
    const { onRoundComplete, onRetry } = renderGame(CloseWindowGame, 3);
    fireEvent.click(screen.getByRole('button', { name: 'Đóng cửa sổ 1' }));
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('trên cùng trước'));
    expect(screen.getByRole('group', { name: 'Cửa sổ 1' })).toBeInTheDocument();
    for (const index of [3, 2, 1]) fireEvent.click(screen.getByRole('button', { name: `Đóng cửa sổ ${index}` }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });
});

describe('SearchBoxGame', () => {
  it('asks for a click into the box before typing, then searches on Enter', () => {
    const { onRoundComplete, onRetry } = renderGame(SearchBoxGame);
    const target = TRAIN_WORDS_2.find(({ name }) => screen.queryByLabelText(`Tìm ${name}`, { exact: false }))!;
    const box = screen.getByRole('textbox', { name: 'Ô tìm kiếm' });
    expect(box).not.toHaveFocus();
    expect(fireEvent.keyDown(window, { key: 'c' })).toBe(false);
    expect(onRetry).toHaveBeenCalledWith(CLICK_BOX_HINT);

    act(() => box.focus());
    expect(screen.getByText(`Gõ ${target.word} rồi bấm Enter`)).toBeInTheDocument();
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onRetry).toHaveBeenLastCalledWith(expect.stringContaining('trước rồi mới bấm Enter'));
    fireEvent.change(box, { target: { value: target.word.toLowerCase() } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: target.word.length + 1, attempts: target.word.length + 3 });
  });

  it('matches two-word names without caring about accents or spaces', () => {
    expect(normalizeSearch('  mèo   con ')).toBe('MEO CON');
    expect(normalizeSearch('đà')).toBe('DA');
    const { onRoundComplete } = renderGame(SearchBoxGame, 5);
    const target = SEARCH_TWO_WORDS.find(({ name }) => screen.queryByLabelText(`Tìm ${name}`, { exact: false }))!;
    const box = screen.getByRole('textbox', { name: 'Ô tìm kiếm' });
    act(() => box.focus());
    fireEvent.change(box, { target: { value: target.name } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: target.word.length + 1, attempts: target.word.length + 1 });
  });
});
