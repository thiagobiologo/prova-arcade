import re, sys
P = 'app/js/game.js'
s = open(P, encoding='utf-8').read()
def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# 1) vida mais curta
rep("export const ECON = { startHp: 3, maxHp: 5, coinsPerHeart: 25,", "export const ECON = { startHp: 2, maxHp: 3, coinsPerHeart: 40,")
rep("this._text(p.x - 10, p.y - 12, '❤❤❤', '#ff9ab0');", "this._text(p.x - 10, p.y - 12, '❤'.repeat(ECON.startHp), '#ff9ab0');")
rep("'25 MOEDAS = ❤ +1'", "ECON.coinsPerHeart + ' MOEDAS = ❤ +1'")

# 2) chefão: mais vida, maior, janelas de vulnerabilidade, fúria (fase 2) e pedras caindo
rep("hp: this.cfg.quick ? 2 : 3, max: this.cfg.quick ? 2 : 3, x: L.boss.x0 + 200, y: L.boss.rowG * TS - 48, w: 34, h: 48,",
    "hp: BHP[th.boss][this.cfg.quick ? 0 : 1], max: BHP[th.boss][this.cfg.quick ? 0 : 1], ph: 1, weak: false, x: L.boss.x0 + 200, y: L.boss.rowG * TS - 62, w: 44, h: 62,")
rep("const ESIZE =", "const BHP = { colossus: [4, 6], titan: [5, 7], hydra: [5, 8] }; // [rápido, completo]\nconst ESIZE =")
rep("this.orbs = []; this.waves = []; this.parts = []; this.texts = []; this.shake = 0; this.main = null;", "this.orbs = []; this.waves = []; this.rocks = []; this.parts = []; this.texts = []; this.shake = 0; this.main = null;")
rep("const slow = this.assist >= 2 ? 0.8 : 1; const kind = this.A.th.boss;", "const slow = (this.assist >= 2 ? 0.8 : 1) * (B.ph === 2 ? 1.28 : 1); const kind = this.A.th.boss; B.weak = B.st === 'recover' && B.stun === 0 && B.t > 4;")
rep("if (B.t <= 0) { B.st = 'tele'; B.t = (kind === 'colossus' ? 40 : kind === 'titan' ? 28 : 32) + (this.assist >= 1 ? 14 : 0); B.dashDir = to; }",
    "if (B.t <= 0) { B.st = 'tele'; B.t = Math.round(((kind === 'colossus' ? 40 : kind === 'titan' ? 28 : 32) + (this.assist >= 1 ? 14 : 0)) * (B.ph === 2 ? 0.78 : 1)); B.dashDir = to; if (B.ph === 2) this._rocks(B); }")
rep("B.st = 'dash'; B.t = 58; B.dashDir = to; sfx.stomp(); }", "B.st = 'dash'; B.t = 66; B.dashDir = to; sfx.stomp(); }")
rep("B.x += B.dashDir * 3.3 * slow; if (B.t <= 0 || B.x < B.x0 - 30 || B.x + B.w > B.x1 + 40) { B.st = 'recover'; B.t = 44;", "B.x += B.dashDir * 3.9 * slow; if (B.t <= 0 || B.x < B.x0 - 30 || B.x + B.w > B.x1 + 40) { B.st = 'recover'; B.t = B.ph === 2 ? 56 : 76;")
rep("else { this._fireOrb(B, to); B.st = 'recover'; B.t = 34; }", "else { this._fireOrb(B, to); if (B.ph === 2) this._fireOrb(B, to); B.st = 'recover'; B.t = B.ph === 2 ? 56 : 76; }")
rep("B.st = 'recover'; B.t = 38; B.vx = 0; this.shake = 10;", "B.st = 'recover'; B.t = B.ph === 2 ? 56 : 76; B.vx = 0; this.shake = 10;")
rep("B.t = Math.round((kind === 'hydra' ? 60 : 78) * (this.assist >= 3 ? 1.5 : 1));", "B.t = Math.round((kind === 'hydra' ? 66 : 70) * (B.ph === 2 ? 0.6 : 1) * (this.assist >= 3 ? 1.5 : 1));")
rep("if (kind === 'hydra' && B.hp <= 1) B.t = 40; }", "}")
rep("      if (p.vy > 0.5 && p.y + p.h - B.y < 16 && B.inv === 0) this._bossHit(B);\n      else if (B.stun === 0 && p.inv === 0) this._hurt();",
    "      if (p.vy > 0.5 && p.y + p.h - B.y < 18) { if (B.weak && B.inv === 0) this._bossHit(B); else if (!B.weak && B.stun === 0) { p.vy = -4.2; p.jumping = true; this.shake = 4; sfx.hurt(); this._text(B.x + 4, B.y - 6, 'BLINDADO!', '#ffd0d0'); } }\n      else if (B.stun === 0 && p.inv === 0) this._hurt();")
