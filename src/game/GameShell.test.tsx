import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GameShell from './GameShell';
import type { MiniGameProps } from './types';

const speak = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => ({ speak, supported: true }) }));

function FakeGame({ onRoundComplete, onRetry, assistLevel = 0 }: MiniGameProps) {
  return (
    <>
      <div data-testid="fake-target" data-assist={assistLevel || undefined} />
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

// React listens to webkitAnimationEnd when jsdom lacks AnimationEvent.
function endAnimation(element: HTMLElement) {
  fireEvent(element, new Event('animationend', { bubbles: true }));
  fireEvent(element, new Event('webkitAnimationEnd', { bubbles: true }));
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

  it('keeps the retry hint after the shake animation until the round completes', async () => {
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
    endAnimation(screen.getByTestId('game-stage'));
    expect(screen.getByTestId('game-stage')).toHaveAttribute('data-feedback', 'idle');
    expect(screen.getByRole('status')).toHaveTextContent('Thử lại nhé');

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('ignores animation end events bubbling from children', async () => {
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
    endAnimation(screen.getByRole('button', { name: 'Thử lại lượt' }));
    expect(screen.getByTestId('game-stage')).toHaveAttribute('data-feedback', 'retry');
  });

  it('drives the mascot: cheer on a correct round, encourage on retry, idle after the feedback ends', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GameShell definition={{ ...definition, rounds: 3 }} onComplete={() => {}} onHome={() => {}} onNext={() => {}} />,
    );
    const mascot = () => container.querySelector('.coach-bubble .mascot');

    expect(mascot()).toHaveAttribute('data-mood', 'idle');
    expect(mascot()).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.game-stage .mascot')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Thử lại lượt' }));
    expect(mascot()).toHaveAttribute('data-mood', 'encourage');
    expect(mascot()).toHaveAttribute('data-moving', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Thử lại nhé');

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(mascot()).toHaveAttribute('data-mood', 'cheer');

    endAnimation(screen.getByTestId('game-stage'));
    expect(mascot()).toHaveAttribute('data-mood', 'idle');
    expect(mascot()).not.toHaveAttribute('data-moving');
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

  it('celebrates the result without blocking the next lesson button', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const { container } = render(
      <GameShell definition={{ ...definition, rounds: 1 }} onComplete={() => {}} onHome={() => {}} onNext={onNext} />,
    );

    await user.click(screen.getByRole('button', { name: 'Hoàn thành lượt' }));
    expect(container.querySelector('.confetti')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.game-result-emoji .mascot')).toHaveAttribute('data-mood', 'cheer');
    expect(container.querySelectorAll('.result-primary-action')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Bài tiếp theo' }));
    expect(onNext).toHaveBeenCalledTimes(1);
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

  it('does not add review rounds to a quick session', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <GameShell
        definition={{ ...definition, rounds: 10 }}
        roundLimit={5}
        onComplete={onComplete}
        onHome={() => {}}
        onNext={() => {}}
      />,
    );

    for (let round = 0; round < 5; round += 1) {
      await user.click(screen.getByRole('button', { name: 'Hoàn thành có lỗi' }));
    }

    expect(screen.getByText('Con nhận được 1 sao')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledOnce();
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

    const retry = screen.getByRole('button', { name: 'Thử lại lượt' });
    const target = screen.getByTestId('fake-target');

    await user.click(retry);
    expect(target).not.toHaveAttribute('data-assist');

    await user.click(retry);
    expect(screen.getByRole('complementary', { name: 'Cách chơi' })).toBeInTheDocument();
    expect(target).toHaveAttribute('data-assist', '1');

    await user.click(retry);
    expect(target).toHaveAttribute('data-assist', '2');
  });

  it('reads the intro on mount and the hint on the second retry', async () => {
    const user = userEvent.setup();
    speak.mockClear();
    render(<GameShell definition={definition} onComplete={() => {}} onHome={() => {}} onNext={() => {}} />);

    expect(speak).toHaveBeenCalledWith(definition.intro);
    speak.mockClear();

    const retry = screen.getByRole('button', { name: 'Thử lại lượt' });
    await user.click(retry);
    expect(speak).not.toHaveBeenCalled();

    await user.click(retry);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0]).toContain('Thử lại nhé');
  });

  it('speaks the hint and opens the guide only on the second retry', async () => {
    const user = userEvent.setup();
    speak.mockClear();

    render(
      <GameShell
        definition={definition}
        onComplete={() => {}}
        onHome={() => {}}
        onNext={() => {}}
      />,
    );

    const retry = screen.getByRole('button', { name: 'Thử lại lượt' });
    await user.click(retry);
    await user.click(retry);
    await user.click(screen.getByRole('button', { name: 'Ẩn cách chơi' }));
    await user.click(retry);
    await user.click(retry);

    expect(speak.mock.calls.filter(([text]) => text !== definition.intro)).toHaveLength(1);
    expect(screen.queryByRole('complementary', { name: 'Cách chơi' })).not.toBeInTheDocument();
  });
});
