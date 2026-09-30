import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Confetti, { CONFETTI_PIECES } from './Confetti';

const CELEBRATE_MS = 650;

describe('Confetti', () => {
  it('renders decorative pieces hidden from screen readers', () => {
    const { container } = render(<Confetti />);
    const root = container.querySelector('.confetti');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root?.querySelectorAll('.confetti-piece')).toHaveLength(CONFETTI_PIECES.length);
  });

  it('finishes every piece within about 1.5 seconds', () => {
    const lastEnd = Math.max(...CONFETTI_PIECES.map((piece) => piece.delayMs + CELEBRATE_MS));
    expect(lastEnd).toBeLessThanOrEqual(1500);
    CONFETTI_PIECES.forEach((piece) => {
      expect(piece.left).toBeGreaterThanOrEqual(0);
      expect(piece.left).toBeLessThanOrEqual(100);
    });
  });
});
