/* Áudio sintetizado (sem arquivos): efeitos + trilha ADAPTATIVA em camadas. © Thiago Silva.
 * Modos: 'calm' (estações de pergunta: só pad suave, sem bateria — não "empolga" a resposta),
 *        'play' (trechos de plataforma: bateria/arpejo sobem com a intensidade),
 *        'boss' (luta de chefe: dramática, andamento maior, percussão pesada). */
let ctx = null, master = null, musicBus = null, sfxBus = null, comp = null, muted = false, timer = null, duckGain = null;
let theme = null, mode = 'play', inten = 0.15, intenS = 0.15, step = 0, nextT = 0, curName = '';
try { muted = localStorage.getItem('pa_mute') === '1'; } catch (e) { /* ok */ }

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master = ctx.createGain(); master.gain.value = muted ? 0 : 0.85; comp.connect(master); master.connect(ctx.destination);
  duckGain = ctx.createGain(); duckGain.gain.value = 1; duckGain.connect(comp);
  musicBus = ctx.createGain(); musicBus.gain.value = 0.2; musicBus.connect(duckGain);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(comp);
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });
}
export const isMuted = () => muted;
export function toggleMute() { muted = !muted; try { localStorage.setItem('pa_mute', muted ? '1' : '0'); } catch (e) { /* ok */ } if (master) master.gain.value = muted ? 0 : 0.85; return muted; }
export function duck(on) { if (duckGain) duckGain.gain.setTargetAtTime(on ? 0.22 : 1, ctx.currentTime, 0.08); }

/* ---------- efeitos ---------- */
function osc(type, f0, f1, dur, vol = 0.3, delay = 0, dest = null) {
  if (!ctx || muted) return; const t = ctx.currentTime + delay; const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(dest || sfxBus); o.start(t); o.stop(t + dur + 0.03);
}
function noiseBurst(dur, vol, delay = 0, hp = 800, dest = null, lp = 0) {
  if (!ctx || muted) return; const t = ctx.currentTime + delay; const len = Math.max(1, Math.floor(ctx.sampleRate * dur)); const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
  const g = ctx.createGain(); g.gain.value = vol; s.connect(f); let last = f; if (lp) { const l = ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lp; f.connect(l); last = l; } last.connect(g); g.connect(dest || sfxBus); s.start(t);
}
export const sfx = {
  jump: () => osc('sine', 300, 720, 0.16, 0.3),
  coin: () => { osc('triangle', 988, 988, 0.07, 0.3); osc('triangle', 1319, 1319, 0.18, 0.3, 0.06); },
  star: () => [1047, 1319, 1568, 2093].forEach((f, i) => osc('triangle', f, f, 0.2, 0.28, i * 0.06)),
  stomp: () => { osc('sine', 240, 60, 0.16, 0.5); noiseBurst(0.09, 0.3); },
  hurt: () => { osc('sawtooth', 380, 90, 0.34, 0.28); noiseBurst(0.1, 0.15); },
  blip: () => osc('triangle', 660, 660, 0.05, 0.25),
  select: () => { osc('triangle', 523, 523, 0.06, 0.28); osc('triangle', 784, 784, 0.12, 0.28, 0.06); },
  back: () => osc('triangle', 440, 300, 0.1, 0.25),
  press: () => { osc('sine', 190, 120, 0.14, 0.6); noiseBurst(0.05, 0.12, 0, 1500); },       // idêntico para qualquer bloco (neutro)
  gate: () => [523, 659, 784, 1047].forEach((f, i) => osc('triangle', f, f, 0.12, 0.26, i * 0.07)),
  check: () => { osc('sine', 660, 660, 0.1, 0.4); osc('sine', 990, 990, 0.22, 0.4, 0.09); },
  clear: () => [523, 659, 784, 659, 784, 1047, 1319].forEach((f, i) => osc('square', f, f, 0.18, 0.2, i * 0.11)),
  turn: () => [392, 523, 659].forEach((f, i) => osc('triangle', f, f, 0.16, 0.3, i * 0.1)),
  tick: () => osc('square', 880, 880, 0.03, 0.12),
  shoot: () => { osc('square', 900, 260, 0.12, 0.3); osc('triangle', 1400, 500, 0.1, 0.18, 0.02); },
  empty: () => osc('square', 140, 110, 0.08, 0.2),
  spring: () => { osc('sine', 220, 980, 0.22, 0.45); osc('triangle', 440, 1320, 0.16, 0.2, 0.04); },
  boss: () => { osc('sawtooth', 70, 40, 1.4, 0.4); osc('sawtooth', 105, 60, 1.4, 0.3); noiseBurst(0.9, 0.2, 0, 200, null, 1200); [0, 0.3, 0.6].forEach((d) => osc('sine', 80, 40, 0.3, 0.7, d)); },
};

