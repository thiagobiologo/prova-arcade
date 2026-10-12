def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:70])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

sub('app/js/ui.js', [
 # orientação: agora a vertical é suportada
 ("function checkOrient() { const portrait = innerHeight > innerWidth; const need = scene === 'play' && portrait && Math.min(innerWidth, innerHeight) < 700; document.body.classList.toggle('need-landscape', need); if (game) game.paused = need || S.paused; }",
  "function checkOrient() { const portrait = innerHeight > innerWidth * 1.12; document.body.classList.toggle('portrait', portrait); document.body.classList.remove('need-landscape'); if (game) game.paused = S.paused; }"),
 # enquadramento: em pé ocupa a tela toda
 ("  const W = Math.max(330, Math.min(500, Math.round(216 * vw / vh / 2) * 2)); const sc = Math.min(vw / W, vh / 216); const fw = Math.floor(W * sc), fh = Math.floor(216 * sc);",
  "  let fw, fh; if (vh > vw * 1.12) { fw = Math.floor(vw); fh = Math.floor(vh); } else { const W = Math.max(330, Math.min(500, Math.round(216 * vw / vh / 2) * 2)); const sc = Math.min(vw / W, vh / 216); fw = Math.floor(W * sc); fh = Math.floor(216 * sc); }"),
 # painel ligado à AURA
 ("  onHud() { $('hud-score').textContent = game.score; },",
  "  onHud() { $('hud-score').textContent = game.score; },\n  onAura(fx) { const p = $('qpanel'); if (p.hidden) return; const fr = $('frame'); const ax = fx * fr.clientWidth; const pr = p.getBoundingClientRect(), fr0 = fr.getBoundingClientRect(); const left = Math.max(26, Math.min(pr.width - 26, ax - (pr.left - fr0.left))); const t = $('q-tail'); if (t) t.style.left = left + 'px'; },"),
 # edição
 ("  S.auth = auth; document.body.classList.toggle('touch'",
  "  S.auth = auth; S.edition = auth.edition === 'premium' ? 'premium' : 'pesquisa'; document.body.dataset.edition = S.edition; $('ed-badge').hidden = $('pitch').hidden = S.edition !== 'premium'; document.body.classList.toggle('touch'"),
 ("S.charStep = 0; sfx.select(); flowChar();\n}",
  "S.charStep = 0; sfx.select();\n  if (S.edition === 'premium') { const fi = CHARS.findIndex((c) => c.id === 'fox'); S.players.forEach((p) => { p.char = fi; }); doMood('pre', 0); return; }\n  flowChar();\n}"),
 ("function startRun() { const seq = ['train', 's1', 's2', 's3'];", "function startRun() { const seq = S.edition === 'premium' ? ['train', 's1', 's2'] : ['train', 's1', 's2', 's3'];"),
 ("p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* ok */ } }).catch(() => {});", "p.catch(() => {});"),
])
sub('app/index.html', [
 ("<p class=\"tag\">Aventura de nivelamento · você joga, a gente enxerga o que você já sabe</p>",
  "<p class=\"ed\" id=\"ed-badge\" hidden>EDIÇÃO DEMONSTRAÇÃO · PREMIUM</p>\n    <p class=\"tag\">Aventura de nivelamento · você joga, a gente enxerga o que você já sabe</p>"),
 ("    <p class=\"lic\" id=\"lic-line\"></p>\n  </section>",
  "    <ul class=\"pitch\" id=\"pitch\" hidden><li><b>Diagnóstico por habilidade</b><span>cada caso da AURA mede uma habilidade essencial, dentro da aventura</span></li><li><b>Painel para o professor</b><span>mapa da sala, defasagens por prioridade, Excel e PDF</span></li><li><b>Aplicação por QR Code</b><span>30 a 40 alunos no celular, sem instalar nada</span></li></ul>\n    <p class=\"lic\" id=\"lic-line\"></p>\n  </section>"),
 ("      <img id=\"q-av\" src=\"/app/gfx/aura.png\" alt=\"\" draggable=\"false\">", "      <i id=\"q-tail\" aria-hidden=\"true\"></i>\n      <img id=\"q-av\" src=\"/app/gfx/aura.png\" alt=\"\" draggable=\"false\">"),
 ("title=\"Cada 25 moedas = 1 coração\"", "title=\"Moedas enchem o coração\""),
])
