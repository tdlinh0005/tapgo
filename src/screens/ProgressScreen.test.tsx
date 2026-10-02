import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultProgress } from '../game/progress';
import ProgressScreen from './ProgressScreen';

const lettersDone = () => {
  const progress = createDefaultProgress();
  progress.games.letters = {
    plays: 1,
    bestStars: 3,
    completed: true,
    lastPlayedAt: '2026-09-14T00:00:00.000Z',
  };
  return progress;
};

const noop = () => {};

describe('ProgressScreen', () => {
  it('shows status and best stars for every game', () => {
    render(<ProgressScreen progress={lettersDone()} onPlay={noop} onHome={noop} onReset={noop} />);

    const list = screen.getByRole('list', { name: 'Tiến độ từng bài' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(43);

    const letters = within(list).getByTestId('progress-letters');
    expect(within(letters).getByText('Gõ chữ cái')).toBeInTheDocument();
    expect(within(letters).getByRole('img', { name: '3 sao' })).toBeInTheDocument();
    expect(within(letters).getByText('Đã hoàn thành')).toBeInTheDocument();

    const numbers = within(list).getByTestId('progress-numbers');
    expect(within(numbers).getByText('Gõ số')).toBeInTheDocument();
    expect(within(numbers).getByRole('img', { name: '0 sao' })).toBeInTheDocument();
    expect(within(numbers).getByText('Chưa hoàn thành')).toBeInTheDocument();
  });

  it('shows completed games as collected stickers and the rest as faded placeholders', () => {
    render(<ProgressScreen progress={lettersDone()} onPlay={noop} onHome={noop} onReset={noop} />);

    expect(screen.getByTestId('progress-letters')).toHaveAttribute('data-state', 'collected');
    expect(screen.getByTestId('progress-numbers')).toHaveAttribute('data-state', 'missing');
    expect(screen.getByText('3 / 129 sao')).toBeInTheDocument();
  });

  it('plays the recommended game from the parent suggestion', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<ProgressScreen progress={lettersDone()} onPlay={onPlay} onHome={noop} onReset={noop} />);

    await user.click(screen.getByRole('button', { name: /Chơi Gõ số/ }));

    expect(onPlay).toHaveBeenCalledWith('numbers');
  });

  it('asks once more before resetting and can be cancelled', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<ProgressScreen progress={lettersDone()} onPlay={noop} onHome={noop} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: /Bắt đầu lại từ đầu/ }));
    expect(screen.getByText(/Xoá rồi không lấy lại được/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Không xoá' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Không xoá' }));
    expect(onReset).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Bắt đầu lại từ đầu/ }));
    await user.click(screen.getByRole('button', { name: 'Xoá hết, bắt đầu lại' }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Đã xoá tiến độ');
  });

  it('disables reset when nothing has been played yet', () => {
    render(<ProgressScreen progress={createDefaultProgress()} onPlay={noop} onHome={noop} onReset={noop} />);
    expect(screen.getByRole('button', { name: /Bắt đầu lại từ đầu/ })).toBeDisabled();
  });
});
