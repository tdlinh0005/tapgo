import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BackgroundDecor from './BackgroundDecor';

describe('BackgroundDecor', () => {
  it('is hidden from assistive tech and has nothing to click', () => {
    render(<BackgroundDecor />);

    const decor = screen.getByTestId('bg-decor');
    expect(decor).toHaveAttribute('aria-hidden', 'true');
    expect(decor.querySelectorAll('span')).toHaveLength(6);
    expect(decor.querySelector('button, a, input')).toBeNull();
  });
});
