import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Mascot, { type MascotMood } from './Mascot';

describe('Mascot', () => {
  it.each<MascotMood>(['idle', 'cheer', 'encourage'])('shows the %s mood as its hidden drawing', (mood) => {
    const { container } = render(<Mascot mood={mood} />);
    const mascot = container.querySelector('.mascot');
    expect(mascot).toHaveAttribute('data-mood', mood);
    expect(mascot).toHaveAttribute('aria-hidden', 'true');
    expect(mascot?.querySelector('img')?.getAttribute('src')).toContain(`mascot-${mood}`);
    expect(mascot).not.toHaveAttribute('data-moving');
  });

  it('marks the mascot as moving only while asked to animate', () => {
    const { container } = render(<Mascot mood="cheer" moving />);
    expect(container.querySelector('.mascot')).toHaveAttribute('data-moving', 'true');
  });
});
