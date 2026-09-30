import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getGameDefinition } from '../game/registry';
import GameCard from './GameCard';
import StarRating from './StarRating';

const letters = getGameDefinition('letters');

describe('GameCard', () => {
  it('labels the play button with its role and the game title', () => {
    render(<GameCard game={letters} stars={2} onPlay={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Chơi Gõ chữ cái' })).toHaveTextContent('Chơi');
    expect(screen.getByRole('img', { name: '2 sao' })).toBeInTheDocument();
  });

  it('tells how to unlock a locked game', () => {
    render(<GameCard game={letters} stars={0} locked onPlay={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Gõ chữ cái: xong bài trước để mở' });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Xong bài trước để mở');
  });
});

describe('StarRating', () => {
  it('exposes the star count as an image label', () => {
    render(<StarRating stars={1} />);

    expect(screen.getByRole('img', { name: '1 sao' })).toBeInTheDocument();
  });
});