rep("B.hp--; B.inv = byShot ? 55 : 80; B.stun = byShot ? 40 : 70;", "B.hp--; B.inv = byShot ? 55 : 80; B.stun = byShot ? 40 : 70; if (B.ph === 1 && B.hp <= Math.ceil(B.max / 2) && B.hp > 0) { B.ph = 2; this.shake = 18; sfx.boss(); this._text(B.x - 10, B.y - 22, 'FÚRIA!', '#ff4d4d'); setIntensity(0.7); }")
rep("  _land(B) {", "  _rocks(B) { const p = this.p; const n = 2 + (B.hp <= 2 ? 1 : 0); for (let i = 0; i < n; i++) { const x = Math.max(B.wallL + 14, Math.min(B.x1 + 6, p.x + p.w / 2 + (i - (n - 1) / 2) * 34 + (Math.random() - 0.5) * 16)); this.rocks.push({ x, y: B.rowG * TS - 230, vy: 0, warn: 54 + i * 10, gY: B.rowG * TS, life: 200 }); } }\n  _land(B) {")
rep("    this.orbs = this.orbs.filter((o) => o.life > 0);\n", "    this.orbs = this.orbs.filter((o) => o.life > 0);\n    for (const r of this.rocks) { if (r.warn > 0) { r.warn--; continue; } r.vy = Math.min(5.4, r.vy + 0.32); r.y += r.vy; r.life--; if (p.dead === 0 && p.inv === 0 && Math.abs(p.x + p.w / 2 - r.x) < 11 && p.y < r.y + 6 && p.y + p.h > r.y - 12) { this._hurt(); r.life = 0; } if (r.y >= r.gY - 6) { r.life = 0; this.shake = Math.max(this.shake, 5); sfx.stomp(); this._spark(r.x, r.gY - 3, '#d8c8ff', 8); } }\n    this.rocks = this.rocks.filter((r) => r.life > 0);\n")
rep("    for (const w of this.waves) { x.fillStyle = 'rgba(255,200,120,.85)';", "    for (const r of this.rocks) { if (r.warn > 0) { const k = 0.5 + 0.5 * Math.sin(f / 2.5); x.fillStyle = `rgba(255,70,70,${0.25 + 0.4 * k})`; x.beginPath(); x.ellipse(r.x, r.gY - 1, 12, 3, 0, 0, 6.3); x.fill(); x.fillStyle = `rgba(255,90,90,${0.5 + 0.4 * k})`; x.beginPath(); x.moveTo(r.x - 5, r.gY - 14); x.lineTo(r.x + 5, r.gY - 14); x.lineTo(r.x, r.gY - 6); x.fill(); continue; } this._glow(x, r.x, r.y, 14, 'rgba(210,190,255,.5)', 0.7); x.fillStyle = '#8f86c8'; x.beginPath(); x.moveTo(r.x, r.y - 11); x.lineTo(r.x + 8, r.y - 2); x.lineTo(r.x + 5, r.y + 9); x.lineTo(r.x - 5, r.y + 9); x.lineTo(r.x - 8, r.y - 2); x.closePath(); x.fill(); x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.moveTo(r.x - 1, r.y - 9); x.lineTo(r.x + 4, r.y - 2); x.lineTo(r.x - 3, r.y); x.fill(); }\n    for (const w of this.waves) { x.fillStyle = 'rgba(255,200,120,.85)';")
rep("this._glow(x, cx, B.y + 18, 60, B.st === 'tele' ? 'rgba(255,60,80,.7)' : 'rgba(150,100,255,.35)', B.st === 'tele' ? 0.9 : 0.5);",
    "this._glow(x, cx, B.y + 22, 74, B.st === 'tele' ? 'rgba(255,60,80,.7)' : (B.ph === 2 ? 'rgba(255,70,70,.5)' : 'rgba(150,100,255,.35)'), B.st === 'tele' ? 0.9 : 0.55);")
