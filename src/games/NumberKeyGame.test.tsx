import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { keyRetryHint } from '../game/retryCopy';
import NumberKeyGame from './NumberKeyGame';

describe('NumberKeyGame', () => {
  it('retries with a hint on a wrong number and stays on the round', async () => {
    const user = userEvent.setup();
    const onRoundComplete = vi.fn();
    const onRetry = vi.fn();
    render(<NumberKeyGame roundIndex={0} totalRounds={10} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={() => {}} />);

    await user.keyboard('2');
    expect(onRoundComplete).not.toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalledWith(keyRetryHint('1'));

    await user.keyboard('1');
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 1, attempts: 2 });
  });
});
