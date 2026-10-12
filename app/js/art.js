/* Arte do cenário em vetor HD (estilo "casual moderno"): tiles, decoração e fundos com parallax. © Thiago Silva.
 * Personagens, inimigos, chefes e props 3D vêm de atlas renderizados no Blender (ver gfx.js). */
export const TS = 16;                       // lado do tile em unidades lógicas
export const T = { EMPTY: 0, TOP: 1, FILL: 2, BRICK: 3, PLAT: 4, SPIKE: 5, BLOCK: 6, WALL: 7, GATE: 8 };
const SOLID = new Set([T.TOP, T.FILL, T.BRICK, T.BLOCK, T.WALL, T.GATE]);
export const isSolid = (t) => SOLID.has(t);

export const PLAYER_COLORS = [
  { name: 'JOGADOR 1', short: 'P1', main: '#2f6bff', dark: '#1a3fa6', light: '#9bb9ff', glow: 'rgba(47,107,255,.7)', mark: '◆' },
  { name: 'JOGADOR 2', short: 'P2', main: '#ff6a2b', dark: '#b8400f', light: '#ffb690', glow: 'rgba(255,106,43,.7)', mark: '▲' },
];
export const OPT_COLORS = [
  { main: '#ffd23f', dark: '#b8860b', letter: 'A', shape: '●', name: 'amarelo' },
  { main: '#3ddc84', dark: '#168a4d', letter: 'B', shape: '■', name: 'verde' },
  { main: '#b46bff', dark: '#6a2fb3', letter: 'C', shape: '▲', name: 'roxo' },
  { main: '#aab0c8', dark: '#5a6082', letter: '?', shape: '◇', name: 'cinza', idk: true },
];
export const CHARS = [
  { id: 'nina', name: 'NINA', desc: 'Cientista curiosa' },
  { id: 'teo', name: 'TÉO', desc: 'Explorador veloz' },
  { id: 'byte', name: 'BYTE', desc: 'Robô gentil' },
  { id: 'fox', name: 'RAPOSA', desc: 'Ágil e esperta' },
];