/* ---------- trilha ---------- */
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const MIN = [0, 2, 3, 5, 7, 8, 10], MAJ = [0, 2, 4, 5, 7, 9, 11], PHR = [0, 1, 4, 5, 7, 8, 10], DOR = [0, 2, 3, 5, 7, 9, 10];
const TH = {
  title: { bpm: 104, root: 57, sc: MAJ, prog: [0, 5, 3, 4], motif: [0, null, 2, null, 4, null, 2, 4, 5, null, 4, null, 2, null, 1, null], wave: 'triangle' },
  train: { bpm: 122, root: 60, sc: MAJ, prog: [0, 4, 5, 3], motif: [0, 2, 4, 2, 4, 5, 4, null, 2, 4, 5, 7, 5, 4, 2, null], wave: 'square' },
  s1: { bpm: 112, root: 57, sc: DOR, prog: [0, 5, 3, 6], motif: [0, null, 2, 4, 7, null, 4, 2, 5, null, 4, 2, 3, null, 2, 0], wave: 'sawtooth' },
  s2: { bpm: 118, root: 62, sc: PHR, prog: [0, 1, 0, 4], motif: [0, 2, 3, 2, 4, 3, 2, 0, 4, 5, 4, 3, 2, 3, 1, 0], wave: 'square' },
  s3: { bpm: 126, root: 59, sc: MIN, prog: [0, 5, 3, 4], motif: [4, 2, 0, 2, 4, 7, 4, 2, 5, 3, 2, 0, 3, 5, 7, 5], wave: 'sawtooth' },
  results: { bpm: 92, root: 60, sc: MAJ, prog: [0, 3, 4, 0], motif: [0, null, 2, null, 4, null, 2, null, 5, null, 4, null, 2, null, 0, null], wave: 'triangle' },
  boss: { bpm: 150, root: 50, sc: PHR, prog: [0, 1, 0, 4], motif: [0, null, 0, 1, null, 0, 4, null, 3, null, 1, 0, null, 3, 4, null], wave: 'sawtooth' },
};
const deg = (T, d) => T.root + T.sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
function note(type, f, t, dur, vol, dest, detune = 0) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; o.detune.value = detune; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03); }
function pad(T, d, t, dur, vol, boss) { // acorde sustentado (e "cordas" com vibrato no chefe)
  [0, 2, 4].forEach((k, i) => { const f = mtof(deg(T, d + k) + (boss ? 0 : 12)); const o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createBiquadFilter(); o.type = boss ? 'sawtooth' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 1) * (boss ? 9 : 5); l.type = 'lowpass'; l.frequency.value = boss ? 900 : 1400;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.25); g.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(l); l.connect(g); g.connect(musicBus);
    if (boss) { const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 8; lfo.connect(lg); lg.connect(o.detune); lfo.start(t); lfo.stop(t + dur + 0.05); } o.start(t); o.stop(t + dur + 0.05); });
}
function kick(t, v = 0.9) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.22); }
function snare(t, v = 0.45) { const len = Math.floor(ctx.sampleRate * 0.14), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; const g = ctx.createGain(); g.gain.value = v; s.connect(f); f.connect(g); g.connect(musicBus); s.start(t); osc2(180, 110, t, 0.09, v * 0.5); }
function osc2(f0, f1, t, dur, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + dur + 0.02); }
function hat(t, v = 0.16) { const len = Math.floor(ctx.sampleRate * 0.04), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; const g = ctx.createGain(); g.gain.value = v; s.connect(f); f.connect(g); g.connect(musicBus); s.start(t); }
function taiko(t, v = 0.8, f0 = 110) { osc2(f0, f0 * 0.5, t, 0.28, v); const len = Math.floor(ctx.sampleRate * 0.06), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = ctx.createBufferSource(); s.buffer = b; const g = ctx.createGain(); g.gain.value = v * 0.25; s.connect(g); g.connect(musicBus); s.start(t); }

