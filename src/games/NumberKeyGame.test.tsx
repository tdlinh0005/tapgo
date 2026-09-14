import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import NumberKeyGame from './NumberKeyGame';

describe('NumberKeyGame', () => {
  it('counts a wrong number before the correct one', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    render(<NumberKeyGame roundIndex={0} totalRounds={10} onRoundComplete={onRoundComplete} speak={() => {}} />);

    await user.keyboard('2');
    expect(onRoundComplete).not.toHaveBeenCalled();
    await user.keyboard('1');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
