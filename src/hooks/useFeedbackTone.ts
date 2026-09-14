import { useCallback } from 'react';

function playTone(frequency: number, durationMs: number, delayMs = 0): void {
  try {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delayMs / 1000;
    const end = start + durationMs / 1000;

    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end);
    oscillator.addEventListener('ended', () => {
      void context.close();
    });
  } catch {
    // Audio feedback is optional; gameplay must remain usable without it.
  }
}

export function useFeedbackTone() {
  const correct = useCallback(() => {
    playTone(660, 110);
    playTone(880, 130, 120);
  }, []);

  const retry = useCallback(() => {
    playTone(330, 120);
  }, []);

  return { correct, retry };
}
