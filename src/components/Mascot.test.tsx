import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Mascot, { type MascotMood } from './Mascot';

describe('Mascot', () => {
  it.each<[MascotMood, string]>([
    ['idle', '🐱'],
    ['cheer', '😸'],
    ['encourage', '😺'],
  ])('shows the %s mood as a hidden emoji', (mood, face) => {
    const { container } = render(<Mascot mood={mood} />);
    const mascot = container.querySelector('.mascot');
    expect(mascot).toHaveAttribute('data-mood', mood);
    expect(mascot).toHaveAttribute('aria-hidden', 'true');
    expect(mascot).toHaveTextContent(face);
    expect(mascot).not.toHaveAttribute('data-moving');
  });

  it('marks the mascot as moving only while asked to animate', () => {
    const { container } = render(<Mascot mood="cheer" moving />);
    expect(container.querySelector('.mascot')).toHaveAttribute('data-moving', 'true');
  });
});
