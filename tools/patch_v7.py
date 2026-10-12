def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:90])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

# ---------------- levels: menos pontos de salvamento ----------------
sub('app/js/levels.js', [
 ("if (c - lastCp > 38) { flat(2); cp(); }", "if (c - lastCp > 64) { flat(2); cp(); }"),
 ("if (d >= 1) { if (c - lastCp > 22) { flat(2); cp(); } secret(); }", "if (d >= 1) { if (c - lastCp > 40) { flat(2); cp(); } secret(); }"),
])

# ---------------- art.js: sem bandeira decorativa + detalhes de teto ----------------
s = open('app/js/art.js', encoding='utf-8').read()
i = s.index("  // bandeira/estandarte"); j = s.index("  // caixote / barril")
s = s[:i] + s[j:]
s = s.replace("export function buildWorld(key) {", """function buildFgTop(th) {   // detalhes do TETO em primeiro plano: estalactites, folhagem, raízes (dá clima de caverna/mata)
  const S = 2, H = 46; const [c, x] = cv(BW * S, H * S); x.scale(S, S); const r = rng(th.key.charCodeAt(1) * 53 + 3); const key = th.key;
  [-BW, 0, BW].forEach((o) => { for (let i = 0; i < 17; i++) { const bx = ((i * 38 + 9) % BW) + o, len = 8 + r() * 30;
    if (key === 's1') { const g = x.createLinearGradient(0, 0, 0, len); g.addColorStop(0, '#dff6ff'); g.addColorStop(1, '#5aa8e8'); x.fillStyle = g; x.strokeStyle = 'rgba(10,8,50,.85)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(bx - 6, -1); x.lineTo(bx + 1, len); x.lineTo(bx + 7, -1); x.closePath(); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(bx - 2, 1, 1.4, len * 0.5); }
    else if (key === 's2') { x.fillStyle = '#7a4a34'; x.strokeStyle = 'rgba(30,10,10,.85)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(bx - 7, -1); x.lineTo(bx - 1, len * 0.9); x.lineTo(bx + 8, -1); x.closePath(); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,220,170,.25)'; x.fillRect(bx - 3, 1, 1.5, len * 0.4); }
    else if (key === 's3') { x.strokeStyle = '#0a3a2e'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, -1); x.bezierCurveTo(bx + 3, len * 0.4, bx - 3, len * 0.7, bx + 1, len); x.stroke(); x.fillStyle = th.glow; x.shadowColor = th.glow; x.shadowBlur = 5; x.beginPath(); x.arc(bx + 1, len, 1.6, 0, 6.3); x.fill(); x.shadowBlur = 0; }
    else { x.fillStyle = '#1d5a2e'; x.strokeStyle = 'rgba(6,30,12,.85)'; x.lineWidth = 1.1; x.beginPath(); x.ellipse(bx, len * 0.35, 9, len * 0.45 + 3, 0, 0, 6.3); x.fill(); x.stroke(); x.fillStyle = 'rgba(180,255,150,.25)'; x.beginPath(); x.ellipse(bx - 2, len * 0.2, 3.5, 2, 0, 0, 6.3); x.fill(); } } });
  return c;
}

export function buildWorld(key) {""", 1)
s = s.replace("return { th, tex, decor: decorFor(th), bg, fg: buildFg(th) };", "return { th, tex, decor: decorFor(th), bg, fg: buildFg(th), fgt: buildFgTop(th) };", 1)
open('app/js/art.js', 'w', encoding='utf-8').write(s)

# ---------------- game.js ----------------
g = open('app/js/game.js', encoding='utf-8').read()
def rep(a, b):
    global g
    assert a in g, a[:90]; g = g.replace(a, b, 1)

# monstros voltam quando você morre (clássico de plataforma)
rep("kind: th.flyer });\n    this.plats = [", "kind: th.flyer });\n    this.enemies.forEach((e) => { e.ix = e.x; e.iy = e.y; });\n    this.plats = [")
rep("if (n >= 3 && prev < 3) { const x0 = this.respawn.x - 60, x1 = this.respawn.x + 420; for (const e of this.enemies) if (e.alive && e.x > x0 && e.x < x1) { e.alive = false; this._spark(e.x + 6, e.y + 6, '#ffffff', 10); } }", "if (n >= 3 && prev < 3) this._assistClear();")
rep("  _ghostNear() {", "  _assistClear() { const x0 = this.respawn.x - 60, x1 = this.respawn.x + 420; for (const e of this.enemies) if (e.alive && e.x > x0 && e.x < x1) { e.alive = false; this._spark(e.x + 6, e.y + 6, '#ffffff', 10); } }\n  _reviveEnemies() { const rx = this.respawn.x; for (const e of this.enemies) { if (e.ix === undefined || e.ix < rx - 260) continue; e.alive = true; e.x = e.ix; e.y = e.iy; e.vy = 0; e.alert = 0; e.charge = 0; e.sw = 0; e.cool = 0; e.cd = undefined; e.gx = undefined; } if (this.assist >= 3) this._assistClear(); }\n  _ghostNear() {")
rep("this._emitHp(); if (this.inSecret) { this._exitSecret(true); return; } this.snapCam(); }", "this._emitHp(); if (!this.inSecret) this._reviveEnemies(); if (this.inSecret) { this._exitSecret(true); return; } this.snapCam(); }")

