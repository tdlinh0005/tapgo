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

describe('ProgressScreen', () => {
  it('shows status and best stars for every game', () => {
    render(<ProgressScreen progress={lettersDone()} onPlay={() => {}} onHome={() => {}} />);

    const list = screen.getByRole('list', { name: 'Tiến độ từng bài' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(20);

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
    render(<ProgressScreen progress={lettersDone()} onPlay={() => {}} onHome={() => {}} />);

    expect(screen.getByTestId('progress-letters')).toHaveAttribute('data-state', 'collected');
    expect(screen.getByTestId('progress-numbers')).toHaveAttribute('data-state', 'missing');
    expect(screen.getByText('3 / 60 sao')).toBeInTheDocument();
  });

  it('plays the recommended game from the parent suggestion', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<ProgressScreen progress={lettersDone()} onPlay={onPlay} onHome={() => {}} />);

    await user.click(screen.getByRole('button', { name: /Chơi Gõ số/ }));

    expect(onPlay).toHaveBeenCalledWith('numbers');
  });
});
