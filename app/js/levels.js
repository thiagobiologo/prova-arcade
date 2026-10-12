/* Gerador de fases por trechos (chunks) + validador de completabilidade. © Thiago Silva.
 * Ritmo: trechos de plataforma (tensão) → respiro → estação de pergunta (arena segura, sem inimigos).
 * Fase termina em arena de chefe. Seeds fixas ⇒ mesma fase para todos os alunos (equidade).
 * Alvo de dificuldade: público de 3º ano do Ensino Médio (17–18 anos), com apoio adaptativo no motor. */
import { T, rng, TS } from './art.js';

export const ROWS = 24;
const GR = 17;
const MAXC = 460;
export const DIFF = { train: 0, s1: 1, s2: 2, s3: 3 };

export function tileAt(L, c, r) {
  if (r < 0) return T.EMPTY;
  if (c < 0) return T.WALL;
  if (c >= L.cols) return T.WALL;
  if (r >= ROWS) return T.EMPTY;   // abaixo do mapa não há chão: quem cai no buraco morre
  return L.tiles[r * L.stride + c];
}

export function buildLevel(key, seed, nStations, quick = false, room = false) {
  const d = DIFF[key]; const r = rng(seed * 2654435761 >>> 0); const rnd = (a, b) => a + ((r() * (b - a + 1)) | 0); const pick = (a) => a[(r() * a.length) | 0];
  const tiles = new Uint8Array(MAXC * ROWS); const top = new Int16Array(MAXC).fill(-1);
  const L = { key, seed, rows: ROWS, stride: MAXC, tiles, cols: 0, coins: [], stars: [], enemies: [], movers: [], crumbles: [], blinks: [], saws: [], crushers: [], turrets: [], chests: [], winds: [], fgprops: [], springs: [], hearts: [], secretDoor: null, exitDoor: null, checkpoints: [], stations: [], decor: [], spawn: null, goal: null, boss: null };
  let c = 0, g = GR;
  const set = (cc, rr, t) => { if (cc >= 0 && cc < MAXC && rr >= 0 && rr < ROWS) tiles[rr * MAXC + cc] = t; };
  const column = (cc, gr, tt = T.TOP) => { set(cc, gr, tt); for (let rr = gr + 1; rr < ROWS; rr++) set(cc, rr, T.FILL); top[cc] = gr; };
  const flat = (n) => { for (let i = 0; i < n; i++) column(c + i, g); c += n; };
  const pit = (n) => { c += n; };
  const coin = (cc, rr) => L.coins.push({ x: cc * TS + 3, y: rr * TS + 3 });
  const coinLine = (cc, rr, n) => { for (let i = 0; i < n; i++) coin(cc + i, rr); };
  const coinArc = (cc, n, rr) => { for (let i = 0; i < n; i++) coin(cc + i, rr - (i === 0 || i === n - 1 ? 0 : 1)); };
  const plat = (cc, rr, len) => { for (let i = 0; i < len; i++) set(cc + i, rr, T.PLAT); };
  const blob = (cc0, cc1, rowG, hop, spiked) => L.enemies.push({ type: 'blob', x: ((cc0 + cc1) >> 1) * TS, y: (rowG - 1) * TS - 1, minX: cc0 * TS, maxX: cc1 * TS, hop: !!hop, spiked: !!spiked, aggro: d >= 1 });
  const shooter = (cc, rowG) => L.enemies.push({ type: 'blob', x: cc * TS, y: (rowG - 1) * TS - 1, minX: cc * TS, maxX: cc * TS, shooter: true });
  const bat = (cc, rr, range, o) => L.enemies.push({ type: 'bat', x: cc * TS, y: rr * TS, minX: (cc - range) * TS, maxX: (cc + range) * TS, baseY: rr * TS, aggro: d >= 1, ...(o || {}) });
  let lastCp = 0; const cp = () => { L.checkpoints.push({ x: (c - 1) * TS, y: (g - 2) * TS - 4 }); lastCp = c; };
  const star = (cc, rr) => L.stars.push({ x: cc * TS + 2, y: rr * TS + 1 });
  const chest = (cc, prow) => L.chests.push({ x: cc * TS, y: prow * TS - 12 });
  const gem = (cc, rr) => L.coins.push({ x: cc * TS + 3, y: rr * TS + 3, gem: true });

  /* ---- trechos ---- */
  const chunks = {
    run() { const n = rnd(6, 9); flat(n); coinLine(c - n + 1, g - 2, Math.min(5, n - 2)); },
    gap() { const w = rnd(2, 3); flat(2); const c0 = c; pit(w); flat(3); coinArc(c0, w, g - 3); },
    stairsUp() { const k = rnd(2, 3); flat(2); for (let i = 0; i < k; i++) { if (g <= 12) break; g -= 1; flat(3); } coinLine(c - 3, g - 2, 3); },
    stairsDown() { const k = rnd(2, 3); flat(2); for (let i = 0; i < k; i++) { if (g >= 19) break; g += 1; flat(3); } },
    float() { const n = rnd(3, 4 + (d >= 3 ? 1 : 0)); flat(2); for (let i = 0; i < n; i++) { pit(2); const pr = g - 1 - (i % 2); plat(c, pr, 2); coinLine(c, pr - 2, 2); if (i === n - 1) gem(c, pr - 3); pit(2); } flat(3); },
    enemy() { const n = rnd(10, 13); const c0 = c; flat(n); blob(c0 + 2, c0 + n - 2, g); if (d >= 1) blob(c0 + 6, c0 + n - 2, g, d >= 2); if (d >= 2) blob(c0 + 2, c0 + 7, g, true); if (d >= 2) blob(c0 + 4, c0 + 9, g, false, true); coinLine(c0 + 3, g - 3, 3); },
    spikes() { const w = rnd(2, 3); flat(3); const c0 = c; for (let i = 0; i < w; i++) { column(c + i, g); set(c + i, g - 1, T.SPIKE); } c += w; flat(2); if (d >= 2) { const c1 = c; for (let i = 0; i < 2; i++) { column(c + i, g); set(c + i, g - 1, T.SPIKE); } c += 2; flat(3); coinArc(c1, 2, g - 3); } else flat(1); coinArc(c0, w, g - 3); },
    tworoute() { const c0 = c; flat(16); plat(c0 + 2, g - 2, 2); plat(c0 + 6, g - 4, 5); coinLine(c0 + 6, g - 5, 5); blob(c0 + 5, c0 + 14, g); if (d >= 2) bat(c0 + 8, g - 7, 3); },
    mover() { flat(2); const c0 = c; pit(9); flat(3); L.movers.push({ x: c0 * TS, y: g * TS, w: 3 * TS, h: 8, range: 5 * TS, speed: 0.6 + d * 0.12, t: r() * 6 }); coinLine(c0 + 2, g - 3, 5); if (d >= 3) bat(c0 + 5, g - 4, 3); },
    bats() { const n = rnd(10, 12); const c0 = c; flat(n); bat(c0 + 4, g - 4, 3); bat(c0 + 8, g - 5, 3, { shoot: d >= 2 }); if (d >= 2) bat(c0 + 6, g - 3, 2); coinLine(c0 + 2, g - 2, 3); },
    pitSpikes() { flat(2); const c0 = c; pit(3); flat(3); for (let i = 0; i < 2; i++) { column(c + i, g); set(c + i, g - 1, T.SPIKE); } c += 2; flat(3); coinArc(c0, 3, g - 3); },
    drop() { flat(3); g = Math.min(19, g + rnd(2, 3)); flat(5); },
    gauntlet() { const c0 = c; flat(18); blob(c0 + 2, c0 + 6, g); blob(c0 + 8, c0 + 12, g); blob(c0 + 13, c0 + 16, g, d >= 2, d >= 3); bat(c0 + 9, g - 4, 4); coinLine(c0 + 3, g - 3, 4); },
    crumble() { const k = rnd(3, 4); flat(2); for (let i = 0; i < k; i++) { pit(2); const pr = g - 1 - (i % 2); L.crumbles.push({ x: c * TS, y: pr * TS, w: 2 * TS }); coinLine(c, pr - 2, 2); pit(2); } flat(3); },
    climb() { flat(3); const c0 = c; flat(14); plat(c0 + 1, g - 2, 3); plat(c0 + 5, g - 4, 3); plat(c0 + 9, g - 6, 3); plat(c0 + 12, g - 4, 2); coinLine(c0 + 9, g - 7, 3); bat(c0 + 6, g - 7, 4); blob(c0 + 4, c0 + 12, g); },
    blink() { const k = rnd(3, 4); flat(2); for (let i = 0; i < k; i++) { pit(2); const pr = g - 1 - (i % 2); L.blinks.push({ x: c * TS, y: pr * TS, w: 2 * TS, ph: i * 47 }); coinLine(c, pr - 2, 2); pit(2); } flat(3); },
    saws() { const c0 = c; flat(20); L.saws.push({ kind: 'h', x0: (c0 + 3) * TS, x1: (c0 + 6) * TS, y: g * TS - 7, sp: 0.9 + d * 0.15, t: r() * 6 }); L.saws.push({ kind: 'h', x0: (c0 + 12) * TS, x1: (c0 + 15) * TS, y: g * TS - 7, sp: 1.1 + d * 0.15, t: r() * 6 }); coinLine(c0 + 4, g - 3, 3); coinLine(c0 + 13, g - 3, 3); if (d >= 3) L.saws.push({ kind: 'v', x: (c0 + 9) * TS + 8, y0: g * TS - 14, y1: g * TS - 46, sp: 1.3, t: r() * 6 }); },
    spring() { flat(3); const c0 = c; flat(13); L.springs.push({ x: (c0 + 2) * TS + 1, y: g * TS - 6, w: 14, h: 6 }); plat(c0 + 4, g - 4, 6); coinLine(c0 + 4, g - 5, 6); if (r() < 0.2) L.hearts.push({ x: (c0 + 7) * TS + 2, y: (g - 6) * TS }); blob(c0 + 7, c0 + 12, g); },
    tower() { // MURO: o chão não passa; é preciso subir em zigue-zague e atravessar por cima (estilo castelo do Mario)
      while (g < 15) { flat(2); g += 1; } flat(3); const c0 = c; flat(20);
      plat(c0 + 1, g - 2, 3); plat(c0 + 5, g - 4, 3); plat(c0 + 1, g - 6, 3); plat(c0 + 5, g - 8, 3); plat(c0 + 9, g - 10, 10);
      for (let rr = g - 9; rr < g; rr++) { set(c0 + 9, rr, T.BRICK); set(c0 + 10, rr, T.BRICK); }
      set(c0 + 4, g - 1, T.SPIKE); set(c0 + 8, g - 1, T.SPIKE); if (d >= 2) set(c0 + 12, g - 1, T.SPIKE);
      coinLine(c0 + 1, g - 3, 3); coinLine(c0 + 5, g - 5, 3); coinLine(c0 + 1, g - 7, 3); coinLine(c0 + 10, g - 12, 5); blob(c0 + 10, c0 + 17, g - 10); bat(c0 + 13, g - 14, 3);
      star(c0 + 17, g - 13); chest(c0 + 15, g - 10); gem(c0 + 12, g - 13); gem(c0 + 5, g - 9); if (r() < 0.3) L.hearts.push({ x: (c0 + 2) * TS + 2, y: (g - 8) * TS }); if (d >= 3) bat(c0 + 6, g - 11, 3);
    },
    crusher() { const n = 15; const c0 = c; flat(n); const mk = (cc) => L.crushers.push({ x: cc * TS + 2, w: 28, h: 28, yTop: g * TS - 28 - 66, yBot: g * TS - 28 }); mk(c0 + 4); mk(c0 + 9); if (d >= 2) mk(c0 + 13); coinLine(c0 + 6, g - 2, 2); coinLine(c0 + 11, g - 2, 2); if (d >= 3) blob(c0 + 1, c0 + 3, g); },
    cannon() { flat(3); const c0 = c; flat(15); set(c0 + 13, g - 1, T.BRICK); L.turrets.push({ x: (c0 + 13) * TS, y: (g - 1) * TS, dir: -1, per: 130 - d * 10, t: rnd(0, 50) }); blob(c0 + 2, c0 + 9, g); coinLine(c0 + 4, g - 3, 3); },
    windlift() { while (g < 15) { flat(2); g += 1; } flat(3); const c0 = c; flat(16); L.winds.push({ x: (c0 + 4) * TS, y: (g - 11) * TS, w: 3 * TS, h: 11 * TS }); plat(c0 + 3, g - 11, 5); chest(c0 + 5, g - 11); gem(c0 + 4, g - 13); gem(c0 + 6, g - 13); blob(c0 + 8, c0 + 14, g, d >= 2); coinLine(c0 + 10, g - 3, 3); if (d >= 2) bat(c0 + 7, g - 7, 3); },
    shooters() { flat(3); const c0 = c; flat(18); shooter(c0 + 15, g); blob(c0 + 3, c0 + 9, g, d >= 2, d >= 2); coinLine(c0 + 5, g - 3, 3); if (d >= 2) shooter(c0 + 11, g); },
    ambush() { const c0 = c; flat(18); bat(c0 + 5, g - 5, 3); bat(c0 + 11, g - 6, 3, { shoot: true }); if (d >= 3) bat(c0 + 8, g - 4, 4, { immortal: true }); coinLine(c0 + 2, g - 3, 3); coinLine(c0 + 13, g - 3, 3); },
    moverSpikes() { flat(2); const c0 = c; pit(10); flat(3); L.movers.push({ x: c0 * TS, y: g * TS, w: 3 * TS, h: 8, range: 6 * TS, speed: 0.85, t: r() * 6 }); },
  };
  const sets = {
    0: ['run', 'gap', 'stairsUp', 'enemy'],
    1: ['gap', 'stairsUp', 'stairsDown', 'float', 'enemy', 'spikes', 'tworoute', 'bats', 'climb', 'gauntlet', 'crumble', 'blink', 'spring', 'tower', 'crusher', 'windlift', 'shooters', 'enemy', 'ambush'],
    2: ['gap', 'float', 'enemy', 'spikes', 'tworoute', 'mover', 'bats', 'drop', 'gauntlet', 'crumble', 'climb', 'pitSpikes', 'blink', 'saws', 'spring', 'tower', 'crusher', 'cannon', 'tower', 'windlift', 'shooters', 'ambush', 'enemy', 'gauntlet', 'shooters'],
    3: ['gap', 'float', 'enemy', 'spikes', 'tworoute', 'mover', 'bats', 'pitSpikes', 'drop', 'gauntlet', 'crumble', 'climb', 'moverSpikes', 'blink', 'saws', 'spring', 'tower', 'crusher', 'cannon', 'tower', 'cannon', 'windlift', 'shooters', 'ambush', 'ambush', 'gauntlet', 'enemy', 'shooters'],
  }[d];
  function secret() { // torre opcional (sem muro): sobe em zigue-zague até um corredor alto; a porta é invisível e só aparece perto
    if (L.secretDoor) return; while (g < 15) { flat(2); g += 1; } flat(3); const c0 = c; flat(20);
    plat(c0 + 2, g - 2, 3); plat(c0 + 6, g - 4, 3); plat(c0 + 2, g - 6, 3); plat(c0 + 6, g - 8, 3); plat(c0 + 10, g - 10, 9);
    coin(c0 + 3, g - 3); coin(c0 + 7, g - 5); coin(c0 + 3, g - 7); coinLine(c0 + 11, g - 12, 3); star(c0 + 13, g - 13); if (d >= 2) bat(c0 + 14, g - 13, 2);
    L.secretDoor = { x: (c0 + 17) * TS, y: (g - 10) * TS - 26, w: 16, h: 26 }; chest(c0 + 14, g - 10); gem(c0 + 12, g - 12); blob(c0 + 3, c0 + 14, g); }
  function section(n) {
    let last = '';
    for (let i = 0; i < n; i++) {
      let name = pick(sets); let guard = 0; while ((name === last || (name === 'stairsUp' && g <= 13) || (name === 'drop' && g >= 18) || (name === 'stairsDown' && g >= 18)) && guard++ < 20) name = pick(sets);
      chunks[name](); last = name;
      if (c - lastCp > 64) { flat(2); cp(); }          // checkpoint a cada ~40 blocos: cair num buraco nunca volta ao início da fase
      if (g > 18) { flat(2); g -= 1; flat(3); g -= 1; flat(3); }
      if (g < 13) { flat(3); g += 2; flat(4); }
    }
    if (d >= 1) { if (c - lastCp > 40) { flat(2); cp(); } secret(); }
    flat(2);
  }
  function station(idx, practice, type = 'ped') {
    flat(3); cp(); flat(1);
    const c0 = c; flat(24);
    const pc = [c0 + 3, c0 + 7, c0 + 11, c0 + 15]; const gc = c0 + 19;
    if (type === 'ped') pc.forEach((p) => { for (let rr = g - 2; rr < g; rr++) { set(p, rr, T.BLOCK); set(p + 1, rr, T.BLOCK); } });
    for (let rr = g - 6; rr < g; rr++) set(gc, rr, T.GATE);
    const geo = { ped: (p) => ({ x: p * TS, y: (g - 2) * TS, w: 32, h: 32 }), door: (p) => ({ x: p * TS + 2, y: g * TS - 44, w: 28, h: 44 }), bump: (p) => ({ x: p * TS, y: g * TS - 64, w: 32, h: 16 }), mimic: (p) => ({ x: p * TS + 6, y: g * TS - 20, w: 20, h: 20 }), barrel: (p) => ({ x: p * TS + 4, y: g * TS - 24, w: 24, h: 24 }), balloon: (p) => ({ x: p * TS + 6, y: g * TS - 78, w: 20, h: 26 }) }[type];
    L.stations.push({ idx, practice: !!practice, type, x0: (c0 + 2) * TS, x1: gc * TS, xc: (c0 + 12) * TS, gc, gateTop: g - 6, gateBot: g - 1, rowG: g, signX: (c0 + 1) * TS, signY: g * TS,
      opts: pc.map((p, i) => ({ i, ...geo(p) })), lockX: (gc + 3) * TS });
    flat(5);
  }
  function bossArena() {
    flat(3); cp(); flat(1); const c0 = c; flat(36);
    L.boss = { x0: (c0 + 4) * TS, x1: (c0 + 35) * TS, gate: { col: c0 + 1, top: g - 9, bot: g - 1 }, rowG: g, kind: key, wallL: (c0 + 2) * TS };
    L.goal = { x: (c0 + 32) * TS, y: (g - 3) * TS, w: TS * 2, h: TS * 3 }; L.bossRegion = [c0, c0 + 36];
  }

  /* ---- montagem da fase ---- */
  flat(10); L.spawn = { x: 2 * TS + 3, y: (GR - 2) * TS };
  if (room) {
    for (const n of ['spring', 'float', 'blink', 'saws', 'crumble', 'float', 'spring', 'saws']) { chunks[n](); }
    flat(4); L.exitDoor = { x: (c - 2) * TS, y: g * TS - 28, w: 16, h: 28 }; L.goal = { x: (c - 2) * TS, y: g * TS - 28, w: 16, h: 28 };
  } else if (d === 0) {
    chunks.run(); chunks.gap(); chunks.enemy(); chunks.stairsUp(); flat(2);
    station(0, true, 'ped'); chunks.gap(); chunks.run();
    flat(2); const gx = c + 4; flat(10); L.goal = { x: gx * TS, y: (g - 1) * TS, w: TS * 2, h: TS * 3 };
  } else {
    const qs = nStations > 5 ? 1 : 2, secs = quick ? [qs, qs, qs] : [5, 5, 4];
    // um objeto DIFERENTE por pergunta (em cada fase os 3 são distintos; nas 3 fases aparecem os 6 tipos)
    const STY = { 1: ['barrel', 'door', 'bump'], 2: ['balloon', 'mimic', 'ped'], 3: ['bump', 'barrel', 'balloon'] }[d];
    for (let s = 0; s < nStations; s++) { section(secs[s] || (quick ? qs : 4)); station(s, false, STY[s % 3]); }
    flat(2); bossArena();
  }
  flat(2); for (let rr = 0; rr < ROWS; rr++) set(c, rr, T.WALL); c += 1;
  L.cols = c;

  /* decoração */
  let lastDecor = -10; const inArena = (cc) => L.stations.some((s) => cc >= (s.x0 / TS) - 3 && cc <= s.gc + 4) || (L.bossRegion && cc >= L.bossRegion[0] - 2 && cc <= L.bossRegion[1] + 2);
  for (let cc = 4; cc < L.cols - 3; cc++) {
    if (top[cc] < 0 || cc - lastDecor < 2 || inArena(cc)) continue;
    if (tiles[(top[cc] - 1) * MAXC + cc] !== T.EMPTY) continue;
    if (L.checkpoints.some((p) => Math.abs(p.x / TS - cc) < 2)) continue;
    if (r() < 0.6) { L.decor.push({ col: cc, row: top[cc], id: (r() * 1000) | 0 }); lastDecor = cc; }
  }
  L.top = top;
  { const hz = []; for (const e of L.enemies) hz.push(e.x); for (const s of L.saws) hz.push(s.x0 !== undefined ? s.x0 : s.x, s.x1 !== undefined ? s.x1 : s.x); for (const k of L.crushers) hz.push(k.x); for (const k of L.turrets) hz.push(k.x); for (const k of L.springs) hz.push(k.x); for (const k of [...L.movers, ...L.crumbles, ...L.blinks]) hz.push(k.x, k.x + (k.range || 0)); for (const k of L.winds) hz.push(k.x); for (const k of L.chests) hz.push(k.x);
    // peças em primeiro plano (estilo Donkey Kong Country): só em trechos planos e seguros; relaxa o rigor até ter ao menos 4 por fase
    const place = (rad, gap, half) => { let cc = 22; while (cc < L.cols - 24) { cc += gap + ((r() * gap) | 0); if (cc >= L.cols - 24) break; const px = cc * TS, g0 = top[cc]; let ok = g0 >= 0 && !inArena(cc - 3) && !inArena(cc + 3) && !inArena(cc) && !L.fgprops.some((q) => Math.abs(q.x - px) < gap * TS);
        for (let k = -half; ok && k <= half; k++) { if (top[cc + k] !== g0) ok = false; for (let rr = g0 - 4; ok && rr < g0; rr++) { const tt = tiles[rr * MAXC + cc + k]; if (tt !== T.EMPTY && tt !== T.PLAT) ok = false; } }
        for (const hx of hz) if (ok && Math.abs(hx - px) < rad * TS) ok = false; for (const q of L.checkpoints) if (ok && Math.abs(q.x - px) < 4 * TS) ok = false;
        if (ok) L.fgprops.push({ x: px, gy: g0 * TS, w: 14 + ((r() * 12) | 0), seed: (r() * 1e6) | 0, low: r() < 0.38 }); } };
    place(4, 16, 3); if (L.fgprops.length < 4) place(3, 13, 2); if (L.fgprops.length < 4) place(2, 11, 2); L.fgprops.sort((a, b) => a.x - b.x); }
  /* vãos (para a ponte de apoio): colunas sem chão, com a altura do chão adjacente */
  L.pits = []; let cc = 1;
  while (cc < L.cols - 1) { if (top[cc] < 0) { let e = cc; while (e < L.cols && top[e] < 0) e++; const gl = top[cc - 1] >= 0 ? top[cc - 1] : GR; L.pits.push({ x: cc * TS, w: (e - cc) * TS, row: gl }); cc = e; } else cc++; }
  return L;
}

