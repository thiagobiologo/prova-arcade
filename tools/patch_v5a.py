def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:90])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

# ---------- rótulos curtos nos objetos (aparecem depois que a versão é ouvida) ----------
open('app/js/labels.js', 'w', encoding='utf-8').write('''/* Rótulos curtos que aparecem em cima de cada objeto depois que o aluno ouviu a versão (ajuda a lembrar qual é qual). © Thiago Silva. */
export const LABELS = {
  '0A': ['Cérebro não interpreta', 'Olho interpreta sozinho', 'Olho emite raios'],
  '0B': ['Reflexo da luz da tela', 'Olho emite feixe', 'Poltrona com luz própria'],
  '1A': ['Divergente', 'Convergente', 'Nenhuma lente'],
  '1B': ['Divergente (fina)', 'Convergente (grossa)', 'Convergente: aumenta'],
  '2A': ['Paulo conv. · Rita div.', 'Paulo div. · Rita conv.', 'Mesma lente'],
  '2B': ['Convergente', 'Divergente', 'Lente escura'],
  '3A': ['Esqueleto também apoia', 'Só protege órgãos', 'Ossos movem tudo'],
  '3B': ['Sustenta e protege', 'Produz calor', 'Move sozinho'],
  '4A': ['Músculos se alternam', 'Músculos empurram', 'Contraem juntos'],
  '4B': ['Músculo enfraqueceu', 'Ossos dobram sozinhos', 'Músculos são molas'],
  '5A': ['Sinal olhos→músculos', 'Ossos comandam', 'Músculos decidem'],
  '5B': ['Sinal não chega', 'Ossos sem ordens', 'Músculos sem comando'],
  '6A': ['Cafeína, nicotina, álcool', 'Só as proibidas', 'Todas as substâncias'],
  '6B': ['Cafeína estimula', 'Age só no estômago', 'Natural: não atua'],
  '7A': ['Sistema nervoso mais lento', 'Acelera o sistema', 'Só o fígado'],
  '7B': ['Reduz atenção e reflexos', 'Só estômago e fígado', 'Aumenta a força'],
  '8A': ['Adaptação à nicotina', 'Falta de vontade', 'Legal não vicia'],
  '8B': ['É falsa', 'É verdadeira', 'Só as legais'],
  P: ['Plantas iguais: claro × escuro', 'Plantas diferentes', 'Uma planta só'],
};
''')

# ---------- servidor: "Não sei" conta como resposta não correta e gera o indicativo IDK ----------
sub('lib_results.js', [
 ("    const item = slot.forms[a.form]; const idx = a.order[a.ped]; const opt = item.opts[idx]; if (!opt) continue;",
  "    const item = slot.forms[a.form];\n"
  "    if (+a.ped === 3) { const okx = item.opts.find((o) => o.ok); per[slot.skill].tot++; tags.push('IDK'); items.push({ slot: a.slot, skill: slot.skill, form: a.form, ctx: item.ctx || '', stem: item.stem, chosen: 'Não sei', expected: okx.t, ok: false, idk: true, tag: 'IDK', changes: +a.changes || 0, tFirst: +a.tFirst || 0, dwell: +a.dwell || 0, visits: +a.visits || 1 }); continue; }\n"
  "    const idx = a.order[a.ped]; const opt = item.opts[idx]; if (!opt) continue;"),
])
sub('app/js/items.js', [("    P9: 'Acredita que adolescentes são mais resistentes que adultos aos efeitos dessas substâncias.',",
  "    P9: 'Acredita que adolescentes são mais resistentes que adultos aos efeitos dessas substâncias.',\n    IDK: 'Declarou não saber responder (marcou \"Não sei\"): a habilidade ainda não foi construída ou o aluno não reconheceu o conceito.',")])

# ---------- cores: 4º objeto (cinza, "Não sei") ----------
sub('app/js/art.js', [("  { main: '#b46bff', dark: '#6a2fb3', letter: 'C', shape: '▲', name: 'roxo' },\n];",
  "  { main: '#b46bff', dark: '#6a2fb3', letter: 'C', shape: '▲', name: 'roxo' },\n  { main: '#aab0c8', dark: '#5a6082', letter: '?', shape: '◇', name: 'cinza', idk: true },\n];"),
 ("ice: false,", "ice: false,") if False else ("night: true, abyss: '#2b0b52', fog: '#7a60ff', enemy: 'spider'", "night: true, ice: true, abyss: '#2b0b52', fog: '#7a60ff', enemy: 'spider'"),
 ("name: 'Caverna dos Cristais'", "name: 'Geleira dos Cristais'"),
])
sub('app/js/ui.js', [("name: 'CAVERNA DOS CRISTAIS'", "name: 'GELEIRA DOS CRISTAIS'")])

