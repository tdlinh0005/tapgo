import { useCallback, useEffect } from 'react';

const VIETNAMESE_LANG = 'vi-VN';

let textAwaitingVoices: string | null = null;

function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.speechSynthesis) &&
    typeof globalThis.SpeechSynthesisUtterance === 'function'
  );
}

function isVietnameseVoice(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().replace('_', '-').startsWith('vi');
}

function utter(text: string, voice?: SpeechSynthesisVoice): void {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = VIETNAMESE_LANG;
  utterance.rate = 0.9;
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

// Chrome loads its voice list asynchronously, so the first call often sees an empty list.
function speakWhenVoicesLoad(text: string): void {
  const synth = window.speechSynthesis;
  if (typeof synth.addEventListener !== 'function') {
    utter(text);
    return;
  }

  synth.cancel();
  if (textAwaitingVoices === null) {
    synth.addEventListener(
      'voiceschanged',
      () => {
        const waitingText = textAwaitingVoices;
        textAwaitingVoices = null;
        if (waitingText !== null) speakVietnamese(waitingText);
      },
      { once: true },
    );
  }
  textAwaitingVoices = text;
}

// Without an explicit Vietnamese voice the browser falls back to its default (usually English) voice.
export function speakVietnamese(text: string): void {
  if (!isSpeechSupported()) return;

  const synth = window.speechSynthesis;
  if (typeof synth.getVoices !== 'function') {
    utter(text);
    return;
  }

  const voices = synth.getVoices();
  if (voices.length === 0) {
    speakWhenVoicesLoad(text);
    return;
  }

  const voice = voices.find(isVietnameseVoice);
  if (voice) utter(text, voice);
  else synth.cancel();
}

export function stopSpeech(): void {
  textAwaitingVoices = null;
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export function useSpeech() {
  const supported = isSpeechSupported();

  const speak = useCallback((text: string) => {
    speakVietnamese(text);
  }, []);

  useEffect(() => stopSpeech, []);

  return { speak, supported };
}
