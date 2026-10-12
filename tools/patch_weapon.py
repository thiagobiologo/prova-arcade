import sys, os
base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app')
def patch(rel, pairs):
    p = os.path.join(base, rel); s = open(p, encoding='utf8').read()
    for old, new in pairs:
        if old not in s: print('NAO ACHEI em', rel, ':', old[:90]); sys.exit(1)
        s = s.replace(old, new, 1)
    open(p, 'w', encoding='utf8').write(s)

patch('js/game.js', [
 ("export const ECON = { startHp: 3, maxHp: 5, coinsPerHeart: 25, maxShield: 2 };",
  "export const ECON = { startHp: 3, maxHp: 5, coinsPerHeart: 25, maxShield: 2, shotsPerBoss: 3, maxAmmo: 6 };"),
 ("this.input = { left: false, right: false, jump: false, _jumpPrev: false };",
  "this.input = { left: false, right: false, jump: false, fire: false, _jumpPrev: false, _firePrev: false };"),
 # carga
 ("    this.orbs = []; this.waves = []; this.parts = []; this.texts = []; this.shake = 0; this.main = null;",
  "    this.weapon = !!cfg.weapon; this.ammo = cfg.weapon ? Math.max(0, cfg.ammo | 0) : 0; this.ammoStart = this.ammo; this.ammoUsed = 0; this.shots = []; this.fireCool = 0;\n    this.orbs = []; this.waves = []; this.parts = []; this.texts = []; this.shake = 0; this.main = null;"),
 ("this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false);\n  }\n  _applyLevel",
  "this._emitHp(); this._emitAmmo(); this.hooks.onSecret && this.hooks.onSecret(false);\n  }\n  _emitAmmo() { this.hooks.onAmmo && this.hooks.onAmmo({ weapon: this.weapon, ammo: this.ammo, max: ECON.maxAmmo }); }\n  _applyLevel"),
 # disparo
 ("    // molas\n",
  "    // arma (Orbe de Luz): pouquíssimos tiros, sem recarga; não funciona durante as perguntas\n    if (this.fireCool > 0) this.fireCool--;\n    if (I.fire && !I._firePrev && this.weapon && this.fireCool === 0 && p.dead === 0 && !this.stations.some((s) => s.active)) {\n      if (this.ammo > 0) { this.ammo--; this.ammoUsed++; this.fireCool = 14; this.shots.push({ x: p.x + (p.face > 0 ? p.w : -3), y: p.y + 8, vx: p.face * 3.8, life: 90 }); sfx.shoot(); this._spark(p.x + (p.face > 0 ? p.w + 2 : -2), p.y + 8, '#fff6b0', 5); this._emitAmmo(); }\n      else { this.fireCool = 20; sfx.empty(); this._text(p.x - 8, p.y - 6, 'SEM MUNIÇÃO', '#ff9ab0'); }\n    }\n    I._firePrev = I.fire; this._shots();\n    // molas\n"),
 ("  _emitAmmo() {",
  "  _shots() {\n    for (const sh of this.shots) {\n      sh.x += sh.vx; sh.life--; if (this._solidAt(sh.x, sh.y)) { sh.life = 0; this._spark(sh.x, sh.y, '#fff6b0', 5); continue; }\n      for (const e of this.enemies) if (e.alive && sh.x > e.x - 2 && sh.x < e.x + e.w + 2 && sh.y > e.y - 2 && sh.y < e.y + e.h + 2) { e.alive = false; this.killed++; this.score += 30; sh.life = 0; sfx.stomp(); this._spark(e.x + e.w / 2, e.y + 6, '#fff6b0', 14); this._text(e.x, e.y - 6, '+30', '#fff6b0'); break; }\n      const B = this.boss; if (sh.life > 0 && B && B.active && !B.dead && B.inv === 0 && sh.x > B.x && sh.x < B.x + B.w && sh.y > B.y && sh.y < B.y + B.h) { sh.life = 0; this._bossHit(B, true); }\n    }\n    this.shots = this.shots.filter((s) => s.life > 0);\n  }\n  _emitAmmo() {"),
 # chefe: dano por tiro + desbloqueio da arma
 ("  _bossHit(B) {\n    const p = this.p; B.hp--; B.inv = 80; B.stun = 70; B.flash = 14; B.st = 'stun'; B.vx = 0; p.vy = -4.6; p.jumping = true; sfx.stomp();",
  "  _bossHit(B, byShot) {\n    const p = this.p; B.hp--; B.inv = byShot ? 55 : 80; B.stun = byShot ? 40 : 70; B.flash = 14; B.st = 'stun'; B.vx = 0; if (!byShot) { p.vy = -4.6; p.jumping = true; } sfx.stomp();"),
 ("this.goal.enabled = true; setMode('play'); setIntensity(0.25);\n      this._text(B.x - 20, B.y - 20, 'CHEFE DERROTADO!', '#ffe36b');",
  "this.goal.enabled = true; setMode('play'); setIntensity(0.25);\n      this.weapon = true; this.ammo = Math.min(ECON.maxAmmo, this.ammo + ECON.shotsPerBoss); this._emitAmmo(); this._text(B.x - 40, B.y - 36, 'ORBE DE LUZ: +' + ECON.shotsPerBoss + ' tiros (sem recarga)', '#fff6b0');\n      this._text(B.x - 20, B.y - 20, 'CHEFE DERROTADO!', '#ffe36b');"),
 # stats
 ("hpEnd: this.p.hp };", "hpEnd: this.p.hp, weapon: this.weapon, ammoEnd: this.ammo, ammoUsed: this.ammoUsed };"),
 # desenho dos tiros (antes do jogador)
 ("    this._playerDraw(x, p, f);\n    for (const q of this.parts)",
  "    for (const sh of this.shots) { this._glow(x, sh.x, sh.y, 14, 'rgba(255,240,150,.9)', 1); x.fillStyle = '#fffbe0'; x.beginPath(); x.arc(sh.x, sh.y, 2.6, 0, 6.3); x.fill(); x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(sh.x - Math.sign(sh.vx) * 4, sh.y, 1.6, 0, 6.3); x.fill(); }\n    this._playerDraw(x, p, f);\n    for (const q of this.parts)"),
 ("this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false);\n  }\n  _emitAmmo()", "this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false);\n  }\n  _emitAmmo()") if False else ("    setMode('play'); setIntensity(0.12);\n    this.hooks.onLoaded", "    setMode('play'); setIntensity(0.12); this._emitAmmo();\n    this.hooks.onLoaded"),
])
patch('js/audio.js', [
 ("  spring: () =>", "  shoot: () => { osc('square', 900, 260, 0.12, 0.3); osc('triangle', 1400, 500, 0.1, 0.18, 0.02); },\n  empty: () => osc('square', 140, 110, 0.08, 0.2),\n  spring: () =>"),
])
patch('js/ui.js', [
 ("const map = { ArrowLeft: 'left',", "const map = { x: 'fire', X: 'fire', k: 'fire', K: 'fire', ArrowLeft: 'left',"),
 ("hold('t-left', 'left'); hold('t-right', 'right'); hold('t-jump', 'jump');", "hold('t-left', 'left'); hold('t-right', 'right'); hold('t-jump', 'jump'); hold('t-fire', 'fire');"),
 ("game.load({ key: t.key, seed: st.seed, nStations: st.n, charIdx: pl.char, playerIdx: t.p, quick: S.quick });", "game.load({ key: t.key, seed: st.seed, nStations: st.n, charIdx: pl.char, playerIdx: t.p, quick: S.quick, weapon: pl.weapon, ammo: pl.ammo });"),
 ("pl.stages[t.key] = stats; pl.score += stats.score;", "pl.stages[t.key] = stats; pl.score += stats.score; pl.weapon = stats.weapon; pl.ammo = stats.ammoEnd;"),
 ("  onAssist(n) {", "  onAmmo(a) { const box = $('hud-ammo'); box.hidden = !a.weapon; if (a.weapon) box.innerHTML = '<span>ORBE</span>' + Array.from({ length: a.max }, (_, i) => `<i class=\"${i < a.ammo ? 'on' : ''}\">✦</i>`).join(''); $('t-fire').hidden = !a.weapon; $('t-fire').classList.toggle('empty', a.ammo === 0); },\n  onAssist(n) {"),
 ("newPlayers(n) { S.players = Array.from({ length: n }, (_, i) => ({ idx: i,", "newPlayers(n) { S.players = Array.from({ length: n }, (_, i) => ({ weapon: false, ammo: 0, idx: i,"),
 ("<li><b>💬 Casos da AURA:</b> responda do jeito que o jogo pedir.</li>", "<li><b>💬 Casos da AURA:</b> responda do jeito que o jogo pedir.</li>") if False else ("$('hud-score').textContent = game.score; }", "$('hud-score').textContent = game.score; }"),
])
patch('index.html', [
 ('<div id="hud-bank" title="Cada 25 moedas = 1 coração">', '<div id="hud-ammo" hidden title="Orbe de Luz: poucos tiros, sem recarga"></div>\n        <div id="hud-bank" title="Cada 25 moedas = 1 coração">'),
 ('<button id="t-jump" aria-label="Pular">PULAR</button>', '<div id="rbtns"><button id="t-fire" aria-label="Atirar" hidden>✦</button><button id="t-jump" aria-label="Pular">PULAR</button></div>'),
 ('<li><b>💬 Casos da AURA:</b> responda do jeito que o jogo pedir.</li>', '<li><b>💬 Casos da AURA:</b> responda do jeito que o jogo pedir (barril, balão, porta, bloco…).</li>\n      <li><b>✦ Arma:</b> ao derrotar um chefão você ganha 3 tiros de luz. <b>Não recarrega!</b> (tecla X)</li>'),
])
print('ok')
