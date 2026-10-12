def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:80])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

# ---------------- levels.js ----------------
sub('app/js/levels.js', [
 ("movers: [], crumbles: [], blinks: [], saws: [], springs: [],", "movers: [], crumbles: [], blinks: [], saws: [], crushers: [], turrets: [], springs: [],"),
 # novos trechos: torre vertical obrigatória (muro), esmagador (estilo Thwomp), canhão (estilo Mega Man)
 ("    moverSpikes() {",
  "    tower() { // MURO: o chão não passa; é preciso subir em zigue-zague e atravessar por cima (estilo castelo do Mario)\n"
  "      while (g < 15) { flat(2); g += 1; } flat(3); const c0 = c; flat(20);\n"
  "      plat(c0 + 1, g - 2, 3); plat(c0 + 5, g - 4, 3); plat(c0 + 1, g - 6, 3); plat(c0 + 5, g - 8, 3); plat(c0 + 9, g - 10, 10);\n"
  "      for (let rr = g - 9; rr < g; rr++) { set(c0 + 9, rr, T.BRICK); set(c0 + 10, rr, T.BRICK); }\n"
  "      set(c0 + 4, g - 1, T.SPIKE); set(c0 + 8, g - 1, T.SPIKE); if (d >= 2) set(c0 + 12, g - 1, T.SPIKE);\n"
  "      coinLine(c0 + 1, g - 3, 3); coinLine(c0 + 5, g - 5, 3); coinLine(c0 + 1, g - 7, 3); coinLine(c0 + 10, g - 12, 5); blob(c0 + 10, c0 + 17, g - 10); bat(c0 + 13, g - 14, 3);\n"
  "      star(c0 + 17, g - 13); if (r() < 0.6) L.hearts.push({ x: (c0 + 2) * TS + 2, y: (g - 8) * TS }); if (d >= 3) bat(c0 + 6, g - 11, 3);\n"
  "    },\n"
  "    crusher() { const n = 15; const c0 = c; flat(n); const mk = (cc) => L.crushers.push({ x: cc * TS + 2, w: 28, h: 28, yTop: g * TS - 28 - 66, yBot: g * TS - 28 }); mk(c0 + 4); mk(c0 + 9); if (d >= 2) mk(c0 + 13); coinLine(c0 + 6, g - 2, 2); coinLine(c0 + 11, g - 2, 2); if (d >= 3) blob(c0 + 1, c0 + 3, g); },\n"
  "    cannon() { flat(3); const c0 = c; flat(15); set(c0 + 13, g - 1, T.BRICK); L.turrets.push({ x: (c0 + 13) * TS, y: (g - 1) * TS, dir: -1, per: 130 - d * 10, t: rnd(0, 50) }); blob(c0 + 2, c0 + 9, g); coinLine(c0 + 4, g - 3, 3); },\n"
  "    moverSpikes() {"),
 ("    1: ['gap', 'stairsUp', 'stairsDown', 'float', 'enemy', 'spikes', 'tworoute', 'bats', 'climb', 'gauntlet', 'crumble', 'blink', 'spring'],\n    2: ['gap', 'float', 'enemy', 'spikes', 'tworoute', 'mover', 'bats', 'drop', 'gauntlet', 'crumble', 'climb', 'pitSpikes', 'blink', 'saws', 'spring'],\n    3: ['gap', 'float', 'enemy', 'spikes', 'tworoute', 'mover', 'bats', 'pitSpikes', 'drop', 'gauntlet', 'crumble', 'climb', 'moverSpikes', 'blink', 'saws', 'spring'],",
  "    1: ['gap', 'stairsUp', 'stairsDown', 'float', 'enemy', 'spikes', 'tworoute', 'bats', 'climb', 'gauntlet', 'crumble', 'blink', 'spring', 'tower', 'crusher'],\n    2: ['gap', 'float', 'enemy', 'spikes', 'tworoute', 'mover', 'bats', 'drop', 'gauntlet', 'crumble', 'climb', 'pitSpikes', 'blink', 'saws', 'spring', 'tower', 'crusher', 'cannon', 'tower'],\n    3: ['gap', 'float', 'enemy', 'spikes', 'tworoute', 'mover', 'bats', 'pitSpikes', 'drop', 'gauntlet', 'crumble', 'climb', 'moverSpikes', 'blink', 'saws', 'spring', 'tower', 'crusher', 'cannon', 'tower', 'cannon'],"),
 # a fase secreta agora é uma torre opcional com porta INVISÍVEL no fim (só aparece perto)
 ("  function secret() { flat(2); const c0 = c; flat(15); plat(c0 + 1, g - 2, 2); plat(c0 + 4, g - 4, 2); plat(c0 + 7, g - 6, 2); star(c0 + 7, g - 7); plat(c0 + 10, g - 4, 2); if (!L.secretDoor) L.secretDoor = { x: (c0 + 10) * TS + 8, y: (g - 4) * TS - 26, w: 16, h: 26 }; coinLine(c0 + 1, g - 3, 2); if (d >= 2) bat(c0 + 6, g - 8, 3); blob(c0 + 3, c0 + 13, g); }",
  "  function secret() { // torre opcional (sem muro): sobe em zigue-zague até um corredor alto; a porta é invisível e só aparece perto\n"
  "    if (L.secretDoor) return; while (g < 15) { flat(2); g += 1; } flat(3); const c0 = c; flat(20);\n"
  "    plat(c0 + 2, g - 2, 3); plat(c0 + 6, g - 4, 3); plat(c0 + 2, g - 6, 3); plat(c0 + 6, g - 8, 3); plat(c0 + 10, g - 10, 9);\n"
  "    coin(c0 + 3, g - 3); coin(c0 + 7, g - 5); coin(c0 + 3, g - 7); coinLine(c0 + 11, g - 12, 3); star(c0 + 13, g - 13); if (d >= 2) bat(c0 + 14, g - 13, 2);\n"
  "    L.secretDoor = { x: (c0 + 17) * TS, y: (g - 10) * TS - 26, w: 16, h: 26 }; blob(c0 + 3, c0 + 14, g); }"),
])

