def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:80])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

sub('app/js/levels.js', [
 ("crushers: [], turrets: [],", "crushers: [], turrets: [], chests: [], winds: [],"),
 ("  const blob = (cc0, cc1, rowG) => L.enemies.push({ type: 'blob', x: ((cc0 + cc1) >> 1) * TS, y: (rowG - 1) * TS - 1, minX: cc0 * TS, maxX: cc1 * TS });",
  "  const blob = (cc0, cc1, rowG, hop) => L.enemies.push({ type: 'blob', x: ((cc0 + cc1) >> 1) * TS, y: (rowG - 1) * TS - 1, minX: cc0 * TS, maxX: cc1 * TS, hop: !!hop });"),
 ("  const star = (cc, rr) => L.stars.push({ x: cc * TS + 2, y: rr * TS + 1 });",
  "  const star = (cc, rr) => L.stars.push({ x: cc * TS + 2, y: rr * TS + 1 });\n  const chest = (cc, prow) => L.chests.push({ x: cc * TS, y: prow * TS - 12 });\n  const gem = (cc, rr) => L.coins.push({ x: cc * TS + 3, y: rr * TS + 3, gem: true });"),
 ("if (d >= 1) blob(c0 + 6, c0 + n - 2, g);", "if (d >= 1) blob(c0 + 6, c0 + n - 2, g, d >= 2);"),
 ("plat(c, pr, 2); coinLine(c, pr - 2, 2); pit(2); } flat(3); },\n    enemy()", "plat(c, pr, 2); coinLine(c, pr - 2, 2); if (i === n - 1) gem(c, pr - 3); pit(2); } flat(3); },\n    enemy()"),
 ("star(c0 + 17, g - 13); if (r() < 0.3)", "star(c0 + 17, g - 13); chest(c0 + 15, g - 10); gem(c0 + 12, g - 13); gem(c0 + 5, g - 9); if (r() < 0.3)"),
 ("    moverSpikes() {",
  "    windlift() { while (g < 15) { flat(2); g += 1; } flat(3); const c0 = c; flat(16); L.winds.push({ x: (c0 + 4) * TS, y: (g - 11) * TS, w: 3 * TS, h: 11 * TS }); plat(c0 + 3, g - 11, 5); chest(c0 + 5, g - 11); gem(c0 + 4, g - 13); gem(c0 + 6, g - 13); blob(c0 + 8, c0 + 14, g, d >= 2); coinLine(c0 + 10, g - 3, 3); if (d >= 2) bat(c0 + 7, g - 7, 3); },\n    moverSpikes() {"),
 ("'spring', 'tower', 'crusher'],", "'spring', 'tower', 'crusher', 'windlift'],"),
 ("'spring', 'tower', 'crusher', 'cannon', 'tower'],", "'spring', 'tower', 'crusher', 'cannon', 'tower', 'windlift'],"),
 ("'spring', 'tower', 'crusher', 'cannon', 'tower', 'cannon'],", "'spring', 'tower', 'crusher', 'cannon', 'tower', 'cannon', 'windlift'],"),
 ("L.secretDoor = { x: (c0 + 17) * TS, y: (g - 10) * TS - 26, w: 16, h: 26 }; blob(c0 + 3, c0 + 14, g); }", "L.secretDoor = { x: (c0 + 17) * TS, y: (g - 10) * TS - 26, w: 16, h: 26 }; chest(c0 + 14, g - 10); gem(c0 + 12, g - 12); blob(c0 + 3, c0 + 14, g); }"),
])

