import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultProgress, recordCompletion } from '../game/progress';
import LearningPathScreen from './LearningPathScreen';

describe('LearningPathScreen', () => {
  it('draws a station for every game with locked stops that tell how to open them', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<LearningPathScreen progress={createDefaultProgress()} onPlay={onPlay} onHome={vi.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(11);
    expect(screen.getByRole('button', { name: 'Phím cách và Enter: xong bài trước để mở' })).toBeDisabled();
    const numbers = screen.getByRole('button', { name: 'Gõ số: xong bài trước để mở' });
    expect(numbers).toBeDisabled();
    expect(numbers).toHaveTextContent('🔒');

    await user.click(screen.getByRole('button', { name: 'Chơi Gõ chữ cái' }));
    expect(onPlay).toHaveBeenCalledWith('letters');
  });

  it('puts the mascot beside the recommended station only', () => {
    const progress = recordCompletion(createDefaultProgress(), 'letters', 2);
    const { container } = render(<LearningPathScreen progress={progress} onPlay={vi.fn()} onHome={vi.fn()} />);

    expect(container.querySelectorAll('.mascot')).toHaveLength(1);
    const recommended = screen.getByRole('button', { name: 'Chơi Gõ số' }).closest('li');
    expect(recommended).toHaveAttribute('data-recommended', 'true');
    expect(recommended?.querySelector('.mascot')).not.toBeNull();
    const letters = screen.getByRole('button', { name: 'Chơi Gõ chữ cái' }).closest('li');
    expect(letters).toHaveAttribute('data-state', 'done');
    expect(within(letters as HTMLElement).getByRole('img', { name: '2 sao' })).toBeInTheDocument();
  });
});