/* ---------- validador (conservador) ---------- */
const FLOOR = new Set([T.TOP, T.FILL, T.BRICK, T.BLOCK, T.WALL, T.PLAT]);
export function validate(L) {
  const get = (c, r) => { const t = tileAt(L, c, r); return t === T.GATE ? T.EMPTY : t; };
  const stand = (c, r) => get(c, r) === T.EMPTY && get(c, r - 1) === T.EMPTY && FLOOR.has(get(c, r + 1));
  const nodes = new Map(); const key = (c, r) => c * 100 + r;
  for (let c = 0; c < L.cols; c++) for (let r = 1; r < ROWS - 1; r++) if (stand(c, r)) nodes.set(key(c, r), [c, r]);
  for (const m of L.movers) { const c0 = Math.round(m.x / TS), c1 = Math.round((m.x + m.range) / TS), r = Math.round(m.y / TS) - 1; for (let c = c0; c <= c1 + 2; c++) nodes.set(key(c, r), [c, r]); }
  for (const m of L.blinks) { const c0 = Math.round(m.x / TS), r = Math.round(m.y / TS) - 1; nodes.set(key(c0, r), [c0, r]); nodes.set(key(c0 + 1, r), [c0 + 1, r]); }
  for (const m of L.crumbles) { const c0 = Math.round(m.x / TS), r = Math.round(m.y / TS) - 1; nodes.set(key(c0, r), [c0, r]); nodes.set(key(c0 + 1, r), [c0 + 1, r]); }
  const start = [Math.floor(L.spawn.x / TS), GR - 1]; let sKey = null;
  for (let r = start[1]; r < ROWS && sKey === null; r++) if (nodes.has(key(start[0], r))) sKey = key(start[0], r);
  if (sKey === null) return { ok: false, why: 'sem ponto de partida' };
  const seen = new Set([sKey]); const q = [sKey];
  while (q.length) {
    const k = q.pop(); const [c, r] = nodes.get(k);
    for (let dc = -6; dc <= 6; dc++) for (let dr = -2; dr <= 12; dr++) {
      const nc = c + dc, nr = r + dr; const nk = key(nc, nr); if (seen.has(nk) || !nodes.has(nk)) continue;
      const ad = Math.abs(dc); const up = -dr;
      const okEdge = (up > 0 && up <= 2 && ad <= 3) || (up === 0 && ad <= 4) || (up < 0 && ad <= (up >= -1 ? 5 : 6));
      if (okEdge) { seen.add(nk); q.push(nk); }
    }
  }
  const goalC = Math.floor(L.goal.x / TS); let goalOk = false; let maxC = 0; for (const k of seen) { const [c] = nodes.get(k); maxC = Math.max(maxC, c); if (c >= goalC) goalOk = true; }
  const stOk = L.stations.every((s) => s.type !== 'ped' || s.opts.some((p) => seen.has(key(Math.floor(p.x / TS), Math.round(p.y / TS) - 1))));
  const starOk = L.stars.every((s) => { const c = Math.floor(s.x / TS), r = Math.floor(s.y / TS); for (let rr = r; rr < r + 3; rr++) if (seen.has(key(c, rr)) || seen.has(key(c + 1, rr)) || seen.has(key(c - 1, rr))) return true; return false; });
  return { ok: goalOk && stOk && starOk, goalOk, stOk, starOk, nodes: nodes.size, reached: seen.size, maxC };
}
