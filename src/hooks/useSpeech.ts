import { useCallback } from 'react';

export function speakVietnamese(text: string): void {
  if (
    typeof window === 'undefined' ||
    !window.speechSynthesis ||
    typeof globalThis.SpeechSynthesisUtterance !== 'function'
  ) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function useSpeech() {
  const supported =
    typeof window !== 'undefined' &&
    Boolean(window.speechSynthesis) &&
    typeof globalThis.SpeechSynthesisUtterance === 'function';

  const speak = useCallback((text: string) => {
    speakVietnamese(text);
  }, []);

  return { speak, supported };
}
