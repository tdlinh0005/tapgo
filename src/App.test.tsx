import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { PROGRESS_KEY } from './game/progress';

beforeEach(() => {
  localStorage.clear();
});

describe('App navigation', () => {
  it('shows the TapGo home actions', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'TapGo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bắt đầu lộ trình' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chơi tự do' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tiến độ' })).toBeInTheDocument();
  });

  it('opens the learning path', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Bắt đầu lộ trình' }));
    expect(screen.getByRole('heading', { name: 'Lộ trình học' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gõ chữ cái/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Gõ số/ })).toBeDisabled();
  });

  it('shows all ten games in free play and does not lock them', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Chơi tự do' }));
    expect(screen.getByRole('heading', { name: 'Chơi tự do' })).toBeInTheDocument();
    expect(screen.getAllByTestId('game-card')).toHaveLength(10);
    expect(screen.getByRole('button', { name: /Gõ số/ })).toBeEnabled();
  });

  it('shows total best stars in progress', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        version: 1,
        lastGameId: 'letters',
        games: {
          letters: { plays: 1, bestStars: 2, completed: true, lastPlayedAt: null },
          numbers: { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          words: { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          'find-key': { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          sequence: { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          'click-target': { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          'pick-picture': { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          'mouse-trail': { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          'drag-sort': { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
          'drag-match': { plays: 0, bestStars: 0, completed: false, lastPlayedAt: null },
        },
      }),
    );

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Tiến độ' }));
    expect(screen.getByText('2 / 30 sao')).toBeInTheDocument();
  });
});