# ponto de salvamento: totem de pedra com cristal (não bandeira)
i0 = g.index("  _flag(x, c, f) {"); i1 = g.index("  _portal(x, g, f) {")
g = g[:i0] + """  _flag(x, c, f) {   // ponto de salvamento: totem de pedra com cristal flutuante na cor do mundo
    const th = this.A.th, px = c.x + 4, gy = c.y + 22, on = c.on, col = on ? th.accent : '#7d839e'; x.save();
    x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(px, gy + 1, 8, 2, 0, 0, 6.3); x.fill();
    const gr = x.createLinearGradient(px - 6, 0, px + 6, 0); gr.addColorStop(0, shade(th.platDark, 0.12)); gr.addColorStop(1, shade(th.platDark, -0.45)); x.fillStyle = gr; x.strokeStyle = 'rgba(8,4,24,.85)'; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(px - 6, gy); x.lineTo(px - 4, gy - 9); x.lineTo(px - 3, gy - 14); x.lineTo(px + 3, gy - 14); x.lineTo(px + 4, gy - 9); x.lineTo(px + 6, gy); x.closePath(); x.fill(); x.stroke();
    const cy = gy - 22 + Math.sin(f / 14) * 1.8; if (on) this._glow(x, px, cy, 20, th.glow, 0.7);
    x.fillStyle = col; x.beginPath(); x.moveTo(px, cy - 7); x.lineTo(px + 4.5, cy); x.lineTo(px, cy + 7); x.lineTo(px - 4.5, cy); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(px - 1, cy - 5); x.lineTo(px + 2, cy - 1); x.lineTo(px - 1.5, cy); x.fill(); x.restore();
  }
""" + g[i1:]

# saída = porta na parede do fundo; ao entrar, a tela fecha e passa de fase
i0 = g.index("  _portal(x, g, f) {"); i1 = g.index("  _optBadge(")
g = g[:i0] + open('tools/exitwall.txt', encoding='utf-8').read() + g[i1:]
rep("if (vis(g.x, 50) && g.w > 0 && !this.inSecret) this._portal(x, g, f);", "if (vis(g.x - 60, 220) && g.w > 0 && !this.inSecret) this._exitWall(x, g, f);")
rep("g.hit = true; this.done = true; sfx.clear(); this._spark(g.x + 16, g.y + 24, '#ffd23f', 50); this.hooks.onStageDone && this.hooks.onStageDone(this.stats()); }",
    "g.hit = true; this.done = true; this.exitT = 1; sfx.clear(); this._spark(g.x + 16, g.y + 24, '#ffd23f', 30); }")
rep("    if (this.done) { this.doneT++; p.vx *= 0.9; }", "    if (this.done) { this.doneT++; p.vx *= 0.9; }\n    if (this.exitT > 0) { this.exitT++; I.left = I.right = I.jump = false; const dcx = g.x + g.w / 2; p.vx = Math.max(-1.1, Math.min(1.1, (dcx - (p.x + p.w / 2)) * 0.14)); if (Math.abs(p.vx) > 0.05) p.face = p.vx > 0 ? 1 : -1; if (this.exitT === 58 && !this._doneSent) { this._doneSent = true; this.hooks.onStageDone && this.hooks.onStageDone(this.stats()); } }")
rep("this.frame = 0; this.score = 0;", "this.exitT = 0; this._doneSent = false; this.frame = 0; this.score = 0;")
rep("drawFoot(x, this.sheet, fr, cx, foot, 40, p.face < 0, sx, sy)", "drawFoot(x, this.sheet, fr, cx, foot, 40, p.face < 0, sx, sy, this.exitT > 18 ? Math.max(0, 1 - (this.exitT - 18) / 30) : 1)")
# teto em primeiro plano + íris que fecha
rep("    if (A.fg && !this.stations.some((st) => st.active)", "    if (A.fgt && !this.inSecret) { const fw = 640; const ox = -(((camX * 1.12) % fw) + fw) % fw; const ty = Math.max(-2, -this.cam.y * 0.3 - 2); for (let xx = ox; xx < W; xx += fw) x.drawImage(A.fgt, xx, ty, fw, 46); }\n    if (A.fg && !this.stations.some((st) => st.active)")
open('app/js/game.js', 'w', encoding='utf-8').write(g)
print('ok')
