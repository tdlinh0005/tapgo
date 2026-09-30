import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFeedbackTone } from './useFeedbackTone';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useFeedbackTone', () => {
  it('reuses one audio context and resumes it when suspended', () => {
    const constructed = vi.fn();
    const resume = vi.fn(() => Promise.resolve());
    const node = () => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    });
    class MockAudioContext {
      state = 'suspended';
      currentTime = 0;
      destination = {};
      resume = resume;
      createOscillator = node;
      createGain = node;
      constructor() {
        constructed();
      }
    }
    vi.stubGlobal('AudioContext', MockAudioContext);

    const { result } = renderHook(() => useFeedbackTone());
    result.current.correct();
    result.current.correct();
    result.current.correct();
    result.current.retry();
    result.current.retry();

    expect(constructed).toHaveBeenCalledOnce();
    expect(resume).toHaveBeenCalled();
  });
});
