import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FUN_SETS, PIANO_TUNES, TRAIN_WORDS_2, TRAIN_WORDS_3, TRAIN_WORDS_4, type PianoSet, type TrainSet } from './funGames';
import { createPianoGame } from './PianoGame';
import { createTrainGame } from './TrainGame';

const PianoGame = createPianoGame(FUN_SETS['fun-piano'] as PianoSet);
const TrainGame = createTrainGame(FUN_SETS['fun-train'] as TrainSet);

const renderGame = (Game: typeof PianoGame, roundIndex = 0, assistLevel: 0 | 1 = 0, sessionSeed?: number) => {
  const onRoundComplete = vi.fn();
  const onRetry = vi.fn();
  const { container } = render(<Game roundIndex={roundIndex} totalRounds={6} onRoundComplete={onRoundComplete} onRetry={onRetry} speak={vi.fn()} assistLevel={assistLevel} sessionSeed={sessionSeed} />);
  return { container, onRoundComplete, onRetry };
};

const press = (key: string) => fireEvent.keyDown(window, { key });

describe('PianoGame', () => {
  it('plays the tune note by note on the lit key', () => {
    const { container, onRoundComplete, onRetry } = renderGame(PianoGame);
    const tune = PIANO_TUNES.find(({ name }) => screen.queryByText(`Đàn bài: ${name}`))!;
    expect(container.querySelectorAll('.piano-key')).toHaveLength(7);
    const notes = tune.notes.split('');

    expect(container.querySelector('.piano-key[data-state="next"]')).toHaveTextContent(notes[0]);
    press(notes[0].toLowerCase());
    expect(screen.getByLabelText(`Đã đàn 1 / ${notes.length} nốt`)).toBeInTheDocument();
    for (const key of notes.slice(1)) press(key);
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: notes.length, attempts: notes.length });
  });

  it('lets the child try unlit piano keys for free and counts only keys off the piano', () => {
    const { container, onRoundComplete, onRetry } = renderGame(PianoGame, 1, 0, 4242);
    const notes = PIANO_TUNES.find(({ name }) => screen.queryByText(`Đàn bài: ${name}`))!.notes.split('');
    const unlit = 'ASDFGHJ'.split('').find((key) => key !== notes[0])!;

    press(unlit);
    press(' ');
    expect(onRetry).not.toHaveBeenCalled();
    expect(container.querySelector('.piano-tune [data-state="played"]')).toBeNull();

    press('Q');
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining(`Bấm phím ${notes[0]}`));
    press(notes[0]);
    fireEvent.keyDown(window, { key: notes[1], repeat: true });
    expect(screen.getByLabelText(`Đã đàn 1 / ${notes.length} nốt`)).toBeInTheDocument();
    for (const key of notes.slice(1)) press(key);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: notes.length, attempts: notes.length + 1 });
  });
});

describe('TrainGame', () => {
  it('types the animal name wagon by wagon', () => {
    const { container, onRoundComplete, onRetry } = renderGame(TrainGame);
    const target = TRAIN_WORDS_2.find(({ name }) => screen.queryByText(`Gõ tên ${name}`))!;
    const wagons = () => Array.from(container.querySelectorAll<HTMLElement>('.train-wagon'));
    expect(wagons()).toHaveLength(2);
    expect(screen.getByRole('img', { name: target.name })).toBeInTheDocument();

    const wrong = 'XYZ'.split('').find((key) => !target.word.includes(key))!;
    press(wrong);
    expect(onRetry).toHaveBeenCalledWith(expect.stringContaining(`Gõ chữ ${target.word[0]}`));
    press(target.word[0].toLowerCase());
    expect(wagons()[0]).toHaveAttribute('data-state', 'done');
    expect(wagons()[1]).toHaveAttribute('data-state', 'next');
    press(target.word[1]);
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 2, attempts: 3 });
  });

  it('ignores Space between letters', () => {
    const { onRoundComplete, onRetry } = renderGame(TrainGame, 2, 0, 4242);
    const target = TRAIN_WORDS_3.find(({ name }) => screen.queryByText(`Gõ tên ${name}`))!;
    for (const letter of target.word) {
      press(' ');
      press(letter);
    }
    expect(onRetry).not.toHaveBeenCalled();
    expect(onRoundComplete).toHaveBeenCalledWith({ correct: 3, attempts: 3 });
  });

  it('makes the last round a four-letter name', () => {
    renderGame(TrainGame, 5);
    expect(TRAIN_WORDS_4.some(({ name }) => screen.queryByText(`Gõ tên ${name}`))).toBe(true);
  });
});
