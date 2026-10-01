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

  it('cancels speech when the hook unmounts', () => {
    const cancel = vi.fn();
    class MockUtterance {
      constructor(public text: string) {}
    }

    Object.defineProperty(window, 'speechSynthesis', {
      value: { cancel, speak: vi.fn() },
      configurable: true,
    });
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);

    const { unmount } = renderHook(() => useSpeech());
    expect(cancel).not.toHaveBeenCalled();
    unmount();

    expect(cancel).toHaveBeenCalledOnce();
  });

  describe('voice selection', () => {
    class MockUtterance {
      lang = '';
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      constructor(public text: string) {}
    }

    const englishVoice = { lang: 'en-US', name: 'English' } as SpeechSynthesisVoice;
    const vietnameseVoice = { lang: 'vi-VN', name: 'Vietnamese' } as SpeechSynthesisVoice;

    function installSynth(initialVoices: SpeechSynthesisVoice[]) {
      let voices = initialVoices;
      const listeners: Array<() => void> = [];
      const synth = {
        cancel: vi.fn(),
        speak: vi.fn(),
        getVoices: () => voices,
        addEventListener: (_type: string, listener: () => void) => {
          listeners.push(listener);
        },
      };
      Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
      vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
      return {
        synth,
        loadVoices(next: SpeechSynthesisVoice[]) {
          voices = next;
          listeners.splice(0).forEach((listener) => listener());
        },
      };
    }

    function spokenUtterance(speak: ReturnType<typeof vi.fn>): MockUtterance {
      return speak.mock.calls[0][0] as MockUtterance;
    }

    it('speaks with a Vietnamese voice instead of the default one', () => {
      const { synth } = installSynth([englishVoice, vietnameseVoice]);

      const { result } = renderHook(() => useSpeech());
      result.current.speak('Hãy bấm chữ A');

      expect(synth.speak).toHaveBeenCalledOnce();
      expect(spokenUtterance(synth.speak).voice).toBe(vietnameseVoice);
      expect(spokenUtterance(synth.speak).lang).toBe('vi-VN');
    });

    it('stays silent when no Vietnamese voice is installed', () => {
      const { synth } = installSynth([englishVoice]);

      const { result } = renderHook(() => useSpeech());
      result.current.speak('Hãy bấm chữ A');

      expect(synth.speak).not.toHaveBeenCalled();
    });

    it('waits for voices to load and speaks only the latest text', () => {
      const { synth, loadVoices } = installSynth([]);

      const { result } = renderHook(() => useSpeech());
      result.current.speak('Câu cũ');
      result.current.speak('Câu mới');
      expect(synth.speak).not.toHaveBeenCalled();

      loadVoices([englishVoice, vietnameseVoice]);

      expect(synth.speak).toHaveBeenCalledOnce();
      expect(spokenUtterance(synth.speak).text).toBe('Câu mới');
      expect(spokenUtterance(synth.speak).voice).toBe(vietnameseVoice);
    });

    it('drops text waiting for voices when the hook unmounts', () => {
      const { synth, loadVoices } = installSynth([]);

      const { result, unmount } = renderHook(() => useSpeech());
      result.current.speak('Xin chào');
      unmount();
      loadVoices([vietnameseVoice]);

      expect(synth.speak).not.toHaveBeenCalled();
    });
  });
});