# ---------------- game.js ----------------
sub('app/js/game.js', [
 ("    this.springs = L.springs.map((s) => ({ ...s, anim: 0, cool: 0 }));",
  "    this.springs = L.springs.map((s) => ({ ...s, anim: 0, cool: 0 }));\n"
  "    this.crushers = (L.crushers || []).map((k) => ({ ...k, y: k.yTop, st: 0, t: 0, vy: 0, cool: 0 })); this.turrets = (L.turrets || []).map((k) => ({ ...k, flash: 0 })); this.bullets = [];"),
 ("saws: this.saws, springs: this.springs, cps: this.cps, stations: this.stations, goal: this.goal, boss: this.boss, platRuns: this.platRuns, decorIdx: this._decorIdx, secretDoor: this.secretDoor, respawn: this.respawn, px: p.x, py: p.y, orbs: this.orbs, waves: this.waves };",
  "saws: this.saws, springs: this.springs, cps: this.cps, stations: this.stations, goal: this.goal, boss: this.boss, platRuns: this.platRuns, decorIdx: this._decorIdx, secretDoor: this.secretDoor, respawn: this.respawn, px: p.x, py: p.y, orbs: this.orbs, waves: this.waves, crushers: this.crushers, turrets: this.turrets, bullets: this.bullets };"),
 ("this.respawn = m.respawn; this.orbs = m.orbs; this.waves = m.waves; void keepCoins;", "this.respawn = m.respawn; this.orbs = m.orbs; this.waves = m.waves; this.crushers = m.crushers; this.turrets = m.turrets; this.bullets = m.bullets; void keepCoins;"),
 ("    this._bossStep(); this._orbsWaves();", "    this._bossStep(); this._orbsWaves(); this._hazards();"),
 ("  _land(B) {",
  "  _hazards() {\n"
  "    const p = this.p, hz = this.assist >= 3;\n"
  "    for (const k of this.crushers) {\n"
  "      const cx = p.x + p.w / 2, kc = k.x + k.w / 2; k.t++;\n"
  "      if (k.st === 0) { if (k.cool > 0) k.cool--; else if (Math.abs(cx - kc) < 22 && p.y + p.h > k.yTop + 20 && p.dead === 0) { k.st = 1; k.t = 0; } }\n"
  "      else if (k.st === 1) { if (k.t > (this.assist >= 2 ? 34 : 24)) { k.st = 2; k.vy = 0; } }\n"
  "      else if (k.st === 2) { k.vy = Math.min(9, k.vy + 0.9); k.y += k.vy; if (k.y >= k.yBot) { k.y = k.yBot; k.st = 3; k.t = 0; this.shake = Math.max(this.shake, 7); sfx.stomp(); this._spark(k.x + k.w / 2, k.yBot + 26, '#d8d0ff', 12); } }\n"
  "      else if (k.st === 3) { if (k.t > 46) { k.st = 4; k.t = 0; } }\n"
  "      else if (k.st === 4) { k.y -= 1.3; if (k.y <= k.yTop) { k.y = k.yTop; k.st = 0; k.cool = 40; } }\n"
  "      if (!hz && (k.st === 2 || k.st === 3) && p.dead === 0 && p.inv === 0 && p.x + p.w > k.x + 2 && p.x < k.x + k.w - 2 && p.y + p.h > k.y + 4 && p.y < k.y + k.h) this._hurt();\n"
  "    }\n"
  "    for (const t of this.turrets) {\n"
  "      t.t++; if (t.flash > 0) t.flash--; if (Math.abs(t.x - p.x) > 260) continue;\n"
  "      if (t.t % t.per === 0 && !hz) { t.flash = 8; sfx.shoot && sfx.shoot(); this.bullets.push({ x: t.x + (t.dir < 0 ? -4 : 20), y: t.y + 9, vx: t.dir * 1.55, life: 260 }); }\n"
  "    }\n"
  "    for (const b of this.bullets) { b.x += b.vx; b.life--; if (this._solidAt(b.x, b.y)) b.life = 0; if (b.life > 0 && p.dead === 0 && p.inv === 0 && Math.abs(p.x + p.w / 2 - b.x) < 8 && Math.abs(p.y + p.h / 2 - b.y) < 12) { b.life = 0; this._hurt(); this._spark(b.x, b.y, '#ff9a4d', 8); } }\n"
  "    this.bullets = this.bullets.filter((b) => b.life > 0);\n"
  "  }\n"
  "  _land(B) {"),
 # desenho
 ("    for (const sw of this.saws) if (vis(sw.cx - 10, 20)) this._saw(x, sw, f);",
  "    for (const sw of this.saws) if (vis(sw.cx - 10, 20)) this._saw(x, sw, f);\n"
  "    for (const k of this.crushers) if (vis(k.x - 4, 40)) this._crusher(x, k, f);\n"
  "    for (const t of this.turrets) if (vis(t.x - 4, 30)) this._cannon(x, t, f);\n"
  "    for (const b of this.bullets) { this._glow(x, b.x, b.y, 10, 'rgba(255,140,60,.7)', 0.8); x.fillStyle = '#ffd09a'; x.beginPath(); x.arc(b.x, b.y, 3.6, 0, 6.3); x.fill(); x.fillStyle = '#ff5a2e'; x.beginPath(); x.arc(b.x, b.y, 2.2, 0, 6.3); x.fill(); }"),
 ("  _slab(x, img, px, py, w, h) {",
  "  _crusher(x, k, f) {\n"
  "    const sx = k.st === 1 ? Math.sin(f * 2.4) * 1.1 : 0, X = k.x + sx, Y = k.y; x.save();\n"
  "    x.strokeStyle = '#3a3d63'; x.lineWidth = 2; x.beginPath(); x.moveTo(X + 7, this.cam.y - 10); x.lineTo(X + 7, Y); x.moveTo(X + k.w - 7, this.cam.y - 10); x.lineTo(X + k.w - 7, Y); x.stroke();\n"
  "    if (k.st === 1) { x.fillStyle = 'rgba(255,60,60,.35)'; x.beginPath(); x.ellipse(k.x + k.w / 2, k.yBot + 27, 15, 3.4, 0, 0, 6.3); x.fill(); }\n"
  "    const g = x.createLinearGradient(X, Y, X, Y + k.h); g.addColorStop(0, '#9b9fcc'); g.addColorStop(1, '#4b4f80'); x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(X, Y, k.w, k.h, 4) : x.rect(X, Y, k.w, k.h); x.fill(); x.strokeStyle = '#2a2d52'; x.lineWidth = 1.2; x.stroke();\n"
  "    x.fillStyle = '#2a2d52'; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(X + 3 + i * 6.5, Y + k.h); x.lineTo(X + 6.2 + i * 6.5, Y + k.h + 4); x.lineTo(X + 9.4 + i * 6.5, Y + k.h); x.fill(); }\n"
  "    const ang = k.st >= 1; x.fillStyle = '#fff'; x.fillRect(X + 6, Y + 9, 6, 5); x.fillRect(X + k.w - 12, Y + 9, 6, 5); x.fillStyle = ang ? '#ff3b3b' : '#2a2d52'; x.fillRect(X + 8, Y + 10, 3, 4); x.fillRect(X + k.w - 11, Y + 10, 3, 4);\n"
  "    x.strokeStyle = '#2a2d52'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(X + 5, Y + (ang ? 6 : 7)); x.lineTo(X + 12, Y + (ang ? 9 : 8)); x.moveTo(X + k.w - 5, Y + (ang ? 6 : 7)); x.lineTo(X + k.w - 12, Y + (ang ? 9 : 8)); x.stroke();\n"
  "    x.restore();\n"
  "  }\n"
  "  _cannon(x, t, f) {\n"
  "    const X = t.x, Y = t.y, d = t.dir; x.save(); x.fillStyle = '#2c2f52'; x.beginPath(); x.roundRect ? x.roundRect(X + 1, Y + 2, 14, 12, 3) : x.rect(X + 1, Y + 2, 14, 12); x.fill();\n"
  "    x.fillStyle = '#464a7c'; x.fillRect(d < 0 ? X - 5 : X + 12, Y + 6, 9, 5); x.fillStyle = '#12132a'; x.fillRect(d < 0 ? X - 5 : X + 18, Y + 7, 3, 3);\n"
  "    if (t.flash > 0) { this._glow(x, d < 0 ? X - 6 : X + 22, Y + 9, 14, 'rgba(255,170,70,.8)', 0.9); }\n"
  "    else if ((t.t % t.per) > t.per - 24) { x.fillStyle = 'rgba(255,90,60,.9)'; x.beginPath(); x.arc(X + 8, Y + 8, 2.2, 0, 6.3); x.fill(); }\n"
  "    x.restore();\n"
  "  }\n"
  "  _slab(x, img, px, py, w, h) {"),
 # porta secreta invisível
 ("  _secretDoor(x, d, f, used, exit) {\n    const cx = d.x + d.w / 2, cy = d.y + d.h / 2;",
  "  _secretDoor(x, d, f, used, exit) {\n    const cx = d.x + d.w / 2, cy = d.y + d.h / 2;\n"
  "    if (!exit && !used) { const dd = Math.hypot(this.p.x - cx, this.p.y - cy); const near = Math.max(0, 1 - dd / 110); const tw = ((f % 200) < 24) ? 1 : 0; const a = Math.max(near * 0.85, tw * 0.5);\n"
  "      if (a > 0.02) { this._glow(x, cx, cy, 24 + near * 12, 'rgba(255,225,130,.7)', a * 0.8); for (let k = 0; k < 4; k++) { x.fillStyle = `rgba(255,245,190,${a})`; x.beginPath(); x.arc(cx + Math.cos(f / 13 + k * 1.6) * 8, cy + Math.sin(f / 11 + k * 1.6) * 12, 1.1, 0, 6.3); x.fill(); } }\n"
  "      if (dd < 34) { x.globalAlpha = 1 - dd / 34 + 0.25; x.strokeStyle = '#ffe9a0'; x.lineWidth = 1.4; x.beginPath(); x.roundRect ? x.roundRect(d.x, d.y, d.w, d.h, 7) : x.rect(d.x, d.y, d.w, d.h); x.stroke(); x.globalAlpha = 1; }\n"
  "      return; }"),
 # robô de teste: destrava quando fica preso (muros/torres)
 ("    const p = this.p, I = this.input, L = this.L; I.left = false; I.right = true; I.jump = false;",
  "    const p = this.p, I = this.input, L = this.L; I.left = false; I.right = true; I.jump = false;\n"
  "    if (!this._bu || this.frame - this._bu.f > 240) { if (this._bu && Math.abs(p.x - this._bu.x) < 10 && !this.stations.some((s) => s.active) && !(this.boss && this.boss.active)) { for (let cc = Math.floor(p.x / TS) + 4; cc < L.cols - 2; cc++) { const tp = L.top[cc]; if (tp >= 0 && tileAt(L, cc, tp - 1) === T.EMPTY && tileAt(L, cc, tp - 2) === T.EMPTY && tileAt(L, cc, tp - 3) === T.EMPTY) { p.x = cc * TS + 3; p.y = (tp - 2) * TS - 2; p.vx = p.vy = 0; break; } } } this._bu = { f: this.frame, x: p.x }; }"),
])