# ---------- fases: 4 objetos por estação (o 4º é "Não sei") e mais dificuldade ----------
sub('app/js/levels.js', [
 ("const pc = [c0 + 4, c0 + 9, c0 + 14]; const gc = c0 + 19;", "const pc = [c0 + 3, c0 + 7, c0 + 11, c0 + 15]; const gc = c0 + 19;"),
 ("if (d >= 1) blob(c0 + 6, c0 + n - 2, g, d >= 2);", "if (d >= 1) blob(c0 + 6, c0 + n - 2, g, d >= 2); if (d >= 2) blob(c0 + 2, c0 + 7, g, true);"),
 ("    bats() { const n = rnd(10, 12); const c0 = c; flat(n); bat(c0 + 4, g - 4, 3); bat(c0 + 8, g - 5, 3); if (d >= 3) bat(c0 + 6, g - 3, 2);",
  "    bats() { const n = rnd(10, 12); const c0 = c; flat(n); bat(c0 + 4, g - 4, 3); bat(c0 + 8, g - 5, 3, { shoot: d >= 2 }); if (d >= 2) bat(c0 + 6, g - 3, 2);"),
 ("'spring', 'tower', 'crusher', 'windlift', 'shooters'],", "'spring', 'tower', 'crusher', 'windlift', 'shooters', 'enemy', 'ambush'],"),
 ("'windlift', 'shooters', 'ambush'],", "'windlift', 'shooters', 'ambush', 'enemy', 'gauntlet', 'shooters'],"),
 ("'windlift', 'shooters', 'ambush', 'ambush'],", "'windlift', 'shooters', 'ambush', 'ambush', 'gauntlet', 'enemy', 'shooters'],"),
])