function playStep(s, t) {
  const T = theme, boss = mode === 'boss', calm = mode === 'calm'; const bar = Math.floor(s / 16) % 4, st = s % 16, ch = T.prog[bar]; const I = intenS; const sd = 60 / bpm() / 4;
  if (st === 0) pad(T, ch, t, sd * 16 * 0.98, calm ? 0.2 : boss ? 0.16 : 0.12, boss);
  if (calm) { // fundo suave: notas esparsas de "sino"
    if (st % 4 === 0) { const m = T.motif[st]; if (m != null) note('sine', mtof(deg(T, m) + 12), t, sd * 6, 0.1, musicBus); }
    if (st === 0 || st === 8) note('sine', mtof(deg(T, ch) - 12), t, sd * 7, 0.22, musicBus); return;
  }
  // baixo
  if (st % 2 === 0 || (boss && st % 4 === 3)) { const o = mtof(deg(T, ch) - 12); note(boss ? 'sawtooth' : 'triangle', o, t, sd * (boss ? 1.4 : 1.7), (boss ? 0.34 : 0.28) * (0.6 + 0.4 * I), musicBus); }
  // bateria
  if (boss) {
    if (st === 0 || st === 3 || st === 6 || st === 10 || st === 12) kick(t, 0.95); if (st === 4 || st === 12) snare(t, 0.6); if (st % 2 === 0) hat(t, 0.15);
    if (st === 2 || st === 14 || (bar === 3 && st >= 12)) taiko(t, 0.75, st === 14 ? 90 : 130); if (st % 8 === 0 && I > 0.7) osc('sawtooth', mtof(deg(T, ch) + 12), mtof(deg(T, ch) + 12) * 0.98, sd * 3, 0.0, 0);
  } else {
    if (I > 0.12 && st % 4 === 0) kick(t, 0.55 + 0.35 * I); if (I > 0.32 && (st === 4 || st === 12)) snare(t, 0.3 + 0.25 * I); if (I > 0.22 && st % 2 === 0) hat(t, 0.08 + 0.1 * I);
    if (I > 0.55 && st % 2 === 1) hat(t, 0.06); if (I > 0.62 && (st === 10 || st === 14)) kick(t, 0.5); if (I > 0.8 && st % 8 === 6) taiko(t, 0.45, 120);
  }
  // melodia
  const m = T.motif[st];
  if (boss) { if (st === 0 || st === 6 || st === 10) { [0, 4].forEach((k, i) => note('sawtooth', mtof(deg(T, ch + k) + 12), t, sd * 2.6, 0.2, musicBus, i * 6)); } }
  else if (m != null && I > 0.28) note(T.wave, mtof(deg(T, m + ch * 0) + 12), t, sd * 1.8, 0.2 * (0.5 + 0.5 * I), musicBus);
  if (!boss && I > 0.5) { const arp = [0, 2, 4, 2][st % 4]; note('square', mtof(deg(T, ch + arp) + 24), t, sd * 0.9, 0.05 + 0.05 * I, musicBus); }
  if (boss && I > 0.5 && st % 2 === 1) note('square', mtof(deg(T, ch + [0, 1, 2, 4][(st >> 1) % 4]) + 24), t, sd * 0.8, 0.06, musicBus);
}
function bpm() { if (!theme) return 100; const base = theme.bpm; if (mode === 'calm') return base * 0.62; if (mode === 'boss') return base * (1 + 0.12 * intenS); return base * (1 + 0.22 * intenS); }
function sched() {
  if (!ctx || !theme || muted) { if (ctx && !muted) nextT = ctx.currentTime + 0.05; return; }
  intenS += (inten - intenS) * 0.05; const sd = 60 / bpm() / 4;
  if (nextT < ctx.currentTime - 0.3) nextT = ctx.currentTime + 0.05;
  while (nextT < ctx.currentTime + 0.14) { playStep(step, nextT); nextT += sd; step++; }
}
export function playMusic(name) { if (!ctx) return; const T = TH[name]; if (!T) return; curName = name; theme = T; if (!timer) timer = setInterval(sched, 30); nextT = ctx.currentTime + 0.05; step = 0; if (name !== 'boss' && mode === 'boss') mode = 'play'; }
export function setMode(m) {
  if (m === mode) return; const prev = mode; mode = m; if (!ctx) return;
  if (m === 'boss') { theme = TH.boss; step = 0; nextT = ctx.currentTime + 0.05; }
  else if (prev === 'boss' && curName) { theme = TH[curName]; step = 0; nextT = ctx.currentTime + 0.05; }
}
export function setIntensity(v) { inten = Math.max(0, Math.min(1, v)); }
export function stopMusic() { theme = null; }
export const currentMode = () => mode;