export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
export function shade(h, f) { const [r, g, b] = hex2rgb(h); return f >= 0 ? rgb2hex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f) : rgb2hex(r * (1 + f), g * (1 + f), b * (1 + f)); }
export function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function lg(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function clipRound(c, w, h, tl, tr) { c.beginPath(); c.moveTo(tl, 0); c.lineTo(w - tr, 0); if (tr) c.arcTo(w, 0, w, tr, tr); else c.lineTo(w, 0); c.lineTo(w, h); c.lineTo(0, h); c.lineTo(0, tl); if (tl) c.arcTo(0, 0, tl, 0, tl); c.closePath(); c.clip(); }

/* ---------- temas ---------- */
export const THEMES = {
  train: { key: 'train', name: 'Campo de Treino', sky: ['#2f9bff', '#7fd0ff', '#fff0c8'], hill: ['#8fd0ee', '#62c58f', '#3aa46b'], topA: '#a6ee52', topB: '#3fb23a', topHi: '#eaffb0', dirtA: '#c47a45', dirtB: '#74402a', pebble: '#ecb888', plat: '#f2b94a', platDark: '#b8741c', accent: '#ffd23f', glow: '#fff3b0', night: false, abyss: '#2b1a55', fog: '#ffffff', enemy: 'sentinel', flyer: 'drone', boss: null },
  s1: { key: 's1', name: 'Geleira dos Cristais', sky: ['#07052a', '#1b1262', '#4a2a9e'], hill: ['#2b2486', '#1f1a6c', '#140f4c'], topA: '#62f0ff', topB: '#2f8fe0', topHi: '#e6fdff', dirtA: '#4a45b0', dirtB: '#221e66', pebble: '#8a88f0', plat: '#8f86ff', platDark: '#3b3aa8', accent: '#7df9ff', glow: '#7df9ff', night: true, ice: true, abyss: '#2b0b52', fog: '#7a60ff', enemy: 'spider', flyer: 'wraith', boss: 'colossus' },
  s2: { key: 's2', name: 'Ruínas dos Ossos', sky: ['#4b2a8c', '#ff6e5c', '#ffc880'], hill: ['#c4546e', '#9c3c64', '#6c295a'], topA: '#ffd27a', topB: '#e8934a', topHi: '#fff1c8', dirtA: '#e0985a', dirtB: '#a45e36', pebble: '#f6d6a2', plat: '#f0dcae', platDark: '#a88650', accent: '#fff0c4', glow: '#ffb46a', night: false, abyss: '#4b1222', fog: '#ffd2a0', enemy: 'skull', flyer: 'vulture', boss: 'titan' },
  s3: { key: 's3', name: 'Floresta das Sinapses', sky: ['#030a1e', '#0a3449', '#16866a'], hill: ['#0f4c55', '#0a3b46', '#062a33'], topA: '#8dffb0', topB: '#2fd382', topHi: '#e8fff0', dirtA: '#2f6a62', dirtB: '#123533', pebble: '#58b0a0', plat: '#4ab89c', platDark: '#1f6a58', accent: '#ff4fd8', glow: '#7dffa3', night: true, abyss: '#07231e', fog: '#3dff9a', enemy: 'spore', flyer: 'wisp', boss: 'hydra' },
};

/* ---------- texturas de tile (64×64 px por tile) ---------- */
const TP = 64;
function pebbles(c, th, seed, n, y0, y1) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * TP, y = y0 + r() * (y1 - y0), s = 2 + r() * 4; c.fillStyle = r() < 0.5 ? th.pebble : shade(th.dirtB, -0.2); c.globalAlpha = 0.16 + r() * 0.25; c.beginPath(); c.ellipse(x, y, s * 1.4, s, 0, 0, 6.3); c.fill(); } c.globalAlpha = 1; }
function soil(c, th, seed) {
  const r = rng(seed * 13 + 7);
  c.fillStyle = lg(c, 0, 0, 0, TP, [[0, th.dirtA], [0.55, mix(th.dirtA, th.dirtB, 0.6)], [1, th.dirtB]]); c.fillRect(0, 0, TP, TP);
  for (let k = 0; k < 3; k++) { const y = 14 + k * 17 + (seed % 4); c.fillStyle = k % 2 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.10)'; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(18, y + 5, 44, y - 5, TP, y + 3); c.lineTo(TP, y + 8); c.bezierCurveTo(44, y + 3, 18, y + 12, 0, y + 8); c.closePath(); c.fill(); }
  pebbles(c, th, seed, 7, 6, TP);
  for (let i = 0; i < 3; i++) { const x = 6 + r() * (TP - 12), y = 22 + r() * 34, rx = 4 + r() * 5, ry = rx * 0.7; c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x + 1, y + 1.5, rx, ry, 0, 0, 6.3); c.fill(); c.fillStyle = lg(c, 0, y - ry, 0, y + ry, [[0, shade(th.pebble, 0.15)], [1, shade(th.dirtB, 0.1)]]); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - rx * 0.3, y - ry * 0.35, rx * 0.4, ry * 0.25, 0, 0, 6.3); c.fill(); }
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 1.4; c.lineCap = 'round';
  for (let k = 0; k < 2; k++) { let x = r() * TP, y = 20 + r() * 20; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (r() - 0.4) * 9; y += 4 + r() * 6; c.lineTo(x, y); } c.stroke(); }
  if (th.key === 's1') { for (let i = 0; i < 3; i++) { const x = 6 + r() * (TP - 12), y = 26 + r() * 30; c.save(); c.shadowColor = th.accent; c.shadowBlur = 6; c.fillStyle = th.accent; c.globalAlpha = 0.75; c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 2.2, y); c.lineTo(x, y + 3); c.lineTo(x - 2.2, y); c.closePath(); c.fill(); c.restore(); } }
  else if (th.key === 's3') { c.strokeStyle = th.glow; c.globalAlpha = 0.45; c.lineWidth = 1.2; for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(r() * TP, 22); c.bezierCurveTo(r() * TP, 34, r() * TP, 46, r() * TP, TP); c.stroke(); } c.globalAlpha = 1; }
  else if (th.key === 's2') { c.fillStyle = 'rgba(255,248,225,.55)'; for (let i = 0; i < 1; i++) { if (r() < 0.45) continue; const x = 8 + r() * (TP - 20), y = 28 + r() * 26; c.save(); c.translate(x, y); c.rotate(r() * 3); c.fillRect(-5, -1, 10, 2.2); c.beginPath(); c.arc(-5, 0, 1.8, 0, 6.3); c.arc(5, 0, 1.8, 0, 6.3); c.fill(); c.restore(); } }
  else { c.strokeStyle = 'rgba(70,40,20,.45)'; c.lineWidth = 2; for (let k = 0; k < 2; k++) { const x = 8 + r() * (TP - 16); c.beginPath(); c.moveTo(x, 20); c.bezierCurveTo(x - 6, 30, x + 6, 40, x - 2, 52); c.stroke(); } }
  c.globalAlpha = 1;
}
function texTop(th, flags, v) {
  const [t, c] = cv(TP, TP); c.save(); clipRound(c, TP, TP, flags & 1 ? 16 : 0, flags & 2 ? 16 : 0);
  soil(c, th, v * 17 + flags); const r = rng(v * 31 + flags * 7 + 3);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(TP, 0); c.lineTo(TP, 20 + (v ? 3 : 0));
  for (let x = TP; x >= 0; x -= 8) c.quadraticCurveTo(x - 4, 28 + ((x * 7 + v * 5) % 7), x - 8, 20 + ((x * 5 + v * 3) % 5)); c.closePath();
  c.fillStyle = lg(c, 0, 0, 0, 32, [[0, th.topHi], [0.22, th.topA], [1, th.topB]]); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.24)'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, 4, 3, TP - 8, 3.5, 2); c.fill();
  c.lineCap = 'round';
  if (th.key === 'train') {
    for (let i = 0; i < 12; i++) { const x = 3 + r() * (TP - 6), l = 4 + r() * 6; c.strokeStyle = r() < 0.5 ? shade(th.topA, 0.4) : shade(th.topB, -0.15); c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, 8 + r() * 6); c.lineTo(x + (r() - 0.5) * 3, 8 + r() * 6 + l); c.stroke(); }
    for (let i = 0; i < 3; i++) { const x = 6 + r() * (TP - 12), y = 10 + r() * 8; c.fillStyle = ['#fff', '#ff7ab6', '#ffd23f'][i % 3]; c.beginPath(); c.arc(x, y, 1.9, 0, 6.3); c.fill(); c.fillStyle = '#e8a020'; c.beginPath(); c.arc(x, y, 0.7, 0, 6.3); c.fill(); }
  } else if (th.key === 's1') {
    c.fillStyle = 'rgba(255,255,255,.30)'; c.beginPath(); c.moveTo(8 + v * 14, 3); c.lineTo(22 + v * 14, 3); c.lineTo(12 + v * 14, 17); c.lineTo(-2 + v * 14, 17); c.closePath(); c.fill(); c.beginPath(); c.moveTo(36 - v * 8, 3); c.lineTo(42 - v * 8, 3); c.lineTo(34 - v * 8, 17); c.lineTo(28 - v * 8, 17); c.closePath(); c.fill();
    c.fillStyle = th.topHi; for (let x = 4; x < TP; x += 10) { const l = 5 + ((x * 7 + v * 3) % 6); c.globalAlpha = 0.85; c.beginPath(); c.moveTo(x, 20 + (x % 3)); c.lineTo(x + 3, 20 + (x % 3) + l); c.lineTo(x + 6, 20 + (x % 3)); c.fill(); } c.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { c.fillStyle = '#fff'; c.globalAlpha = 0.5 + r() * 0.5; c.beginPath(); c.arc(r() * TP, 6 + r() * 12, 0.8 + r() * 1.4, 0, 6.3); c.fill(); } c.globalAlpha = 1;
  } else if (th.key === 's2') {
    c.strokeStyle = 'rgba(160,100,40,.42)'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const y = 8 + i * 6; c.beginPath(); c.moveTo(4, y); c.quadraticCurveTo(32, y + 3, 60, y - 1); c.stroke(); }
    for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(255,248,225,.7)'; c.beginPath(); c.ellipse(5 + r() * (TP - 10), 9 + r() * 10, 1.8, 1.1, 0, 0, 6.3); c.fill(); }
  } else {
    c.fillStyle = shade(th.topB, -0.2); for (let i = 0; i < 9; i++) { c.globalAlpha = 0.5; c.beginPath(); c.arc(3 + i * 7.5, 6 + ((i * 5) % 8), 3 + (i % 3), 0, 6.3); c.fill(); } c.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { c.fillStyle = th.glow; c.globalAlpha = 0.5 + r() * 0.5; c.shadowColor = th.glow; c.shadowBlur = 6; c.beginPath(); c.arc(r() * TP, 6 + r() * 14, 1 + r() * 1.3, 0, 6.3); c.fill(); } c.shadowBlur = 0; c.globalAlpha = 1;
  }
  if (flags & 1) { c.fillStyle = lg(c, 0, 0, 14, 0, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 20, 14, TP); }
  if (flags & 2) { c.fillStyle = lg(c, TP, 0, TP - 14, 0, [[0, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(TP - 14, 20, 14, TP); }
  c.restore(); return t;
}
function texFill(th, flags, v) {
  const [t, c] = cv(TP, TP); c.save(); clipRound(c, TP, TP, 0, 0); soil(c, th, v * 29 + flags + 100);
  if (flags & 1) { c.fillStyle = lg(c, 0, 0, 14, 0, [[0, 'rgba(0,0,0,.4)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, 14, TP); }
  if (flags & 2) { c.fillStyle = lg(c, TP, 0, TP - 14, 0, [[0, 'rgba(0,0,0,.4)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(TP - 14, 0, 14, TP); }
  c.restore(); return t;
}
function texPlat(th) {
  const [t, c] = cv(TP, 32); c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, 2, 12, TP - 4, 18, 9); c.fill();
  c.fillStyle = lg(c, 0, 2, 0, 24, [[0, shade(th.plat, 0.35)], [0.35, th.plat], [1, th.platDark]]); rr(c, 0, 0, TP, 24, 10); c.fill();
  c.save(); rr(c, 0, 0, TP, 24, 10); c.clip();
  if (th.key === 'train') { for (let x = 0; x < TP; x += 16) { c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(x + 15, 0, 1.6, 24); } c.strokeStyle = 'rgba(120,70,20,.4)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { const y = 5 + i * 3.2; c.beginPath(); c.moveTo(2, y); c.bezierCurveTo(20, y + 1.5, 40, y - 1.5, 62, y + 0.5); c.stroke(); } }
  else if (th.key === 's1') { c.fillStyle = 'rgba(255,255,255,.13)'; c.beginPath(); c.moveTo(0, 24); c.lineTo(18, 0); c.lineTo(30, 0); c.lineTo(12, 24); c.fill(); c.beginPath(); c.moveTo(34, 24); c.lineTo(52, 0); c.lineTo(60, 0); c.lineTo(42, 24); c.fill(); c.shadowColor = th.accent; c.shadowBlur = 5; c.strokeStyle = th.accent; c.globalAlpha = 0.85; c.lineWidth = 1.6; c.beginPath(); c.moveTo(6, 17); c.lineTo(TP - 6, 17); c.stroke(); }
  else if (th.key === 's2') { c.strokeStyle = 'rgba(120,80,40,.45)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 10); c.lineTo(TP, 10); c.stroke(); for (let x = 8; x < TP; x += 14) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x, 10); c.moveTo(x + 7, 10); c.lineTo(x + 7, 17); c.stroke(); } c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, 0, TP, 5); }
  else { c.fillStyle = 'rgba(30,140,70,.6)'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(4 + i * 9, 1 + ((i * 5) % 4), 4 + ((i * 3) % 3), 0, 6.3); c.fill(); } c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1.2; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(10 + i * 16, 15, 5, 3, 0, 0, 6.3); c.stroke(); } }
  c.restore(); c.save(); c.strokeStyle = 'rgba(0,0,0,.38)'; c.lineWidth = 2; rr(c, 0, 0, TP, 24, 10); c.stroke(); c.restore();
  c.fillStyle = 'rgba(255,255,255,.45)'; rr(c, 6, 3, TP - 12, 3.5, 2); c.fill();
  if (th.key !== 's1') { c.fillStyle = th.accent; c.globalAlpha = 0.85; rr(c, 10, 17, TP - 20, 3, 1.5); c.fill(); c.globalAlpha = 1; }
  [10, TP - 10].forEach((x) => { c.fillStyle = shade(th.platDark, -0.3); c.beginPath(); c.arc(x, 12, 2.4, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(x - 0.6, 11.3, 1, 0, 6.3); c.fill(); });
  return t;
}
function texSpike(th) {
  const [t, c] = cv(TP, TP); const col = th.night ? '#c9d6ff' : '#dfe6f4';
  for (let i = 0; i < 3; i++) { const x = 4 + i * 20; c.beginPath(); c.moveTo(x, TP - 6); c.lineTo(x + 9, 14 + (i === 1 ? -4 : 2)); c.lineTo(x + 18, TP - 6); c.closePath(); c.fillStyle = lg(c, x, 0, x + 18, 0, [[0, shade(col, 0.5)], [0.5, col], [1, shade(col, -0.45)]]); c.fill(); c.strokeStyle = 'rgba(10,6,30,.55)'; c.lineWidth = 2; c.stroke(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x + 7, 24); c.lineTo(x + 9, 18); c.lineTo(x + 10, 24); c.fill(); }
  c.fillStyle = 'rgba(255,60,90,.55)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(13 + i * 20, 14 + (i === 1 ? -4 : 2), 2.4, 0, 6.3); c.fill(); }
  c.fillStyle = shade(th.dirtB, -0.3); rr(c, 0, TP - 10, TP, 10, 4); c.fill(); return t;
}
function texBrick(th) {
  const [t, c] = cv(TP, TP); const r = rng(77 + th.key.length * 5); c.fillStyle = lg(c, 0, 0, 0, TP, [[0, shade(th.platDark, 0.15)], [1, shade(th.platDark, -0.4)]]); c.fillRect(0, 0, TP, TP);
  for (let row = 0; row < 4; row++) { const y = row * 16, off = row % 2 ? 16 : 0; for (let x = -off; x < TP; x += 32) { const vv = (r() - 0.5) * 0.16; c.fillStyle = lg(c, 0, y, 0, y + 14, [[0, shade(th.plat, 0.12 + vv)], [1, shade(th.platDark, vv)]]); rr(c, x + 1, y + 1, 30, 14, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x + 4, y + 2, 24, 2); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + 3, y + 12, 26, 2);
    if (r() < 0.3) { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); let px = x + 6 + r() * 18, py = y + 2; c.moveTo(px, py); for (let j = 0; j < 3; j++) { px += (r() - 0.5) * 5; py += 4; c.lineTo(px, py); } c.stroke(); }
    if (th.key === 's3' && r() < 0.5) { c.fillStyle = 'rgba(60,200,110,.55)'; c.beginPath(); c.arc(x + 4 + r() * 22, y + 2, 3.5, 0, 6.3); c.fill(); } } }
  return t;
}

/* ---------- decoração ---------- */
function decorExtras(th, add) {
  const sh = (x, cx, y, rx) => { x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, y, rx, 2, 0, 0, 6.3); x.fill(); };
  // placa com seta
  add(22, 28, (x) => { sh(x, 11, 27, 8); x.fillStyle = '#7a4a26'; x.fillRect(10, 8, 3, 19); x.fillStyle = lg(x, 0, 2, 0, 14, [[0, '#d99a58'], [1, '#9a6030']]); x.beginPath(); x.moveTo(1, 4); x.lineTo(16, 4); x.lineTo(21, 9); x.lineTo(16, 14); x.lineTo(1, 14); x.closePath(); x.fill(); x.strokeStyle = '#5a3418'; x.lineWidth = 1; x.stroke(); x.fillStyle = '#fff6d8'; x.beginPath(); x.moveTo(5, 9); x.lineTo(14, 9); x.lineTo(11.5, 6.5); x.moveTo(14, 9); x.lineTo(11.5, 11.5); x.strokeStyle = '#fff6d8'; x.lineWidth = 1.4; x.stroke(); }, 11);
  // poste com lanterna luminosa
  add(16, 38, (x) => { sh(x, 8, 37, 6); x.fillStyle = '#3a3d5e'; x.fillRect(7, 9, 2.4, 28); x.fillRect(3, 34, 10, 3); const g = x.createRadialGradient(8, 8, 1, 8, 8, 14); g.addColorStop(0, th.glow); g.addColorStop(1, 'rgba(0,0,0,0)'); x.globalAlpha = 0.55; x.fillStyle = g; x.fillRect(-6, -6, 28, 28); x.globalAlpha = 1; x.fillStyle = '#2a2d4a'; x.fillRect(4, 3, 8, 2); x.fillStyle = lg(x, 0, 4, 0, 13, [[0, '#fff'], [1, th.glow]]); x.fillRect(5, 5, 6, 8); x.fillStyle = '#2a2d4a'; x.fillRect(4, 13, 8, 2); }, 12);
  // caixote / barril
  add(16, 16, (x) => { sh(x, 8, 15, 7); x.fillStyle = lg(x, 0, 2, 0, 15, [[0, '#d9a45c'], [1, '#8f5a2a']]); x.fillRect(1.5, 2, 13, 13); x.strokeStyle = '#5a3418'; x.lineWidth = 1.2; x.strokeRect(1.5, 2, 13, 13); x.beginPath(); x.moveTo(1.5, 2); x.lineTo(14.5, 15); x.moveTo(14.5, 2); x.lineTo(1.5, 15); x.stroke(); x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(3, 3, 10, 1.6); }, 14);
  // arbusto com bagas
  add(26, 16, (x) => { sh(x, 13, 15, 11); [[7, 10, 7], [13, 8, 8], [19, 10, 7]].forEach(([a, b, rr2]) => { x.fillStyle = lg(x, 0, b - rr2, 0, b + rr2, [[0, shade(th.topA, 0.15)], [1, shade(th.topB, -0.25)]]); x.beginPath(); x.arc(a, b, rr2, 0, 6.3); x.fill(); }); [[9, 8], [16, 6], [20, 11]].forEach(([a, b], i) => { x.fillStyle = ['#ff5470', '#ffd23f', '#ff8ad6'][i]; x.beginPath(); x.arc(a, b, 1.5, 0, 6.3); x.fill(); }); }, 15);
}
function decorFor(th) {
  const out = []; const add = (w, h, fn, seed = 1) => { const [c, x] = cv(w * 4, h * 4); x.scale(4, 4); fn(x, rng(seed), w, h); out.push({ img: c, w, h }); };
  const blob = (x, cx, cy, rx, ry, a, b) => { x.fillStyle = lg(x, 0, cy - ry, 0, cy + ry, [[0, a], [1, b]]); x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 6.3); x.fill(); };
  const shadow = (x, cx, y, rx) => { x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, y, rx, 2, 0, 0, 6.3); x.fill(); };
  if (th.key === 'train') {
    add(30, 46, (x) => { shadow(x, 15, 45, 10); x.fillStyle = lg(x, 0, 0, 8, 0, [[0, '#a8683a'], [1, '#6a3c20']]); x.fillRect(13, 24, 5, 21); blob(x, 15, 20, 14, 14, '#7cf06a', '#2f9a44'); blob(x, 11, 14, 9, 8, '#a8ff8a', '#4fc055'); blob(x, 20, 22, 8, 7, '#5fd860', '#2b8c3c'); [[8, 22, '#ff5470'], [22, 16, '#ff5470'], [16, 8, '#ffd23f']].forEach(([a, b, c2]) => { x.fillStyle = c2; x.beginPath(); x.arc(a, b, 1.8, 0, 6.3); x.fill(); }); }, 1);
    add(24, 14, (x) => { shadow(x, 12, 13, 10); blob(x, 8, 9, 8, 6, '#8cf06a', '#2f9a44'); blob(x, 16, 8, 8, 7, '#a8ff8a', '#3fb050'); x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.ellipse(7, 6, 3, 1.5, 0, 0, 6.3); x.fill(); }, 2);
    add(20, 16, (x) => { for (let i = 0; i < 4; i++) { const bx = 3 + i * 4.5; x.strokeStyle = '#3fa83a'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(bx, 15); x.lineTo(bx + (i % 2 ? 1 : -1), 8); x.stroke(); x.fillStyle = ['#ff5470', '#ffd23f', '#ffffff', '#ff8ad6'][i]; x.beginPath(); x.arc(bx + (i % 2 ? 1 : -1), 7, 2.6, 0, 6.3); x.fill(); x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(bx + (i % 2 ? 1 : -1), 7, 0.9, 0, 6.3); x.fill(); } }, 3);
    add(16, 16, (x) => { shadow(x, 8, 15, 6); x.fillStyle = '#f4ead2'; x.fillRect(6, 7, 4, 8); blob(x, 8, 6, 8, 6, '#ff5a5a', '#c42b3c'); x.fillStyle = '#fff'; [[5, 5], [10, 4], [8, 8]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.1, 0, 6.3); x.fill(); }); }, 4);
    add(20, 14, (x) => { shadow(x, 10, 13, 8); x.fillStyle = lg(x, 0, 2, 0, 14, [[0, '#b7bfd0'], [1, '#6e7890']]); x.beginPath(); x.moveTo(1, 13); x.quadraticCurveTo(2, 3, 10, 3); x.quadraticCurveTo(18, 3, 19, 13); x.fill(); x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.ellipse(8, 6, 4, 1.6, 0, 0, 6.3); x.fill(); }, 5);
  } else if (th.key === 's1') {
    const crystal = (w, h, a, b, seed) => add(w, h, (x) => { shadow(x, w / 2, h - 1, w / 2.4); x.shadowColor = a; x.shadowBlur = 6; for (let i = 0; i < 3; i++) { const cx = w * (0.25 + 0.25 * i), hh = h * (0.6 + 0.4 * (i === 1 ? 1 : 0.55)), ww = w * 0.2; x.fillStyle = lg(x, cx - ww, 0, cx + ww, 0, [[0, shade(a, 0.5)], [0.5, a], [1, b]]); x.beginPath(); x.moveTo(cx - ww, h - 1); x.lineTo(cx - ww * 0.7, h - hh * 0.7); x.lineTo(cx, h - hh); x.lineTo(cx + ww * 0.7, h - hh * 0.7); x.lineTo(cx + ww, h - 1); x.closePath(); x.fill(); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(cx - ww * 0.3, h - hh * 0.65); x.lineTo(cx, h - hh + 1); x.lineTo(cx - ww * 0.05, h - hh * 0.5); x.fill(); } x.shadowBlur = 0; }, seed);
    crystal(24, 34, '#5fe8ff', '#2a62c8', 1); crystal(20, 24, '#ff6be0', '#8a2aa8', 2); crystal(26, 40, '#9a8cff', '#4a3ac8', 3); crystal(14, 16, '#5fe8ff', '#2a62c8', 4);
    add(22, 12, (x) => { shadow(x, 11, 11, 9); x.fillStyle = lg(x, 0, 2, 0, 12, [[0, '#6a68c0'], [1, '#2a2870']]); x.beginPath(); x.moveTo(1, 11); x.quadraticCurveTo(3, 2, 11, 2); x.quadraticCurveTo(19, 2, 21, 11); x.fill(); x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.ellipse(8, 5, 4, 1.4, 0, 0, 6.3); x.fill(); }, 5);
  } else if (th.key === 's2') {
    add(34, 26, (x) => { shadow(x, 17, 25, 15); x.fillStyle = '#f6efd8'; x.fillRect(2, 22, 30, 3.5); for (let k = 0; k < 5; k++) { const bx = 5 + k * 6; x.strokeStyle = '#f6efd8'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, 22); x.quadraticCurveTo(bx - 1, 8, bx + 2, 3 + Math.abs(k - 2)); x.stroke(); x.strokeStyle = '#cdbf9a'; x.lineWidth = 1; x.stroke(); } }, 1);
    add(30, 16, (x) => { shadow(x, 15, 15, 13); x.fillStyle = '#f6efd8'; x.strokeStyle = '#8a7a58'; x.lineWidth = 1;[[4, 8], [26, 8]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3.2, 0, 6.3); x.fill(); x.stroke(); }); x.fillRect(5, 6.5, 20, 3.6); x.strokeRect(5, 6.5, 20, 3.6); x.beginPath(); x.arc(15, 12, 5, 0, 6.3); x.fill(); x.stroke(); x.fillStyle = '#2a1a24'; x.fillRect(12.4, 11, 1.8, 2.4); x.fillRect(15.6, 11, 1.8, 2.4); }, 2);
    add(16, 32, (x) => { shadow(x, 8, 31, 7); x.fillStyle = lg(x, 4, 0, 12, 0, [[0, '#59e08c'], [1, '#1f8a52']]); rr(x, 5, 3, 6, 28, 3); x.fill(); rr(x, 0.5, 11, 4.5, 11, 2.2); x.fill(); rr(x, 11, 8, 4.5, 11, 2.2); x.fill(); x.fillStyle = '#ffb7c5'; x.beginPath(); x.arc(8, 3, 2.2, 0, 6.3); x.fill(); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(6, 6, 1.2, 18); }, 3);
    add(20, 36, (x) => { shadow(x, 10, 35, 8); x.fillStyle = lg(x, 3, 0, 17, 0, [[0, '#fff0c8'], [0.6, '#e8d2a0'], [1, '#a8905e']]); x.fillRect(4, 6, 12, 29); rr(x, 1, 1, 18, 7, 2); x.fill(); x.strokeStyle = 'rgba(120,90,50,.5)'; x.lineWidth = 1; for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(4, 12 + k * 5); x.lineTo(16, 12 + k * 5); x.stroke(); } }, 4);
    add(22, 14, (x) => { shadow(x, 11, 13, 9); x.fillStyle = lg(x, 0, 2, 0, 14, [[0, '#d9c49a'], [1, '#8a7650']]); x.beginPath(); x.moveTo(1, 13); x.quadraticCurveTo(2, 3, 11, 3); x.quadraticCurveTo(20, 3, 21, 13); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(9, 6, 4, 1.4, 0, 0, 6.3); x.fill(); }, 5);
  } else {
    const shroom = (w, h, a, b, seed) => add(w, h, (x) => { shadow(x, w / 2, h - 1, w / 2.3); x.fillStyle = lg(x, w * 0.4, 0, w * 0.6, 0, [[0, '#d6f0e0'], [1, '#7fa890']]); rr(x, w * 0.4, h * 0.45, w * 0.2, h * 0.55, w * 0.08); x.fill(); x.shadowColor = a; x.shadowBlur = 8; x.fillStyle = lg(x, 0, 0, 0, h * 0.55, [[0, shade(a, 0.4)], [0.6, a], [1, b]]); x.beginPath(); x.ellipse(w / 2, h * 0.42, w * 0.5, h * 0.4, 0, Math.PI, 0); x.lineTo(w, h * 0.46); x.quadraticCurveTo(w / 2, h * 0.6, 0, h * 0.46); x.closePath(); x.fill(); x.shadowBlur = 0; x.fillStyle = 'rgba(255,255,255,.75)';[[0.3, 0.25, 0.07], [0.6, 0.18, 0.06], [0.72, 0.33, 0.05], [0.45, 0.35, 0.045]].forEach(([a2, b2, s]) => { x.beginPath(); x.arc(w * a2, h * b2, w * s, 0, 6.3); x.fill(); }); }, seed);
    shroom(24, 26, '#ff4fd8', '#8a1f9a', 1); shroom(14, 15, '#7df9ff', '#2a62c8', 2); shroom(32, 34, '#b46bff', '#5a2aa8', 3); shroom(10, 11, '#ff4fd8', '#8a1f9a', 4);
    add(24, 20, (x) => { shadow(x, 12, 19, 10); for (let k = 0; k < 7; k++) { x.strokeStyle = k % 2 ? '#2fb36a' : '#47d88a'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(12, 19); x.quadraticCurveTo(12 + (k - 3) * 3, 8, 12 + (k - 3) * 4.5, 3 + Math.abs(k - 3)); x.stroke(); } x.fillStyle = '#7dffa3'; x.shadowColor = '#7dffa3'; x.shadowBlur = 6;[[4, 7], [20, 6], [12, 3]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.3, 0, 6.3); x.fill(); }); }, 5);
  }
  decorExtras(th, add);
  return out;
}

