import { useCallback } from 'react';

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!sharedContext) {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return null;
    sharedContext = new AudioContextClass();
  }
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume().catch(() => {});
  }
  return sharedContext;
}

function playTone(frequency: number, durationMs: number, delayMs = 0): void {
  try {
    const context = getAudioContext();
    if (!context) return;

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
