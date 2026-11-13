let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  volume = 0.06,
  delaySec = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

export function playEatSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(520, 0.09, 'triangle', 0.07, 0);
  playTone(680, 0.1, 'triangle', 0.06, 0.045);
}

export function playLevelUpSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(523.25, 0.11, 'triangle', 0.07, 0);
  playTone(659.25, 0.11, 'triangle', 0.07, 0.08);
  playTone(783.99, 0.16, 'triangle', 0.08, 0.16);
}

export function playGameOverSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(280, 0.14, 'sawtooth', 0.04, 0);
  playTone(210, 0.22, 'sawtooth', 0.04, 0.11);
}