/* ---------- fundos (parallax) ---------- */
const BW = 640, BH = 270;       // dimensões lógicas de cada camada que se repete
function ridge(c, base, amps, seed, colTop, colBot, W = BW) { const r = rng(seed); const w = amps.map(([k, a]) => ({ k, a, p: r() * 6.28 })); c.beginPath(); c.moveTo(0, BH); for (let x = 0; x <= W; x += 4) { let y = base; for (const v of w) y += Math.sin((x / W) * 6.2832 * v.k + v.p) * v.a; c.lineTo(x, y); } c.lineTo(W, BH); c.closePath(); c.fillStyle = lg(c, 0, base - 40, 0, BH, [[0, colTop], [1, colBot]]); c.fill(); }
function buildBg(th) {
  const S = 2; const mkL = () => { const [c, x] = cv(BW * S, BH * S); x.scale(S, S); return [c, x]; };
  const [far, fx] = mkL(), [mid, mx] = mkL(), [near, nx] = mkL(), [mist, tx] = mkL(); const key = th.key; const r = rng(key.charCodeAt(1) * 977 + 5);
  const W3 = (fn) => [-BW, 0, BW].forEach(fn);                       // desenha também nas bordas: emenda invisível na horizontal
  const haze = (c, y, h, col, a) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col); c.globalAlpha = a; c.fillStyle = g; c.fillRect(0, y, BW, h); c.globalAlpha = 1; };
  const fog = (c, y, h, col, a, seed, n = 6) => { const q = rng(seed); c.globalAlpha = a; for (let i = 0; i < n; i++) { const cx = (i / n) * BW + q() * 50, cy = y + q() * h * 0.5, rx = 80 + q() * 80, ry = h * (0.45 + q() * 0.4); W3((o) => { c.save(); c.translate(cx + o, cy); c.scale(1, ry / rx); const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-rx, -rx, rx * 2, rx * 2); c.restore(); }); } c.globalAlpha = 1; };
  const glowLine = (c, pts, col, w = 1.2, blur = 6) => { c.save(); c.shadowColor = col; c.shadowBlur = blur; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); pts.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.stroke(); c.restore(); };
  if (key === 'train') {
    W3((o) => { for (let i = 0; i < 4; i++) { const x = 70 + i * 165 + o, h = 78 + (i % 2) * 24, b = 150; const g = fx.createLinearGradient(x - 80, 0, x + 80, 0); g.addColorStop(0, '#9ec3e8'); g.addColorStop(0.55, '#7aa5d4'); g.addColorStop(1, '#5b84b8'); fx.fillStyle = g; fx.beginPath(); fx.moveTo(x - 85, b); fx.lineTo(x - 8, b - h); fx.lineTo(x + 6, b - h + 6); fx.lineTo(x + 88, b); fx.closePath(); fx.fill(); fx.fillStyle = '#f4f9ff'; fx.beginPath(); fx.moveTo(x - 24, b - h + 28); fx.lineTo(x - 8, b - h); fx.lineTo(x + 6, b - h + 6); fx.lineTo(x + 22, b - h + 30); fx.lineTo(x + 12, b - h + 24); fx.lineTo(x + 2, b - h + 34); fx.lineTo(x - 8, b - h + 24); fx.closePath(); fx.fill(); } });
    ridge(fx, 135, [[2, 18], [5, 8], [11, 3]], 11, shade(th.hill[0], 0.15), th.hill[0]);
    // ilha flutuante do Instituto Aurora
    const ix = 400, iy = 58; fx.fillStyle = 'rgba(0,0,0,.12)'; fx.beginPath(); fx.ellipse(ix, iy + 34, 38, 5, 0, 0, 6.3); fx.fill(); const ig = fx.createLinearGradient(0, iy, 0, iy + 28); ig.addColorStop(0, '#9a6a45'); ig.addColorStop(1, '#5a3a24'); fx.fillStyle = ig; fx.beginPath(); fx.moveTo(ix - 36, iy + 8); fx.quadraticCurveTo(ix, iy + 38, ix + 36, iy + 8); fx.closePath(); fx.fill(); fx.fillStyle = '#6fd65a'; fx.beginPath(); fx.ellipse(ix, iy + 8, 36, 7, 0, 0, 6.3); fx.fill(); fx.fillStyle = '#eef3ff'; fx.fillRect(ix - 7, iy - 18, 14, 26); fx.fillStyle = '#ff5470'; fx.beginPath(); fx.moveTo(ix - 10, iy - 18); fx.lineTo(ix, iy - 32); fx.lineTo(ix + 10, iy - 18); fx.fill(); fx.fillStyle = '#7fd0ff'; fx.fillRect(ix - 2, iy - 12, 4, 6); fx.fillStyle = '#ffd23f'; fx.beginPath(); fx.arc(ix, iy - 33, 2.5, 0, 6.3); fx.fill();
    haze(fx, 90, 70, 'rgba(255,255,255,.55)', 0.55);
    ridge(mx, 168, [[3, 13], [7, 6], [13, 3]], 12, '#6fd08e', '#3aa46b');
    W3((o) => { for (let k = 0; k < 9; k++) { const x = ((k * 71 + 20) % BW) + o, h = 20 + (k * 13) % 18; mx.fillStyle = 'rgba(0,0,0,.18)'; mx.fillRect(x - 1.5, 168, 3, 14); const g = mx.createLinearGradient(0, 168 - h * 1.4, 0, 168); g.addColorStop(0, '#7be39a'); g.addColorStop(1, '#2f9a5a'); mx.fillStyle = g; mx.beginPath(); mx.ellipse(x, 168 - h * 0.55, 11, h * 0.62, 0, 0, 6.3); mx.fill(); mx.fillStyle = 'rgba(255,255,255,.22)'; mx.beginPath(); mx.ellipse(x - 3, 168 - h * 0.8, 4, h * 0.25, -0.4, 0, 6.3); mx.fill(); }
      for (const [hx, hy] of [[130, 178], [470, 176]]) { const x = hx + o; mx.fillStyle = '#fff6e0'; mx.fillRect(x - 8, hy - 10, 16, 10); mx.fillStyle = '#e8506a'; mx.beginPath(); mx.moveTo(x - 10, hy - 10); mx.lineTo(x, hy - 19); mx.lineTo(x + 10, hy - 10); mx.fill(); mx.fillStyle = '#7fd0ff'; mx.fillRect(x - 2, hy - 7, 4, 4); } });
    ridge(nx, 214, [[4, 7], [9, 3]], 13, '#2f8a58', '#1d5d3c');
    W3((o) => { for (let k = 0; k < 16; k++) { const x = ((k * 41 + 9) % BW) + o; nx.fillStyle = '#134a2e'; for (let b = 0; b < 4; b++) { nx.beginPath(); nx.moveTo(x + b * 3, 270); nx.quadraticCurveTo(x + b * 3 + (b % 2 ? 5 : -5), 244, x + b * 3 + (b % 2 ? 2 : -2), 226 - b * 3); nx.lineTo(x + b * 3 + 3, 270); nx.fill(); } if (k % 3 === 0) { nx.fillStyle = ['#ff6b8b', '#ffd23f', '#ffffff'][k % 3 + (k % 2)]; nx.beginPath(); nx.arc(x + 4, 236, 2.2, 0, 6.3); nx.fill(); } } });
    fog(tx, 205, 60, 'rgba(255,255,255,.9)', 0.34, 7);
  } else if (key === 's1') {
    ridge(fx, 140, [[3, 12], [8, 5]], 21, shade(th.hill[0], 0.25), th.hill[0]);
    W3((o) => { for (let k = 0; k < 11; k++) { const x = ((k * 59 + 12) % BW) + o, h = 70 + (k * 17) % 70, col = ['#ff6be0', '#5fe8ff', '#9a8cff'][k % 3], w = 9 + (k % 3) * 3, b = 175;
      fx.save(); fx.shadowColor = col; fx.shadowBlur = 18; fx.globalAlpha = 0.78; fx.fillStyle = shade(col, -0.25); fx.beginPath(); fx.moveTo(x - w, b); fx.lineTo(x - w * 0.6, b - h * 0.7); fx.lineTo(x, b - h); fx.lineTo(x, b); fx.closePath(); fx.fill(); fx.fillStyle = shade(col, -0.55); fx.beginPath(); fx.moveTo(x, b); fx.lineTo(x, b - h); fx.lineTo(x + w * 0.6, b - h * 0.7); fx.lineTo(x + w, b); fx.closePath(); fx.fill(); fx.restore();
      fx.fillStyle = 'rgba(255,255,255,.35)'; fx.beginPath(); fx.moveTo(x - w * 0.4, b - h * 0.6); fx.lineTo(x - 1, b - h + 2); fx.lineTo(x - 1, b - h * 0.4); fx.fill(); }
      for (let k = 0; k < 8; k++) { const x = ((k * 83 + 30) % BW) + o, y = 40 + (k * 29) % 60; fx.save(); fx.shadowColor = '#9a8cff'; fx.shadowBlur = 8; fx.fillStyle = 'rgba(190,170,255,.7)'; fx.beginPath(); fx.moveTo(x, y - 7); fx.lineTo(x + 3.5, y); fx.lineTo(x, y + 7); fx.lineTo(x - 3.5, y); fx.fill(); fx.restore(); } });
    haze(fx, 110, 90, 'rgba(110,80,255,.5)', 0.6);
    ridge(mx, 175, [[3, 11], [9, 4]], 22, shade(th.hill[1], 0.12), th.hill[1]);
    W3((o) => { for (let k = 0; k < 20; k++) { const x = ((k * 33 + 5) % BW) + o, h = 14 + (k * 19) % 52; const g = mx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, shade(th.hill[1], -0.45)); g.addColorStop(1, shade(th.hill[1], 0.05)); mx.fillStyle = g; mx.beginPath(); mx.moveTo(x - 7, 0); mx.lineTo(x, h); mx.lineTo(x + 7, 0); mx.fill(); if (k % 4 === 0) { mx.save(); mx.shadowColor = '#7df9ff'; mx.shadowBlur = 8; mx.fillStyle = '#bff6ff'; mx.beginPath(); mx.arc(x, h, 1.6, 0, 6.3); mx.fill(); mx.restore(); } }
      for (let k = 0; k < 5; k++) { const x0 = ((k * 131 + 20) % BW) + o; glowLine(mx, [[x0, 200], [x0 + 18, 190], [x0 + 30, 196], [x0 + 52, 184]], k % 2 ? '#5fe8ff' : '#ff6be0', 1.2, 7); } });
    ridge(nx, 222, [[5, 6], [11, 3]], 23, shade(th.hill[2], 0.2), shade(th.hill[2], -0.3));
    W3((o) => { for (let k = 0; k < 9; k++) { const x = ((k * 67 + 10) % BW) + o, h = 20 + (k * 11) % 30; nx.fillStyle = '#0a0730'; nx.beginPath(); nx.moveTo(x - 7, 270); nx.lineTo(x - 2, 262 - h); nx.lineTo(x + 6, 270); nx.fill(); nx.save(); nx.shadowColor = '#5fe8ff'; nx.shadowBlur = 6; nx.strokeStyle = 'rgba(95,232,255,.8)'; nx.lineWidth = 1; nx.beginPath(); nx.moveTo(x - 2, 262 - h); nx.lineTo(x + 6, 270); nx.stroke(); nx.restore(); } });
    fog(tx, 190, 80, 'rgba(120,90,255,.95)', 0.3, 8); W3((o) => { for (let k = 0; k < 3; k++) { const x = k * 220 + 60 + o; const g = tx.createLinearGradient(x, 0, x + 70, 230); g.addColorStop(0, 'rgba(160,190,255,.32)'); g.addColorStop(1, 'rgba(160,190,255,0)'); tx.fillStyle = g; tx.beginPath(); tx.moveTo(x, 0); tx.lineTo(x + 28, 0); tx.lineTo(x + 130, 230); tx.lineTo(x + 50, 230); tx.fill(); } });
  } else if (key === 's2') {
    W3((o) => { for (let k = 0; k < 6; k++) { const x = ((k * 109 + 18) % BW) + o, w = 52 + (k % 3) * 18, h = 40 + (k % 4) * 12, b = 168; const g = fx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, shade(th.hill[0], 0.1)); g.addColorStop(1, shade(th.hill[0], -0.2)); fx.fillStyle = g; fx.fillRect(x, b - h, w, h + 30); fx.fillStyle = 'rgba(255,255,255,.2)'; fx.fillRect(x, b - h, w, 3); for (let j = 10; j < h; j += 9) { fx.fillStyle = 'rgba(0,0,0,.12)'; fx.fillRect(x, b - h + j, w, 1.4); } }
      for (let k = 0; k < 3; k++) { const x = 70 + k * 205 + o; fx.strokeStyle = 'rgba(250,240,220,.55)'; fx.lineWidth = 4.5; fx.lineCap = 'round'; for (let j = 0; j < 4; j++) { fx.beginPath(); fx.moveTo(x + j * 11, 176); fx.quadraticCurveTo(x + j * 11 - 4, 120 - j * 3, x + j * 11 + 16, 112 - Math.abs(j - 1.5) * 4); fx.stroke(); } }
      for (let k = 0; k < 3; k++) { const x = 130 + k * 190 + o, y = 52 + (k * 23) % 40; fx.strokeStyle = 'rgba(70,30,60,.6)'; fx.lineWidth = 1.5; fx.beginPath(); fx.moveTo(x - 7, y - 2); fx.quadraticCurveTo(x - 3, y - 6, x, y); fx.quadraticCurveTo(x + 3, y - 6, x + 7, y - 2); fx.stroke(); } });
    haze(fx, 120, 60, 'rgba(255,210,150,.6)', 0.7);
    ridge(mx, 178, [[3, 9], [8, 4]], 32, '#c9607a', th.hill[1]);
    W3((o) => { for (let k = 0; k < 5; k++) { const x = ((k * 131 + 25) % BW) + o; mx.fillStyle = '#7d3b66'; mx.fillRect(x, 150, 9, 40); mx.fillRect(x + 46, 150, 9, 40); mx.beginPath(); mx.moveTo(x, 152); mx.arc(x + 27, 152, 28, Math.PI, 0); mx.lineTo(x + 55, 150); mx.lineTo(x + 46, 150); mx.arc(x + 27, 152, 19, 0, Math.PI, true); mx.closePath(); mx.fill(); mx.fillStyle = 'rgba(255,255,255,.14)'; mx.fillRect(x, 150, 3, 40); }
      for (let k = 0; k < 6; k++) { const x = ((k * 97 + 60) % BW) + o; mx.fillStyle = '#8a4170'; mx.fillRect(x, 175 - (k % 3) * 8, 7, 24 + (k % 3) * 8); mx.fillStyle = '#a2557f'; mx.fillRect(x - 2, 173 - (k % 3) * 8, 11, 3); } });
    ridge(nx, 222, [[3, 5], [8, 3]], 33, shade(th.hill[2], 0.1), shade(th.hill[2], -0.35));
    W3((o) => { for (let k = 0; k < 7; k++) { const x = ((k * 83 + 14) % BW) + o; nx.fillStyle = '#3a1830'; nx.fillRect(x, 232, 6, 40); nx.fillRect(x - 7, 244, 7, 4); nx.fillRect(x - 7, 238, 4, 10); nx.fillRect(x + 6, 248, 7, 4); nx.fillRect(x + 9, 240, 4, 10); nx.fillStyle = 'rgba(255,150,80,.55)'; nx.fillRect(x + 4, 232, 2, 40); } });
    fog(tx, 200, 70, 'rgba(255,200,140,.95)', 0.3, 9);
  } else {
    W3((o) => { for (let k = 0; k < 13; k++) { const x = ((k * 51 + 9) % BW) + o, h = 100 + (k * 19) % 70; const g = fx.createLinearGradient(0, 168 - h, 0, 168); g.addColorStop(0, shade(th.hill[0], -0.4)); g.addColorStop(1, shade(th.hill[0], 0.05)); fx.fillStyle = g; fx.fillRect(x, 168 - h, 7, h); fx.save(); fx.shadowColor = '#3dff9a'; fx.shadowBlur = 16; fx.fillStyle = shade(th.hill[0], 0.18); fx.beginPath(); fx.ellipse(x + 3.5, 168 - h, 20, 12, 0, 0, 6.3); fx.fill(); fx.restore(); } });
    haze(fx, 100, 80, 'rgba(61,255,154,.4)', 0.6);
    ridge(mx, 176, [[4, 8], [10, 4]], 42, shade(th.hill[1], 0.15), th.hill[1]);
    W3((o) => { for (let k = 0; k < 8; k++) { const x = ((k * 79 + 22) % BW) + o, cy = 150 + (k * 17) % 22, rw = 20 + (k % 3) * 6; mx.fillStyle = shade(th.hill[1], -0.25); mx.fillRect(x - 3, cy, 6, 40); mx.save(); mx.shadowColor = k % 2 ? '#ff4fd8' : '#3dff9a'; mx.shadowBlur = 14; const g = mx.createLinearGradient(0, cy - 16, 0, cy + 6); g.addColorStop(0, k % 2 ? '#ff8aee' : '#7dffa3'); g.addColorStop(1, k % 2 ? '#8a1f9a' : '#1f8a5a'); mx.fillStyle = g; mx.beginPath(); mx.ellipse(x, cy, rw, 16, 0, Math.PI, 0); mx.lineTo(x + rw, cy + 4); mx.quadraticCurveTo(x, cy + 10, x - rw, cy + 4); mx.fill(); mx.restore(); mx.fillStyle = 'rgba(255,255,255,.65)'; for (const [dx, dy] of [[-8, -8], [3, -11], [10, -5]]) { mx.beginPath(); mx.arc(x + dx, cy + dy, 2, 0, 6.3); mx.fill(); } } });
    ridge(nx, 224, [[5, 5], [11, 3]], 43, shade(th.hill[2], 0.1), shade(th.hill[2], -0.35));
    W3((o) => { for (let k = 0; k < 8; k++) { const x = ((k * 71 + 6) % BW) + o; nx.fillStyle = '#031418'; nx.fillRect(x, 0, 9, 270); nx.fillStyle = 'rgba(61,255,154,.22)'; nx.fillRect(x + 7, 0, 2, 270); for (let j = 0; j < 3; j++) { glowLine(nx, [[x + 4, 20 + j * 12], [x + 10 + j * 3, 52 + j * 14], [x + 6, 92 + j * 10]], '#3dff9a', 1, 4); } } });
    fog(tx, 190, 80, 'rgba(61,255,154,.95)', 0.26, 10);
  }
  const stars = []; if (th.night) for (let k = 0; k < 70; k++) stars.push({ x: r() * 640, y: r() * 150, s: r() * 1.4 + 0.4, t: r() * 6.28 });
  void haze; return { far, mid, near, mist, W: BW, H: BH, S, stars };
}

