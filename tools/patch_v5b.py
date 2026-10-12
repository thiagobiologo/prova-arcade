def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:90])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

sub('app/js/ui.js', [
 ("import { SKINS, ACCS, newCos, dressed } from './cosmetics.js';", "import { SKINS, ACCS, newCos, dressed } from './cosmetics.js';\nimport { LABELS } from './labels.js';"),
 # tempo mínimo de leitura + rótulos
 ("  if (s.practice) { s.item = PRACTICE; s.order = makeOrder(PRACTICE, Math.floor(Math.random() * 3)); s.meta = { practice: true }; return; }",
  "  const fin = (key) => { const n = (s.item.ctx || '').length + s.item.stem.length + [0, 1, 2].reduce((a, i) => a + s.item.opts[s.order[i]].t.length, 0); s.readNeed = Math.round(Math.min(1200, Math.max(480, n / 22 * 60))); s.labels = [0, 1, 2].map((i) => (LABELS[key] || [])[s.order[i]] || '').concat(['NÃO SEI']); };\n"
  "  if (s.practice) { s.item = PRACTICE; s.order = makeOrder(PRACTICE, Math.floor(Math.random() * 3)); s.meta = { practice: true }; fin('P'); return; }"),
 ("s.item = item; s.order = makeOrder(item, pl.pos[slotIdx]);", "s.item = item; s.order = makeOrder(item, pl.pos[slotIdx]); fin(slotIdx + pl.form);"),
 # progresso conta só as 3 versões
 ("function progDots(s) { const n = (s.rev || []).filter(Boolean).length;", "function progDots(s) { const n = (s.rev || []).slice(0, 3).filter(Boolean).length;"),
 # 4ª linha: Não sei
 ("li.append(b, sp); ul.appendChild(li); setLi(li, s, i); void o; }", "li.append(b, sp); ul.appendChild(li); setLi(li, s, i); void o; }\n  { const li = document.createElement('li'); li.dataset.ped = 3; li.className = 'idk' + (s.selected === 3 ? ' sel' : ''); const b = document.createElement('b'); b.textContent = '◇ ?'; b.style.background = OPT_COLORS[3].main; const sp = document.createElement('span'); sp.textContent = 'NÃO SEI — se você ainda não aprendeu isso, marque a caixa cinza. É melhor do que chutar.'; li.append(b, sp); ul.appendChild(li); }\n  $('q-time').style.width = '0%';"),
 ("  const parts = []; if (it.ctx) parts.push({ t: it.ctx }); parts.push({ t: it.stem });", "  const parts = []; if (it.ctx) parts.push({ t: it.ctx }); parts.push({ t: it.stem });"),
 ("  $('q-say').classList.add('on'); ctxDuck(true); let k = 0;", "  parts.push({ t: 'Caixa cinza: não sei. Se você ainda não aprendeu isso, marque a caixa cinza.', opt: 3 });\n  $('q-say').classList.add('on'); ctxDuck(true); let k = 0;"),
 ("  onNag(s) { const p = $('qpanel'); const h = $('q-hint'); h.hidden = false; h.classList.add('nag');", "  onReadTick(s, f) { $('q-time').style.width = Math.round(f * 100) + '%'; $('q-timebar').classList.toggle('done', f >= 1); },\n  onNag(s) { const p = $('qpanel'); const h = $('q-hint'); h.hidden = false; h.classList.add('nag'); if (s.typed && s.rev.every(Boolean)) h.textContent = 'Leia com calma: a barra de tempo precisa encher antes de você responder.';"),
 ("const oi = s.order[s.selected]; const opt = s.item.opts[oi];", "const oi = s.order[s.selected]; const opt = s.selected === 3 ? { t: 'Não sei', ok: false, m: 'IDK' } : s.item.opts[oi];"),
 # capa do demo: sem selo "premium"
 ("$('ed-badge').hidden = $('pitch').hidden = S.edition !== 'premium';", "$('ed-badge').hidden = true; $('pitch').hidden = S.edition !== 'premium';"),
])
sub('app/index.html', [
 ("<div id=\"q-head\">", "<div id=\"q-timebar\" title=\"Tempo de leitura\"><u id=\"q-time\"></u></div>\n        <div id=\"q-head\">"),
])
open('app/style.css', 'a', encoding='utf-8').write("""
/* ===== v6: tempo de leitura, Não sei, painel centralizado no celular ===== */
#q-timebar{height:5px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden;margin:0 0 4px}
#q-time{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd23f,#ff8a2e);transition:width .25s linear}
#q-timebar.done #q-time{background:#7dffa3}
#q-opts li.idk{background:rgba(170,176,200,.14);border:2px dashed rgba(200,206,230,.55);font-weight:800}
#q-opts li.idk b{background:#aab0c8!important}
#qpanel{left:50%!important;right:auto!important;transform:translateX(-50%);width:min(calc(100% - 16px),920px);box-sizing:border-box;margin:0!important}
#qpanel.shake{animation:shk2 .45s}
@keyframes shk2{20%{transform:translateX(calc(-50% - 7px))}40%{transform:translateX(calc(-50% + 7px))}60%{transform:translateX(calc(-50% - 4px))}80%{transform:translateX(calc(-50% + 4px))}}
@keyframes slide{from{transform:translate(-50%,-10px);opacity:0}to{transform:translateX(-50%);opacity:1}}
""")
print('ok')
