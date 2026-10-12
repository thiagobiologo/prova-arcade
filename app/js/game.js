/* Motor de plataforma 2D (canvas HD): vida em corações, economia (moedas/estrelas), obstáculos, fase secreta,
 * chefes, apoio adaptativo e 4 tipos de "caso" embutidos no jogo (pisar, porta, bloco, monstrinho).
 * © Thiago Silva. Física em unidades lógicas (tile = 16); desenho em alta resolução. */
import { TS, T, isSolid, PLAYER_COLORS, OPT_COLORS, CHARS, buildWorld, rng, shade } from './art.js';
import { buildLevel, tileAt, ROWS } from './levels.js';
import { sfx, setMode, setIntensity, playMusic } from './audio.js';
import { gfx, drawFoot } from './gfx.js';

const VH = 216;
const PHY = { grav: 0.28, maxFall: 5.2, acc: 0.15, air: 0.11, fric: 0.17, maxV: 1.9, jump: -5.5, cut: -2.3, coyote: 6, buffer: 7, spring: -9.6 };
const HB = { w: 10, h: 20 };
export const ECON = { startHp: 2, maxHp: 3, coinsPerHeart: 40, maxShield: 1, shotsPerBoss: 3, maxAmmo: 6 };
const BOSS_NAME = { colossus: 'COLOSSO DE CRISTAL', titan: 'TITÃ DE OSSOS', hydra: 'HIDRA SINÁPTICA' };
const BHP = { colossus: [4, 6], titan: [5, 7], hydra: [5, 8] }; // [rápido, completo]
const ESIZE = { sentinel: 25, spider: 20, skull: 24, spore: 22, drone: 25, wraith: 27, vulture: 22, wisp: 25 };

export class Game {
  constructor(canvas, hooks) {
    this.cv = canvas; this.ctx = canvas.getContext('2d', { alpha: false }); this.hooks = hooks || {};
    this.W = 384; this.H = VH; this.S = 2; this.running = false; this.acc = 0; this.last = 0; this.turbo = 1;
    this.input = { left: false, right: false, jump: false, fire: false, _jumpPrev: false, _firePrev: false };
    this.cache = {}; this.bot = false; this.paused = false; this.god = false; this._loop = this._loop.bind(this);
  }
  resize(cssW, cssH) {
    let dpr = Math.min(2, window.devicePixelRatio || 1); while (cssW * cssH * dpr * dpr > 2.6e6 && dpr > 1) dpr -= 0.25;
    this.portrait = cssH > cssW * 1.12;
    if (this.portrait) { this.W = 232; this.H = Math.max(240, Math.min(560, Math.round(232 * cssH / Math.max(1, cssW)))); }
    else { this.H = VH; this.W = Math.max(330, Math.min(500, Math.round(VH * cssW / Math.max(1, cssH) / 2) * 2)); }
    const PX = 1.6; this.cv.width = Math.round(this.W * PX); this.cv.height = Math.round(this.H * PX); this.S = PX; void dpr;   // modo 16 bits: desenha em baixa resolução e amplia sem suavizar
  }
  world(key) { return this.cache[key] || (this.cache[key] = buildWorld(key)); }

  /* ---------- carga ---------- */
  load(cfg) {
    this.cfg = cfg; this.A = this.world(cfg.key); this.G = gfx();
    const L = buildLevel(cfg.key, cfg.seed, cfg.nStations, !!cfg.quick);
    this.pc = PLAYER_COLORS[cfg.playerIdx]; this.cid = CHARS[cfg.charIdx].id; this.sheet = `char_${this.cid}_p${cfg.playerIdx + 1}`;
    this.p = { x: L.spawn.x, y: L.spawn.y, w: HB.w, h: HB.h, vx: 0, vy: 0, on: false, face: 1, coy: 0, buf: 0, dead: 0, inv: 0, anim: 0, ride: null, jumping: false, hurtT: 0, squash: 0, wasOn: false, hp: ECON.startHp, shield: 0, spring: 0 };
    this.respawn = { x: L.spawn.x, y: L.spawn.y };
    this.weapon = !!cfg.weapon; this.ammo = cfg.weapon ? Math.max(0, cfg.ammo | 0) : 0; this.ammoStart = this.ammo; this.ammoUsed = 0; this.shots = []; this.fireCool = 0;
    this.orbs = []; this.waves = []; this.rocks = []; this.parts = []; this.texts = []; this.shake = 0; this.main = null; this.inSecret = false; this.secretUsed = false; this.roomCoins = 0;
    this._applyLevel(L);
    this.exitT = 0; this._doneSent = false; this.frame = 0; this.score = 0; this.killed = 0; this.deaths = 0; this.hits = 0; this.coinsGot = 0; this.coinBank = 0; this.heartsGained = 0; this.shieldsUsed = 0; this.secrets = 0; this.done = false; this.doneT = 0; this.segDeaths = 0; this.assist = 0; this.assistMax = 0; this.bossKilled = false; this.secretRoom = false;
    this.cam = { x: 0, y: 0 }; this.snapCam();
    this.clouds = Array.from({ length: 9 }, (_, i) => ({ x: i * 90 + Math.random() * 40, y: 14 + Math.random() * 70, s: 0.1 + Math.random() * 0.14, w: 36 + Math.random() * 40 }));
    this.motes = Array.from({ length: 34 }, () => ({ x: Math.random() * 520, y: Math.random() * VH, p: Math.random() * 6, s: 0.1 + Math.random() * 0.25, r: 0.6 + Math.random() * 1.4 }));
    setMode('play'); setIntensity(0.12); this._emitAmmo();
    this.hooks.onLoaded && this.hooks.onLoaded(this); this.hooks.onBoss && this.hooks.onBoss(null); this.hooks.onAssist && this.hooks.onAssist(0); this._emitHp(); this._emitAmmo(); this.hooks.onSecret && this.hooks.onSecret(false);
  }
  _shots() {
    for (const sh of this.shots) {
      sh.x += sh.vx; sh.life--; if (this._solidAt(sh.x, sh.y)) { sh.life = 0; this._spark(sh.x, sh.y, '#fff6b0', 5); continue; }
      for (const e of this.enemies) if (e.alive && sh.x > e.x - 2 && sh.x < e.x + e.w + 2 && sh.y > e.y - 2 && sh.y < e.y + e.h + 2) { if (e.spiked || e.immortal) { sh.life = 0; this._spark(sh.x, sh.y, '#ffffff', 6); this._text(e.x - 2, e.y - 8, 'IMUNE', '#ffd0d0'); break; } e.alive = false; this.killed++; this.score += 30; sh.life = 0; sfx.stomp(); this._spark(e.x + e.w / 2, e.y + 6, '#fff6b0', 14); this._text(e.x, e.y - 6, '+30', '#fff6b0'); break; }
      const B = this.boss; if (sh.life > 0 && B && B.active && !B.dead && B.inv === 0 && sh.x > B.x && sh.x < B.x + B.w && sh.y > B.y && sh.y < B.y + B.h) { sh.life = 0; this._bossHit(B, true); }
    }
    this.shots = this.shots.filter((s) => s.life > 0);
  }
  _emitAmmo() { this.hooks.onAmmo && this.hooks.onAmmo({ weapon: this.weapon, ammo: this.ammo, max: ECON.maxAmmo }); }
  _applyLevel(L) {
    this.L = L; const th = this.A.th;
    this.coins = L.coins.map((c) => ({ ...c, got: false, ph: Math.random() * 8 }));
    this.starsC = L.stars.map((s) => ({ ...s, got: false }));
    this.hearts = L.hearts.map((h) => ({ ...h, got: false }));
    this.enemies = L.enemies.map((e) => e.type === 'blob'
      ? { ...e, w: 14, h: 12, vx: 0.62 + Math.random() * 0.2, dir: Math.random() < 0.5 ? -1 : 1, vy: 0, alive: true, t: 0, y: e.y + 4, kind: th.enemy }
      : { ...e, w: 16, h: 12, alive: true, t: Math.random() * 6, ox: e.x, kind: th.flyer });
    this.enemies.forEach((e) => { e.ix = e.x; e.iy = e.y; });
    this.plats = [
      ...L.movers.map((m) => ({ kind: 'mover', ...m, x0: m.x, dx: 0, prevX: m.x })),
      ...L.crumbles.map((m) => ({ kind: 'crumble', x: m.x, y: m.y, y0: m.y, w: m.w, h: 8, state: 0, t: 0, vy: 0, dx: 0 })),
      ...L.blinks.map((m) => ({ kind: 'blink', x: m.x, y: m.y, w: m.w, h: 8, ph: m.ph, vis: true, warn: false, dx: 0 })),
    ];
    this.saws = L.saws.map((s) => ({ ...s, cx: s.x0 !== undefined ? s.x0 : s.x, cy: s.y !== undefined ? s.y : s.y0, r: 7, rot: 0 }));
    this.springs = L.springs.map((s) => ({ ...s, anim: 0, cool: 0 }));
    this.crushers = (L.crushers || []).map((k) => ({ ...k, y: k.yTop, st: 0, t: 0, vy: 0, cool: 0 })); this.turrets = (L.turrets || []).map((k) => ({ ...k, flash: 0 })); this.bullets = []; this.chests = (L.chests || []).map((k) => ({ ...k, open: false, t: 0 })); this.winds = L.winds || []; this.fgprops = L.fgprops || [];
    this.cps = L.checkpoints.map((c) => ({ ...c, on: false }));
    this.stations = L.stations.map((s) => ({ ...s, opts: s.opts.map((o) => ({ ...o, fx: o.x, fy: o.y })), active: false, selected: -1, changes: 0, gateOpen: false, locked: false, visits: 0, dwellF: 0, tFirstF: null, enterF: null, choices: [], item: null, order: null, lastSpeak: -999, arm: null, padF: 0, dropStarted: false, pad: { x: s.x0 + 12, y: s.rowG * TS } }));
    this.goal = { ...L.goal, hit: false, t: 0, enabled: !L.boss && !L.exitDoor }; this._snapGoal(L);
    this.boss = L.boss ? { ...L.boss, name: BOSS_NAME[th.boss], sheet: 'boss_' + th.boss, hp: BHP[th.boss][this.cfg.quick ? 0 : 1], max: BHP[th.boss][this.cfg.quick ? 0 : 1], ph: 1, weak: false, x: L.boss.x0 + 200, y: L.boss.rowG * TS - 72, w: 52, h: 72, vx: 0, vy: 0, on: true, face: -1, active: false, dead: false, st: 'idle', t: 40, inv: 0, stun: 0, flash: 0, dying: 0 } : null;
    this.secretDoor = L.secretDoor ? { ...L.secretDoor } : null; this.exitDoor = L.exitDoor ? { ...L.exitDoor } : null;
    this._decorIdx = L.decor.map((d) => this.A.decor[d.id % this.A.decor.length]);
    this.platRuns = []; for (let r = 0; r < ROWS; r++) { let c = 0; while (c < L.cols) { if (tileAt(L, c, r) === T.PLAT) { let e = c; while (tileAt(L, e, r) === T.PLAT) e++; this.platRuns.push({ x: c * TS, y: r * TS, w: (e - c) * TS }); c = e; } else c++; } }
  }
  _snapGoal(L) { const g = this.goal; if (!g || !(g.w > 0) || L.exitDoor) return; g.w = TS * 2; g.h = TS * 3; const c = Math.floor((g.x + g.w / 2) / TS); let r = Math.max(0, Math.floor(g.y / TS) - 1); while (r < ROWS - 1 && !isSolid(tileAt(L, c, r))) r++; g.y = r * TS - g.h; }
  snapCam() { const p = this.p; this.cam.x = Math.max(0, Math.min(this.L.cols * TS - this.W, p.x - this.W * 0.4)); this.cam.y = this.portrait ? Math.max(-this.H, Math.min(ROWS * TS - this.H * 0.6, p.y - this.H * 0.74)) : Math.max(0, Math.min(ROWS * TS - this.H, p.y - this.H * 0.64)); }
  _emitHp() { const p = this.p; this.hooks.onHp && this.hooks.onHp({ hp: p.hp, max: ECON.maxHp, shield: p.shield, bank: this.coinBank, per: ECON.coinsPerHeart }); }

  /* ---------- execução ---------- */
  start() { if (this.running) return; this.running = true; this.last = performance.now(); this.acc = 0; requestAnimationFrame(this._loop); }
  stop() { this.running = false; }
  _loop(t) {
    if (!this.running) return; requestAnimationFrame(this._loop);
    const dt = Math.min(100, t - this.last); this.last = t; if (this.paused) { this.render(); return; }
    const tb = this.turbo || 1; this.acc += dt * tb; let n = 0; while (this.acc >= 16.667 && n < 5 * tb) { this.update(); this.acc -= 16.667; n++; } if (n >= 5 * tb) this.acc = 0;
    this.render();
  }