function buildFg(th) {
  const S = 2, H = 34; const [c, x] = cv(BW * S, H * S); x.scale(S, S); const r = rng(th.key.charCodeAt(1) * 31 + 9);
  const col = th.key === 'train' ? '#1d5a2e' : shade(th.abyss, -0.1);
  [-BW, 0, BW].forEach((o) => {
    for (let i = 0; i < 16; i++) {
      const bx = ((i * 41 + 13) % BW) + o, h = 14 + r() * 18;
      if (th.key === 's1') { x.fillStyle = col; x.beginPath(); x.moveTo(bx - 5, H); x.lineTo(bx - 2, H - h); x.lineTo(bx + 2, H - h * 0.8); x.lineTo(bx + 6, H); x.fill(); x.strokeStyle = th.accent; x.globalAlpha = 0.6; x.lineWidth = 1; x.beginPath(); x.moveTo(bx - 2, H - h); x.lineTo(bx - 5, H); x.stroke(); x.globalAlpha = 1; }
      else if (th.key === 's2') { x.strokeStyle = col; x.lineWidth = 3.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, H); x.quadraticCurveTo(bx - 4, H - h * 0.6, bx + 5, H - h); x.stroke(); }
      else if (th.key === 's3') { x.strokeStyle = col; x.lineWidth = 2.4; x.lineCap = 'round'; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(bx, H); x.quadraticCurveTo(bx + k * 3, H - h * 0.7, bx + k * 6, H - h * (0.6 - Math.abs(k) * 0.08)); x.stroke(); } }
      else { x.fillStyle = col; for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(bx + k * 3 - 2, H); x.quadraticCurveTo(bx + k * 3, H - h, bx + k * 6 + 1, H - h * 0.7 - 2); x.quadraticCurveTo(bx + k * 3 + 2, H - h * 0.4, bx + k * 3 + 2, H); x.fill(); } }
    }
  });
  return c;
}

