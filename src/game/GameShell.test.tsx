import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GameShell from './GameShell';
import type { MiniGameProps } from './types';

function FakeGame({ onRoundComplete, onRetry }: MiniGameProps) {
  return (
    <>
      <button onClick={() => onRoundComplete({ correct: 1, attempts: 1 })}>
        Hoàn thành lượt
      </button>
      <button onClick={() => onRoundComplete({ correct: 2, attempts: 3 })}>
        Hoàn thành có lỗi
      </button>
      <button onClick={() => onRetry?.()}>Thử lại lượt</button>
    </>
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
  it('shows an optional child-friendly guide', async () => {
    const user = userEvent.setup();
    render(
      <GameShell
        definition={definition}
        onComplete={() => {}}
        onHome={() => {}}
        onNext={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Xem cách chơi' }));
    expect(screen.getByRole('complementary', { name: 'Cách chơi' })).toHaveTextContent('Dùng bàn phím');
  });

  it('shows a specific retry hint without crashing', async () => {
    const user = userEvent.setup();
    render(
      <GameShell
        definition={definition}
        onComplete={() => {}}
        onHome={() => {}}
        onNext={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Thử lại lượt' }));
    expect(screen.getByRole('status')).toHaveTextContent('Thử lại nhé');
  });

  it('uses the supplied final action label', async () => {
    const user = userEvent.setup();
    render(
      <GameShell
        definition={{ ...definition, rounds: 1 }}
        onComplete={() => {}}
        onHome={() => {}}
        onNext={() => {}}
        nextLabel="Xem tiến độ"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(screen.getByRole('button', { name: 'Xem tiến độ' })).toBeInTheDocument();
  });

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
    await user.click(screen.getByRole('button', { name: 'Thử lại lượt' }));
    expect(screen.getByTestId('game-stage')).toHaveAttribute('data-feedback', 'retry');

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(screen.getByText('Con nhận được 3 sao')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith('letters', 3);
  });

  it('does not let the review round change the original score', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <GameShell
        definition={{ ...definition, rounds: 1 }}
        onComplete={onComplete}
        onHome={() => {}}
        onNext={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Hoàn thành có lỗi' }));
    expect(screen.getByRole('status')).toHaveTextContent('ôn lại');

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(screen.getByText('Con nhận được 1 sao')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith('letters', 1);
  });

  it('opens guidance and raises assistance after two retries', async () => {
    const user = userEvent.setup();

    render(
      <GameShell
        definition={definition}
        onComplete={() => {}}
        onHome={() => {}}
        onNext={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Thử lại lượt' }));
    await user.click(screen.getByRole('button', { name: 'Thử lại lượt' }));

    expect(screen.getByRole('complementary', { name: 'Cách chơi' })).toBeInTheDocument();
    expect(screen.getByTestId('game-stage')).toHaveClass('assist-level-1');
  });
});
