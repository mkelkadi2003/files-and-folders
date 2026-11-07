// Tiny Web Audio sound effects – no files needed.
let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18) {
  const c = getCtx();
  if (!c || muted) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.05);
}

export const sfx = {
  click() {
    tone(660, 0, 0.06, "square", 0.06);
  },
  correct() {
    tone(523, 0, 0.12, "triangle");
    tone(659, 0.1, 0.12, "triangle");
    tone(784, 0.2, 0.25, "triangle");
  },
  wrong() {
    tone(220, 0, 0.18, "sawtooth", 0.12);
    tone(165, 0.15, 0.3, "sawtooth", 0.12);
  },
  tick() {
    tone(1200, 0, 0.04, "square", 0.04);
  },
  unlock() {
    tone(392, 0, 0.1, "square", 0.08);
    tone(523, 0.1, 0.1, "square", 0.08);
    tone(659, 0.2, 0.1, "square", 0.08);
    tone(1046, 0.3, 0.35, "triangle", 0.15);
  },
  fanfare() {
    const notes = [523, 659, 784, 1046, 784, 1046];
    notes.forEach((n, i) => tone(n, i * 0.13, 0.22, "triangle", 0.16));
  },
  whoosh() {
    tone(300, 0, 0.25, "sine", 0.08);
    tone(600, 0.05, 0.2, "sine", 0.06);
  },
  hover() {
    tone(880, 0, 0.05, "sine", 0.04);
  },
};