  /* ---------- colisão ---------- */
  _solidAt(px, py) { return isSolid(tileAt(this.L, Math.floor(px / TS), Math.floor(py / TS))); }
  _hit(p) {
    const c0 = Math.floor(p.x / TS), c1 = Math.floor((p.x + p.w - 0.01) / TS), r0 = Math.floor(p.y / TS), r1 = Math.floor((p.y + p.h - 0.01) / TS);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (isSolid(tileAt(this.L, c, r))) return { c, r };
    return null;
  }
  update() {
    this.frame++; const p = this.p, I = this.input, L = this.L, as = this.assist;
    if (this.bot) this._botStep();
    for (const m of this.plats) {
      if (m.kind === 'mover') { m.prevX = m.x; m.t += 0.016 * (m.speed * 1.9) * (as >= 2 ? 0.8 : 1); const k = (Math.sin(m.t) + 1) / 2; m.x = m.x0 + k * m.range; m.dx = m.x - m.prevX; }
      else if (m.kind === 'crumble') { if (m.state === 1) { m.t--; if (m.t <= 0) { m.state = 2; m.vy = 0; } } else if (m.state === 2) { m.vy += 0.3; m.y += m.vy; if (m.y > m.y0 + 160) { m.state = 3; m.t = 150; } } else if (m.state === 3) { m.t--; if (m.t <= 0) { m.state = 0; m.y = m.y0; } } }
      else if (m.kind === 'blink') { const ph = (this.frame + m.ph) % 150; m.warn = ph >= 88 && ph < 110; m.vis = as >= 2 ? true : ph < 110; }
    }
    for (const s of this.saws) { s.t += s.sp * 0.03 * (as >= 2 ? 0.6 : 1); s.rot += 0.35; const k = (Math.sin(s.t) + 1) / 2; if (s.kind === 'h') { s.cx = s.x0 + k * (s.x1 - s.x0); s.cy = s.y; } else { s.cx = s.x; s.cy = s.y0 + k * (s.y1 - s.y0); } }
    if (p.dead > 0) { p.dead--; p.vy += PHY.grav * 0.8; p.y += p.vy; p.hurtT++; if (p.dead === 0) this._respawn(); this._camera(); this._fx(); return; }
    if (p.inv > 0) p.inv--;
    const ice = this.A.th.ice && p.on && !p.ride && !this.inSecret; const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0); const a = ice ? 0.042 : (p.on ? PHY.acc : PHY.air);
    if (dir) { p.vx += dir * a; p.face = dir; if (Math.abs(p.vx) > PHY.maxV) p.vx = PHY.maxV * Math.sign(p.vx); if (dir !== Math.sign(p.vx) && p.on) p.vx += dir * (ice ? 0.012 : PHY.fric); }
    else { const f = ice ? 0.01 : (p.on ? PHY.fric : PHY.fric * 0.4); if (Math.abs(p.vx) <= f) p.vx = 0; else p.vx -= Math.sign(p.vx) * f; }
    const cyt = as >= 1 ? 9 : PHY.coyote, bf = as >= 1 ? 10 : PHY.buffer;
    if (I.jump && !I._jumpPrev) p.buf = bf; I._jumpPrev = I.jump; if (p.buf > 0) p.buf--;
    if (p.on) p.coy = cyt; else if (p.coy > 0) p.coy--;
    if (p.buf > 0 && p.coy > 0) { p.vy = PHY.jump; p.on = false; p.coy = 0; p.buf = 0; p.jumping = true; p.squash = -8; sfx.jump(); this._dust(p.x + 5, p.y + p.h, 5); }
    if (!I.jump && p.vy < PHY.cut && p.jumping) p.vy = PHY.cut;
    if (p.ride) p.x += p.ride.dx;
    p.x += p.vx; let h = this._hit(p);
    if (h) { if (p.vx > 0) p.x = h.c * TS - p.w; else if (p.vx < 0) p.x = (h.c + 1) * TS; p.vx = 0; h = this._hit(p); if (h) p.x -= Math.sign(p.vx || 1) * 0.5; }
    if (p.x < 0) { p.x = 0; p.vx = 0; }
    const prevBottom = p.y + p.h; this._pb = prevBottom; p.vy = Math.min(PHY.maxFall, p.vy + PHY.grav); p.y += p.vy; p.wasOn = p.on; p.on = false; p.ride = null;
    h = this._hit(p);
    if (h) { if (p.vy > 0) { p.y = h.r * TS - p.h; p.on = true; } else p.y = (h.r + 1) * TS; p.vy = p.vy > 0 ? 0 : 0.5; }
    if (p.vy >= 0) {
      const c0 = Math.floor(p.x / TS), c1 = Math.floor((p.x + p.w - 0.01) / TS), rb = Math.floor((p.y + p.h) / TS);
      for (let c = c0; c <= c1; c++) if (tileAt(L, c, rb) === T.PLAT && prevBottom <= rb * TS + 1 && p.y + p.h >= rb * TS) { p.y = rb * TS - p.h; p.vy = 0; p.on = true; }
      for (const m of this.plats) {
        if ((m.kind === 'crumble' && m.state >= 2) || (m.kind === 'blink' && !m.vis)) continue;
        if (p.x + p.w > m.x + 1 && p.x < m.x + m.w - 1 && prevBottom <= m.y + 3 && p.y + p.h >= m.y) {
          p.y = m.y - p.h; p.vy = 0; p.on = true; p.ride = m.kind === 'mover' ? m : null;
          if (m.kind === 'crumble' && m.state === 0 && as < 2) { m.state = 1; m.t = 26; sfx.tick(); }
        }
      }
    }
    if (p.on) { p.jumping = false; if (!p.wasOn && this.frame > 5) { this._dust(p.x + 5, p.y + p.h, 4); p.squash = 7; } }
    if (p.squash > 0) p.squash--; else if (p.squash < 0) p.squash++;
    // arma (Orbe de Luz): pouquíssimos tiros, sem recarga; não funciona durante as perguntas
    if (this.fireCool > 0) this.fireCool--;
    if (I.fire && !I._firePrev && this.weapon && this.fireCool === 0 && p.dead === 0 && !this.stations.some((s) => s.active)) {
      if (this.ammo > 0) { this.ammo--; this.ammoUsed++; this.fireCool = 14; this.shots.push({ x: p.x + (p.face > 0 ? p.w : -3), y: p.y + 8, vx: p.face * 3.8, life: 90 }); sfx.shoot(); this._spark(p.x + (p.face > 0 ? p.w + 2 : -2), p.y + 8, '#fff6b0', 5); this._emitAmmo(); }
      else { this.fireCool = 20; sfx.empty(); this._text(p.x - 8, p.y - 6, 'SEM MUNIÇÃO', '#ff9ab0'); }
    }
    I._firePrev = I.fire; this._shots();
    // molas
    for (const sp of this.springs) { if (sp.cool > 0) sp.cool--; if (sp.anim > 0) sp.anim--; if (sp.cool === 0 && p.vy >= 0 && p.x + p.w > sp.x && p.x < sp.x + sp.w && p.y + p.h >= sp.y - 1 && p.y + p.h <= sp.y + sp.h + 5) { p.vy = PHY.spring; p.on = false; p.jumping = true; p.squash = -9; sp.anim = 14; sp.cool = 18; sfx.spring(); this._spark(sp.x + 7, sp.y, '#9ff5ff', 8); } }
    // espinhos (com apoio nível 2+ ficam inofensivos perto do retorno)
    if (!(as >= 2 && Math.abs(p.x - this.respawn.x) < 900)) {
      const sc0 = Math.floor(p.x / TS), sc1 = Math.floor((p.x + p.w - 0.01) / TS), sr0 = Math.floor((p.y + 4) / TS), sr1 = Math.floor((p.y + p.h - 0.01) / TS);
      for (let r = sr0; r <= sr1; r++) for (let c = sc0; c <= sc1; c++) if (tileAt(L, c, r) === T.SPIKE && p.y + p.h > r * TS + 7) this._hurt();
    }
    // serras
    if (p.inv === 0) for (const s of this.saws) { const nx = Math.max(p.x, Math.min(s.cx, p.x + p.w)), ny = Math.max(p.y, Math.min(s.cy, p.y + p.h)); if ((nx - s.cx) ** 2 + (ny - s.cy) ** 2 < (s.r - 1) ** 2) { this._hurt(); break; } }
    if (p.y + p.h > (ROWS - 3) * TS + 4) { if (p.dead === 0) this._spark(p.x + 5, (ROWS - 3) * TS, this.A.th.accent, 16); this._hurt(true); }
    p.anim += Math.abs(p.vx) * 0.11 + 0.02; if (ice && Math.abs(p.vx) > 0.5 && this.frame % 4 === 0) this.parts.push({ x: p.x + 5 - Math.sign(p.vx) * 4, y: p.y + 19, vx: -p.vx * 0.2, vy: -0.2, life: 14, col: 'rgba(210,245,255,.85)', r: 1.2 });
    // coletáveis (moedas viram corações; estrelas viram escudo)
    for (const c of this.coins) if (!c.got && p.x + p.w > c.x - 1 && p.x < c.x + 12 && p.y + p.h > c.y - 1 && p.y < c.y + 12) { c.got = true; this.coinsGot++; this.score += c.gem ? 50 : 10; sfx.coin(); this._spark(c.x + 5, c.y + 5, c.gem ? '#7df9ff' : '#ffd23f', c.gem ? 14 : 7); this._text(c.x, c.y - 4, c.gem ? '+5 GEMA' : '+10', c.gem ? '#9ff5ff' : '#ffe36b'); for (let k = 0; k < (c.gem ? 5 : 1); k++) this._bank(); }
    for (const k of this.chests) { if (k.open) { k.t++; continue; } if (p.x + p.w > k.x && p.x < k.x + 16 && p.y + p.h > k.y && p.y < k.y + 14) { k.open = true; k.t = 0; sfx.star(); for (let i = 0; i < 8; i++) this._bank(); this.score += 80; this._spark(k.x + 8, k.y + 4, '#ffe36b', 28); this._text(k.x - 8, k.y - 8, 'BAÚ! +8 MOEDAS', '#fff0a0'); } }
    for (const w of this.winds) if (p.dead === 0 && p.x + p.w > w.x && p.x < w.x + w.w && p.y + p.h > w.y && p.y < w.y + w.h) { p.vy = Math.max(p.vy - 0.55, -3.0); p.on = false; if (this.frame % 5 === 0) this.parts.push({ x: p.x + 5, y: p.y + 18, vx: (Math.random() - 0.5) * 0.4, vy: 1.2, life: 14, col: 'rgba(200,245,255,.8)', r: 1.1 }); }
    for (const s of this.starsC) if (!s.got && p.x + p.w > s.x && p.x < s.x + 16 && p.y + p.h > s.y && p.y < s.y + 16) { s.got = true; this.secrets++; this.score += 100; for (let k = 0; k < 10; k++) this._bank(); sfx.star(); this._spark(s.x + 8, s.y + 8, '#fff0a0', 22); this._text(s.x - 12, s.y - 8, '★ +100 · +10 MOEDAS', '#fff0a0'); }
    for (const hh of this.hearts) if (!hh.got && p.x + p.w > hh.x && p.x < hh.x + 12 && p.y + p.h > hh.y && p.y < hh.y + 12) { hh.got = true; this._heal(1, hh.x, hh.y); }
    for (const e of this.enemies) { if (!e.alive) continue; this._enemy(e); this._enemyHit(e); }
    this._bossStep(); this._orbsWaves(); this._hazards();
    for (const c of this.cps) if (!c.on && Math.abs(p.x - c.x) < 14 && Math.abs(p.y - c.y) < 40) { c.on = true; this.respawn = { x: c.x, y: c.y }; sfx.check(); this._spark(c.x + 4, c.y + 6, '#3ddc84', 14); this._text(c.x - 10, c.y - 6, 'CHECKPOINT', '#8affc0'); this._relax(); }
    for (const s of this.stations) { if (s.type === 'balloon') this._optAnim(s); this._station(s); }
    // portas secretas
    const sd = this.secretDoor; if (sd && !this.secretUsed && !this.inSecret && p.x + p.w > sd.x && p.x < sd.x + sd.w && p.y + p.h > sd.y && p.y < sd.y + sd.h + 4) this._enterSecret();
    const ed = this.exitDoor; if (ed && this.inSecret && p.x + p.w > ed.x && p.x < ed.x + ed.w && p.y + p.h > ed.y && p.y < ed.y + ed.h + 4) this._exitSecret();
    const g = this.goal; g.t++;
    if (g.enabled && !g.hit && p.x + p.w > g.x && p.x < g.x + g.w && p.y + p.h > g.y && p.y < g.y + g.h + 8) { g.hit = true; this.done = true; this.exitT = 1; sfx.clear(); this._spark(g.x + 16, g.y + 24, '#ffd23f', 30); }
    if (this.done) { this.doneT++; p.vx *= 0.9; }
    if (this.exitT > 0) { this.exitT++; I.left = I.right = I.jump = false; const dcx = g.x + g.w / 2; p.vx = Math.max(-1.1, Math.min(1.1, (dcx - (p.x + p.w / 2)) * 0.14)); if (Math.abs(p.vx) > 0.05) p.face = p.vx > 0 ? 1 : -1; if (this.exitT === 58 && !this._doneSent) { this._doneSent = true; this.hooks.onStageDone && this.hooks.onStageDone(this.stats()); } }
    if (this.frame % 12 === 0 && this.hooks.onHud) this.hooks.onHud(this);
    if (this.frame % 20 === 0) this._music();
    if (this.assist > 0 && this.frame % 30 === 0 && this.assistX !== undefined && p.x > this.assistX + 26 * TS) this._relax();   // ajuda só no trecho difícil: 26 blocos adiante ela some
    if (this.assist >= 2 && this.frame % 30 === 0) this._ghostNear();
    this._camera(); this._fx();
  }
  stats() { const wallet = this.coinBank; const tot = (this.main ? this.main.coins.length : this.coins.length) + this.roomCoins; return { wallet, frames: this.frame, seconds: Math.round(this.frame / 60), score: this.score, coins: this.coinsGot, coinsTotal: tot, killed: this.killed, deaths: this.deaths, hits: this.hits, hearts: this.heartsGained, shieldsUsed: this.shieldsUsed, secrets: this.secrets, secretsTotal: (this.main ? this.main.starsC.length : this.starsC.length), secretRoom: this.secretRoom, assistMax: this.assistMax, boss: this.bossKilled, hpEnd: this.p.hp, weapon: this.weapon, ammoEnd: this.ammo, ammoUsed: this.ammoUsed }; }

  /* ---------- economia: moedas → corações; estrelas → escudo ---------- */
  _bank() { this.coinBank++; this._emitHp(); }
  _heal(n, x, y, fromCoins) {
    const p = this.p; if (p.hp < ECON.maxHp) { p.hp = Math.min(ECON.maxHp, p.hp + n); this.heartsGained += n; this._text(x - 6, y - 10, fromCoins ? ECON.coinsPerHeart + ' MOEDAS = ❤ +1' : '❤ +1', '#ff9ab0'); sfx.star(); this._spark(p.x + 5, p.y + 5, '#ff7a9a', 14); }
    else { this.score += 50; this._text(x - 6, y - 10, 'VIDA CHEIA +50', '#ffe36b'); sfx.coin(); }
    this._emitHp();
  }

  /* ---------- apoio adaptativo (só nos trechos de plataforma; nunca nas perguntas) ---------- */
  _assistLevelFor(n) { return n >= 10 ? 3 : n >= 7 ? 2 : n >= 4 ? 1 : 0; }
  _setAssist(n) {
    const prev = this.assist; this.assist = n; this.assistMax = Math.max(this.assistMax, n); if (n > prev) this.assistX = this.p.x; if (n === prev) return;
    if (n >= 2 && prev < 2) this._ghostNear();
    if (n < 2) this.plats = this.plats.filter((m) => m.kind !== 'ghost');
    if (n >= 3 && prev < 3) this._assistClear();
    this.hooks.onAssist && this.hooks.onAssist(n);
  }
  _assistClear() { const x0 = this.respawn.x - 60, x1 = this.respawn.x + 420; for (const e of this.enemies) if (e.alive && e.x > x0 && e.x < x1) { e.alive = false; this._spark(e.x + 6, e.y + 6, '#ffffff', 10); } }
  _reviveEnemies() { const rx = this.respawn.x; for (const e of this.enemies) { if (e.ix === undefined || e.ix < rx - 260) continue; e.alive = true; e.x = e.ix; e.y = e.iy; e.vy = 0; e.alert = 0; e.charge = 0; e.sw = 0; e.cool = 0; e.cd = undefined; e.gx = undefined; } if (this.assist >= 3) this._assistClear(); }
  _ghostNear() { const p = this.p; const x0 = p.x - 80, x1 = p.x + 560; for (const pit of this.L.pits) if (pit.x + pit.w > x0 && pit.x < x1 && !(this.L.bossRegion && pit.x > this.L.bossRegion[0] * TS) && !this.plats.some((m) => m.kind === 'ghost' && m.x === pit.x)) this.plats.push({ kind: 'ghost', x: pit.x, y: pit.row * TS, w: pit.w, h: 6, dx: 0 }); }
  _relax() { this.segDeaths = 0; if (this.assist) this._setAssist(0); }

  /* ---------- inimigos / dano ---------- */
  _enemy(e) {
    const slow = this.assist >= 1 ? 0.65 : 1; e.t += 0.05 * (e.type === 'bat' ? slow : 1);
    const p = this.p; const dx = (p.x + p.w / 2) - (e.x + e.w / 2), dy = (p.y + p.h / 2) - (e.y + e.h / 2);
    const calm = this.assist >= 2 || p.dead > 0 || this.stations.some((s) => s.active);
    if (e.type === 'blob') {
      e.vy = Math.min(4, e.vy + PHY.grav); e.y += e.vy; const feet = e.y + e.h, cx = e.x + e.w / 2, rowF = Math.floor(feet / TS);
      if (this._solidAt(cx, feet) || tileAt(this.L, Math.floor(cx / TS), rowF) === T.PLAT) { e.y = rowF * TS - e.h; e.vy = 0; }
      if (e.hop && e.vy === 0 && ((this.frame + (e.x | 0)) % 64) === 0) e.vy = -3.3;
      if (e.shooter) {            // atirador: fica parado, mira e cospe uma bola em arco
        e.dir = dx >= 0 ? 1 : -1; if (e.cd === undefined) e.cd = 40 + ((e.x | 0) % 50);
        if (!calm && Math.abs(dx) < 230 && Math.abs(dy) < 90) { e.cd--; if (e.cd <= 0) { e.cd = 84; this.bullets.push({ x: e.x + e.w / 2 + e.dir * 8, y: e.y + 2, vx: e.dir * 2.0, vy: -1.9, g: 0.1, life: 200, col: 'spore' }); sfx.shoot && sfx.shoot(); } }
        return;
      }
      let sp = e.vx * e.dir * slow, lo = e.minX, hi = e.maxX + TS;
      if (e.aggro && !calm && !(e.alert > 0) && !(e.charge > 0) && Math.abs(dx) < 240 && Math.abs(dy) < 52) e.alert = 10;
      if (e.alert > 0) { e.alert--; e.dir = dx >= 0 ? 1 : -1; if (e.alert === 0) e.charge = 190; sp = 0; }
      else if (e.charge > 0) { e.charge--; if (calm) e.charge = 0; e.dir = dx >= 0 ? 1 : -1; sp = e.vx * 3.6 * e.dir * slow; lo -= 56; hi += 56; if (e.hop && e.vy === 0 && (e.charge % 30) === 0) e.vy = -3.0; }
      e.x += sp; const ahead = e.x + (e.dir > 0 ? e.w + 1 : -1);
      const floorAhead = this._solidAt(ahead, e.y + e.h + 2) || tileAt(this.L, Math.floor(ahead / TS), Math.floor((e.y + e.h + 2) / TS)) === T.PLAT;
      if (e.x < lo || e.x + e.w > hi || this._solidAt(ahead, e.y + e.h / 2) || (!floorAhead && e.vy === 0)) { e.dir *= -1; e.x += e.dir * 2; e.charge = 0; }
    } else {
      const bx = e.ox + Math.sin(e.t * 0.9) * (e.maxX - e.minX) / 2, by = e.baseY + Math.sin(e.t * 1.8) * 10;
      if (e.immortal) {           // fantasma imortal: persegue devagar quando você chega perto (não dá para matar)
        if (e.gx === undefined) { e.gx = bx; e.gy = by; }
        const near = !calm && Math.abs(dx) < 230 && Math.abs(dy) < 150; const tx = near ? p.x : bx, ty = near ? p.y - 6 : by, k = near ? 0.02 : 0.03;
        e.gx += (tx - e.gx) * k; e.gy += (ty - e.gy) * k; e.x = e.gx + Math.sin(e.t * 3) * 4; e.y = e.gy + Math.sin(e.t * 2.2) * 5; e.dir = dx >= 0 ? 1 : -1; return;
      }
      let ox = 0, oy = 0;
      if (e.sw > 0) { const k = Math.sin((1 - e.sw / 44) * Math.PI); ox = k * (e.tx - bx); oy = k * (e.ty - by); e.sw--; if (e.sw === 0) e.cool = 46; }
      else if (e.cool > 0) e.cool--;
      else if (e.aggro && !calm && Math.abs(dx) < 270 && dy > -20 && dy < 170) { e.sw = 44; e.tx = p.x; e.ty = p.y; e.warn = 16; }
      if (e.warn > 0) e.warn--;
      e.x = bx + ox; e.y = by + oy; e.dir = e.sw > 0 ? (dx >= 0 ? 1 : -1) : (Math.cos(e.t * 0.9) >= 0 ? 1 : -1);
      if (e.shoot) { e.cd = (e.cd === undefined ? 70 : e.cd) - 1; if (!calm && e.cd <= 0 && Math.abs(dx) < 240 && dy > -20) { e.cd = 120; const L2 = Math.hypot(dx, dy) || 1; this.bullets.push({ x: e.x + 8, y: e.y + 8, vx: dx / L2 * 1.6, vy: dy / L2 * 1.6, g: 0, life: 220, col: 'fire' }); sfx.shoot && sfx.shoot(); } }
    }
  }
  _enemyHit(e) {
    const p = this.p; if (p.dead > 0) return; const bad = e.spiked || e.immortal, feet = p.y + p.h;
    // PISÃO generoso: caindo (ou de passagem) por cima do monstro, com folga de 5px nas laterais e 12px acima da cabeça, mata (a hitbox do desenho é maior que a física)
    if (!bad && p.vy > 0.05 && p.x + p.w > e.x - 5 && p.x < e.x + e.w + 5 && feet > e.y - 12 && feet < e.y + 17) { e.alive = false; this.killed++; this.score += 50; p.vy = this.input.jump ? -4.8 : -3.4; p.jumping = true; sfx.stomp(); this._spark(e.x + e.w / 2, e.y + 4, '#ffffff', 12); this._text(e.x, e.y - 6, '+50', '#ffffff'); this.shake = 3; return; }
    if (p.inv > 0) return;
    if (p.x + p.w > e.x + 1 && p.x < e.x + e.w - 1 && feet > e.y && p.y < e.y + e.h) this._hurt();
  }
  _hurt(pit) {
    const p = this.p; if (this.god && !pit) return; if (p.dead > 0 || (p.inv > 0 && !pit)) return;
    if (!pit && p.shield > 0) { p.shield--; p.inv = 90; this.shieldsUsed++; sfx.hurt(); this._text(p.x - 4, p.y - 6, 'ESCUDO!', '#ffe36b'); this._spark(p.x + 5, p.y + 8, '#ffe36b', 16); this._emitHp(); return; }
    p.hp--; this.hits++; this.segDeaths++; this.shake = 7; sfx.hurt(); this._setAssist(this._assistLevelFor(this.segDeaths)); if (this.assist) this.assistX = p.x;
    if (pit || p.hp <= 0) { if (p.hp <= 0) { this.deaths++; p.hpReset = true; } p.dead = pit ? 38 : 50; p.vy = pit ? 0 : -3.6; p.vx = 0; p.hurtT = 0; }
    else { p.vy = -3; p.vx = -p.face * 1.6; p.inv = 100; p.squash = -6; }
    this._emitHp(); this.hooks.onHit && this.hooks.onHit(this);
  }
  _respawn() { const p = this.p; p.x = this.respawn.x; p.y = this.respawn.y; p.vx = p.vy = 0; p.inv = 100; p.on = false; p.ride = null; if (p.hpReset || p.hp <= 0) { p.hp = ECON.startHp; p.hpReset = false; this.coinBank = Math.floor(this.coinBank * 0.75); this._text(p.x - 10, p.y - 12, '❤'.repeat(ECON.startHp), '#ff9ab0'); } this._emitHp(); if (!this.inSecret) this._reviveEnemies(); if (this.inSecret) { this._exitSecret(true); return; } this.snapCam(); }

  /* ---------- fase secreta ---------- */
  _enterSecret() {
    const p = this.p; this.main = { L: this.L, coins: this.coins, starsC: this.starsC, hearts: this.hearts, enemies: this.enemies, plats: this.plats, saws: this.saws, springs: this.springs, cps: this.cps, stations: this.stations, goal: this.goal, boss: this.boss, platRuns: this.platRuns, decorIdx: this._decorIdx, secretDoor: this.secretDoor, respawn: this.respawn, px: p.x, py: p.y, orbs: this.orbs, waves: this.waves, crushers: this.crushers, turrets: this.turrets, bullets: this.bullets, chests: this.chests, winds: this.winds, fgprops: this.fgprops };
    const R = buildLevel(this.cfg.key, this.cfg.seed + 777, 0, false, true); this.roomCoins = R.coins.length; this._applyLevel(R); this.orbs = []; this.waves = []; this.inSecret = true;
    p.x = R.spawn.x; p.y = R.spawn.y; p.vx = p.vy = 0; p.inv = 60; this.respawn = { x: R.spawn.x, y: R.spawn.y }; this._relax(); this.snapCam(); sfx.star(); this.shake = 6;
    this._text(p.x - 10, p.y - 16, 'FASE SECRETA!', '#fff0a0'); setMode('play'); setIntensity(0.55); this.hooks.onSecret && this.hooks.onSecret(true);
  }
  _exitSecret(failed) {
    const m = this.main; if (!m) return; const p = this.p; const keepCoins = this.coins;
    this.L = m.L; this.coins = m.coins; this.starsC = m.starsC; this.hearts = m.hearts; this.enemies = m.enemies; this.plats = m.plats; this.saws = m.saws; this.springs = m.springs; this.cps = m.cps; this.stations = m.stations; this.goal = m.goal; this.boss = m.boss; this.platRuns = m.platRuns; this._decorIdx = m.decorIdx; this.secretDoor = m.secretDoor; this.exitDoor = null; this.respawn = m.respawn; this.orbs = m.orbs; this.waves = m.waves; this.crushers = m.crushers; this.turrets = m.turrets; this.bullets = m.bullets; this.chests = m.chests; this.winds = m.winds; this.fgprops = m.fgprops; void keepCoins;
    this.inSecret = false; this.secretUsed = true; this.secretRoom = !failed; this.main = null; p.x = m.px - 22; p.y = m.py - 4; p.vx = p.vy = 0; p.inv = 90; this.snapCam();
    if (failed) { this._text(p.x - 26, p.y - 22, 'CAIU! SAIU DO BÔNUS', '#ffb0b0'); sfx.hurt(); this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false); return; }
    this._heal(1, p.x, p.y); p.shield = Math.min(ECON.maxShield, p.shield + 1); this.score += 200; sfx.clear(); this._spark(p.x + 5, p.y, '#fff0a0', 30); this._text(p.x - 14, p.y - 22, 'BÔNUS! +200 · ESCUDO ESPECIAL', '#fff0a0'); this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false);
  }

  /* ---------- chefe (entretenimento; totalmente fora da prova) ---------- */
  _bossStep() {
    const B = this.boss; if (!B) return; if (B.dead) { if (B.dying > 0) B.dying--; return; } const p = this.p, L = this.L;
    if (!B.active) {
      if (p.x > B.x0 && p.dead === 0) {
        B.active = true; for (let r = B.gate.top; r <= B.gate.bot; r++) L.tiles[r * L.stride + B.gate.col] = T.GATE;
        this.respawn = { x: B.wallL + 20, y: (B.rowG - 2) * TS - 4 }; setMode('boss'); setIntensity(0.45); sfx.boss(); this.shake = 14;
        this.hooks.onBoss && this.hooks.onBoss({ name: B.name, hp: B.hp, max: B.max, show: true }); this._text(B.x - 20, B.y - 12, 'CHEFE!', '#ff6e6e');
      } else return;
    }
    const slow = (this.assist >= 2 ? 0.8 : 1) * (B.ph === 2 ? 1.28 : 1); const kind = this.A.th.boss; B.weak = B.st === 'recover' && B.stun === 0 && B.t > 4; const cx = B.x + B.w / 2, pcx = p.x + p.w / 2; const to = pcx < cx ? -1 : 1;
    if (B.inv > 0) B.inv--; if (B.flash > 0) B.flash--; if (B.stun > 0) { B.stun--; B.st = 'stun'; if (B.stun === 0) { B.st = 'idle'; B.t = 50; } }
    B.vy = Math.min(5, B.vy + PHY.grav); B.y += B.vy; const feet = B.y + B.h;
    if (this._solidAt(cx, feet)) { const rr = Math.floor(feet / TS); B.y = rr * TS - B.h; if (!B.on && B.st === 'leap') this._land(B); B.on = true; B.vy = 0; } else B.on = false;
    if (B.stun === 0) {
      if (B.st === 'idle') {
        B.face = to; B.t--; const sp = (kind === 'titan' ? 0.7 : kind === 'colossus' ? 0.5 : 0.35) * slow; B.x += to * sp;
        if (B.t <= 0) { B.st = 'tele'; B.t = Math.round(((kind === 'colossus' ? 40 : kind === 'titan' ? 28 : 32) + (this.assist >= 1 ? 14 : 0)) * (B.ph === 2 ? 0.78 : 1)); B.dashDir = to; if (B.ph === 2) this._rocks(B); }
      } else if (B.st === 'tele') {
        B.face = to; B.t--;
        if (B.t <= 0) {
          if (kind === 'colossus') { B.st = 'dash'; B.t = 66; B.dashDir = to; sfx.stomp(); }
          else if (kind === 'titan') { B.st = 'leap'; B.vy = -7.1; B.vx = to * 2.1 * slow; B.on = false; sfx.jump(); }
          else { this._fireOrb(B, to); if (B.ph === 2) this._fireOrb(B, to); B.st = 'recover'; B.t = B.ph === 2 ? 56 : 76; }
        }
      } else if (B.st === 'dash') { B.t--; B.x += B.dashDir * 3.9 * slow; if (B.t <= 0 || B.x < B.x0 - 30 || B.x + B.w > B.x1 + 40) { B.st = 'recover'; B.t = B.ph === 2 ? 56 : 76; this.shake = 8; sfx.stomp(); } }
      else if (B.st === 'leap') { B.x += B.vx; }
      else if (B.st === 'recover') { B.t--; if (B.t <= 0) { B.st = 'idle'; B.t = Math.round((kind === 'hydra' ? 66 : 70) * (B.ph === 2 ? 0.6 : 1) * (this.assist >= 3 ? 1.5 : 1)); } }
    }
    B.x = Math.max(B.wallL + 8, Math.min(B.x1 + 14, B.x));
    const btop = (B.weak || B.stun > 0) ? B.y + 30 : B.y;   // exausto, o chefão se agacha: a cabeça fica ao alcance do pulo (senão ficava alta demais para pisar)
    if (p.dead === 0 && p.x + p.w > B.x + 2 && p.x < B.x + B.w - 2 && p.y + p.h > btop && p.y < B.y + B.h) {
      if (p.vy > 0.5 && p.y + p.h - btop < 18) { if (B.weak && B.inv === 0) this._bossHit(B); else if (!B.weak && B.stun === 0) { p.vy = -4.4; p.jumping = true; p.bnc = 22; this.shake = 4; sfx.hurt(); this._text(B.x + 4, B.y - 6, 'BLINDADO!', '#ffd0d0'); } }
      else if (B.stun === 0 && p.inv === 0 && !(p.bnc > 0)) this._hurt();
    }
    if (p.bnc > 0) p.bnc--;
  }
  _rocks(B) { const p = this.p; const n = 2 + (B.hp <= 2 ? 1 : 0); for (let i = 0; i < n; i++) { const x = Math.max(B.wallL + 14, Math.min(B.x1 + 6, p.x + p.w / 2 + (i - (n - 1) / 2) * 34 + (Math.random() - 0.5) * 16)); this.rocks.push({ x, y: B.rowG * TS - 230, vy: 0, warn: 54 + i * 10, gY: B.rowG * TS, life: 200 }); } }
  _hazards() {
    const p = this.p, hz = this.assist >= 3;
    for (const k of this.crushers) {
      const cx = p.x + p.w / 2, kc = k.x + k.w / 2; k.t++;
      if (k.st === 0) { if (k.cool > 0) k.cool--; else if (Math.abs(cx - kc) < 22 && p.y + p.h > k.yTop + 20 && p.dead === 0) { k.st = 1; k.t = 0; } }
      else if (k.st === 1) { if (k.t > (this.assist >= 2 ? 34 : 24)) { k.st = 2; k.vy = 0; } }
      else if (k.st === 2) { k.vy = Math.min(9, k.vy + 0.9); k.y += k.vy; if (k.y >= k.yBot) { k.y = k.yBot; k.st = 3; k.t = 0; this.shake = Math.max(this.shake, 7); sfx.stomp(); this._spark(k.x + k.w / 2, k.yBot + 26, '#d8d0ff', 12); } }
      else if (k.st === 3) { if (k.t > 46) { k.st = 4; k.t = 0; } }
      else if (k.st === 4) { k.y -= 1.3; if (k.y <= k.yTop) { k.y = k.yTop; k.st = 0; k.cool = 40; } }
      if (!hz && (k.st === 2 || k.st === 3) && p.dead === 0 && p.inv === 0 && p.x + p.w > k.x + 2 && p.x < k.x + k.w - 2 && p.y + p.h > k.y + 4 && p.y < k.y + k.h) this._hurt();
    }
    for (const t of this.turrets) {
      t.t++; if (t.flash > 0) t.flash--; if (Math.abs(t.x - p.x) > 260) continue;
      if (t.t % t.per === 0 && !hz) { t.flash = 8; sfx.shoot && sfx.shoot(); this.bullets.push({ x: t.x + (t.dir < 0 ? -4 : 20), y: t.y + 9, vx: t.dir * 1.55, life: 260 }); }
    }
    for (const b of this.bullets) { b.x += b.vx; if (b.vy) { b.y += b.vy; b.vy += b.g || 0; } b.life--; if (this._solidAt(b.x, b.y)) b.life = 0; if (b.life > 0 && p.dead === 0 && p.inv === 0 && Math.abs(p.x + p.w / 2 - b.x) < 8 && Math.abs(p.y + p.h / 2 - b.y) < 12) { b.life = 0; this._hurt(); this._spark(b.x, b.y, '#ff9a4d', 8); } }
    this.bullets = this.bullets.filter((b) => b.life > 0);
  }
  _land(B) { B.st = 'recover'; B.t = B.ph === 2 ? 56 : 76; B.vx = 0; this.shake = 10; sfx.stomp(); for (const d of [-1, 1]) this.waves.push({ x: B.x + B.w / 2, y: B.rowG * TS - 8, vx: d * 2.2, life: 52, w: 10, h: 8 }); this._spark(B.x + B.w / 2, B.rowG * TS - 2, '#ffd9a0', 16); }
  _fireOrb(B, dir) { const hi = (B.hp % 2 === 0) !== (this.frame % 3 === 0); this.orbs.push({ x: B.x + B.w / 2 + dir * 14, y: hi ? B.rowG * TS - 36 : B.rowG * TS - 11, vx: dir * (1.5 + (3 - B.hp) * 0.1) * (this.assist >= 2 ? 0.8 : 1), r: 5, life: 360 }); if (B.hp <= 2) this.orbs.push({ x: B.x + B.w / 2 + dir * 14, y: hi ? B.rowG * TS - 11 : B.rowG * TS - 36, vx: dir * 1.2, r: 5, life: 360, late: 20 }); sfx.hurt(); }
  _bossHit(B, byShot) {
    const p = this.p; B.hp--; B.inv = byShot ? 55 : 80; B.stun = byShot ? 40 : 70; if (B.ph === 1 && B.hp <= Math.ceil(B.max / 2) && B.hp > 0) { B.ph = 2; this.shake = 18; sfx.boss(); this._text(B.x - 10, B.y - 22, 'FÚRIA!', '#ff4d4d'); setIntensity(0.7); } B.flash = 14; B.st = 'stun'; B.vx = 0; if (!byShot) { p.vy = -4.6; p.jumping = true; } sfx.stomp(); this.shake = 12; this._spark(B.x + B.w / 2, B.y + 8, '#ffffff', 26); this._text(B.x, B.y - 8, '-1', '#ff9e9e');
    this.hooks.onBoss && this.hooks.onBoss({ name: B.name, hp: B.hp, max: B.max, show: true });
    if (B.hp <= 0) {
      B.dead = true; B.dying = 90; this.bossKilled = true; this.score += 500; sfx.clear(); this.shake = 20; this._spark(B.x + B.w / 2, B.y + 20, '#ffd23f', 90); this._spark(B.x + B.w / 2, B.y + 20, '#ff6e6e', 50);
      for (let i = 0; i < 14; i++) this.coins.push({ x: B.x + B.w / 2 + (Math.random() - 0.5) * 80, y: B.y - Math.random() * 40, got: false, ph: Math.random() * 8 }); this.hearts.push({ x: B.x + B.w / 2 - 6, y: B.y, got: false });
      for (let r = B.gate.top; r <= B.gate.bot; r++) this.L.tiles[r * this.L.stride + B.gate.col] = T.EMPTY; this.goal.enabled = true; setMode('play'); setIntensity(0.25);
      this.weapon = true; this.ammo = Math.min(ECON.maxAmmo, this.ammo + ECON.shotsPerBoss); this._emitAmmo(); this._text(B.x - 40, B.y - 36, 'ORBE DE LUZ: +' + ECON.shotsPerBoss + ' tiros (sem recarga)', '#fff6b0');
      this._text(B.x - 20, B.y - 20, 'CHEFE DERROTADO!', '#ffe36b'); this.hooks.onBoss && this.hooks.onBoss({ name: B.name, hp: 0, max: B.max, show: false });
    }
  }
  _orbsWaves() {
    const p = this.p;
    for (const o of this.orbs) { if (o.late > 0) { o.late--; continue; } o.x += o.vx; o.life--; if (p.dead === 0 && p.inv === 0 && Math.abs(p.x + p.w / 2 - o.x) < o.r + 4 && Math.abs(p.y + p.h / 2 - o.y) < o.r + 9) { this._hurt(); o.life = 0; this._spark(o.x, o.y, '#7dffa3', 10); } if (this._solidAt(o.x, o.y)) o.life = 0; }
    this.orbs = this.orbs.filter((o) => o.life > 0);
    for (const r of this.rocks) { if (r.warn > 0) { r.warn--; continue; } r.vy = Math.min(5.4, r.vy + 0.32); r.y += r.vy; r.life--; if (p.dead === 0 && p.inv === 0 && Math.abs(p.x + p.w / 2 - r.x) < 11 && p.y < r.y + 6 && p.y + p.h > r.y - 12) { this._hurt(); r.life = 0; } if (r.y >= r.gY - 6) { r.life = 0; this.shake = Math.max(this.shake, 5); sfx.stomp(); this._spark(r.x, r.gY - 3, '#d8c8ff', 8); } }
    this.rocks = this.rocks.filter((r) => r.life > 0);
    for (const w of this.waves) { w.x += w.vx; w.life--; if (p.dead === 0 && p.inv === 0 && p.on && Math.abs(p.x + p.w / 2 - w.x) < w.w / 2 + 4 && p.y + p.h > w.y) { this._hurt(); w.life = 0; } if (this._solidAt(w.x, w.y)) w.life = 0; }
    this.waves = this.waves.filter((w) => w.life > 0);
  }

  /* ---------- "casos" embutidos no jogo: 4 formas de responder ---------- */
  _station(s) {
    const p = this.p; const cx = p.x + p.w / 2; const inside = !s.locked && cx > s.x0 && cx < s.x1 + 2;
    if (inside && !s.active) { s.active = true; s.visits++; s.enterF = this.frame; setMode('calm'); this.hooks.onStationEnter && this.hooks.onStationEnter(s, this); }
    else if (!inside && s.active) { s.active = false; setMode('play'); this.hooks.onStationExit && this.hooks.onStationExit(s, this); }
    if (s.active) { let nb = -1, bd = 30; for (const d of s.opts) { const dd = Math.abs(cx - (d.x + d.w / 2)); if (dd < bd) { bd = dd; nb = d.i; } } if (nb !== s.near) { s.near = nb; this.hooks.onNear && this.hooks.onNear(nb); } }
    else if (s.near >= 0) { s.near = -1; this.hooks.onNear && this.hooks.onNear(-1); }
    if (s.active) {
      s.rd = s.rd || [0, 0, 0, 0]; s.rev = s.rev || [false, false, false, true]; s.readF = (s.readF || 0) + 1;
      if (this.bot) { s.typed = true; s.rev = [true, true, true, true]; s.readF = 1e9; }
      if (this.frame % 6 === 0 && this.hooks.onReadTick) this.hooks.onReadTick(s, Math.min(1, s.readF / (s.readNeed || 1)));
      if (s.near >= 0 && !s.rev[s.near] && s.typed) { s.rd[s.near]++; if (s.rd[s.near] >= 36) this.reveal(s, s.near); }
      else if (s.near >= 0 && s.rev[s.near]) s.rd[s.near]++;
      if (!s.ready && s.typed && s.rev.every(Boolean) && s.readF >= (s.readNeed || 0)) { s.ready = true; sfx.check(); if (!s.practice) { for (let k = 0; k < 6; k++) this._bank(); this._text(this.p.x - 16, this.p.y - 22, 'OUVIU TUDO! +6 MOEDAS', '#fff0a0'); } this.hooks.onReady && this.hooks.onReady(s, this); }
      s.dwellF++;
      const still = p.on && Math.abs(p.vx) < 0.35 && p.dead === 0;
      if (still && Math.abs(cx - s.pad.x) < 10) { s.padF++; if (s.padF === 22 && this.frame - s.lastSpeak > 90) { s.lastSpeak = this.frame; this.hooks.onSpeak && this.hooks.onSpeak(s, this, 'pad'); } } else s.padF = 0;
      let sel = -1;
      if (s.type === 'ped' || s.type === 'door') {          // ficar PARADO sobre o bloco / dentro da porta
        let onO = -1; if (p.on && p.dead === 0) for (const d of s.opts) { if (s.type === 'ped' ? (Math.abs(p.y + p.h - d.y) <= 1.5 && cx > d.x + 3 && cx < d.x + d.w - 3) : (cx > d.x + 4 && cx < d.x + d.w - 4 && p.y + p.h >= d.y + d.h - 3)) onO = d.i; }
        if (onO >= 0 && still) { if (s.arm && s.arm.ped === onO) s.arm.f++; else s.arm = { ped: onO, f: 1 }; if (s.arm.f >= 36) sel = onO; } else if (s.arm) { s.arm.f = Math.max(0, s.arm.f - 3); if (s.arm.f === 0) s.arm = null; }
      } else if (s.type === 'bump') {                       // bater com a cabeça por baixo (estilo bloco de interrogação)
        if (p.vy < 0 && p.dead === 0) for (const d of s.opts) if (cx > d.x - 2 && cx < d.x + d.w + 2 && p.y < d.y + d.h && p.y > d.y - 8) { sel = d.i; d.bump = 10; p.vy = 1.2; this._spark(d.x + 16, d.y + 14, OPT_COLORS[d.i].main, 8); break; }
      } else if (s.type === 'mimic') {                      // pisar no monstrinho da resposta (inofensivo)
        if (p.vy > 0.4 && p.dead === 0) for (const d of s.opts) if (cx > d.x - 3 && cx < d.x + d.w + 3 && p.y + p.h > d.y - 2 && p.y + p.h < d.y + 12 && (this._pb || 0) <= d.y + 4) { sel = d.i; d.squash = 14; p.vy = -3.8; p.jumping = true; this._spark(d.x + 10, d.y + 4, OPT_COLORS[d.i].main, 10); break; }
      }
      this._optAnim(s);
      if (s.type === 'barrel') {                            // pisar no barril (só depois que ele pousou)
        if (p.vy > 0.4 && p.dead === 0) for (const d of s.opts) { const bx = d.x + (d.roll || 0), by = d.y + d.yoff; if (d.landed && cx > bx - 3 && cx < bx + d.w + 3 && p.y + p.h > by - 2 && p.y + p.h < by + 12 && (this._pb || 0) <= by + 4) { sel = d.i; d.squash = 14; p.vy = -3.8; p.jumping = true; this._spark(bx + 12, by + 2, OPT_COLORS[d.i].main, 10); break; } }
      } else if (s.type === 'balloon') {                    // encostar no balão (precisa pular)
        if (!p.on && p.dead === 0) for (const d of s.opts) { if (d.pop > 0) continue; const bx = d.fx, by = d.fy; if (p.x + p.w > bx + 2 && p.x < bx + d.w - 2 && p.y < by + d.h && p.y + p.h > by + 4) { sel = d.i; d.pop = 38; for (let k = 0; k < 16; k++) this.parts.push({ x: bx + 10, y: by + 12, vx: (Math.random() - 0.5) * 3.2, vy: -Math.random() * 2.6, life: 34, col: ['#fff', OPT_COLORS[d.i].main, '#ffd23f', '#ff7be8'][k % 4], r: 1.4, g: 0.09, add: true }); break; } }
      }
      for (const d of s.opts) { if (d.bump > 0) d.bump--; if (d.squash > 0) d.squash--; if (d.pop > 0) d.pop--; }
      if (sel >= 0 && !s.ready) { if (this.frame - (s.nagF || -999) > 70) { s.nagF = this.frame; this.hooks.onNag && this.hooks.onNag(s, this); sfx.empty && sfx.empty(); } sel = -1; }
      if (sel >= 0 && sel !== s.selected) {
        if (s.selected >= 0) s.changes++; else s.tFirstF = s.dwellF;
        s.selected = sel; s.choices.push({ ped: sel, f: s.dwellF }); sfx.press();
        for (let i = 0; i < 8; i++) this.parts.push({ x: s.opts[sel].x + s.opts[sel].w / 2 + (Math.random() - 0.5) * 20, y: s.opts[sel].y, vx: (Math.random() - 0.5) * 0.9, vy: -0.6 - Math.random() * 0.9, life: 26, col: '#ffffff', r: 1.2, add: true });
        this.hooks.onSelect && this.hooks.onSelect(s, sel, this);
      }
      if (s.selected >= 0 && !s.gateOpen) { s.gateOpen = true; for (let r = s.gateTop; r <= s.gateBot; r++) this.L.tiles[r * this.L.stride + s.gc] = T.EMPTY; sfx.gate(); }
    }
    if (s.gateOpen && !s.locked && p.x > s.lockX) {
      s.locked = true; s.active = false; for (let r = s.gateTop; r <= s.gateBot; r++) this.L.tiles[r * this.L.stride + s.gc] = T.GATE;
      this.respawn = { x: s.lockX + 14, y: (s.rowG - 2) * TS - 4 };   // nunca voltar para antes de um portão já trancado
      setMode('play'); this._relax(); this.hooks.onStationExit && this.hooks.onStationExit(s, this); this.hooks.onStationLock && this.hooks.onStationLock(s, this); sfx.check();
    }
  }

  reveal(s, i) { if (!s.rev) s.rev = [false, false, false, true]; if (s.rev[i]) return; s.rev[i] = true; sfx.blip && sfx.blip(); this.hooks.onReveal && this.hooks.onReveal(s, i, this); }
  _optAnim(s) {
    const f = s.dwellF;
    if (s.type === 'barrel') {
      if (!s.dropStarted) { s.dropStarted = true; s.opts.forEach((d, i) => { d.dropT = -i * 16; d.yoff = -170; d.vy = 0; d.landed = false; d.bounces = 0; d.roll = 0; d.rot = 0; }); }
      for (const d of s.opts) {
        d.dropT++; if (d.dropT < 0) continue;
        if (!d.landed) { d.vy += 0.38; d.yoff += d.vy; d.rot += 0.12; if (d.yoff >= 0) { d.yoff = 0; if (d.bounces < 2) { d.vy = -d.vy * 0.42; d.bounces++; sfx.tick(); } else { d.landed = true; d.vy = 0; d.rot = 0; } } }
        else { d.roll = Math.sin((f + d.i * 40) / 38) * 9; d.rot = (d.roll - (d.rollPrev || 0)) * 0.12 + (d.rot || 0) * 0.9; d.rollPrev = d.roll; }
      }
    } else if (s.type === 'balloon') {
      for (const d of s.opts) { d.fx = d.x + Math.sin((this.frame + d.i * 45) / 52) * 7; d.fy = d.y + Math.sin((this.frame + d.i * 30) / 34) * 6; }
    }
  }

  /* ---------- música adaptativa ---------- */
  _music() {
    if (this.stations.some((s) => s.active)) { setMode('calm'); return; }
    if (this.boss && this.boss.active && !this.boss.dead) { setMode('boss'); setIntensity(0.45 + 0.55 * (1 - this.boss.hp / this.boss.max)); return; }
    const p = this.p; let near = 0; for (const e of this.enemies) if (e.alive && Math.abs(e.x - p.x) < 110 && Math.abs(e.y - p.y) < 70) near++; for (const s of this.saws) if (Math.abs(s.cx - p.x) < 90) near++;
    const pit = this.L.pits.some((q) => Math.abs(q.x - p.x) < 60) ? 0.1 : 0; const base = 0.12 + 0.1 * ({ train: 0, s1: 1, s2: 2, s3: 3 }[this.cfg.key]);
    setMode('play'); setIntensity(Math.min(1, base + Math.min(0.4, near * 0.14) + Math.min(0.3, this.segDeaths * 0.08) + pit + (p.hp <= 1 ? 0.15 : 0)));
  }

  /* ---------- câmera / partículas ---------- */
  _camera() {
    const p = this.p, L = this.L; const pt = this.portrait; let tx = p.x + p.w / 2 - this.W * (pt ? 0.5 : 0.42) + (pt ? 0 : p.face * 20), ty = p.y + p.h / 2 - this.H * (pt ? 0.74 : 0.64);
    const act = this.stations.find((s) => s.active); if (act) { const o0 = act.opts[0], o3 = act.opts[act.opts.length - 1]; tx = (o0.x + o3.x + o3.w) / 2 - this.W / 2; ty = (act.rowG * TS) - this.H * (pt ? 0.84 : 0.93); }
    const B = this.boss; if (B && B.active && !B.dead) { const mid = (p.x + B.x + B.w / 2) / 2; tx = Math.max(B.wallL - 10, Math.min(B.x1 + 24 - this.W, mid - this.W / 2)); ty = B.rowG * TS - this.H * (pt ? 0.8 : 0.78); }
    tx = Math.max(0, Math.min(L.cols * TS - this.W, tx)); ty = pt ? Math.max(-this.H, Math.min(ROWS * TS - this.H * 0.6, ty)) : Math.max(0, Math.min(ROWS * TS - this.H, ty));
    this.cam.x += (tx - this.cam.x) * 0.11; this.cam.y += (ty - this.cam.y) * 0.1; if (this.shake > 0) this.shake--;
  }
  _dust(x, y, n) { for (let i = 0; i < n; i++) this.parts.push({ x, y: y - 1, vx: (Math.random() - 0.5) * 1.4, vy: -Math.random() * 0.6, life: 16, col: 'rgba(255,255,255,.6)', r: 1.6 }); }
  _spark(x, y, col, n) { for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3.2, life: 26 + Math.random() * 18, col, r: 0.9 + Math.random() * 1.6, g: 0.1, add: true }); }
  _text(x, y, str, col) { this.texts.push({ x, y, str, col, life: 62 }); }
  _fx() { for (const q of this.parts) { q.x += q.vx; q.y += q.vy; q.vy += q.g || 0; q.life--; } this.parts = this.parts.filter((q) => q.life > 0); for (const t of this.texts) { t.y -= 0.4; t.life--; } this.texts = this.texts.filter((t) => t.life > 0); }

  /* ======================= DESENHO ======================= */
  render() {
    const x = this.ctx, A = this.A; if (!A || !this.L) return; const S = this.S, W = this.W, H = this.H, th = A.th, cam = this.cam, f = this.frame;
    x.setTransform(S, 0, 0, S, 0, 0); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const sh = this.shake > 0 ? ((f % 2) ? 1 : -1) * Math.min(2.5, this.shake / 2) : 0; const camX = cam.x + sh, camY = cam.y;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.sky[0]); g.addColorStop(0.55, th.sky[1]); g.addColorStop(1, th.sky[2]); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const vy = this.portrait ? 0 : -(cam.y / Math.max(1, ROWS * TS - H)) * 46;
    this._skyExtras(x, th, W, H, f, cam);
    const bg = A.bg; const bk = Math.max(1, (H - vy) / bg.H); const bw = bg.W * bk; const lay = (img, k) => { const ox = -((camX * k) % bw); for (let xx = ox; xx < W; xx += bw) x.drawImage(img, xx, vy, bw, bg.H * bk); };
    lay(bg.far, 0.1); lay(bg.mid, 0.25); if (bg.mist) lay(bg.mist, 0.34); this._bgDynamic(x, th, W, H, f, cam, vy); lay(bg.near, 0.45);
    if (this.inSecret) { x.fillStyle = 'rgba(255,220,120,.10)'; x.fillRect(0, 0, W, H); }
    x.save(); x.translate(-camX, -camY); this._world(x, camX, camY); x.restore();
    if (this.fgprops && this.fgprops.length && !this.inSecret) this._fgprops(x, camX, camY, f);
    if (th.ice && !this.inSecret && f < 300) { x.save(); x.globalAlpha = Math.min(1, (300 - f) / 60); x.font = '700 11px "Lilita One", system-ui'; x.textAlign = 'center'; x.lineWidth = 3; x.strokeStyle = 'rgba(10,20,60,.8)'; x.fillStyle = '#d8f8ff'; x.strokeText('❄ CHÃO DE GELO: ESCORREGA! ❄', W / 2, H * 0.3); x.fillText('❄ CHÃO DE GELO: ESCORREGA! ❄', W / 2, H * 0.3); x.restore(); }
    if (A.fgt && !this.inSecret) { const fw = 640; const ox = -(((camX * 1.12) % fw) + fw) % fw; const ty = Math.max(-2, -this.cam.y * 0.3 - 2); for (let xx = ox; xx < W; xx += fw) x.drawImage(A.fgt, xx, ty, fw, 46); }
    if (A.fg && !this.stations.some((st) => st.active) && !(this.boss && this.boss.active)) { const fw = 640; const ox = -(((camX * 1.35) % fw) + fw) % fw; for (let xx = ox; xx < W; xx += fw) x.drawImage(A.fg, xx, H - 34, fw, 34); }
    { const by = ROWS * TS - camY; if (by < H) { x.fillStyle = th.abyss; x.fillRect(0, Math.max(0, by - 0.5), W, H); } }
    if (this.exitT > 24) { const k = Math.min(1, (this.exitT - 24) / 32), d = this.goal, sx = d.x + d.w / 2 - cam.x, sy = d.y + d.h / 2 - cam.y, rad = (1 - k) * Math.hypot(W, H); x.save(); x.fillStyle = '#05030f'; x.beginPath(); x.rect(0, 0, W, H); x.moveTo(sx + rad, sy); x.arc(sx, sy, Math.max(0.01, rad), 0, 6.2832, true); x.fill('evenodd'); x.restore(); }
    const fg = x.createLinearGradient(0, H - 52, 0, H); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, th.abyss); x.globalAlpha = 0.85; x.fillStyle = fg; x.fillRect(0, H - 52, W, 52); x.globalAlpha = 1;
    for (const m of this.motes) {
      const mx = ((m.x - cam.x * 0.3 + Math.sin(f / 90 + m.p) * 8) % (W + 20) + W + 20) % (W + 20) - 10, my = (m.y + Math.sin(f / 70 + m.p) * 6 + f * m.s * 0.12) % H, tw = 0.5 + 0.5 * Math.sin(f / 20 + m.p);
      if (th.key === 's1') x.fillStyle = `rgba(160,240,255,${0.25 + 0.5 * tw})`; else if (th.key === 's3') x.fillStyle = `rgba(255,240,120,${0.2 + 0.7 * tw})`; else if (th.key === 's2') x.fillStyle = 'rgba(255,230,180,.35)'; else x.fillStyle = 'rgba(255,255,255,.22)';
      x.beginPath(); x.arc(mx, my, m.r * (th.key === 's3' ? 1.2 : 0.8), 0, 6.3); x.fill();
    }
  }
  _bgDynamic(x, th, W, H, f, cam, vy) {
    const wrap = (v, m) => ((v % m) + m) % m;
    if (th.key === 'train') { for (let i = 0; i < 5; i++) { const px = wrap(f * 0.35 + i * 140 - cam.x * 0.06, W + 80) - 40, py = 30 + (i * 23) % 60 + Math.sin(f / 30 + i) * 5 + vy * 0.3, fl = Math.sin(f / 5 + i * 2) * 3; x.strokeStyle = 'rgba(40,50,90,.7)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(px - 6, py + fl); x.quadraticCurveTo(px - 3, py - 3, px, py); x.quadraticCurveTo(px + 3, py - 3, px + 6, py + fl); x.stroke(); } }
    else if (th.key === 's1') { for (let i = 0; i < 6; i++) { const px = wrap(i * 97 - cam.x * 0.18 + Math.sin(f / 90 + i) * 6, W + 60) - 30, py = 36 + (i * 31) % 90 + Math.sin(f / 40 + i * 1.7) * 7 + vy * 0.5; this._glow(x, px, py, 16, 'rgba(160,140,255,.5)', 0.8); x.fillStyle = 'rgba(200,185,255,.85)'; x.beginPath(); x.moveTo(px, py - 6); x.lineTo(px + 3, py); x.lineTo(px, py + 6); x.lineTo(px - 3, py); x.fill(); } }
    else if (th.key === 's2') { for (let i = 0; i < 3; i++) { const px = wrap(f * 0.25 + i * 170 - cam.x * 0.07, W + 80) - 40, py = 44 + i * 22 + Math.sin(f / 50 + i) * 4 + vy * 0.3, fl = Math.sin(f / 9 + i) * 3.5; x.strokeStyle = 'rgba(60,20,50,.7)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(px - 9, py + fl); x.quadraticCurveTo(px - 4, py - 4, px, py); x.quadraticCurveTo(px + 4, py - 4, px + 9, py + fl); x.stroke(); } }
    else { for (let i = 0; i < 7; i++) { const px = wrap(i * 83 - cam.x * 0.5, W + 40) - 20; const sw = Math.sin(f / 45 + i) * 4; x.strokeStyle = 'rgba(30,180,110,.55)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(px, -2); x.quadraticCurveTo(px + sw, 22 + (i % 3) * 8, px + sw * 1.6, 44 + (i % 3) * 16); x.stroke(); this._glow(x, px + sw * 1.6, 44 + (i % 3) * 16, 8, 'rgba(120,255,170,.8)', 0.9); } }
  }
  _glow(x, cx, cy, r, col, a = 1) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = a; x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); x.restore(); }
  _skyExtras(x, th, W, H, f, cam) {
    if (th.key === 'train') { this._glow(x, W * 0.78, 36, 90, 'rgba(255,240,170,.9)', 0.9); x.fillStyle = '#fffbe0'; x.beginPath(); x.arc(W * 0.78, 36, 15, 0, 6.3); x.fill(); }
    else if (th.key === 's1') { this._glow(x, W * 0.25, 60, 130, 'rgba(255,90,220,.5)', 0.7); this._glow(x, W * 0.8, 90, 150, 'rgba(60,200,255,.45)', 0.7); }
    else if (th.key === 's2') { const sx = W * 0.66, sy = H * 0.5; this._glow(x, sx, sy, 160, 'rgba(255,200,120,.95)', 0.95); x.fillStyle = '#fff3d4'; x.beginPath(); x.arc(sx, sy, 28, 0, 6.3); x.fill(); x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc(sx - 6, sy - 6, 18, 0, 6.3); x.fill(); }
    else { this._glow(x, W * 0.75, 40, 120, 'rgba(160,255,200,.6)', 0.8); x.fillStyle = '#e8fff4'; x.beginPath(); x.arc(W * 0.75, 40, 11, 0, 6.3); x.fill(); }
    for (const s of this.A.bg.stars) { const a = 0.4 + 0.6 * Math.abs(Math.sin(f / 40 + s.t)); x.fillStyle = `rgba(255,255,255,${a})`; x.fillRect(((s.x - cam.x * 0.03) % W + W) % W, s.y - (cam.y * 0.02), s.s, s.s); }
    if (!th.night) for (const c of this.clouds) this._cloud(x, ((c.x - cam.x * c.s * 0.6 + f * c.s * 0.1) % (W + 120) + W + 120) % (W + 120) - 60, c.y, c.w, th);
    if (th.night) { x.save(); x.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { const px = ((k * 190 - cam.x * 0.12 + f * 0.05) % (W + 200) + W + 200) % (W + 200) - 100; const gg = x.createLinearGradient(px, 0, px + 60, H); gg.addColorStop(0, th.key === 's1' ? 'rgba(120,150,255,.16)' : 'rgba(120,255,190,.12)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + 38, 0); x.lineTo(px + 120, H); x.lineTo(px + 40, H); x.fill(); } x.restore(); }
  }
  _cloud(x, px, py, w, th) { x.fillStyle = th.key === 's2' ? 'rgba(255,214,190,.8)' : 'rgba(255,255,255,.92)'; x.beginPath(); x.ellipse(px + w * 0.5, py + 8, w * 0.5, 8, 0, 0, 6.3); x.ellipse(px + w * 0.35, py + 4, w * 0.22, 9, 0, 0, 6.3); x.ellipse(px + w * 0.62, py + 2, w * 0.25, 10, 0, 0, 6.3); x.fill(); x.fillStyle = th.key === 's2' ? 'rgba(220,130,130,.5)' : 'rgba(170,200,235,.55)'; x.beginPath(); x.ellipse(px + w * 0.5, py + 14, w * 0.46, 3.5, 0, 0, 6.3); x.fill(); }

  _world(x, camX, camY) {
    const A = this.A, L = this.L, p = this.p, f = this.frame, W = this.W, H = this.H, tex = A.tex;
    const c0 = Math.max(0, Math.floor(camX / TS) - 1), c1 = Math.min(L.cols, Math.ceil((camX + W) / TS) + 1), r0 = Math.max(0, Math.floor(camY / TS) - 1), r1 = Math.min(ROWS, Math.ceil((camY + H) / TS) + 1);
    const vis = (px, w) => px + w > camX - 30 && px < camX + W + 30;
    L.decor.forEach((d, i) => { const sp = this._decorIdx[i]; if (!sp) return; const px = d.col * TS + 8 - sp.w / 2; if (vis(px, sp.w)) x.drawImage(sp.img, px, d.row * TS - sp.h + 1.5, sp.w, sp.h); });
    { const LQ = { train: ['#37b0ff', '#0b5fc0', '#c9efff'], s1: ['#9a66ff', '#3a1fb0', '#a8f6ff'], s2: ['#ff9a36', '#c4281a', '#ffe6a8'], s3: ['#74ff9a', '#0e8a4a', '#eaffb8'] }[A.th.key]; const ly = (ROWS - 3) * TS - 2;
      for (const pit of L.pits) { if (!vis(pit.x, pit.w)) continue; const g = x.createLinearGradient(0, ly, 0, ly + 50); g.addColorStop(0, LQ[0]); g.addColorStop(1, LQ[1]); this._glow(x, pit.x + pit.w / 2, ly, Math.max(26, pit.w * 0.7), LQ[0], 0.35); x.fillStyle = g; x.beginPath(); x.moveTo(pit.x - 1, ly + 60); x.lineTo(pit.x - 1, ly); for (let xx = 0; xx <= pit.w + 2; xx += 3) x.lineTo(pit.x - 1 + xx, ly + Math.sin((xx + f * 1.6) / 5) * 1.6); x.lineTo(pit.x + pit.w + 1, ly + 60); x.closePath(); x.fill(); x.strokeStyle = LQ[2]; x.lineWidth = 1.1; x.globalAlpha = 0.8; x.beginPath(); for (let xx = 0; xx <= pit.w + 2; xx += 3) { const yy = ly + Math.sin((xx + f * 1.6) / 5) * 1.6; if (xx === 0) x.moveTo(pit.x - 1, yy); else x.lineTo(pit.x - 1 + xx, yy); } x.stroke(); x.globalAlpha = 1; for (let b = 0; b < Math.max(2, pit.w / 14); b++) { const bx = pit.x + ((b * 37 + 11) % Math.max(8, pit.w)), t2 = ((f * 0.9 + b * 29) % 50) / 50; x.fillStyle = LQ[2]; x.globalAlpha = (1 - t2) * 0.8; x.beginPath(); x.arc(bx, ly + 8 - t2 * 22, 1 + (b % 2), 0, 6.3); x.fill(); x.globalAlpha = 1; } } }
    for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {
      const t = L.tiles[r * L.stride + c]; if (!t) continue; const px = c * TS, py = r * TS; const hs = ((c * 73856093) ^ (r * 19349663)) >>> 0;
      if (t === T.TOP || t === T.FILL) {
        const lt = tileAt(L, c - 1, r), rt = tileAt(L, c + 1, r); const fl = (isSolid(lt) && lt !== T.GATE && lt !== T.BLOCK ? 0 : 1) | (isSolid(rt) && rt !== T.GATE && rt !== T.BLOCK ? 0 : 2);
        x.drawImage((t === T.TOP && !(r > 0 && isSolid(tileAt(L, c, r - 1))) ? tex.top : tex.fill)[fl][hs & 1], px - 0.2, py - 0.2, TS + 0.4, TS + 0.4);
      } else if (t === T.BRICK || t === T.WALL) x.drawImage(tex.brick, px, py, TS + 0.2, TS + 0.2);
      else if (t === T.SPIKE) x.drawImage(tex.spike, px, py, TS, TS);
    }
    for (const pr of this.platRuns) if (vis(pr.x, pr.w)) { this._under(x, pr, A.th); this._slab(x, tex.plat, pr.x, pr.y, pr.w, 8); }
    for (const s of this.stations) if (vis(s.x0 - 40, 480)) this._stationDraw(x, s, f);
    for (const c of this.cps) if (vis(c.x, 20)) this._flag(x, c, f);
    if (this.secretDoor && vis(this.secretDoor.x, 20)) this._secretDoor(x, this.secretDoor, f, this.secretUsed);
    if (this.exitDoor && vis(this.exitDoor.x, 20)) this._secretDoor(x, this.exitDoor, f, false, true);
    for (const m of this.plats) {
      if (m.kind === 'ghost') { if (vis(m.x, m.w)) { x.save(); x.globalAlpha = 0.42 + 0.2 * Math.sin(f / 10); x.fillStyle = '#9ff5ff'; x.fillRect(m.x, m.y, m.w, 3); x.globalAlpha = 0.18; x.fillRect(m.x, m.y + 3, m.w, 6); x.restore(); this._glow(x, m.x + m.w / 2, m.y + 2, Math.max(20, m.w * 0.5), 'rgba(120,240,255,.5)', 0.6); } continue; }
      if (m.kind === 'blink') { if (!vis(m.x, m.w)) continue; x.save(); x.globalAlpha = m.vis ? (m.warn ? 0.45 + 0.45 * Math.sin(f * 1.3) : 1) : 0.14; this._slab(x, tex.plat, m.x, m.y, m.w, 8); if (!m.vis) { x.strokeStyle = 'rgba(255,255,255,.5)'; x.setLineDash([2, 2]); x.strokeRect(m.x + 0.5, m.y + 0.5, m.w - 1, 7); } x.restore(); continue; }
      if (m.kind === 'crumble') { if (m.state === 3 || !vis(m.x, m.w)) continue; const shk = m.state === 1 ? Math.sin(f * 1.8) * 1 : 0; x.save(); x.globalAlpha = m.state === 2 ? Math.max(0, 1 - (m.y - m.y0) / 120) : 1; this._slab(x, tex.plat, m.x + shk, m.y, m.w, 8); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(m.x + m.w * 0.3 + shk, m.y + 1, 1, 4); x.fillRect(m.x + m.w * 0.62 + shk, m.y + 2, 1, 5); x.restore(); continue; }
      if (vis(m.x, m.w)) { this._slab(x, tex.plat, m.x, m.y, m.w, 9); this._glow(x, m.x + m.w / 2, m.y + 7, m.w * 0.55, A.th.accent, 0.25); }
    }
    for (const sp of this.springs) if (vis(sp.x, 16)) this._spring(x, sp, f);
    const g = this.goal; if (vis(g.x - 60, 220) && g.w > 0 && !this.inSecret) this._exitWall(x, g, f);
    for (const k of this.chests) if (vis(k.x, 20)) this._chest(x, k, f);
    for (const w of this.winds) if (vis(w.x, w.w)) this._wind(x, w, f);
    for (const c of this.coins) if (!c.got && c.gem && vis(c.x, 14)) this._gem(x, c, f);
    for (const c of this.coins) if (!c.got && !c.gem && vis(c.x, 14)) { const fr = ((f >> 2) + (c.ph | 0)) & 7; const s = this.G && this.G.coin; if (s) { this._glow(x, c.x + 6, c.y + 6, 12, 'rgba(255,210,60,.35)', 0.6); x.drawImage(s.img, fr * s.cw, 0, s.cw, s.ch, c.x - 1, c.y - 1 + Math.sin(f / 14 + c.ph) * 1.5, 14, 14 * s.ch / s.cw); } }
    for (const h of this.hearts) if (!h.got && vis(h.x, 16)) this._heart(x, h.x + 6, h.y + 6 + Math.sin(f / 12) * 1.5, 7, f);
    for (const s0 of this.starsC) if (!s0.got && vis(s0.x, 20)) { const s = this.G && this.G.star; if (s) { this._glow(x, s0.x + 8, s0.y + 8, 24, 'rgba(255,230,120,.7)', 0.9); x.drawImage(s.img, (((f >> 3) & 7) * s.cw), 0, s.cw, s.ch, s0.x - 3, s0.y - 3 + Math.sin(f / 12) * 2, 22, 22 * s.ch / s.cw); } }
    for (const sw of this.saws) if (vis(sw.cx - 10, 20)) this._saw(x, sw, f);
    for (const k of this.crushers) if (vis(k.x - 4, 40)) this._crusher(x, k, f);
    for (const t of this.turrets) if (vis(t.x - 4, 30)) this._cannon(x, t, f);
    for (const b of this.bullets) { const sp = b.col === 'spore'; this._glow(x, b.x, b.y, 11, sp ? 'rgba(255,90,230,.75)' : 'rgba(255,140,60,.7)', 0.85); x.fillStyle = sp ? '#ffd0f6' : '#ffd09a'; x.beginPath(); x.arc(b.x, b.y, 3.8, 0, 6.3); x.fill(); x.fillStyle = sp ? '#ff4fd8' : '#ff5a2e'; x.beginPath(); x.arc(b.x, b.y, 2.3, 0, 6.3); x.fill(); }
    for (const e of this.enemies) if (e.alive && vis(e.x, 30)) {
      const sheet = 'en_' + e.kind, hh = ESIZE[e.kind] || 24, fr = (f >> 4) & 1; const bob = e.type === 'bat' ? 0 : Math.abs(Math.sin(f / 7 + e.x)) * -0.8;
      if (e.type === 'blob') { x.fillStyle = 'rgba(0,0,0,.22)'; x.beginPath(); x.ellipse(e.x + e.w / 2, e.y + e.h + 0.5, 8, 2, 0, 0, 6.3); x.fill(); }
      if (e.kind === 'spore' || e.kind === 'wraith' || e.kind === 'wisp') this._glow(x, e.x + e.w / 2, e.y + e.h / 2, 18, e.kind === 'spore' ? 'rgba(255,80,220,.35)' : e.kind === 'wisp' ? 'rgba(80,255,150,.4)' : 'rgba(100,230,255,.35)', 0.7);
      if (e.immortal) { this._glow(x, e.x + e.w / 2, e.y + e.h / 2, 34, 'rgba(255,40,90,.6)', 0.55 + 0.25 * Math.sin(f / 6)); }
      drawFoot(x, sheet, e.type === 'bat' ? (f >> 3) & 1 : fr, e.x + e.w / 2, e.y + e.h + (e.type === 'bat' ? hh * 0.3 : 3) + bob, hh, e.dir < 0);
      if (e.spiked) this._spikes(x, e, f);
      if (e.alert > 0 || e.warn > 0) { x.save(); x.fillStyle = '#ff3b4a'; x.strokeStyle = '#fff'; x.lineWidth = 1.4; x.font = '700 14px "Lilita One", system-ui'; x.textAlign = 'center'; x.strokeText('!', e.x + e.w / 2, e.y - 6 - Math.sin(f / 2) * 1.5); x.fillText('!', e.x + e.w / 2, e.y - 6 - Math.sin(f / 2) * 1.5); this._glow(x, e.x + e.w / 2, e.y + e.h / 2, 22, 'rgba(255,60,70,.6)', 0.7); x.restore(); }
      if (e.shooter && e.cd < 26 && e.cd >= 0) this._glow(x, e.x + e.w / 2 + e.dir * 8, e.y + 3, 20, 'rgba(255,90,230,.8)', 0.9);
      if (e.shoot && e.cd < 24 && e.cd >= 0) this._glow(x, e.x + 8, e.y + 8, 20, 'rgba(255,140,60,.9)', 0.9);
    }
    if (this.boss && (!this.boss.dead || this.boss.dying > 0)) this._bossDraw(x, this.boss, f);
    for (const o of this.orbs) { if (o.late > 0) continue; this._glow(x, o.x, o.y, 16, 'rgba(120,255,170,.8)', 0.9); x.fillStyle = '#eaffef'; x.beginPath(); x.arc(o.x, o.y, o.r - 1, 0, 6.3); x.fill(); x.fillStyle = '#3dff8a'; x.beginPath(); x.arc(o.x, o.y, o.r - 2.5, 0, 6.3); x.fill(); }
    for (const r of this.rocks) { if (r.warn > 0) { const k = 0.5 + 0.5 * Math.sin(f / 2.5); x.fillStyle = `rgba(255,70,70,${0.25 + 0.4 * k})`; x.beginPath(); x.ellipse(r.x, r.gY - 1, 12, 3, 0, 0, 6.3); x.fill(); x.fillStyle = `rgba(255,90,90,${0.5 + 0.4 * k})`; x.beginPath(); x.moveTo(r.x - 5, r.gY - 14); x.lineTo(r.x + 5, r.gY - 14); x.lineTo(r.x, r.gY - 6); x.fill(); continue; } this._glow(x, r.x, r.y, 14, 'rgba(210,190,255,.5)', 0.7); x.fillStyle = '#8f86c8'; x.beginPath(); x.moveTo(r.x, r.y - 11); x.lineTo(r.x + 8, r.y - 2); x.lineTo(r.x + 5, r.y + 9); x.lineTo(r.x - 5, r.y + 9); x.lineTo(r.x - 8, r.y - 2); x.closePath(); x.fill(); x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.moveTo(r.x - 1, r.y - 9); x.lineTo(r.x + 4, r.y - 2); x.lineTo(r.x - 3, r.y); x.fill(); }
    for (const w of this.waves) { x.fillStyle = 'rgba(255,200,120,.85)'; x.beginPath(); x.moveTo(w.x - w.w / 2, w.y + 8); x.quadraticCurveTo(w.x, w.y - 2, w.x + w.w / 2, w.y + 8); x.fill(); this._glow(x, w.x, w.y + 4, 14, 'rgba(255,170,90,.6)', 0.7); }
    for (const sh of this.shots) { this._glow(x, sh.x, sh.y, 14, 'rgba(255,240,150,.9)', 1); x.fillStyle = '#fffbe0'; x.beginPath(); x.arc(sh.x, sh.y, 2.6, 0, 6.3); x.fill(); x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(sh.x - Math.sign(sh.vx) * 4, sh.y, 1.6, 0, 6.3); x.fill(); }
    this._playerDraw(x, p, f);
    for (const q of this.parts) { x.globalAlpha = Math.min(1, q.life / 12); if (q.add) x.globalCompositeOperation = 'lighter'; x.fillStyle = q.col; x.beginPath(); x.arc(q.x, q.y, q.r, 0, 6.3); x.fill(); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; }
    x.font = '700 8px "Lilita One", system-ui'; x.textAlign = 'center';
    for (const t of this.texts) { x.globalAlpha = Math.min(1, t.life / 18); x.lineWidth = 2.5; x.strokeStyle = 'rgba(10,6,32,.85)'; x.strokeText(t.str, t.x + 8, t.y); x.fillStyle = t.col; x.fillText(t.str, t.x + 8, t.y); x.globalAlpha = 1; }
  }
  _under(x, pr, th) { // base de rocha sob a plataforma (parece apoiada, não solta no ar)
    const n = Math.max(1, Math.round(pr.w / 28)); x.save(); for (let i = 0; i < n; i++) { const cx = pr.x + pr.w * ((i + 0.5) / n), hh = 9 + (((pr.x / 16 | 0) * 7 + i * 5) % 9), ww = Math.min(9, pr.w / (n * 2.2)); const g = x.createLinearGradient(0, pr.y + 7, 0, pr.y + 8 + hh); g.addColorStop(0, th.abyss); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(cx - ww, pr.y + 7); x.lineTo(cx + ww, pr.y + 7); x.lineTo(cx + 1.5, pr.y + 8 + hh); x.lineTo(cx - 1.5, pr.y + 8 + hh); x.closePath(); x.fill(); }
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(pr.x + 2, pr.y + 8, pr.w - 4, 2); x.restore(); }
  _gem(x, c, f) { const cx = c.x + 6, cy = c.y + 6 + Math.sin(f / 14 + c.ph) * 1.6, s = 6.5; this._glow(x, cx, cy, 15, 'rgba(120,255,255,.55)', 0.75); const g = x.createLinearGradient(cx - s, cy - s, cx + s, cy + s); g.addColorStop(0, '#d2fcff'); g.addColorStop(0.5, '#38d6ff'); g.addColorStop(1, '#1a6ae0'); x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s, cy - s * 0.2); x.lineTo(cx, cy + s); x.lineTo(cx - s, cy - s * 0.2); x.closePath(); x.fill(); x.strokeStyle = 'rgba(10,30,90,.75)'; x.lineWidth = 1; x.stroke(); x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.moveTo(cx - s * 0.55, cy - s * 0.2); x.lineTo(cx, cy - s * 0.85); x.lineTo(cx + s * 0.2, cy - s * 0.2); x.fill(); const sp = (Math.sin(f / 9 + c.ph) + 1) / 2; x.fillStyle = `rgba(255,255,255,${0.3 + sp * 0.7})`; x.fillRect(cx + 3, cy - 6, 1.4, 1.4); }
  _chest(x, k, f) { const X = k.x, Y = k.y; x.save(); x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(X + 8, Y + 13, 9, 2, 0, 0, 6.3); x.fill(); const g = x.createLinearGradient(0, Y + 5, 0, Y + 13); g.addColorStop(0, '#c98a4a'); g.addColorStop(1, '#7a4620'); x.fillStyle = g; x.fillRect(X, Y + 5, 16, 8); x.strokeStyle = '#4a2810'; x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 5.5, 15, 7); x.fillStyle = '#ffd23f'; x.fillRect(X + 2, Y + 5, 2, 8); x.fillRect(X + 12, Y + 5, 2, 8);
    if (!k.open) { const lg2 = x.createLinearGradient(0, Y, 0, Y + 6); lg2.addColorStop(0, '#e0a864'); lg2.addColorStop(1, '#a8682e'); x.fillStyle = lg2; x.beginPath(); x.moveTo(X, Y + 6); x.quadraticCurveTo(X + 8, Y - 3, X + 16, Y + 6); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#ffd23f'; x.fillRect(X + 6.5, Y + 4, 3, 4); const sp = (f % 120) < 14; if (sp) { x.fillStyle = '#fff'; x.fillRect(X + 12, Y, 1.6, 1.6); } }
    else { this._glow(x, X + 8, Y + 4, 22, 'rgba(255,230,120,.8)', Math.max(0, 0.9 - k.t / 80)); x.fillStyle = '#a8682e'; x.beginPath(); x.moveTo(X, Y + 5); x.lineTo(X - 2, Y - 4); x.lineTo(X + 14, Y - 6); x.lineTo(X + 16, Y + 5); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#ffe36b'; x.fillRect(X + 2, Y + 3, 12, 3); }
    x.restore(); }
  _wind(x, w, f) { x.save(); const g = x.createLinearGradient(0, w.y, 0, w.y + w.h); g.addColorStop(0, 'rgba(180,240,255,.04)'); g.addColorStop(1, 'rgba(180,240,255,.2)'); x.fillStyle = g; x.fillRect(w.x, w.y, w.w, w.h); x.strokeStyle = 'rgba(230,252,255,.75)'; x.lineWidth = 1.2; x.lineCap = 'round'; for (let k = 0; k < 7; k++) { const t = ((f * 1.7 + k * 41) % 90) / 90, xx = w.x + 4 + ((k * 13) % (w.w - 8)), yy = w.y + w.h - t * w.h, len = 8 + (k % 3) * 4; x.globalAlpha = Math.sin(t * Math.PI) * 0.9; x.beginPath(); x.moveTo(xx, yy); x.quadraticCurveTo(xx + (k % 2 ? 3 : -3), yy - len * 0.5, xx, yy - len); x.stroke(); } x.restore(); }
  _spikes(x, e, f) { const cx = e.x + e.w / 2, top = e.y - 1; x.save(); for (let k = -1; k <= 1; k++) { const bx = cx + k * 5.6; x.fillStyle = '#dfe6f8'; x.strokeStyle = '#2a2440'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(bx - 3.4, top + 3); x.lineTo(bx, top - 7.5 - (k === 0 ? 2 : 0)); x.lineTo(bx + 3.4, top + 3); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#ff4d5e'; x.beginPath(); x.arc(bx, top - 6 - (k === 0 ? 2 : 0), 1.1, 0, 6.3); x.fill(); } x.restore(); }
  _fgprops(x, camX, camY, f) {   // peças NA FRENTE do herói e da câmera (parallax > 1): passam rápido, como no Donkey Kong Country
    const A = this.A, th = A.th, W = this.W, H = this.H; const key = th.key;
    for (const p of this.fgprops) {
      const sx = (p.x - camX) * 1.34 - p.w / 2; if (sx < -80 || sx > W + 30) continue; const gy = p.gy - camY; const rr = rng(p.seed);
      x.save();
      if (p.low) {    // blocos de pedra empilhados no chão, em primeiro plano
        const n = 2 + ((p.seed % 2)); for (let k = 0; k < n; k++) { const bw = 22 + rr() * 10, bh = 15 + rr() * 8, bx = sx + k * 14 - 6, by = gy + 8 - (k % 2) * 6 - Math.floor(k / 2) * 14; const g = x.createLinearGradient(0, by - bh, 0, by); g.addColorStop(0, shade(th.platDark, -0.15)); g.addColorStop(1, shade(th.platDark, -0.62)); x.fillStyle = g; x.strokeStyle = 'rgba(8,4,24,.85)'; x.lineWidth = 1.6; x.beginPath(); x.roundRect ? x.roundRect(bx, by - bh, bw, bh, 3) : x.rect(bx, by - bh, bw, bh); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(bx + 2, by - bh + 2, bw - 4, 2); if (key === 's1') { x.strokeStyle = th.accent; x.globalAlpha = 0.5; x.beginPath(); x.moveTo(bx + 3, by - 3); x.lineTo(bx + bw - 3, by - 3); x.stroke(); x.globalAlpha = 1; } }
      } else {        // coluna de ponta a ponta da tela (tronco, cristal, pilar ou cipó)
        const w = p.w; const col = key === 'train' ? ['#4a2c16', '#1c0f07'] : key === 's1' ? ['#3a2a7a', '#0e0a2a'] : key === 's2' ? ['#6a463c', '#24120f'] : ['#0e3a30', '#04120f'];
        const g = x.createLinearGradient(sx, 0, sx + w, 0); g.addColorStop(0, shade(col[0], 0.12)); g.addColorStop(0.55, col[0]); g.addColorStop(1, col[1]); x.fillStyle = g; x.globalAlpha = 0.97;
        x.beginPath(); x.moveTo(sx, -6); x.lineTo(sx + w, -6); x.lineTo(sx + w + 2, H + 6); x.lineTo(sx - 2, H + 6); x.closePath(); x.fill(); x.globalAlpha = 1;
        x.strokeStyle = 'rgba(6,3,20,.85)'; x.lineWidth = 1.8; x.beginPath(); x.moveTo(sx, -6); x.lineTo(sx - 2, H + 6); x.moveTo(sx + w, -6); x.lineTo(sx + w + 2, H + 6); x.stroke();
        if (key === 'train') { x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1.2; for (let k = 0; k < 7; k++) { const yy = rr() * H, xx = sx + 3 + rr() * (w - 6); x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + 1, yy + 10 + rr() * 16); x.stroke(); } x.fillStyle = '#1f6a30'; for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(sx + (k % 2 ? w : 0), 12 + k * 20 + rr() * 8, 12, 8, rr(), 0, 6.3); x.fill(); } }
        else if (key === 's1') { x.fillStyle = 'rgba(255,255,255,.1)'; x.beginPath(); x.moveTo(sx + 2, 0); x.lineTo(sx + w * 0.5, H * 0.3); x.lineTo(sx + 2, H * 0.62); x.fill(); x.strokeStyle = th.accent; x.globalAlpha = 0.65; x.lineWidth = 1.2; x.shadowColor = th.accent; x.shadowBlur = 6; x.beginPath(); x.moveTo(sx + w - 1, 0); x.lineTo(sx + w + 1, H); x.stroke(); x.globalAlpha = 1; x.shadowBlur = 0; }
        else if (key === 's2') { x.fillStyle = 'rgba(255,240,210,.18)'; for (let k = 0; k < 6; k++) x.fillRect(sx - 2, 20 + k * 38 + rr() * 6, w + 4, 6); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(sx + w * 0.6, 0, w * 0.4, H); }
        else { x.fillStyle = th.glow; x.shadowColor = th.glow; x.shadowBlur = 8; for (let k = 0; k < 5; k++) { x.globalAlpha = 0.5 + 0.5 * Math.sin(f / 18 + k * 2); x.beginPath(); x.arc(sx + 2 + rr() * (w - 4), 12 + k * 42 + rr() * 14, 1.6, 0, 6.3); x.fill(); } x.globalAlpha = 1; x.shadowBlur = 0; x.fillStyle = '#0a5a3e'; for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(sx + (k % 2 ? w : 0), 24 + k * 50, 10, 6, 0.6 * (k % 2 ? 1 : -1), 0, 6.3); x.fill(); } }
      }
      x.restore();
    }
  }
  _crusher(x, k, f) {
    const sx = k.st === 1 ? Math.sin(f * 2.4) * 1.1 : 0, X = k.x + sx, Y = k.y; x.save();
    x.strokeStyle = '#3a3d63'; x.lineWidth = 2; x.beginPath(); x.moveTo(X + 7, this.cam.y - 10); x.lineTo(X + 7, Y); x.moveTo(X + k.w - 7, this.cam.y - 10); x.lineTo(X + k.w - 7, Y); x.stroke();
    if (k.st === 1) { x.fillStyle = 'rgba(255,60,60,.35)'; x.beginPath(); x.ellipse(k.x + k.w / 2, k.yBot + 27, 15, 3.4, 0, 0, 6.3); x.fill(); }
    const g = x.createLinearGradient(X, Y, X, Y + k.h); g.addColorStop(0, '#9b9fcc'); g.addColorStop(1, '#4b4f80'); x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(X, Y, k.w, k.h, 4) : x.rect(X, Y, k.w, k.h); x.fill(); x.strokeStyle = '#2a2d52'; x.lineWidth = 1.2; x.stroke();
    x.fillStyle = '#2a2d52'; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(X + 3 + i * 6.5, Y + k.h); x.lineTo(X + 6.2 + i * 6.5, Y + k.h + 4); x.lineTo(X + 9.4 + i * 6.5, Y + k.h); x.fill(); }
    const ang = k.st >= 1; x.fillStyle = '#fff'; x.fillRect(X + 6, Y + 9, 6, 5); x.fillRect(X + k.w - 12, Y + 9, 6, 5); x.fillStyle = ang ? '#ff3b3b' : '#2a2d52'; x.fillRect(X + 8, Y + 10, 3, 4); x.fillRect(X + k.w - 11, Y + 10, 3, 4);
    x.strokeStyle = '#2a2d52'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(X + 5, Y + (ang ? 6 : 7)); x.lineTo(X + 12, Y + (ang ? 9 : 8)); x.moveTo(X + k.w - 5, Y + (ang ? 6 : 7)); x.lineTo(X + k.w - 12, Y + (ang ? 9 : 8)); x.stroke();
    x.restore();
  }
  _cannon(x, t, f) {
    const X = t.x, Y = t.y, d = t.dir; x.save(); x.fillStyle = '#2c2f52'; x.beginPath(); x.roundRect ? x.roundRect(X + 1, Y + 2, 14, 12, 3) : x.rect(X + 1, Y + 2, 14, 12); x.fill();
    x.fillStyle = '#464a7c'; x.fillRect(d < 0 ? X - 5 : X + 12, Y + 6, 9, 5); x.fillStyle = '#12132a'; x.fillRect(d < 0 ? X - 5 : X + 18, Y + 7, 3, 3);
    if (t.flash > 0) { this._glow(x, d < 0 ? X - 6 : X + 22, Y + 9, 14, 'rgba(255,170,70,.8)', 0.9); }
    else if ((t.t % t.per) > t.per - 24) { x.fillStyle = 'rgba(255,90,60,.9)'; x.beginPath(); x.arc(X + 8, Y + 8, 2.2, 0, 6.3); x.fill(); }
    x.restore();
  }
  _slab(x, img, px, py, w, h) { const cap = 6, sw = 20; x.drawImage(img, 0, 0, sw, 32, px, py, cap, h); x.drawImage(img, sw, 0, 64 - 2 * sw, 32, px + cap, py, Math.max(0, w - 2 * cap), h); x.drawImage(img, 64 - sw, 0, sw, 32, px + w - cap, py, cap, h); }
  _heart(x, cx, cy, r, f) { x.save(); x.translate(cx, cy); const s = 1 + 0.06 * Math.sin(f / 6); x.scale(s, s); this._glow(x, 0, 0, r * 2.4, 'rgba(255,90,130,.6)', 0.7); x.fillStyle = '#ff4d78'; x.strokeStyle = '#7a1030'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, r * 0.9); x.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.8, -r * 1.2, 0, -r * 0.35); x.bezierCurveTo(r * 0.8, -r * 1.2, r * 1.6, -r * 0.2, 0, r * 0.9); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-r * 0.5, -r * 0.35, r * 0.28, r * 0.18, -0.6, 0, 6.3); x.fill(); x.restore(); }
  _saw(x, s, f) { x.save(); x.translate(s.cx, s.cy); this._glow(x, 0, 0, 18, 'rgba(255,90,90,.4)', 0.6); if (s.kind === 'h') { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(s.x0 - s.cx, 5, s.x1 - s.x0, 2); } else { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(-1, s.y0 - s.cy, 2, s.y1 - s.y0); }
    x.rotate(s.rot); const n = 10, R = 7.5; x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * 6.2832, rr = i % 2 ? R * 0.74 : R; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); const g = x.createRadialGradient(-2, -2, 1, 0, 0, R); g.addColorStop(0, '#f4f6ff'); g.addColorStop(1, '#8b93b0'); x.fillStyle = g; x.fill(); x.strokeStyle = '#2a2d44'; x.lineWidth = 0.8; x.stroke(); x.fillStyle = '#ff4d5e'; x.beginPath(); x.arc(0, 0, 2.2, 0, 6.3); x.fill(); x.fillStyle = '#2a2d44'; x.beginPath(); x.arc(0, 0, 0.9, 0, 6.3); x.fill(); x.restore(); }
  _spring(x, sp, f) { const k = sp.anim > 0 ? 1 - sp.anim / 14 : 0; const hgt = sp.anim > 8 ? 3 : (sp.anim > 0 ? 9 : 6); const bx = sp.x + sp.w / 2, by = sp.y + 6; x.save(); x.strokeStyle = '#c8d0ee'; x.lineWidth = 1.6; x.beginPath(); for (let i = 0; i <= 4; i++) { const yy = by - (hgt * i) / 4; x.lineTo(bx + (i % 2 ? 4.5 : -4.5), yy); } x.stroke(); x.fillStyle = '#ff5470'; x.beginPath(); x.roundRect ? x.roundRect(bx - 7, by - hgt - 3, 14, 3.5, 1.7) : x.rect(bx - 7, by - hgt - 3, 14, 3.5); x.fill(); x.fillStyle = '#3b3f58'; x.fillRect(bx - 7, by, 14, 1.8); if (sp.anim > 0) this._glow(x, bx, by - hgt, 12, 'rgba(150,240,255,.6)', 0.7); void k; x.restore(); }
  _secretDoor(x, d, f, used, exit) {
    const cx = d.x + d.w / 2, cy = d.y + d.h / 2;
    if (!exit && !used) { const dd = Math.hypot(this.p.x - cx, this.p.y - cy); const near = Math.max(0, 1 - dd / 110); const tw = ((f % 200) < 24) ? 1 : 0; const a = Math.max(near * 0.85, tw * 0.5);
      if (a > 0.02) { this._glow(x, cx, cy, 24 + near * 12, 'rgba(255,225,130,.7)', a * 0.8); for (let k = 0; k < 4; k++) { x.fillStyle = `rgba(255,245,190,${a})`; x.beginPath(); x.arc(cx + Math.cos(f / 13 + k * 1.6) * 8, cy + Math.sin(f / 11 + k * 1.6) * 12, 1.1, 0, 6.3); x.fill(); } }
      if (dd < 34) { x.globalAlpha = 1 - dd / 34 + 0.25; x.strokeStyle = '#ffe9a0'; x.lineWidth = 1.4; x.beginPath(); x.roundRect ? x.roundRect(d.x, d.y, d.w, d.h, 7) : x.rect(d.x, d.y, d.w, d.h); x.stroke(); x.globalAlpha = 1; }
      return; } this._glow(x, cx, cy, 30, used ? 'rgba(120,120,160,.25)' : 'rgba(255,220,110,.7)', used ? 0.4 : 0.9);
    x.fillStyle = '#2a2d44'; x.beginPath(); x.roundRect ? x.roundRect(d.x - 2, d.y - 3, d.w + 4, d.h + 3, 8) : x.rect(d.x - 2, d.y - 3, d.w + 4, d.h + 3); x.fill();
    const g = x.createLinearGradient(0, d.y, 0, d.y + d.h); g.addColorStop(0, used ? '#555a7a' : '#ffe9a0'); g.addColorStop(1, used ? '#30345a' : '#ff9a2e'); x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(d.x, d.y, d.w, d.h, 7) : x.rect(d.x, d.y, d.w, d.h); x.fill();
    x.fillStyle = used ? '#9aa0c0' : '#fff'; x.font = '700 9px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillText(exit ? '↩' : '★', cx, cy + 3);
    if (!used) for (let k = 0; k < 3; k++) { x.fillStyle = 'rgba(255,240,170,.8)'; x.beginPath(); x.arc(cx + Math.cos(f / 15 + k * 2.1) * 9, cy + Math.sin(f / 15 + k * 2.1) * 13, 1.2, 0, 6.3); x.fill(); }
  }
  _flag(x, c, f) {   // ponto de salvamento: totem de pedra com cristal flutuante na cor do mundo
    const th = this.A.th, px = c.x + 4, gy = c.y + 22, on = c.on, col = on ? th.accent : '#7d839e'; x.save();
    x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(px, gy + 1, 8, 2, 0, 0, 6.3); x.fill();
    const gr = x.createLinearGradient(px - 6, 0, px + 6, 0); gr.addColorStop(0, shade(th.platDark, 0.12)); gr.addColorStop(1, shade(th.platDark, -0.45)); x.fillStyle = gr; x.strokeStyle = 'rgba(8,4,24,.85)'; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(px - 6, gy); x.lineTo(px - 4, gy - 9); x.lineTo(px - 3, gy - 14); x.lineTo(px + 3, gy - 14); x.lineTo(px + 4, gy - 9); x.lineTo(px + 6, gy); x.closePath(); x.fill(); x.stroke();
    const cy = gy - 22 + Math.sin(f / 14) * 1.8; if (on) this._glow(x, px, cy, 20, th.glow, 0.7);
    x.fillStyle = col; x.beginPath(); x.moveTo(px, cy - 7); x.lineTo(px + 4.5, cy); x.lineTo(px, cy + 7); x.lineTo(px - 4.5, cy); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(px - 1, cy - 5); x.lineTo(px + 2, cy - 1); x.lineTo(px - 1.5, cy); x.fill(); x.restore();
  }
  _exitWall(x, g, f) {
    // a SAÍDA é uma porta na parede do fundo da fase (rocha/gelo/pedra/raízes): ao entrar, a tela fecha e passa para a próxima
    const th = this.A.th, key = th.key, on = g.enabled, X = g.x, fy = g.y + g.h, cx = X + g.w / 2, top = this.cam.y - 14;
    const x0 = X - 52, x1 = Math.max(X + g.w + 120, this.L.cols * TS + 6);
    const P = { train: ['#9aa3b4', '#4c5568', '#e9eef8', '#fff1b0'], s1: ['#3a3898', '#14124a', '#cfeaff', '#9ff5ff'], s2: ['#c58a52', '#6a3a22', '#f3deb0', '#ffe9a8'], s3: ['#1e6a5c', '#06241f', '#7fe0b0', '#9dffb8'] }[key];
    x.save();
    // massa da parede, do chão até o topo da tela
    const gr = x.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, P[0]); gr.addColorStop(0.35, P[1]); gr.addColorStop(1, shade(P[1], -0.35)); x.fillStyle = gr;
    x.beginPath(); x.moveTo(x0 + 8, fy + 2); x.lineTo(x0, fy - 38); x.lineTo(x0 + 12, fy - 86); x.lineTo(x0 + 3, fy - 130); x.lineTo(x0 + 10, top); x.lineTo(x1, top); x.lineTo(x1, fy + 2); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(8,4,24,.9)'; x.lineWidth = 2; x.stroke();
    x.save(); x.clip(); x.strokeStyle = 'rgba(0,0,0,.22)'; x.lineWidth = 1.2;
    for (let yy = fy - 14; yy > top; yy -= 15) { x.beginPath(); x.moveTo(x0, yy); x.lineTo(x1, yy); x.stroke(); for (let xx = x0 + ((yy / 15 | 0) % 2 ? 9 : 22); xx < x1; xx += 26) { x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx, yy - 15); x.stroke(); } }
    x.fillStyle = 'rgba(255,255,255,.08)'; for (let yy = fy - 30; yy > top; yy -= 44) x.fillRect(x0 + 6, yy, x1 - x0, 5);
    x.restore();
    // estalactites / raízes na borda de cima
    for (let xx = x0 + 10; xx < x1; xx += 17) { const len = 8 + ((xx * 7) % 22); x.fillStyle = shade(P[1], 0.12); x.strokeStyle = 'rgba(8,4,24,.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(xx - 6, top + 14); x.lineTo(xx, top + 14 + len); x.lineTo(xx + 6, top + 14); x.closePath(); x.fill(); x.stroke(); }
    // moldura da porta (arco)
    const aw = g.w + 14, ax = cx - aw / 2, at = fy - g.h - 8, rad = aw / 2;
    const fr = x.createLinearGradient(ax, 0, ax + aw, 0); fr.addColorStop(0, P[2]); fr.addColorStop(0.5, shade(P[2], -0.18)); fr.addColorStop(1, shade(P[2], -0.5)); x.fillStyle = fr; x.strokeStyle = 'rgba(8,4,24,.9)'; x.lineWidth = 1.8;
    x.beginPath(); x.moveTo(ax - 3, fy + 2); x.lineTo(ax - 3, at + rad); x.arc(cx, at + rad, rad + 3, Math.PI, 0); x.lineTo(ax + aw + 3, fy + 2); x.closePath(); x.fill(); x.stroke();
    // vão da porta
    const ix = cx - g.w / 2, iw = g.w, it = at + 6, ir = iw / 2;
    x.beginPath(); x.moveTo(ix, fy + 2); x.lineTo(ix, it + ir); x.arc(cx, it + ir, ir, Math.PI, 0); x.lineTo(ix + iw, fy + 2); x.closePath();
    const dg = x.createLinearGradient(0, it, 0, fy); if (on) { dg.addColorStop(0, '#ffffff'); dg.addColorStop(0.45, P[3]); dg.addColorStop(1, shade(P[3], -0.35)); } else { dg.addColorStop(0, '#2a2640'); dg.addColorStop(1, '#0c0a1c'); }
    x.fillStyle = dg; x.fill(); x.stroke();
    if (on) {   // luz saindo da porta, faíscas e degrau iluminado
      this._glow(x, cx, fy - g.h * 0.45, 46, th.glow, 0.5 + 0.12 * Math.sin(f / 12));
      x.save(); x.beginPath(); x.moveTo(ix, fy + 2); x.lineTo(ix, it + ir); x.arc(cx, it + ir, ir, Math.PI, 0); x.lineTo(ix + iw, fy + 2); x.closePath(); x.clip();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.2; for (let k = 0; k < 4; k++) { x.beginPath(); for (let yy = 0; yy <= g.h; yy += 3) { const xx = cx + Math.sin(yy / 6 - f / 10 + k * 1.7) * (iw * 0.28); if (yy === 0) x.moveTo(xx, it + yy); else x.lineTo(xx, it + yy); } x.stroke(); }
      x.restore(); x.fillStyle = 'rgba(255,255,230,.35)'; x.beginPath(); x.moveTo(ix + 2, fy + 2); x.lineTo(ix - 16, fy + 2); x.lineTo(ix + 4, fy - 6); x.fill();
    } else {   // trancada: grade pesada e luz vermelha
      x.fillStyle = '#3a3a52'; for (let k = 0; k < 4; k++) x.fillRect(ix + 3 + k * 8, it + 4, 3, g.h - 4); x.fillStyle = '#ff4d5e'; x.shadowColor = '#ff4d5e'; x.shadowBlur = 8; x.beginPath(); x.arc(cx, fy - g.h * 0.4, 2.8, 0, 6.3); x.fill(); x.shadowBlur = 0;
    }
    // chave do arco
    x.fillStyle = on ? P[3] : '#6b6fa0'; x.beginPath(); x.moveTo(cx, at - 7); x.lineTo(cx + 4, at - 1); x.lineTo(cx, at + 5); x.lineTo(cx - 4, at - 1); x.closePath(); x.fill(); x.stroke();
    if (on) { const k = Math.sin(f / 8); x.fillStyle = '#ffe36b'; x.strokeStyle = 'rgba(40,20,0,.7)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(cx - 6, at - 24 + k * 2); x.lineTo(cx + 6, at - 24 + k * 2); x.lineTo(cx, at - 15 + k * 2); x.closePath(); x.stroke(); x.fill(); x.font = '700 7px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = '#fff6b0'; x.fillText('SAÍDA', cx, at - 28 + k * 2); }
    x.restore();
  }
  _tags(x, s) {   // rótulo curto sobre cada objeto (só depois de ouvir a versão; "NÃO SEI" sempre)
    if (!s.labels) return; x.save(); x.font = '700 6.4px "Nunito", system-ui'; x.textAlign = 'center';
    for (const d of s.opts) { const idk = d.i === 3; if (!idk && !(s.rev && s.rev[d.i])) continue; const txt = s.labels[d.i]; if (!txt) continue;
      const cx = d.type === 'balloon' || s.type === 'balloon' ? d.fx + d.w / 2 : d.x + (d.roll || 0) + d.w / 2; const top = s.type === 'balloon' ? d.fy : (s.type === 'barrel' ? d.y + (d.yoff || 0) : d.y);
      if (s.type === 'barrel' && !d.landed) continue; const w = x.measureText(txt).width + 8, ty = top - 17; const o = OPT_COLORS[d.i];
      x.fillStyle = 'rgba(12,8,40,.82)'; x.beginPath(); x.roundRect ? x.roundRect(cx - w / 2, ty - 8, w, 11, 4) : x.rect(cx - w / 2, ty - 8, w, 11); x.fill(); x.strokeStyle = o.main; x.lineWidth = 1; x.stroke(); x.fillStyle = '#ffffff'; x.fillText(txt, cx, ty); }
    x.restore();
  }
  _optBadge(x, d, lit, f) { const o = OPT_COLORS[d.i]; x.font = '700 7px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = 'rgba(10,6,32,.8)'; x.fillText(o.shape, d.x + d.w / 2 + 0.5, d.y - 3.5); x.fillStyle = o.main; x.fillText(o.shape, d.x + d.w / 2, d.y - 4.2); void lit; void f; }
  _ring(x, s, d) { if (s.arm && s.arm.ped === d.i && s.arm.f > 0 && s.selected !== d.i) { x.save(); x.lineWidth = 2.4; x.strokeStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.arc(d.x + d.w / 2, d.y - 10, 8, 0, 6.3); x.stroke(); x.strokeStyle = OPT_COLORS[d.i].main; x.beginPath(); x.arc(d.x + d.w / 2, d.y - 10, 8, -Math.PI / 2, -Math.PI / 2 + Math.min(1, s.arm.f / 36) * 6.283); x.stroke(); x.restore(); } }
  _stationDraw(x, s, f) {
    const g0 = s.rowG * TS;
    x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(s.x0 - 16, g0 - 1, s.x1 - s.x0 + 32, 2);
    const au = this.G && this.G.aura; if (au) { const ax = this.portrait ? Math.max(s.x0 + 30, this.cam.x + 8) : s.x0 + 30, ay = g0 - 46 + Math.sin(f / 22) * 2.5; { const bx = ax + 13; const bg2 = x.createLinearGradient(0, ay + 10, 0, this.cam.y - 10); bg2.addColorStop(0, 'rgba(120,235,255,.38)'); bg2.addColorStop(1, 'rgba(120,235,255,0)'); x.fillStyle = bg2; x.beginPath(); x.moveTo(bx - 7, ay + 12); x.lineTo(bx - 22, this.cam.y - 10); x.lineTo(bx + 22, this.cam.y - 10); x.lineTo(bx + 7, ay + 12); x.fill(); this.auraPos = { x: bx, y: ay }; if (this.hooks.onAura) this.hooks.onAura((bx - this.cam.x) / this.W, (ay - this.cam.y) / this.H); } this._glow(x, ax + 13, ay + 14, 36, 'rgba(110,230,255,.5)', 0.75); x.drawImage(au.img, 0, 0, au.cw, au.ch, ax, ay, 26, 26 * au.ch / au.cw); }
    const pd = s.pad; this._glow(x, pd.x, pd.y - 2, 20, 'rgba(120,200,255,.55)', 0.7 + 0.2 * Math.sin(f / 12)); x.fillStyle = '#26305a'; x.beginPath(); x.ellipse(pd.x, pd.y - 1, 11, 3.5, 0, 0, 6.3); x.fill(); x.fillStyle = '#6fe6ff'; x.beginPath(); x.ellipse(pd.x, pd.y - 2, 9, 2.6, 0, 0, 6.3); x.fill();
    x.fillStyle = '#eaffff'; x.beginPath(); x.moveTo(pd.x - 4, pd.y - 8); x.lineTo(pd.x - 1, pd.y - 8); x.lineTo(pd.x + 3, pd.y - 12); x.lineTo(pd.x + 3, pd.y - 3); x.lineTo(pd.x - 1, pd.y - 7); x.lineTo(pd.x - 4, pd.y - 7); x.fill();
    x.strokeStyle = '#eaffff'; x.lineWidth = 1; x.beginPath(); x.arc(pd.x + 3, pd.y - 7.5, 3, -1, 1); x.stroke(); x.beginPath(); x.arc(pd.x + 3, pd.y - 7.5, 5.5, -1, 1); x.stroke();
    this._tags(x, s);
    for (const d of s.opts) {
      const lit = s.selected === d.i; const o = OPT_COLORS[d.i];
      if (s.type === 'ped') {
        const sp = this.G && this.G['ped' + d.i]; const off = lit ? 1.8 : 0; x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(d.x + 16, g0 + 0.5, 20, 3, 0, 0, 6.3); x.fill();
        if (lit) this._glow(x, d.x + 16, d.y + 6, 40, o.main, 0.55 + 0.15 * Math.sin(f / 7));
        if (sp) { const w = 38, h = w * sp.ch / sp.cw; x.drawImage(sp.img, (lit ? 1 : 0) * sp.cw, 0, sp.cw, sp.ch, d.x + 16 - w / 2, g0 - h + 1 + off, w, h - off * 0.3); }
      } else if (s.type === 'door') {
        const cx = d.x + d.w / 2; if (lit) this._glow(x, cx, d.y + 22, 40, o.main, 0.7 + 0.2 * Math.sin(f / 7)); else this._glow(x, cx, d.y + 22, 26, o.main, 0.25);
        x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(cx, g0 + 0.5, 17, 2.5, 0, 0, 6.3); x.fill();
        x.fillStyle = o.dark; x.beginPath(); x.roundRect ? x.roundRect(d.x - 3, d.y - 3, d.w + 6, d.h + 3, 14) : x.rect(d.x - 3, d.y - 3, d.w + 6, d.h + 3); x.fill();
        const gr = x.createLinearGradient(0, d.y, 0, d.y + d.h); gr.addColorStop(0, lit ? '#ffffff' : shadeC(o.main, 0.2)); gr.addColorStop(1, lit ? o.main : (d.i === 3 ? o.dark : '#14102e')); x.fillStyle = gr; x.beginPath(); x.roundRect ? x.roundRect(d.x, d.y, d.w, d.h, 12) : x.rect(d.x, d.y, d.w, d.h); x.fill();
        for (let k = 0; k < 5; k++) { x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.arc(cx + Math.sin(f / 10 + k) * 6, d.y + 10 + ((f * 0.7 + k * 9) % (d.h - 12)), 1.1, 0, 6.3); x.fill(); }
        x.font = '700 11px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = 'rgba(10,6,32,.85)'; x.fillText(o.letter, cx + 0.6, d.y + 17.6); x.fillStyle = '#fff'; x.fillText(o.letter, cx, d.y + 17);
      } else if (s.type === 'bump') {
        const by = d.y - (d.bump > 0 ? Math.sin((d.bump / 10) * Math.PI) * 5 : 0); if (lit) this._glow(x, d.x + 16, by + 8, 36, o.main, 0.8); else this._glow(x, d.x + 16, by + 8, 24, o.main, 0.22);
        x.fillStyle = o.dark; x.beginPath(); x.roundRect ? x.roundRect(d.x - 1, by - 1, d.w + 2, d.h + 3, 5) : x.rect(d.x - 1, by - 1, d.w + 2, d.h + 3); x.fill();
        const gr = x.createLinearGradient(0, by, 0, by + d.h); gr.addColorStop(0, lit ? '#fff' : shadeC(o.main, 0.45)); gr.addColorStop(1, o.main); x.fillStyle = gr; x.beginPath(); x.roundRect ? x.roundRect(d.x, by, d.w, d.h, 4) : x.rect(d.x, by, d.w, d.h); x.fill();
        x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(d.x + 3, by + 2, d.w - 6, 1.6); [[d.x + 3, by + 3], [d.x + d.w - 3, by + 3], [d.x + 3, by + d.h - 3], [d.x + d.w - 3, by + d.h - 3]].forEach(([a, b]) => { x.fillStyle = 'rgba(10,6,32,.45)'; x.beginPath(); x.arc(a, b, 1, 0, 6.3); x.fill(); });
        x.font = '700 11px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = 'rgba(10,6,32,.8)'; x.fillText(o.letter, d.x + 16.6, by + 12.4); x.fillStyle = '#fff'; x.fillText(o.letter, d.x + 16, by + 11.8);
        x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(d.x + 16, by + d.h + 5 + Math.sin(f / 8) * 1.5); x.lineTo(d.x + 12, by + d.h + 10 + Math.sin(f / 8) * 1.5); x.lineTo(d.x + 20, by + d.h + 10 + Math.sin(f / 8) * 1.5); x.fill();
      } else if (s.type === 'barrel') {
        if (d.dropT === undefined || d.dropT < 0) { /* ainda não caiu */ } else this._barrel(x, s, d, lit, f);
      } else if (s.type === 'balloon') {
        this._balloon(x, s, d, lit, f);
      } else { // mimic
        const sq = d.squash > 0 ? Math.sin((d.squash / 14) * Math.PI) : 0; const cx = d.x + d.w / 2, base = d.y + d.h; const bob = Math.sin(f / 9 + d.i * 2) * 1.2; if (lit) this._glow(x, cx, base - 10, 30, o.main, 0.8);
        x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(cx, base + 0.5, 11, 2.2, 0, 0, 6.3); x.fill(); x.save(); x.translate(cx, base); x.scale(1 + sq * 0.3, 1 - sq * 0.45); x.translate(0, -bob);
        const gr = x.createRadialGradient(-3, -14, 2, 0, -9, 13); gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, o.main); gr.addColorStop(1, o.dark); x.fillStyle = gr; x.beginPath(); x.ellipse(0, -9, 11, 10, 0, 0, 6.3); x.fill(); x.strokeStyle = 'rgba(10,6,32,.55)'; x.lineWidth = 1; x.stroke();
        for (const sd of [-1, 1]) { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(sd * 4, -12, 3, 3.6, 0, 0, 6.3); x.fill(); x.fillStyle = '#14102e'; x.beginPath(); x.arc(sd * 4 + 0.6, -11.6, 1.6, 0, 6.3); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(sd * 4 + 1.2, -12.6, 0.6, 0, 6.3); x.fill(); }
        x.strokeStyle = '#14102e'; x.lineWidth = 1; x.beginPath(); x.arc(0, -7, 3, 0.2, Math.PI - 0.2); x.stroke(); x.font = '700 8px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = 'rgba(10,6,32,.85)'; x.fillText(o.letter, 0, -1.2); x.restore();
        x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(cx, d.y - 7 + Math.sin(f / 8) * 1.5); x.lineTo(cx - 3.5, d.y - 11 + Math.sin(f / 8) * 1.5); x.lineTo(cx + 3.5, d.y - 11 + Math.sin(f / 8) * 1.5); x.fill();
      }
      this._ring(x, s, d); this._optBadge(x, { ...d, y: s.type === 'mimic' ? d.y - 14 : d.y - (s.type === 'ped' ? 0 : 6) }, lit, f);
    }
    const gx = s.gc * TS, top = s.gateTop * TS, hgt = (s.gateBot - s.gateTop + 1) * TS;
    x.fillStyle = '#2a2d44'; x.fillRect(gx + 1, top - 5, 14, 7); x.fillRect(gx + 1, top + hgt - 3, 14, 5);
    if (!s.gateOpen || s.locked) {
      x.save(); const gg = x.createLinearGradient(gx, 0, gx + 16, 0); gg.addColorStop(0, 'rgba(60,200,255,.05)'); gg.addColorStop(0.5, s.locked ? 'rgba(180,190,220,.5)' : 'rgba(110,235,255,.55)'); gg.addColorStop(1, 'rgba(60,200,255,.05)'); x.fillStyle = gg; x.fillRect(gx, top, 16, hgt);
      x.fillStyle = s.locked ? '#9aa0c0' : '#cffaff'; for (let k = 0; k < hgt; k += 6) { if (((k + (f >> 1)) % 12) < 6) x.fillRect(gx + 6, top + k, 4, 3); } x.restore();
    } else { for (let k = 0; k < 9; k++) { x.fillStyle = 'rgba(125,249,255,.6)'; x.beginPath(); x.arc(gx + 8 + Math.sin(f / 5 + k) * 3, top + ((f * 2 + k * 13) % hgt), 1.2, 0, 6.3); x.fill(); } }
  }
  _barrel(x, s, d, lit, f) {
    const o = OPT_COLORS[d.i]; const th = this.A.th.key; const sq = d.squash > 0 ? Math.sin((d.squash / 14) * Math.PI) : 0; const cx = d.x + (d.roll || 0) + d.w / 2, by = d.y + d.yoff + d.h;
    const pal = { train: ['#c98a4a', '#8a5528', '#b8c0d4'], s1: ['#7ad8ff', '#3a6fd0', '#e8f8ff'], s2: ['#d9c9a6', '#8f7a52', '#6b4a32'], s3: ['#e86bff', '#7a2ab0', '#7dffa3'] }[th]; if (d.i === 3) { pal[0] = '#a9afc6'; pal[1] = '#4d5374'; pal[2] = '#e6eaf8'; } x.save(); x.globalAlpha = 1;
    x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(cx, d.y + d.h + 0.5, 11, 2.4, 0, 0, 6.3); x.fill(); if (lit) this._glow(x, cx, by - 12, 30, o.main, 0.8);
    x.save(); x.translate(cx, by - d.h / 2); x.rotate(d.landed ? (d.rot || 0) : d.rot); x.scale(1 + sq * 0.28, 1 - sq * 0.4);
    const g = x.createLinearGradient(-12, 0, 12, 0); g.addColorStop(0, pal[1]); g.addColorStop(0.35, pal[0]); g.addColorStop(1, pal[1]);
    x.fillStyle = g; x.beginPath(); x.moveTo(-9, -12); x.quadraticCurveTo(-14, 0, -9, 12); x.lineTo(9, 12); x.quadraticCurveTo(14, 0, 9, -12); x.closePath(); x.fill(); x.strokeStyle = 'rgba(10,6,32,.6)'; x.lineWidth = 1; x.stroke();
    if (th === 's1') { x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(-6, -10); x.lineTo(-2, -4); x.lineTo(-6, 6); x.fill(); }
    else if (th === 's3') { x.strokeStyle = pal[2]; x.lineWidth = 1; for (let k = -6; k <= 6; k += 4) { x.beginPath(); x.moveTo(k, -11); x.quadraticCurveTo(k + 2, 0, k, 11); x.stroke(); } }
    else { x.fillStyle = pal[2]; for (const yy of [-8, 7]) { x.fillRect(-12, yy - 1.5, 24, 3); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(-12, yy - 1.5, 24, 0.8); x.fillStyle = pal[2]; } }
    x.fillStyle = lit ? '#fff' : o.main; x.beginPath(); x.ellipse(0, 0, 6.2, 6.2, 0, 0, 6.3); x.fill(); x.strokeStyle = o.dark; x.lineWidth = 1; x.stroke();
    x.rotate(-(d.landed ? (d.rot || 0) : d.rot)); x.font = '700 8px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = 'rgba(10,6,32,.9)'; x.fillText(o.letter, 0, 3); x.restore(); x.restore();
    if (d.landed) { x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(cx, d.y - 6 + Math.sin(f / 8) * 1.5); x.lineTo(cx - 3.5, d.y - 10 + Math.sin(f / 8) * 1.5); x.lineTo(cx + 3.5, d.y - 10 + Math.sin(f / 8) * 1.5); x.fill(); }
  }
  _balloon(x, s, d, lit, f) {
    if (d.pop > 0 && d.pop > 6) return; const o = OPT_COLORS[d.i]; const th = this.A.th.key; const cx = d.fx + d.w / 2, cy = d.fy + 12; const grow = d.pop > 0 ? 1 : 1;
    if (lit) this._glow(x, cx, cy, 34, o.main, 0.85); else this._glow(x, cx, cy, 22, o.main, 0.25);
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(cx, cy + 12); x.quadraticCurveTo(cx + Math.sin(f / 14 + d.i) * 3, cy + 18, cx, cy + 24); x.stroke();
    x.save(); x.translate(cx, cy); x.scale(grow, grow);
    const g = x.createRadialGradient(-3, -5, 2, 0, 0, 14); g.addColorStop(0, lit ? '#fff' : '#ffffff'); g.addColorStop(0.3, o.main); g.addColorStop(1, o.dark); x.fillStyle = g;
    x.beginPath(); if (th === 's1') { x.moveTo(0, -14); x.lineTo(9, -6); x.lineTo(9, 6); x.lineTo(0, 13); x.lineTo(-9, 6); x.lineTo(-9, -6); x.closePath(); } else if (th === 's2') { x.roundRect ? x.roundRect(-9, -13, 18, 26, 6) : x.rect(-9, -13, 18, 26); } else { x.ellipse(0, -1, 10, 13, 0, 0, 6.3); }
    x.fill(); x.strokeStyle = 'rgba(10,6,32,.5)'; x.lineWidth = 1; x.stroke(); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-3.5, -6, 2.2, 3.4, -0.4, 0, 6.3); x.fill();
    x.font = '700 9px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = 'rgba(10,6,32,.85)'; x.fillText(o.letter, 0, 3); x.restore();
    x.fillStyle = o.dark; x.fillRect(cx - 2.5, cy + 24, 5, 4);
  }
  _bossDraw(x, B, f) {
    const cx = B.x + B.w / 2, feet = B.y + B.h + 2; const fr = B.st === 'tele' || B.st === 'dash' || B.st === 'leap' ? 1 : (B.stun > 0 || B.st === 'recover' ? 2 : 0);
    const a = B.dead ? Math.max(0, B.dying / 90) : 1; x.save(); x.globalAlpha = a; const flip = B.face < 0;
    x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(cx, B.rowG * TS + 0.5, 26, 4, 0, 0, 6.3); x.fill();
    this._glow(x, cx, B.y + 22, 74, B.st === 'tele' ? 'rgba(255,60,80,.7)' : (B.ph === 2 ? 'rgba(255,70,70,.5)' : 'rgba(150,100,255,.35)'), B.st === 'tele' ? 0.9 : 0.55);
    const shk = B.st === 'tele' ? Math.sin(f * 2) * 1.2 : 0; drawFoot(x, B.sheet, fr, cx + shk, feet, 90, flip);
    if (B.weak && !B.dead) { const k = 0.5 + 0.5 * Math.sin(f / 4); this._glow(x, cx, B.y + 24, 40, 'rgba(255,230,90,.6)', 0.55 + 0.35 * k); x.fillStyle = '#ffe36b'; x.strokeStyle = 'rgba(40,20,0,.7)'; x.lineWidth = 1.5; x.beginPath(); const ay = B.y - 14 + k * 4; x.moveTo(cx - 8, ay - 8); x.lineTo(cx + 8, ay - 8); x.lineTo(cx, ay + 4); x.closePath(); x.stroke(); x.fill(); x.font = '700 7px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = '#fff6b0'; x.fillText('PISE AGORA!', cx, ay - 12); }
    if (B.flash > 0) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = (B.flash / 14) * 0.9 * a; drawFoot(x, B.sheet, fr, cx, feet, 90, flip); x.globalCompositeOperation = 'source-over'; }
    x.restore();
  }
  _playerDraw(x, p, f) {
    const cx = p.x + p.w / 2, foot = p.y + p.h + 1.5;
    let fr; if (p.dead > 0) fr = 10; else if (!p.on) fr = p.vy < 0 ? 8 : 9; else if (Math.abs(p.vx) > 0.25) fr = 2 + (Math.floor(p.anim * 1.1) % 6); else fr = (f >> 5) & 1;
    let sx = 1, sy = 1; if (p.squash > 0) { sy = 1 - p.squash * 0.02; sx = 1 + p.squash * 0.024; } else if (p.squash < 0) { sy = 1 + 0.012 * -p.squash; sx = 1 - 0.008 * -p.squash; } else if (!p.on && !p.dead) { const v = Math.min(1, Math.abs(p.vy) / 5.5); sy = 1 + v * 0.08; sx = 1 - v * 0.05; }
    const blink = p.inv > 0 && p.dead === 0 && (f >> 2) % 2 === 0;
    x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(cx, this._groundBelow(p) + 0.5, 8, 2.2, 0, 0, 6.3); x.fill();
    x.save(); x.globalAlpha = 0.4; x.strokeStyle = this.pc.main; x.lineWidth = 1.6; x.beginPath(); x.ellipse(cx, p.y + p.h + 1, 9.5, 2.8, 0, 0, 6.3); x.stroke(); x.restore();
    if (!blink) { this._glow(x, cx, p.y + 10, 24, this.pc.glow, 0.42); drawFoot(x, this.sheet, fr, cx, foot, 45, p.face < 0, sx, sy, this.exitT > 18 ? Math.max(0, 1 - (this.exitT - 18) / 30) : 1); }
    if (p.shield > 0 && p.dead === 0) { x.save(); x.globalAlpha = 0.55 + 0.2 * Math.sin(f / 5); x.strokeStyle = '#ffe36b'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(cx, p.y + 9, 11 + p.shield, 14 + p.shield, 0, 0, 6.3); x.stroke(); x.fillStyle = 'rgba(255,230,120,.12)'; x.fill(); x.restore(); }
    const pc = this.pc, pi = this.cfg.playerIdx; const bob = Math.sin(f / 8) * 0.8; const mx = cx, my = p.y - 42 + bob;   // etiqueta P1/P2 ACIMA da cabeça (antes cobria o rosto)
    const rrect = (a, b, w, h, r) => { x.beginPath(); if (x.roundRect) x.roundRect(a, b, w, h, r); else x.rect(a, b, w, h); };
    x.fillStyle = 'rgba(10,6,32,.9)'; rrect(mx - 10, my - 1, 20, 12, 5); x.fill(); x.fillStyle = pc.main; rrect(mx - 9, my, 18, 10, 4.5); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(mx - 7, my + 1, 14, 1.5);
    x.font = '700 8px "Lilita One", system-ui'; x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.fillText('P' + (pi + 1), mx, my + 8);
    x.fillStyle = 'rgba(10,6,32,.9)'; x.beginPath(); x.moveTo(mx - 3.5, my + 11); x.lineTo(mx + 3.5, my + 11); x.lineTo(mx, my + 15); x.fill(); x.fillStyle = pc.main; x.beginPath(); x.moveTo(mx - 2.5, my + 10.5); x.lineTo(mx + 2.5, my + 10.5); x.lineTo(mx, my + 13.5); x.fill();
  }
  _groundBelow(p) { const c = Math.floor((p.x + p.w / 2) / TS); for (let r = Math.floor((p.y + p.h - 1) / TS); r < ROWS + 1; r++) { const t = tileAt(this.L, c, r); if (isSolid(t) || t === T.PLAT) return r * TS; } return p.y + p.h + 40; }

  /* ---------- piloto automático (somente QA) ---------- */
  _botStep() {
    const p = this.p, I = this.input, L = this.L; I.left = false; I.right = true; I.jump = false;
    if (!this._bu || this.frame - this._bu.f > 240) { if (this._bu && Math.abs(p.x - this._bu.x) < 10 && !this.stations.some((s) => s.active) && !(this.boss && this.boss.active)) { for (let cc = Math.floor(p.x / TS) + 4; cc < L.cols - 2; cc++) { const tp = L.top[cc]; if (tp >= 0 && tileAt(L, cc, tp - 1) === T.EMPTY && tileAt(L, cc, tp - 2) === T.EMPTY && tileAt(L, cc, tp - 3) === T.EMPTY) { p.x = cc * TS + 3; p.y = (tp - 2) * TS - 2; p.vx = p.vy = 0; break; } } } this._bu = { f: this.frame, x: p.x }; }
    const cx = p.x + p.w / 2; const act = this.stations.find((s) => s.active && !s.locked); const footRow = Math.floor((p.y + p.h - 1) / TS);
    const floorAt = (xx) => { for (let r = footRow; r < footRow + 3; r++) { const t = tileAt(L, Math.floor(xx / TS), r); if (isSolid(t) || t === T.PLAT) return true; } return this.plats.some((m) => xx > m.x && xx < m.x + m.w && Math.abs(m.y - (p.y + p.h)) < 14 && !(m.kind === 'crumble' && m.state >= 2) && !(m.kind === 'blink' && !m.vis)); };
    const B = this.boss;
    if (B && B.dead && this.goal.enabled && !this.done) { const gx = this.goal.x + 16; I.right = gx > cx + 2; I.left = gx < cx - 2; return; }
    if (B && B.active && !B.dead) {
      const tx = B.x + B.w / 2; const dist = Math.abs(tx - cx); I.right = tx > cx && (B.weak || dist > 70); I.left = tx < cx && (B.weak || dist > 70);   // robô: espera o chefão ficar exausto e só então pisa
      if (B.weak && p.on && dist < 56) I.jump = true; if (!p.on && p.vy < 0 && B.weak) I.jump = true;
      for (const o of this.orbs) if (Math.abs(o.x - cx) < 34 && p.on && o.y > p.y) I.jump = true; for (const w of this.waves) if (Math.abs(w.x - cx) < 28 && p.on) I.jump = true; return;
    }
    if (act) {
      const sel = act.selected >= 0; let dir = 1;
      if (!sel) {
        const want = this.botWant ? this.botWant(act) : 1; const d = act.opts[want]; const tx = d.x + d.w / 2; dir = cx < tx ? 1 : -1; const near = Math.abs(cx - tx);
        if (act.type === 'ped') { const standing = p.on && Math.abs(p.y + p.h - d.y) <= 1.5 && cx > d.x + 3 && cx < d.x + d.w - 3; if (standing) { I.right = false; I.left = false; return; } }
        else if (act.type === 'door') { if (p.on && near < 5) { I.right = false; I.left = false; return; } I.right = dir > 0; I.left = dir < 0; return; }
        else if (act.type === 'bump') { if (near < 6) { I.right = false; I.left = false; if (p.on) I.jump = true; else if (p.vy < 0) I.jump = true; return; } I.right = dir > 0; I.left = dir < 0; return; }
        else if (act.type === 'barrel') { if (act.opts.some((o) => !o.landed)) { I.right = false; I.left = false; return; } const bx = d.x + (d.roll || 0) + d.w / 2; const nr = Math.abs(cx - bx); if (nr < 12 && p.on) I.jump = true; if (!p.on && p.vy < 0) I.jump = true; I.right = cx < bx && nr > 3; I.left = cx > bx && nr > 3; return; }
        else if (act.type === 'balloon') { const bx = d.fx + d.w / 2; const nr = Math.abs(cx - bx); if (nr < 7) { I.right = false; I.left = false; if (p.on) I.jump = true; else if (p.vy < 0) I.jump = true; return; } I.right = cx < bx; I.left = cx > bx; return; }
        else if (act.type === 'mimic') { if (near < 12 && p.on) I.jump = true; if (!p.on && p.vy < 0) I.jump = true; I.right = dir > 0 && near > 3; I.left = dir < 0 && near > 3; return; }
      }
      I.right = dir > 0; I.left = dir < 0; const wall = isSolid(tileAt(L, Math.floor((cx + dir * 11) / TS), Math.floor((p.y + p.h - 4) / TS))); const gap = p.on && !floorAt(cx + dir * 9);
      if (p.on && (wall || (gap && !sel) || (gap && sel && p.y + p.h < act.rowG * TS - 1))) I.jump = true; if (!p.on && p.vy < 0 && p.jumping) I.jump = true; return;
    }
    const ahead = (d) => cx + d; const wallAhead = isSolid(tileAt(L, Math.floor(ahead(11) / TS), Math.floor((p.y + p.h - 4) / TS)));
    const gapAhead = p.on && !floorAt(ahead(9)); const spike = [6, 14, 22].some((d) => tileAt(L, Math.floor(ahead(d) / TS), Math.floor((p.y + p.h - 2) / TS)) === T.SPIKE);
    let enemy = false; for (const e of this.enemies) if (e.alive && Math.abs(e.y - p.y) < 36 && e.x - p.x > -4 && e.x - p.x < 44) enemy = true;
    for (const s of this.saws) if (Math.abs(s.cy - (p.y + p.h)) < 40 && s.cx - cx > -6 && s.cx - cx < 36) enemy = true;
    const mv = this.plats.find((m) => m.kind === 'mover' && m.x0 < cx + 90 && m.x0 + m.range + m.w > cx - 10);
    if (p.on && gapAhead && mv && !p.ride) { const nearEdge = mv.x < p.x + p.w + 14 && mv.x > p.x - 10; if (!nearEdge) { I.right = false; return; } }
    if (p.on && (wallAhead || (gapAhead && !(mv && mv.x > p.x + p.w + 20)) || spike || enemy)) I.jump = true;
    if (!p.on && p.vy < 0 && p.jumping) I.jump = true;
    if (p.ride) { const tgt = floorAt(ahead(40)) && mv && mv.x + mv.w > mv.x0 + mv.range - 6; if (tgt || (floorAt(ahead(30)) && !floorAt(ahead(5)))) I.jump = true; }
  }
}
function shadeC(hex, f) { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return `rgb(${Math.round(r + (255 - r) * f)},${Math.round(g + (255 - g) * f)},${Math.round(b + (255 - b) * f)})`; }
void playMusic;