sub('app/js/game.js', [
 # estado
 ("this.turrets = (L.turrets || []).map((k) => ({ ...k, flash: 0 })); this.bullets = [];",
  "this.turrets = (L.turrets || []).map((k) => ({ ...k, flash: 0 })); this.bullets = []; this.chests = (L.chests || []).map((k) => ({ ...k, open: false, t: 0 })); this.winds = L.winds || [];"),
 ("crushers: this.crushers, turrets: this.turrets, bullets: this.bullets };", "crushers: this.crushers, turrets: this.turrets, bullets: this.bullets, chests: this.chests, winds: this.winds };"),
 ("this.crushers = m.crushers; this.turrets = m.turrets; this.bullets = m.bullets; void keepCoins;", "this.crushers = m.crushers; this.turrets = m.turrets; this.bullets = m.bullets; this.chests = m.chests; this.winds = m.winds; void keepCoins;"),
 # pulo do inimigo saltitante
 ("      e.x += e.vx * e.dir * slow; const ahead = e.x + (e.dir > 0 ? e.w + 1 : -1);", "      if (e.hop && e.vy === 0 && ((this.frame + (e.x | 0)) % 64) === 0) e.vy = -3.3;\n      e.x += e.vx * e.dir * slow; const ahead = e.x + (e.dir > 0 ? e.w + 1 : -1);"),
 # morte no líquido (mais perto da borda do mapa visível)
 ("    if (p.y > ROWS * TS + 6) this._hurt(true);", "    if (p.y + p.h > (ROWS - 3) * TS + 4) { if (p.dead === 0) this._spark(p.x + 5, (ROWS - 3) * TS, this.A.th.accent, 16); this._hurt(true); }"),
 # gemas valem mais
 ("c.got = true; this.coinsGot++; this.score += 10; sfx.coin(); this._spark(c.x + 5, c.y + 5, '#ffd23f', 7); this._text(c.x, c.y - 4, '+10', '#ffe36b'); this._bank(); }",
  "c.got = true; this.coinsGot++; this.score += c.gem ? 50 : 10; sfx.coin(); this._spark(c.x + 5, c.y + 5, c.gem ? '#7df9ff' : '#ffd23f', c.gem ? 14 : 7); this._text(c.x, c.y - 4, c.gem ? '+5 GEMA' : '+10', c.gem ? '#9ff5ff' : '#ffe36b'); for (let k = 0; k < (c.gem ? 5 : 1); k++) this._bank(); }\n"
  "    for (const k of this.chests) { if (k.open) { k.t++; continue; } if (p.x + p.w > k.x && p.x < k.x + 16 && p.y + p.h > k.y && p.y < k.y + 14) { k.open = true; k.t = 0; sfx.star(); for (let i = 0; i < 8; i++) this._bank(); this.score += 80; this._spark(k.x + 8, k.y + 4, '#ffe36b', 28); this._text(k.x - 8, k.y - 8, 'BAÚ! +8 MOEDAS', '#fff0a0'); } }\n"
  "    for (const w of this.winds) if (p.dead === 0 && p.x + p.w > w.x && p.x < w.x + w.w && p.y + p.h > w.y && p.y < w.y + w.h) { p.vy = Math.max(p.vy - 0.55, -3.0); p.on = false; if (this.frame % 5 === 0) this.parts.push({ x: p.x + 5, y: p.y + 18, vx: (Math.random() - 0.5) * 0.4, vy: 1.2, life: 14, col: 'rgba(200,245,255,.8)', r: 1.1 }); }"),
 # desenho: líquido nos buracos (antes dos tiles)
 ("    for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {\n      const t = L.tiles[r * L.stride + c];",
  "    { const LQ = { train: ['#37b0ff', '#0b5fc0', '#c9efff'], s1: ['#9a66ff', '#3a1fb0', '#a8f6ff'], s2: ['#ff9a36', '#c4281a', '#ffe6a8'], s3: ['#74ff9a', '#0e8a4a', '#eaffb8'] }[A.th.key]; const ly = (ROWS - 3) * TS - 2;\n"
  "      for (const pit of L.pits) { if (!vis(pit.x, pit.w)) continue; const g = x.createLinearGradient(0, ly, 0, ly + 50); g.addColorStop(0, LQ[0]); g.addColorStop(1, LQ[1]); this._glow(x, pit.x + pit.w / 2, ly, Math.max(26, pit.w * 0.7), LQ[0], 0.35); x.fillStyle = g; x.beginPath(); x.moveTo(pit.x - 1, ly + 60); x.lineTo(pit.x - 1, ly); for (let xx = 0; xx <= pit.w + 2; xx += 3) x.lineTo(pit.x - 1 + xx, ly + Math.sin((xx + f * 1.6) / 5) * 1.6); x.lineTo(pit.x + pit.w + 1, ly + 60); x.closePath(); x.fill(); x.strokeStyle = LQ[2]; x.lineWidth = 1.1; x.globalAlpha = 0.8; x.beginPath(); for (let xx = 0; xx <= pit.w + 2; xx += 3) { const yy = ly + Math.sin((xx + f * 1.6) / 5) * 1.6; if (xx === 0) x.moveTo(pit.x - 1, yy); else x.lineTo(pit.x - 1 + xx, yy); } x.stroke(); x.globalAlpha = 1; for (let b = 0; b < Math.max(2, pit.w / 14); b++) { const bx = pit.x + ((b * 37 + 11) % Math.max(8, pit.w)), t2 = ((f * 0.9 + b * 29) % 50) / 50; x.fillStyle = LQ[2]; x.globalAlpha = (1 - t2) * 0.8; x.beginPath(); x.arc(bx, ly + 8 - t2 * 22, 1 + (b % 2), 0, 6.3); x.fill(); x.globalAlpha = 1; } } }\n"
  "    for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {\n      const t = L.tiles[r * L.stride + c];"),
 # desenho: gemas, baús, vento
 ("    for (const c of this.coins) if (!c.got && vis(c.x, 14)) { const fr = ((f >> 2) + (c.ph | 0)) & 7;",
  "    for (const k of this.chests) if (vis(k.x, 20)) this._chest(x, k, f);\n    for (const w of this.winds) if (vis(w.x, w.w)) this._wind(x, w, f);\n    for (const c of this.coins) if (!c.got && c.gem && vis(c.x, 14)) this._gem(x, c, f);\n    for (const c of this.coins) if (!c.got && !c.gem && vis(c.x, 14)) { const fr = ((f >> 2) + (c.ph | 0)) & 7;"),
 ("  _crusher(x, k, f) {",
  "  _gem(x, c, f) { const cx = c.x + 6, cy = c.y + 6 + Math.sin(f / 14 + c.ph) * 1.6, s = 6.5; this._glow(x, cx, cy, 15, 'rgba(120,255,255,.55)', 0.75); const g = x.createLinearGradient(cx - s, cy - s, cx + s, cy + s); g.addColorStop(0, '#d2fcff'); g.addColorStop(0.5, '#38d6ff'); g.addColorStop(1, '#1a6ae0'); x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s, cy - s * 0.2); x.lineTo(cx, cy + s); x.lineTo(cx - s, cy - s * 0.2); x.closePath(); x.fill(); x.strokeStyle = 'rgba(10,30,90,.75)'; x.lineWidth = 1; x.stroke(); x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.moveTo(cx - s * 0.55, cy - s * 0.2); x.lineTo(cx, cy - s * 0.85); x.lineTo(cx + s * 0.2, cy - s * 0.2); x.fill(); const sp = (Math.sin(f / 9 + c.ph) + 1) / 2; x.fillStyle = `rgba(255,255,255,${0.3 + sp * 0.7})`; x.fillRect(cx + 3, cy - 6, 1.4, 1.4); }\n"
  "  _chest(x, k, f) { const X = k.x, Y = k.y; x.save(); x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(X + 8, Y + 13, 9, 2, 0, 0, 6.3); x.fill(); const g = x.createLinearGradient(0, Y + 5, 0, Y + 13); g.addColorStop(0, '#c98a4a'); g.addColorStop(1, '#7a4620'); x.fillStyle = g; x.fillRect(X, Y + 5, 16, 8); x.strokeStyle = '#4a2810'; x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 5.5, 15, 7); x.fillStyle = '#ffd23f'; x.fillRect(X + 2, Y + 5, 2, 8); x.fillRect(X + 12, Y + 5, 2, 8);\n"
  "    if (!k.open) { const lg2 = x.createLinearGradient(0, Y, 0, Y + 6); lg2.addColorStop(0, '#e0a864'); lg2.addColorStop(1, '#a8682e'); x.fillStyle = lg2; x.beginPath(); x.moveTo(X, Y + 6); x.quadraticCurveTo(X + 8, Y - 3, X + 16, Y + 6); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#ffd23f'; x.fillRect(X + 6.5, Y + 4, 3, 4); const sp = (f % 120) < 14; if (sp) { x.fillStyle = '#fff'; x.fillRect(X + 12, Y, 1.6, 1.6); } }\n"
  "    else { this._glow(x, X + 8, Y + 4, 22, 'rgba(255,230,120,.8)', Math.max(0, 0.9 - k.t / 80)); x.fillStyle = '#a8682e'; x.beginPath(); x.moveTo(X, Y + 5); x.lineTo(X - 2, Y - 4); x.lineTo(X + 14, Y - 6); x.lineTo(X + 16, Y + 5); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#ffe36b'; x.fillRect(X + 2, Y + 3, 12, 3); }\n"
  "    x.restore(); }\n"
  "  _wind(x, w, f) { x.save(); const g = x.createLinearGradient(0, w.y, 0, w.y + w.h); g.addColorStop(0, 'rgba(180,240,255,.04)'); g.addColorStop(1, 'rgba(180,240,255,.2)'); x.fillStyle = g; x.fillRect(w.x, w.y, w.w, w.h); x.strokeStyle = 'rgba(230,252,255,.75)'; x.lineWidth = 1.2; x.lineCap = 'round'; for (let k = 0; k < 7; k++) { const t = ((f * 1.7 + k * 41) % 90) / 90, xx = w.x + 4 + ((k * 13) % (w.w - 8)), yy = w.y + w.h - t * w.h, len = 8 + (k % 3) * 4; x.globalAlpha = Math.sin(t * Math.PI) * 0.9; x.beginPath(); x.moveTo(xx, yy); x.quadraticCurveTo(xx + (k % 2 ? 3 : -3), yy - len * 0.5, xx, yy - len); x.stroke(); } x.restore(); }\n"
  "  _crusher(x, k, f) {"),
])
print('ok')