rep("drawFoot(x, B.sheet, fr, cx + shk, feet, 66, flip);", "drawFoot(x, B.sheet, fr, cx + shk, feet, 88, flip);\n    if (B.weak && !B.dead) { const k = 0.5 + 0.5 * Math.sin(f / 4); this._glow(x, cx, B.y + 24, 40, 'rgba(255,230,90,.6)', 0.55 + 0.35 * k); x.fillStyle = '#ffe36b'; x.strokeStyle = 'rgba(40,20,0,.7)'; x.lineWidth = 1.5; x.beginPath(); const ay = B.y - 14 + k * 4; x.moveTo(cx - 8, ay - 8); x.lineTo(cx + 8, ay - 8); x.lineTo(cx, ay + 4); x.closePath(); x.stroke(); x.fill(); x.font = '700 7px \"Lilita One\", system-ui'; x.textAlign = 'center'; x.fillStyle = '#fff6b0'; x.fillText('PISE AGORA!', cx, ay - 12); }")
rep("drawFoot(x, B.sheet, fr, cx, feet, 66, flip); x.globalCompositeOperation = 'source-over'; }", "drawFoot(x, B.sheet, fr, cx, feet, 88, flip); x.globalCompositeOperation = 'source-over'; }")

# 3) saída (portal): encaixa no chão e novo desenho
rep("this.goal = { ...L.goal, hit: false, t: 0, enabled: !L.boss && !L.exitDoor };", "this.goal = { ...L.goal, hit: false, t: 0, enabled: !L.boss && !L.exitDoor }; this._snapGoal(L);")
rep("  snapCam() {", "  _snapGoal(L) { const g = this.goal; if (!g || !(g.w > 0) || L.exitDoor) return; g.w = TS * 2; g.h = TS * 3; const c = Math.floor((g.x + g.w / 2) / TS); let r = Math.max(0, Math.floor(g.y / TS) - 1); while (r < ROWS - 1 && !isSolid(tileAt(L, c, r))) r++; g.y = r * TS - g.h; }\n  snapCam() {")
i0 = s.index("  _portal(x, g, f) {"); i1 = s.index("  _optBadge(")
NEWP = open('tools/portal_new.txt', encoding='utf-8').read()
s = s[:i0] + NEWP + s[i1:]

# 4) retrato (vertical)
rep("    this.H = VH; this.W = Math.max(330, Math.min(500, Math.round(VH * cssW / Math.max(1, cssH) / 2) * 2));",
    "    this.portrait = cssH > cssW * 1.12;\n    if (this.portrait) { this.W = 208; this.H = Math.max(240, Math.min(470, Math.round(208 * cssH / Math.max(1, cssW)))); }\n    else { this.H = VH; this.W = Math.max(330, Math.min(500, Math.round(VH * cssW / Math.max(1, cssH) / 2) * 2)); }")
rep("const lay = (img, k) => { const ox = -((camX * k) % bg.W); for (let xx = ox; xx < W; xx += bg.W) x.drawImage(img, xx, vy, bg.W, bg.H); };",
    "const bk = Math.max(1, (H - vy) / bg.H); const bw = bg.W * bk; const lay = (img, k) => { const ox = -((camX * k) % bw); for (let xx = ox; xx < W; xx += bw) x.drawImage(img, xx, vy, bw, bg.H * bk); };")
rep("    x.save(); x.translate(-camX, -camY); this._world(x, camX, camY); x.restore();", "    x.save(); x.translate(-camX, -camY); this._world(x, camX, camY); x.restore();\n    { const by = ROWS * TS - camY; if (by < H) { x.fillStyle = th.abyss; x.fillRect(0, Math.max(0, by - 0.5), W, H); } }")
# 5) feixe de luz AURA -> painel
rep("const au = this.G && this.G.aura; if (au) { const ax = s.x0 + 30, ay = g0 - 46 + Math.sin(f / 22) * 2.5;",
    "const au = this.G && this.G.aura; if (au) { const ax = s.x0 + 30, ay = g0 - 46 + Math.sin(f / 22) * 2.5; { const bx = ax + 13; const bg2 = x.createLinearGradient(0, ay + 10, 0, this.cam.y - 10); bg2.addColorStop(0, 'rgba(120,235,255,.38)'); bg2.addColorStop(1, 'rgba(120,235,255,0)'); x.fillStyle = bg2; x.beginPath(); x.moveTo(bx - 7, ay + 12); x.lineTo(bx - 22, this.cam.y - 10); x.lineTo(bx + 22, this.cam.y - 10); x.lineTo(bx + 7, ay + 12); x.fill(); this.auraPos = { x: bx, y: ay }; }")
open(P, 'w', encoding='utf-8').write(s)
print('ok')
