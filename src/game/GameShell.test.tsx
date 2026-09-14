import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GameShell from './GameShell';
import type { MiniGameProps } from './types';

function FakeGame({ onRoundComplete }: MiniGameProps) {
  return (
    <button onClick={() => onRoundComplete({ correct: 1, attempts: 1 })}>
      Hoàn thành lượt
    </button>
  );
}

const definition = {
  id: 'letters' as const,
  title: 'Gõ chữ cái',
  category: 'keyboard' as const,
  order: 1,
  rounds: 2,
  intro: 'Hãy bấm chữ đang hiện trên màn hình.',
  emoji: '🔤',
  component: FakeGame,
};

describe('GameShell', () => {
  it('advances rounds and completes with stars', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <GameShell
        definition={definition}
        onComplete={onComplete}
        onHome={() => {}}
        onNext={() => {}}
      />,
    );

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(screen.getByText('3 sao')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith('letters', 3);
  });
});
