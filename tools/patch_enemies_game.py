def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:90])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

# ======================= game.js =======================
g = open('app/js/game.js', encoding='utf-8').read()
i0 = g.index("  _enemy(e) {"); i1 = g.index("  _hurt(pit) {")
NEW = r'''  _enemy(e) {
    const slow = this.assist >= 1 ? 0.65 : 1; e.t += 0.05 * (e.type === 'bat' ? slow : 1);
    const p = this.p; const dx = (p.x + p.w / 2) - (e.x + e.w / 2), dy = (p.y + p.h / 2) - (e.y + e.h / 2);
    const calm = this.assist >= 2 || p.dead > 0 || this.stations.some((s) => s.active);
    if (e.type === 'blob') {
      e.vy = Math.min(4, e.vy + PHY.grav); e.y += e.vy; const feet = e.y + e.h, cx = e.x + e.w / 2, rowF = Math.floor(feet / TS);
      if (this._solidAt(cx, feet) || tileAt(this.L, Math.floor(cx / TS), rowF) === T.PLAT) { e.y = rowF * TS - e.h; e.vy = 0; }
      if (e.hop && e.vy === 0 && ((this.frame + (e.x | 0)) % 64) === 0) e.vy = -3.3;
      if (e.shooter) {            // atirador: fica parado, mira e cospe uma bola em arco
        e.dir = dx >= 0 ? 1 : -1; if (e.cd === undefined) e.cd = 40 + ((e.x | 0) % 50);
        if (!calm && Math.abs(dx) < 210 && Math.abs(dy) < 90) { e.cd--; if (e.cd <= 0) { e.cd = 110; this.bullets.push({ x: e.x + e.w / 2 + e.dir * 8, y: e.y + 2, vx: e.dir * 1.7, vy: -1.9, g: 0.1, life: 200, col: 'spore' }); sfx.shoot && sfx.shoot(); } }
        return;
      }
      let sp = e.vx * e.dir * slow, lo = e.minX, hi = e.maxX + TS;
      if (e.aggro && !calm && !(e.alert > 0) && !(e.charge > 0) && Math.abs(dx) < 120 && Math.abs(dy) < 30) e.alert = 20;
      if (e.alert > 0) { e.alert--; e.dir = dx >= 0 ? 1 : -1; if (e.alert === 0) e.charge = 100; sp = 0; }
      else if (e.charge > 0) { e.charge--; if (calm) e.charge = 0; e.dir = dx >= 0 ? 1 : -1; sp = e.vx * 2.6 * e.dir * slow; lo -= 56; hi += 56; if (e.hop && e.vy === 0 && (e.charge % 30) === 0) e.vy = -3.0; }
      e.x += sp; const ahead = e.x + (e.dir > 0 ? e.w + 1 : -1);
      const floorAhead = this._solidAt(ahead, e.y + e.h + 2) || tileAt(this.L, Math.floor(ahead / TS), Math.floor((e.y + e.h + 2) / TS)) === T.PLAT;
      if (e.x < lo || e.x + e.w > hi || this._solidAt(ahead, e.y + e.h / 2) || (!floorAhead && e.vy === 0)) { e.dir *= -1; e.x += e.dir * 2; e.charge = 0; }
    } else {
      const bx = e.ox + Math.sin(e.t * 0.9) * (e.maxX - e.minX) / 2, by = e.baseY + Math.sin(e.t * 1.8) * 10;
      if (e.immortal) {           // fantasma imortal: persegue devagar quando você chega perto (não dá para matar)
        if (e.gx === undefined) { e.gx = bx; e.gy = by; }
        const near = !calm && Math.abs(dx) < 230 && Math.abs(dy) < 150; const tx = near ? p.x : bx, ty = near ? p.y - 6 : by, k = near ? 0.014 : 0.03;
        e.gx += (tx - e.gx) * k; e.gy += (ty - e.gy) * k; e.x = e.gx + Math.sin(e.t * 3) * 4; e.y = e.gy + Math.sin(e.t * 2.2) * 5; e.dir = dx >= 0 ? 1 : -1; return;
      }
      let ox = 0, oy = 0;
      if (e.sw > 0) { const k = Math.sin((1 - e.sw / 64) * Math.PI); ox = k * (e.tx - bx); oy = k * (e.ty - by); e.sw--; if (e.sw === 0) e.cool = 110; }
      else if (e.cool > 0) e.cool--;
      else if (e.aggro && !calm && Math.abs(dx) < 150 && dy > -10 && dy < 130) { e.sw = 64; e.tx = p.x; e.ty = p.y; e.warn = 16; }
      if (e.warn > 0) e.warn--;
      e.x = bx + ox; e.y = by + oy; e.dir = e.sw > 0 ? (dx >= 0 ? 1 : -1) : (Math.cos(e.t * 0.9) >= 0 ? 1 : -1);
      if (e.shoot) { e.cd = (e.cd === undefined ? 70 : e.cd) - 1; if (!calm && e.cd <= 0 && Math.abs(dx) < 240 && dy > -20) { e.cd = 120; const L2 = Math.hypot(dx, dy) || 1; this.bullets.push({ x: e.x + 8, y: e.y + 8, vx: dx / L2 * 1.6, vy: dy / L2 * 1.6, g: 0, life: 220, col: 'fire' }); sfx.shoot && sfx.shoot(); } }
    }
  }
  _enemyHit(e) {
    const p = this.p; if (p.inv > 0 || p.dead > 0) return;
    if (p.x + p.w > e.x + 1 && p.x < e.x + e.w - 1 && p.y + p.h > e.y && p.y < e.y + e.h) {
      const bad = e.spiked || e.immortal;
      if (!bad && p.vy > 0.4 && p.y + p.h - e.y < 11) { e.alive = false; this.killed++; this.score += 50; p.vy = this.input.jump ? -4.8 : -3.4; p.jumping = true; sfx.stomp(); this._spark(e.x + e.w / 2, e.y + 4, '#ffffff', 12); this._text(e.x, e.y - 6, '+50', '#ffffff'); this.shake = 3; }
      else this._hurt();
    }
  }
'''
g = g[:i0] + NEW + g[i1:]
def rep(a, b):
    global g
    assert a in g, a[:90]; g = g.replace(a, b, 1)
