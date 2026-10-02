import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FUN_SETS, PAINT_COLORS, PAINT_PICTURES, type MoleSet, type PaintSet, type ShadowSet } from './funGames';
import { createMoleGame, moleLayout, MOLE_HOLES } from './MoleGame';
import { createPaintGame } from './PaintGame';
import { createShadowGame } from './ShadowGame';

const MoleGame = createMoleGame(FUN_SETS['fun-mole'] as MoleSet);
const ShadowGame = createShadowGame(FUN_SETS['fun-shadow'] as ShadowSet);
const PaintGame = createPaintGame(FUN_SETS['fun-paint'] as PaintSet);

afterEach(() => {
  vi.restoreAllMocks();
});

const renderGame = (Game: typeof MoleGame, roundIndex = 0, assistLevel: 0 | 1 = 0) => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const { container } = render(<Game roundIndex={roundIndex} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} assistLevel={assistLevel} />);
  return { container, onRoundComplete, onRetry };
};

describe('MoleGame', () => {
  it('never puts the friend on a hole a mole visits', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      for (const count of [3, 4, 5]) {
        const { moles, friendAt } = moleLayout(count, seed);
        expect(new Set(moles).size).toBe(count);
        for (let caught = 0; caught < count; caught += 1) expect(moles).not.toContain(friendAt(caught));
      }
    }
  });

  it('shows one waiting mole at a time and leaves a star where it was', () => {
    const { container, onRoundComplete, onRetry } = renderGame(MoleGame);
    expect(container.querySelectorAll('.mole-hole')).toHaveLength(MOLE_HOLES);
    expect(container.querySelector('[data-kind="friend"]')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Bạn chuột chũi' }));
    expect(screen.getAllByRole('button', { name: 'Hang đã có sao' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Hang đã có sao' }));
    expect(onRetry).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole('button', { name: /^Hang trống/ })[0]);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('đang ló đầu'));
    fireEvent.click(screen.getByRole('button', { name: 'Bạn chuột chũi' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bạn chuột chũi' }));
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });

  it('adds a friend to skip from the third round', () => {
    const { onRetry } = renderGame(MoleGame, 2, 1);
    const friend = screen.getByRole('button', { name: 'bạn thỏ' });
    fireEvent.click(friend);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('Đó là bạn thỏ'));
    expect(screen.getByRole('button', { name: 'Bạn chuột chũi' })).toHaveAttribute('data-assist', '1');
  });
});

let pointerId = 0;
const dropOn = (piece: HTMLElement, target: HTMLElement | null) => {
  pointerId += 1;
  vi.spyOn(document, 'elementFromPoint').mockReturnValueOnce(target);
  fireEvent.pointerDown(piece, { pointerId, isPrimary: true, clientX: 0, clientY: 0 });
  fireEvent.pointerUp(piece, { pointerId, clientX: 40, clientY: 40 });
};

describe('ShadowGame', () => {
  const pieces = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('[data-shadow-piece]'));
  const slotFor = (container: HTMLElement, piece: HTMLElement) => container.querySelector<HTMLElement>(`[data-shadow-slot="${piece.dataset.shadowPiece}"]`)!;

  it('drags every animal onto its own shadow', () => {
    const { container, onRoundComplete, onRetry } = renderGame(ShadowGame);
    const shown = pieces(container);
    expect(shown).toHaveLength(3);
    expect(container.querySelectorAll('.shadow-slot')).toHaveLength(3);

    const wrong = Array.from(container.querySelectorAll<HTMLElement>('.shadow-slot')).find((slot) => slot !== slotFor(container, shown[0]))!;
    dropOn(shown[0], wrong);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining('cái bóng'));
    expect(pieces(container)).toHaveLength(3);

    for (const piece of shown) dropOn(piece, slotFor(container, piece));
    expect(container.querySelectorAll('[data-state="placed"]')).toHaveLength(2);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 4 });
  });

  it('uses four animals in later rounds and marks the next shadow for assist', () => {
    const { container } = renderGame(ShadowGame, 3, 1);
    const [first] = pieces(container);
    expect(pieces(container)).toHaveLength(4);
    expect(container.querySelector('[data-assist]')).toBe(slotFor(container, first));
  });
});

describe('PaintGame', () => {
  const pictureShown = () => PAINT_PICTURES.find(({ name }) => screen.queryByText(`Tô màu ${name}`))!;
  const colorName = (id: string) => PAINT_COLORS.find((color) => color.id === id)!.name;

  it('paints each region with the colour of the sample picture', () => {
    const { container, onRoundComplete, onRetry } = renderGame(PaintGame);
    const picture = pictureShown();
    expect(screen.getByRole('img', { name: `Hình mẫu ${picture.name}` })).toBeInTheDocument();
    expect(container.querySelectorAll('.paint-swatch')).toHaveLength(PAINT_COLORS.length);

    const [first] = picture.regions;
    fireEvent.click(screen.getByRole('button', { name: `Tô ${first.name}` }));
    expect(onRetry).toHaveBeenLastCalledWith(expect.stringContaining('Click chọn một màu'));

    const wrongColor = PAINT_COLORS.find((color) => color.id !== first.color)!;
    fireEvent.click(screen.getByRole('button', { name: `Màu ${wrongColor.name}` }));
    fireEvent.click(screen.getByRole('button', { name: `Tô ${first.name}` }));
    expect(onRetry).toHaveBeenLastCalledWith(expect.stringContaining(`${first.name} màu ${colorName(first.color)}`));

    for (const region of [...picture.regions].reverse()) {
      fireEvent.click(screen.getByRole('button', { name: `Màu ${colorName(region.color)}` }));
      fireEvent.click(screen.getByRole('button', { name: `Tô ${region.name}` }));
    }
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: picture.regions.length, attempts: picture.regions.length + 1 });
  });

  it('points assist at the needed colour first, then at the region', () => {
    const { container } = renderGame(PaintGame, 0, 1);
    const [first] = pictureShown().regions;
    expect(container.querySelector('[data-assist]')).toBe(screen.getByRole('button', { name: `Màu ${colorName(first.color)}` }));
    fireEvent.click(screen.getByRole('button', { name: `Màu ${colorName(first.color)}` }));
    expect(container.querySelector('[data-assist]')).toBe(screen.getByRole('button', { name: `Tô ${first.name}` }));
  });
});
