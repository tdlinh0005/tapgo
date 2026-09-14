import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSpeech } from './useSpeech';

const originalSpeechSynthesis = window.speechSynthesis;

afterEach(() => {
  Object.defineProperty(window, 'speechSynthesis', {
    value: originalSpeechSynthesis,
    configurable: true,
  });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useSpeech', () => {
  it('does not throw when speechSynthesis is unavailable', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useSpeech());
    expect(() => result.current.speak('Hãy bấm chữ A')).not.toThrow();
    expect(result.current.supported).toBe(false);
  });

  it('cancels previous speech before speaking', () => {
    const cancel = vi.fn();
    const speak = vi.fn();
    class MockUtterance {
      lang = '';
      rate = 1;
      constructor(public text: string) {}
    }

    Object.defineProperty(window, 'speechSynthesis', {
      value: { cancel, speak },
      configurable: true,
    });
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);

    const { result } = renderHook(() => useSpeech());
    result.current.speak('Xin chào');

    expect(cancel).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledOnce();
  });
});