rep("{ e.alive = false; this.killed++; this.score += 30; sh.life = 0;", "{ if (e.spiked || e.immortal) { sh.life = 0; this._spark(sh.x, sh.y, '#ffffff', 6); this._text(e.x - 2, e.y - 8, 'IMUNE', '#ffd0d0'); break; } e.alive = false; this.killed++; this.score += 30; sh.life = 0;")
# apoio adaptativo LOCAL: só vale perto de onde você travou
rep("const prev = this.assist; this.assist = n; this.assistMax = Math.max(this.assistMax, n); if (n === prev) return;", "const prev = this.assist; this.assist = n; this.assistMax = Math.max(this.assistMax, n); if (n > prev) this.assistX = this.p.x; if (n === prev) return;")
rep("this.respawn.x + 700", "this.respawn.x + 420")
rep("this._setAssist(this._assistLevelFor(this.segDeaths));", "this._setAssist(this._assistLevelFor(this.segDeaths)); if (this.assist) this.assistX = p.x;")
rep("    if (this.assist >= 2 && this.frame % 30 === 0) this._ghostNear();", "    if (this.assist > 0 && this.frame % 30 === 0 && this.assistX !== undefined && p.x > this.assistX + 26 * TS) this._relax();   // ajuda só no trecho difícil: 26 blocos adiante ela some\n    if (this.assist >= 2 && this.frame % 30 === 0) this._ghostNear();")
# projéteis com arco e cor
rep("for (const b of this.bullets) { b.x += b.vx; b.life--;", "for (const b of this.bullets) { b.x += b.vx; if (b.vy) { b.y += b.vy; b.vy += b.g || 0; } b.life--;")
rep("for (const b of this.bullets) { this._glow(x, b.x, b.y, 10, 'rgba(255,140,60,.7)', 0.8); x.fillStyle = '#ffd09a'; x.beginPath(); x.arc(b.x, b.y, 3.6, 0, 6.3); x.fill(); x.fillStyle = '#ff5a2e'; x.beginPath(); x.arc(b.x, b.y, 2.2, 0, 6.3); x.fill(); }",
    "for (const b of this.bullets) { const sp = b.col === 'spore'; this._glow(x, b.x, b.y, 11, sp ? 'rgba(255,90,230,.75)' : 'rgba(255,140,60,.7)', 0.85); x.fillStyle = sp ? '#ffd0f6' : '#ffd09a'; x.beginPath(); x.arc(b.x, b.y, 3.8, 0, 6.3); x.fill(); x.fillStyle = sp ? '#ff4fd8' : '#ff5a2e'; x.beginPath(); x.arc(b.x, b.y, 2.3, 0, 6.3); x.fill(); }")