function buildFgTop(th) {   // detalhes do TETO em primeiro plano: estalactites, folhagem, raízes (dá clima de caverna/mata)
  const S = 2, H = 46; const [c, x] = cv(BW * S, H * S); x.scale(S, S); const r = rng(th.key.charCodeAt(1) * 53 + 3); const key = th.key;
  [-BW, 0, BW].forEach((o) => { for (let i = 0; i < 17; i++) { const bx = ((i * 38 + 9) % BW) + o, len = 8 + r() * 30;
    if (key === 's1') { const g = x.createLinearGradient(0, 0, 0, len); g.addColorStop(0, '#dff6ff'); g.addColorStop(1, '#5aa8e8'); x.fillStyle = g; x.strokeStyle = 'rgba(10,8,50,.85)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(bx - 6, -1); x.lineTo(bx + 1, len); x.lineTo(bx + 7, -1); x.closePath(); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(bx - 2, 1, 1.4, len * 0.5); }
    else if (key === 's2') { x.fillStyle = '#7a4a34'; x.strokeStyle = 'rgba(30,10,10,.85)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(bx - 7, -1); x.lineTo(bx - 1, len * 0.9); x.lineTo(bx + 8, -1); x.closePath(); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,220,170,.25)'; x.fillRect(bx - 3, 1, 1.5, len * 0.4); }
    else if (key === 's3') { x.strokeStyle = '#0a3a2e'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, -1); x.bezierCurveTo(bx + 3, len * 0.4, bx - 3, len * 0.7, bx + 1, len); x.stroke(); x.fillStyle = th.glow; x.shadowColor = th.glow; x.shadowBlur = 5; x.beginPath(); x.arc(bx + 1, len, 1.6, 0, 6.3); x.fill(); x.shadowBlur = 0; }
    else { x.fillStyle = '#1d5a2e'; x.strokeStyle = 'rgba(6,30,12,.85)'; x.lineWidth = 1.1; x.beginPath(); x.ellipse(bx, len * 0.35, 9, len * 0.45 + 3, 0, 0, 6.3); x.fill(); x.stroke(); x.fillStyle = 'rgba(180,255,150,.25)'; x.beginPath(); x.ellipse(bx - 2, len * 0.2, 3.5, 2, 0, 0, 6.3); x.fill(); } } });
  return c;
}

export function buildWorld(key) {
  const th = THEMES[key]; const tex = { top: [], fill: [] };
  for (let f = 0; f < 4; f++) { tex.top[f] = [texTop(th, f, 0), texTop(th, f, 1)]; tex.fill[f] = [texFill(th, f, 0), texFill(th, f, 1)]; }
  tex.plat = texPlat(th); tex.spike = texSpike(th); tex.brick = texBrick(th);
  const bg = buildBg(th); const ov = (typeof window !== 'undefined' && window.__BGOVER && window.__BGOVER[key]) || null; if (ov) for (const k of Object.keys(ov)) bg[k] = ov[k];
  return { th, tex, decor: decorFor(th), bg, fg: buildFg(th), fgt: buildFgTop(th) };
}
