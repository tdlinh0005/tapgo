import { useCallback, useEffect } from 'react';

function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.speechSynthesis) &&
    typeof globalThis.SpeechSynthesisUtterance === 'function'
  );
}

export function speakVietnamese(text: string): void {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function useSpeech() {
  const supported = isSpeechSupported();

  const speak = useCallback((text: string) => {
    speakVietnamese(text);
  }, []);

  useEffect(() => () => {
    if (isSpeechSupported()) window.speechSynthesis.cancel();
  }, []);

  return { speak, supported };
}
