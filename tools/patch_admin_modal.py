import os, sys
d = os.path.dirname(os.path.abspath(__file__)); adm = os.path.join(d, '..', 'admin')
def patch(fn, pairs):
    p = os.path.join(adm, fn); s = open(p, encoding='utf8').read()
    for old, new in pairs:
        if old not in s: print('NAO ACHEI em', fn, ':', old[:90]); sys.exit(1)
        s = s.replace(old, new, 1)
    open(p, 'w', encoding='utf8').write(s)
mod = open(os.path.join(d, 'admin_modal.js.txt'), encoding='utf8').read()
# --- JS
p = os.path.join(adm, 'admin.js'); s = open(p, encoding='utf8').read()
a = s.index('  async function openDrawer(id) {'); b = s.index('\n', s.index("$('drawer-x').onclick"))
s = s[:a] + s[b + 1:]                                   # remove a gaveta antiga
s = s.replace("openDrawer(+tr.dataset.id)", "openStudent(+tr.dataset.id)")
s = s.replace("  /* ---------- APLICAÇÕES E QR ---------- */", mod + "\n  /* ---------- APLICAÇÕES E QR ---------- */", 1)
s = s.replace("turmas.forEach((t) => { const g = R.filter((r) => r.turma === t); h += `<div class=\"h\" style=\"align-self:center\">${esc(t)}</div>`;", "turmas.forEach((t) => { const g = R.filter((r) => r.turma === t); h += `<div class=\"h tl\" data-turma=\"${esc(t)}\" title=\"Abrir o resultado da sala\" style=\"align-self:center\">${esc(t)} ›</div>`;")
assert 'data-turma' in s
open(p, 'w', encoding='utf8').write(s)
# --- HTML
patch('admin.html', [
 ('<div id="drawer" hidden><div id="drawer-bg"></div><aside id="drawer-box"><button id="drawer-x" class="btn ghost sm">Fechar ✕</button><div id="drawer-body"></div></aside></div>',
  '<div id="modal" hidden><div id="modal-bg"></div><div id="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header id="modal-head"><h3 id="modal-title"></h3><span class="spacer"></span><button id="modal-print" class="btn ghost sm">⎙ PDF</button><button id="modal-x" class="btn ghost sm">Fechar ✕</button></header><div id="modal-body"></div></div></div>'),
 ('<a class="btn ghost sm" id="dl-xlsx">⇩ Excel</a>', '<button class="btn primary sm" id="open-class">▦ Resultado da sala</button><a class="btn ghost sm" id="dl-xlsx">⇩ Excel</a>'),
 ('<h3>Mapa de calor · % de alunos com a habilidade consolidada</h3>', '<h3>Mapa de calor · % de alunos com a habilidade consolidada <small>clique na turma para abrir o resultado da sala</small></h3>'),
 ('<button class="btn primary" id="rep-bol">Gerar boletins (PDF)</button></div>', '<button class="btn primary" id="rep-bol">Gerar boletins (PDF)</button></div>\n        <div class="card rep"><div class="ico s">SAL</div><h3>Resultado da sala (modal)</h3><p>Janela com as <b>habilidades em defasagem por prioridade</b>, onde os alunos erram, quem precisa de retomada e <b>sugestão de atividade</b> para a próxima aula. Dá para imprimir em PDF.</p><button class="btn primary" id="rep-sala">Abrir resultado da sala</button></div>'),
])
open(os.path.join(adm, 'admin.css'), 'a', encoding='utf8').write("""
/* modais */
#modal{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:18px}#modal-bg{position:absolute;inset:0;background:rgba(15,27,61,.55);backdrop-filter:blur(2px)}
#modal-box{position:relative;width:min(1000px,100%);max-height:92vh;background:#fff;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
#modal-head{display:flex;gap:8px;align-items:center;padding:14px 18px;border-bottom:1px solid var(--line);background:#f8faff}#modal-head h3{font-size:17px;margin:0}
#modal-body{padding:16px 20px 22px;overflow:auto}
.kp3{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.kp3>div{border:1.5px solid var(--line);border-radius:12px;padding:10px 12px}.kp3 span{font-size:11px;font-weight:800;color:var(--mute);text-transform:uppercase}.kp3 b{display:block;font-size:26px}.kp3 small{color:var(--mute)}
.sim{background:#fff6e0;border:1px solid #ffdc8a;color:#7a5200;padding:7px 11px;border-radius:10px;margin-top:10px;font-weight:700}
.skrow{border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;margin:8px 0}.skhead{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}
.stack{display:flex;height:22px;border-radius:11px;overflow:hidden;background:#eef1f8}.stack i{font:800 11px/22px "Nunito";text-align:center;color:#fff;font-style:normal;overflow:hidden}.stack .a{background:var(--ok)}.stack .b{background:var(--warn)}.stack .c{background:var(--bad)}
.legend{margin:6px 0}.mis{display:inline-block;background:#fff4f4;border:1px solid #ffd7d9;border-radius:9px;padding:2px 8px;margin:2px 4px 2px 0;font-size:12px}.mis em{color:var(--mute);font-style:normal}
.sug{background:#eef4ff;border-left:4px solid var(--pri);padding:8px 12px;border-radius:8px;margin:8px 0 0}
.mfilter{margin-bottom:10px}.mfilter label{display:inline-flex;gap:8px;align-items:center;font-weight:800;color:var(--mute);font-size:12px;text-transform:uppercase}.mfilter select{width:auto;min-width:200px}
.heat .tl{cursor:pointer;color:var(--pri)!important;text-decoration:underline}.ico.s{background:#10b4a4}
.pp .skrow{border:1px solid #cfd6ea;margin:6px 0;padding:6px 8px;page-break-inside:avoid}.pp .stack,.pp .tag,.pp .sug,.pp .mis{-webkit-print-color-adjust:exact;print-color-adjust:exact}.pp .kp3{display:flex;gap:8px}.pp .kp3>div{flex:1;border:1px solid #cfd6ea;padding:6px 8px}.pp .kp3 b{font-size:18px}
""")
print('ok')
