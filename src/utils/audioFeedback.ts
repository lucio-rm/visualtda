// src/utils/audioFeedback.ts
/**
 * Lightweight, zero-dependency Web Audio synthesizer for accessible trace playback
 * and interactive simulation audio cues in Visual TDA.
 */

let audioCtx: AudioContext | null = null;
const STORAGE_KEY = 'visual_tda_sound_enabled';

export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAudioEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // LocalStorage unavailable
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        return null;
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playFrequency(
  freq: number,
  durationMs = 90,
  type: OscillatorType = 'sine',
  gainLevel = 0.08
): void {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Ignore audio dispatch issues on unsupported environments
  }
}

/**
 * Maps step progress [0..totalSteps] to a melodic pentatonic pitch scale (220Hz - 880Hz)
 */
export function playStepPitch(stepIndex: number, totalSteps: number): void {
  if (totalSteps <= 1) {
    playFrequency(440, 75);
    return;
  }
  const ratio = Math.max(0, Math.min(1, stepIndex / (totalSteps - 1)));
  // Pentatonic frequency ladder
  const baseFreq = 261.63; // C4
  const maxFreq = 659.25;  // E5
  const freq = baseFreq + ratio * (maxFreq - baseFreq);
  playFrequency(freq, 80, 'sine', 0.06);
}

/**
 * Pleasant ascending major triad when a test passes or optimal solution is reached
 */
export function playSuccessChime(): void {
  if (!isAudioEnabled()) return;
  const notes = [329.63, 440, 554.37, 659.25]; // E4, A4, C#5, E5
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playFrequency(freq, 160, 'triangle', 0.09);
    }, idx * 75);
  });
}

/**
 * Subtle low tone when an invalid selection / constraint conflict is made
 */
export function playConflictTone(): void {
  if (!isAudioEnabled()) return;
  playFrequency(164.81, 140, 'sawtooth', 0.05); // E3
}