# ---------- motor ----------
sub('app/js/game.js', [
 ("maxShield: 2,", "maxShield: 1,"),
 # estrela comum não dá mais escudo: dá pontos e moedas (escudo só no bônus especial)
 ("s.got = true; this.secrets++; this.score += 100; p.shield = Math.min(ECON.maxShield, p.shield + 1); sfx.star(); this._spark(s.x + 8, s.y + 8, '#fff0a0', 22); this._text(s.x - 10, s.y - 8, '★ +100 · ESCUDO', '#fff0a0'); this._emitHp(); }",
  "s.got = true; this.secrets++; this.score += 100; for (let k = 0; k < 10; k++) this._bank(); sfx.star(); this._spark(s.x + 8, s.y + 8, '#fff0a0', 22); this._text(s.x - 12, s.y - 8, '★ +100 · +10 MOEDAS', '#fff0a0'); }"),
 # fase bônus: morreu = sai
 ("  _exitSecret() {\n    const m = this.main; if (!m) return;", "  _exitSecret(failed) {\n    const m = this.main; if (!m) return;"),
 ("this.inSecret = false; this.secretUsed = true; this.secretRoom = true; this.main = null;", "this.inSecret = false; this.secretUsed = true; this.secretRoom = !failed; this.main = null;"),
 ("    this._heal(1, p.x, p.y); p.shield = Math.min(ECON.maxShield, p.shield + 1); this.score += 200; sfx.clear(); this._spark(p.x + 5, p.y, '#fff0a0', 30); this._text(p.x - 14, p.y - 22, 'SECRETA! +200 · ESCUDO', '#fff0a0'); this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false);",
  "    if (failed) { this._text(p.x - 26, p.y - 22, 'CAIU! SAIU DO BÔNUS', '#ffb0b0'); sfx.hurt(); this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false); return; }\n    this._heal(1, p.x, p.y); p.shield = Math.min(ECON.maxShield, p.shield + 1); this.score += 200; sfx.clear(); this._spark(p.x + 5, p.y, '#fff0a0', 30); this._text(p.x - 14, p.y - 22, 'BÔNUS! +200 · ESCUDO ESPECIAL', '#fff0a0'); this._emitHp(); this.hooks.onSecret && this.hooks.onSecret(false);"),
 ("this._emitHp(); this.snapCam(); }\n\n  /* ---------- fase secreta", "this._emitHp(); if (this.inSecret) { this._exitSecret(true); return; } this.snapCam(); }\n\n  /* ---------- fase secreta"),
 # leitura: 4 objetos, tempo mínimo de leitura
 ("      s.rd = s.rd || [0, 0, 0]; s.rev = s.rev || [false, false, false];\n      if (this.bot) { s.typed = true; s.rev = [true, true, true]; }",
  "      s.rd = s.rd || [0, 0, 0, 0]; s.rev = s.rev || [false, false, false, true]; s.readF = (s.readF || 0) + 1;\n      if (this.bot) { s.typed = true; s.rev = [true, true, true, true]; s.readF = 1e9; }\n      if (this.frame % 6 === 0 && this.hooks.onReadTick) this.hooks.onReadTick(s, Math.min(1, s.readF / (s.readNeed || 1)));"),
 ("if (!s.ready && s.typed && s.rev.every(Boolean)) {", "if (!s.ready && s.typed && s.rev.every(Boolean) && s.readF >= (s.readNeed || 0)) {"),
 ("reveal(s, i) { if (!s.rev) s.rev = [false, false, false];", "reveal(s, i) { if (!s.rev) s.rev = [false, false, false, true];"),
 # gelo: derrapa
 ("    const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0); const a = p.on ? PHY.acc : PHY.air;\n    if (dir) { p.vx += dir * a; p.face = dir; if (Math.abs(p.vx) > PHY.maxV) p.vx = PHY.maxV * Math.sign(p.vx); if (dir !== Math.sign(p.vx) && p.on) p.vx += dir * PHY.fric; }\n    else { const f = p.on ? PHY.fric : PHY.fric * 0.4;",
  "    const ice = this.A.th.ice && p.on && !p.ride && !this.inSecret; const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0); const a = ice ? 0.042 : (p.on ? PHY.acc : PHY.air);\n    if (dir) { p.vx += dir * a; p.face = dir; if (Math.abs(p.vx) > PHY.maxV) p.vx = PHY.maxV * Math.sign(p.vx); if (dir !== Math.sign(p.vx) && p.on) p.vx += dir * (ice ? 0.012 : PHY.fric); }\n    else { const f = ice ? 0.01 : (p.on ? PHY.fric : PHY.fric * 0.4);"),
 ("    p.anim += Math.abs(p.vx) * 0.11 + 0.02;", "    p.anim += Math.abs(p.vx) * 0.11 + 0.02; if (ice && Math.abs(p.vx) > 0.5 && this.frame % 4 === 0) this.parts.push({ x: p.x + 5 - Math.sign(p.vx) * 4, y: p.y + 19, vx: -p.vx * 0.2, vy: -0.2, life: 14, col: 'rgba(210,245,255,.85)', r: 1.2 });"),
 # dificuldade dos monstros
 ("vx: 0.5 + Math.random() * 0.14,", "vx: 0.62 + Math.random() * 0.2,"),
 ("Math.abs(dx) < 120 && Math.abs(dy) < 30) e.alert = 20;", "Math.abs(dx) < 150 && Math.abs(dy) < 34) e.alert = 16;"),
 ("if (e.alert === 0) e.charge = 100;", "if (e.alert === 0) e.charge = 130;"),
 ("sp = e.vx * 2.6 * e.dir * slow;", "sp = e.vx * 3.0 * e.dir * slow;"),
 ("if (!calm && Math.abs(dx) < 210 && Math.abs(dy) < 90) { e.cd--; if (e.cd <= 0) { e.cd = 110; this.bullets.push({ x: e.x + e.w / 2 + e.dir * 8, y: e.y + 2, vx: e.dir * 1.7,", "if (!calm && Math.abs(dx) < 230 && Math.abs(dy) < 90) { e.cd--; if (e.cd <= 0) { e.cd = 84; this.bullets.push({ x: e.x + e.w / 2 + e.dir * 8, y: e.y + 2, vx: e.dir * 2.0,"),
 ("Math.abs(dx) < 150 && dy > -10 && dy < 130) { e.sw = 64;", "Math.abs(dx) < 190 && dy > -10 && dy < 140) { e.sw = 52;"),
 ("const k = Math.sin((1 - e.sw / 64) * Math.PI);", "const k = Math.sin((1 - e.sw / 52) * Math.PI);"),
 ("if (e.sw === 0) e.cool = 110; }", "if (e.sw === 0) e.cool = 78; }"),
 ("k = near ? 0.014 : 0.03;", "k = near ? 0.02 : 0.03;"),
])
# etiquetas em cima dos objetos (depois de ouvir a versão)
g = open('app/js/game.js', encoding='utf-8').read()
a = "    for (const d of s.opts) {\n      const lit = s.selected === d.i; const o = OPT_COLORS[d.i];"
assert a in g
g = g.replace(a, "    this._tags(x, s);\n" + a, 1)
a = "  _optBadge(x, d, lit, f) {"
assert a in g
g = g.replace(a, """  _tags(x, s) {   // rótulo curto sobre cada objeto (só depois de ouvir a versão; "NÃO SEI" sempre)
    if (!s.labels) return; x.save(); x.font = '700 6.4px "Nunito", system-ui'; x.textAlign = 'center';
    for (const d of s.opts) { const idk = d.i === 3; if (!idk && !(s.rev && s.rev[d.i])) continue; const txt = s.labels[d.i]; if (!txt) continue;
      const cx = d.type === 'balloon' || s.type === 'balloon' ? d.fx + d.w / 2 : d.x + (d.roll || 0) + d.w / 2; const top = s.type === 'balloon' ? d.fy : (s.type === 'barrel' ? d.y + (d.yoff || 0) : d.y);
      if (s.type === 'barrel' && !d.landed) continue; const w = x.measureText(txt).width + 8, ty = top - 17; const o = OPT_COLORS[d.i];
      x.fillStyle = 'rgba(12,8,40,.82)'; x.beginPath(); x.roundRect ? x.roundRect(cx - w / 2, ty - 8, w, 11, 4) : x.rect(cx - w / 2, ty - 8, w, 11); x.fill(); x.strokeStyle = o.main; x.lineWidth = 1; x.stroke(); x.fillStyle = '#ffffff'; x.fillText(txt, cx, ty); }
    x.restore();
  }
""" + a, 1)
open('app/js/game.js', 'w', encoding='utf-8').write(g)
print('ok')
