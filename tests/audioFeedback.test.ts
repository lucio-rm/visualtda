// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isAudioEnabled,
  setAudioEnabled,
  playFrequency,
  playStepPitch,
  playSuccessChime,
  playConflictTone
} from '../src/utils/audioFeedback';

describe('Web Audio Acoustic Feedback Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    setAudioEnabled(false);
  });

  it('manages sound enabled preference state in localStorage', () => {
    expect(isAudioEnabled()).toBe(false);
    setAudioEnabled(true);
    expect(isAudioEnabled()).toBe(true);
    expect(localStorage.getItem('visual_tda_sound_enabled')).toBe('true');
    setAudioEnabled(false);
    expect(isAudioEnabled()).toBe(false);
  });

  it('does not throw errors when invoking audio functions while muted', () => {
    expect(() => {
      playFrequency(440);
      playStepPitch(3, 10);
      playSuccessChime();
      playConflictTone();
    }).not.toThrow();
  });

  it('handles mocked AudioContext gracefully when sound is enabled', () => {
    setAudioEnabled(true);

    const mockOscillator = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };

    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn()
    };

    const mockAudioContext = {
      currentTime: 0,
      state: 'running',
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn().mockResolvedValue(undefined)
    };

    // @ts-expect-error Mocking window.AudioContext in test
    window.AudioContext = vi.fn(() => mockAudioContext);

    expect(() => {
      playFrequency(523.25, 100);
      playStepPitch(5, 10);
      playConflictTone();
    }).not.toThrow();
  });
});
