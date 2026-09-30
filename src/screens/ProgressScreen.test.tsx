import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDefaultProgress } from '../game/progress';
import ProgressScreen from './ProgressScreen';

describe('ProgressScreen', () => {
  it('shows status and best stars for every game', () => {
    const progress = createDefaultProgress();
    progress.games.letters = {
      plays: 1,
      bestStars: 3,
      completed: true,
      lastPlayedAt: '2026-09-14T00:00:00.000Z',
    };

    render(<ProgressScreen progress={progress} onHome={() => {}} />);

    const list = screen.getByRole('list', { name: 'Tiến độ từng bài' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(10);

    const letters = within(list).getByTestId('progress-letters');
    expect(within(letters).getByText('Gõ chữ cái')).toBeInTheDocument();
    expect(within(letters).getByText('3 sao')).toBeInTheDocument();
    expect(within(letters).getByText('Đã hoàn thành')).toBeInTheDocument();

    const numbers = within(list).getByTestId('progress-numbers');
    expect(within(numbers).getByText('Gõ số')).toBeInTheDocument();
    expect(within(numbers).getByText('0 sao')).toBeInTheDocument();
    expect(within(numbers).getByText('Chưa hoàn thành')).toBeInTheDocument();
  });
});
