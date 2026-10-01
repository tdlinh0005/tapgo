import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { createDefaultProgress, PROGRESS_KEY, recordCompletion } from './game/progress';

// Integration tests assume the canonical round order; seeded shuffling is covered in src/games/seededRounds.test.tsx.
vi.mock('./game/pickRound', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./game/pickRound')>();
  return { ...actual, createSessionSeed: () => undefined as unknown as number };
});

const originalSpeechSynthesis = window.speechSynthesis;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: originalSpeechSynthesis,
  });
});

describe('App navigation', () => {
  it('shows the TapGo home actions', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'TapGo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chơi ngay' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xem lộ trình' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chơi tự do' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tiến độ' })).toBeInTheDocument();
  });

  it('opens the learning path', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Xem lộ trình' }));
    expect(screen.getByRole('heading', { name: 'Lộ trình học' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gõ chữ cái/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Gõ số/ })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Gõ chữ cái/ }));
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
  });

  it('starts guided play as a five-round quick session', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Chơi ngay' }));
    expect(screen.getByRole('heading', { name: 'Gõ chữ cái' })).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('shows every game in free play and does not lock them', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Chơi tự do' }));
    expect(screen.getByRole('heading', { name: 'Chơi tự do' })).toBeInTheDocument();
    expect(screen.getAllByTestId('game-card')).toHaveLength(28);
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
    expect(screen.getByText('2 / 84 sao')).toBeInTheDocument();
  });
});

async function openLettersAndCompletePerfectly(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Xem lộ trình' }));
  await user.click(screen.getByRole('button', { name: /Gõ chữ cái/ }));

  for (const key of 'AMSLPEBCNT') {
    await user.keyboard(key.toLowerCase());
  }
}

describe('App integration', () => {
  it('persists three stars after a perfect letter session', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openLettersAndCompletePerfectly(user);

    expect(screen.getByText('Con nhận được 3 sao')).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
    expect(saved.games.letters.bestStars).toBe(3);
    expect(saved.games.letters.completed).toBe(true);
  });

  it('saves progress once per completed session under StrictMode', async () => {
    const user = userEvent.setup();
    render(<StrictMode><App /></StrictMode>);
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    await openLettersAndCompletePerfectly(user);

    expect(setItem.mock.calls.filter(([key]) => key === PROGRESS_KEY)).toHaveLength(1);
    setItem.mockRestore();
  });

  it('restores progress after remount and unlocks the next path game', async () => {
    const user = userEvent.setup();
    const first = render(<App />);

    await openLettersAndCompletePerfectly(user);
    first.unmount();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Xem lộ trình' }));
    expect(screen.getByRole('button', { name: /Gõ số/ })).toBeEnabled();
  });

  it('moves from a guided result into a fresh next game', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Chơi ngay' }));
    for (const key of 'AMSLP') {
      await user.keyboard(key.toLowerCase());
    }

    expect(screen.getByText('Con nhận được 3 sao')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bài tiếp theo' }));

    expect(screen.getByRole('heading', { name: 'Gõ số' })).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    expect(screen.queryByText('Con nhận được 3 sao')).not.toBeInTheDocument();
  });

  it('sends guided next to the recommended game instead of the next one in order', async () => {
    const user = userEvent.setup();
    let saved = createDefaultProgress();
    for (const gameId of ['letters', 'numbers', 'find-key'] as const) saved = recordCompletion(saved, gameId, 3);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(saved));
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Chơi ngay' }));
    expect(screen.getByRole('heading', { name: 'Gõ từ ngắn' })).toBeInTheDocument();
    for (const word of ['me', 'ba', 'con', 'meo', 'cho']) {
      await user.keyboard(word);
    }

    expect(screen.getByText('Con nhận được 3 sao')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bài tiếp theo' }));
    expect(screen.getByRole('heading', { name: 'Gõ chuỗi phím' })).toBeInTheDocument();
  });

  it('opens drag match from Free Play even when the path is locked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Chơi tự do' }));
    await user.click(screen.getByRole('button', { name: /Kéo thả ghép cặp/ }));

    expect(screen.getByRole('heading', { name: 'Kéo thả ghép cặp' })).toBeInTheDocument();
  });

  it('keeps gameplay available without speech synthesis', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Xem lộ trình' }));
    await user.click(screen.getByRole('button', { name: /Gõ chữ cái/ }));

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('recovers from corrupt progress data', () => {
    localStorage.setItem(PROGRESS_KEY, '{bad json');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'TapGo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chơi ngay' })).toBeInTheDocument();
  });
});