# desenho dos inimigos: espinhos, alerta, aura de imortal, atirador carregando
rep("      drawFoot(x, sheet, e.type === 'bat' ? (f >> 3) & 1 : fr, e.x + e.w / 2, e.y + e.h + (e.type === 'bat' ? hh * 0.3 : 3) + bob, hh, e.dir < 0);",
    "      if (e.immortal) { this._glow(x, e.x + e.w / 2, e.y + e.h / 2, 34, 'rgba(255,40,90,.6)', 0.55 + 0.25 * Math.sin(f / 6)); }\n"
    "      drawFoot(x, sheet, e.type === 'bat' ? (f >> 3) & 1 : fr, e.x + e.w / 2, e.y + e.h + (e.type === 'bat' ? hh * 0.3 : 3) + bob, hh, e.dir < 0);\n"
    "      if (e.spiked) this._spikes(x, e, f);\n"
    "      if (e.alert > 0 || e.warn > 0) { x.save(); x.fillStyle = '#ff3b4a'; x.strokeStyle = '#fff'; x.lineWidth = 1.4; x.font = '700 14px \"Lilita One\", system-ui'; x.textAlign = 'center'; x.strokeText('!', e.x + e.w / 2, e.y - 6 - Math.sin(f / 2) * 1.5); x.fillText('!', e.x + e.w / 2, e.y - 6 - Math.sin(f / 2) * 1.5); this._glow(x, e.x + e.w / 2, e.y + e.h / 2, 22, 'rgba(255,60,70,.6)', 0.7); x.restore(); }\n"
    "      if (e.shooter && e.cd < 26 && e.cd >= 0) this._glow(x, e.x + e.w / 2 + e.dir * 8, e.y + 3, 20, 'rgba(255,90,230,.8)', 0.9);\n"
    "      if (e.shoot && e.cd < 24 && e.cd >= 0) this._glow(x, e.x + 8, e.y + 8, 20, 'rgba(255,140,60,.9)', 0.9);")
rep("  _crusher(x, k, f) {", "  _spikes(x, e, f) { const cx = e.x + e.w / 2, top = e.y - 1; x.save(); for (let k = -1; k <= 1; k++) { const bx = cx + k * 5.6; x.fillStyle = '#dfe6f8'; x.strokeStyle = '#2a2440'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(bx - 3.4, top + 3); x.lineTo(bx, top - 7.5 - (k === 0 ? 2 : 0)); x.lineTo(bx + 3.4, top + 3); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#ff4d5e'; x.beginPath(); x.arc(bx, top - 6 - (k === 0 ? 2 : 0), 1.1, 0, 6.3); x.fill(); } x.restore(); }\n  _crusher(x, k, f) {")
# peças na frente da câmera
rep("this.chests = (L.chests || []).map((k) => ({ ...k, open: false, t: 0 })); this.winds = L.winds || [];", "this.chests = (L.chests || []).map((k) => ({ ...k, open: false, t: 0 })); this.winds = L.winds || []; this.fgprops = L.fgprops || [];")
rep("chests: this.chests, winds: this.winds };", "chests: this.chests, winds: this.winds, fgprops: this.fgprops };")
rep("this.chests = m.chests; this.winds = m.winds; void keepCoins;", "this.chests = m.chests; this.winds = m.winds; this.fgprops = m.fgprops; void keepCoins;")
rep("    if (A.fg && !this.stations.some((st) => st.active)", "    if (this.fgprops && this.fgprops.length && !this.inSecret) this._fgprops(x, camX, camY, f);\n    if (A.fg && !this.stations.some((st) => st.active)")
rep("  _crusher(x, k, f) {", r'''  _fgprops(x, camX, camY, f) {   // peças NA FRENTE do herói e da câmera (parallax > 1): passam rápido, como no Donkey Kong Country
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
  _crusher(x, k, f) {''')
open('app/js/game.js', 'w', encoding='utf-8').write(g)
print('ok')
