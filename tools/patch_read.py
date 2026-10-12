def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:80])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

sub('app/js/game.js', [
 # leitura obrigatória: aproximar de cada objeto revela a "versão" dele; só depois dá para responder
 ("    else if (s.near >= 0) { s.near = -1; this.hooks.onNear && this.hooks.onNear(-1); }\n    if (s.active) {\n      s.dwellF++;",
  "    else if (s.near >= 0) { s.near = -1; this.hooks.onNear && this.hooks.onNear(-1); }\n"
  "    if (s.active) {\n"
  "      s.rd = s.rd || [0, 0, 0]; s.rev = s.rev || [false, false, false];\n"
  "      if (this.bot) { s.typed = true; s.rev = [true, true, true]; }\n"
  "      if (s.near >= 0 && !s.rev[s.near] && s.typed) { s.rd[s.near]++; if (s.rd[s.near] >= 36) this.reveal(s, s.near); }\n"
  "      else if (s.near >= 0 && s.rev[s.near]) s.rd[s.near]++;\n"
  "      if (!s.ready && s.typed && s.rev.every(Boolean)) { s.ready = true; sfx.check(); if (!s.practice) { for (let k = 0; k < 6; k++) this._bank(); this._text(this.p.x - 16, this.p.y - 22, 'OUVIU TUDO! +6 MOEDAS', '#fff0a0'); } this.hooks.onReady && this.hooks.onReady(s, this); }\n"
  "      s.dwellF++;"),
 ("      if (sel >= 0 && sel !== s.selected) {\n        if (s.selected >= 0) s.changes++;",
  "      if (sel >= 0 && !s.ready) { if (this.frame - (s.nagF || -999) > 70) { s.nagF = this.frame; this.hooks.onNag && this.hooks.onNag(s, this); sfx.empty && sfx.empty(); } sel = -1; }\n"
  "      if (sel >= 0 && sel !== s.selected) {\n        if (s.selected >= 0) s.changes++;"),
 ("  _optAnim(s) {", "  reveal(s, i) { if (!s.rev) s.rev = [false, false, false]; if (s.rev[i]) return; s.rev[i] = true; sfx.blip && sfx.blip(); this.hooks.onReveal && this.hooks.onReveal(s, i, this); }\n  _optAnim(s) {"),
])

sub('app/js/ui.js', [
 # painel: texto digitado, alternativas travadas até chegar perto de cada objeto
 ("function renderPanel(s) {",
  "let twTimer = null;\nfunction stopType() { if (twTimer) { clearInterval(twTimer); twTimer = null; } }\n"
  "function finishType(s) { stopType(); s.typed = true; const c = $('q-ctx'); c.textContent = s.item.ctx || ''; $('q-stem').textContent = s.item.stem; }\n"
  "function startType(s) {\n  stopType(); if (s.typed) { finishType(s); return; }\n  const a = s.item.ctx || '', b = s.item.stem, tot = a.length + b.length; let i = 0; $('q-ctx').textContent = ''; $('q-stem').textContent = '';\n"
  "  twTimer = setInterval(() => { i += 3; $('q-ctx').textContent = a.slice(0, Math.min(i, a.length)); $('q-stem').textContent = i > a.length ? b.slice(0, i - a.length) : ''; if (i >= tot) finishType(s); }, 34);\n}\n"
  "function progDots(s) { const n = (s.rev || []).filter(Boolean).length; return 'VERSÕES OUVIDAS ' + '●'.repeat(n) + '○'.repeat(3 - n); }\n"
  "function setLi(li, s, i) { const o = s.item.opts[s.order[i]]; const sp = li.querySelector('span'); const rv = s.rev && s.rev[i]; li.classList.toggle('lk', !rv); sp.textContent = rv ? o.t : `🔒 Chegue perto de ${OPT_COLORS[i].shape} ${OPT_COLORS[i].letter} e ouça esta versão`; }\n"
  "function renderPanel(s) {"),
 ("$('q-stem').textContent = s.item.stem; const ul = $('q-opts'); ul.innerHTML = '';",
  "$('q-stem').textContent = ''; c.textContent = ''; const ul = $('q-opts'); ul.innerHTML = '';"),
 ("sp.textContent = o.t; li.append(b, sp); ul.appendChild(li); }",
  "li.append(b, sp); ul.appendChild(li); setLi(li, s, i); void o; }\n  startType(s); $('q-prog').textContent = progDots(s);"),
 ("$('q-hint').textContent = HINTS[s.type] || HINTS.ped; S.seen = S.seen || {}; $('q-hint').hidden = !!S.seen[s.type] && !s.practice; S.seen[s.type] = 1; $('qpanel').hidden = false;",
  "S.seen = S.seen || {}; $('q-hint').textContent = s.ready ? (HINTS[s.type] || HINTS.ped) : 'PASSO 1: chegue perto de cada objeto e ouça as 3 versões (🔒). PASSO 2: responda do jeito do objeto.'; $('q-hint').hidden = false; $('q-hint').classList.remove('nag'); $('qpanel').classList.toggle('ready', !!s.ready); $('qpanel').hidden = false;"),
 ("  onNear(i) {",
  "  onReveal(s, i) { const li = $('q-opts').children[i]; if (li) { setLi(li, s, i); li.classList.add('rv'); setTimeout(() => li.classList.remove('rv'), 900); } $('q-prog').textContent = progDots(s); },\n"
  "  onReady(s) { $('qpanel').classList.add('ready'); const h = $('q-hint'); h.classList.remove('nag'); const first = !S.seen[s.type] || s.practice; S.seen[s.type] = 1; h.textContent = '✔ Agora escolha: ' + (HINTS[s.type] || HINTS.ped); h.hidden = !first; },\n"
  "  onNag(s) { const p = $('qpanel'); const h = $('q-hint'); h.hidden = false; h.classList.add('nag'); p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); setTimeout(() => p.classList.remove('shake'), 500); },\n"
  "  onNear(i) {"),
 ("  onStationExit() { $('qpanel').hidden = true; stopSpeak(); },", "  onStationExit() { $('qpanel').hidden = true; stopType(); stopSpeak(); },"),
 # leitura em voz alta: cada opção falada é revelada; falar o enunciado conclui a digitação
 ("    document.querySelectorAll('#q-opts li').forEach((l, i) => l.classList.toggle('say', p.opt === i));",
  "    if (p.opt === undefined) { if (!s.typed) finishType(s); } else if (game && s.rev && !s.rev[p.opt]) game.reveal(s, p.opt);\n    document.querySelectorAll('#q-opts li').forEach((l, i) => l.classList.toggle('say', p.opt === i));"),
 ("stem: s.item.stem, chosen: opt.t,", "rd: (s.rd || []).slice(), stem: s.item.stem, chosen: opt.t,"),
 ("answers: p.answers.map((a) => ({ slot: a.slot,", "answers: p.answers.map((a) => ({ rd: a.rd, slot: a.slot,"),
])
sub('app/index.html', [
 ("<div id=\"q-head\"><span id=\"q-who\"></span>", "<div id=\"q-head\"><span id=\"q-who\"></span><span id=\"q-prog\"></span>"),
])
