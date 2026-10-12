def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:80])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

# ---- economia: moedas viram carteira (não curam); vida mais rara ----
sub('app/js/game.js', [
 ("  _bank() { this.coinBank++; if (this.coinBank >= ECON.coinsPerHeart) { this.coinBank = 0; this._heal(1, this.p.x, this.p.y - 8, true); } this._emitHp(); }",
  "  _bank() { this.coinBank++; this._emitHp(); }"),
 ("this.coinBank = Math.floor(this.coinBank / 2);", "this.coinBank = Math.floor(this.coinBank * 0.75);"),
 ("stats() { const tot =", "stats() { const wallet = this.coinBank; const tot ="),
 ("return { frames: this.frame,", "return { wallet, frames: this.frame,"),
])
sub('app/js/levels.js', [
 ("if (r() < 0.5) L.hearts.push({ x: (c0 + 7) * TS + 2, y: (g - 6) * TS });", "if (r() < 0.2) L.hearts.push({ x: (c0 + 7) * TS + 2, y: (g - 6) * TS });"),
 ("if (r() < 0.6) L.hearts.push({ x: (c0 + 2) * TS + 2, y: (g - 8) * TS });", "if (r() < 0.3) L.hearts.push({ x: (c0 + 2) * TS + 2, y: (g - 8) * TS });"),
])

# ---- interface: carteira, foco, habilidade, loja ----
sub('app/index.html', [
 ("<div id=\"hud-bank\" title=\"Moedas enchem o coração\"><i><u id=\"bank-fill\"></u></i><span id=\"bank-txt\">0/25</span></div>",
  "<div id=\"hud-bank\" title=\"Suas moedas: no fim da prova você troca por skins e acessórios\"><i><u id=\"bank-fill\"></u></i><span id=\"bank-txt\">0</span></div>"),
 ("<span id=\"q-prog\"></span>", "<span id=\"q-skill\"></span><span id=\"q-prog\"></span>"),
 ("  <section class=\"scene\" id=\"sc-results\">",
  "  <section class=\"scene\" id=\"sc-shop\">\n"
  "    <div id=\"shop-badge\">P1</div>\n    <h2 id=\"shop-title\">LOJA DO FINAL</h2>\n    <p id=\"shop-sub\">Suas moedas viram skins e acessórios. É só diversão: <b>não muda a nota</b>.</p>\n"
  "    <p id=\"shop-gift-note\" class=\"giftnote\" hidden></p>\n"
  "    <div class=\"shop-body\">\n      <div class=\"shop-prev\"><div id=\"shop-cv\"></div><div id=\"shop-wallet\">🪙 0</div></div>\n"
  "      <div class=\"shop-list\"><h3>Skins</h3><div id=\"shop-skins\" class=\"shop-grid\"></div><h3>Acessórios</h3><div id=\"shop-accs\" class=\"shop-grid\"></div>\n"
  "        <div id=\"shop-gift\" hidden><h3>🎁 Presentear <span id=\"gift-name\"></span></h3><div id=\"shop-gifts\" class=\"shop-grid\"></div></div></div>\n    </div>\n"
  "    <button class=\"btn gold\" id=\"btn-shop-done\">CONTINUAR</button>\n  </section>\n\n  <section class=\"scene\" id=\"sc-results\">"),
])
sub('app/js/ui.js', [
 ("import { renderResults } from './results.js';", "import { renderResults } from './results.js';\nimport { SKINS, ACCS, newCos, dressed } from './cosmetics.js';"),
 # carteira no HUD
 ("$('bank-fill').style.width = Math.round(h.bank / h.per * 100) + '%'; $('bank-txt').textContent = h.bank + '/' + h.per;", "$('bank-txt').textContent = h.bank;"),
 # habilidade (curricular) no painel — só na edição vitrine
 ("function renderPanel(s) {", "function skillTag(s) { if (S.edition !== 'premium') return ''; if (s.practice) return 'TREINO DA AURA'; const k = PACK.skills.find((x) => x.code === (s.meta && s.meta.skill)); return k ? `${k.code} · ${k.short}` : ''; }\nfunction renderPanel(s) {"),
 ("startType(s); $('q-prog').textContent = progDots(s);", "startType(s); $('q-prog').textContent = progDots(s); $('q-skill').textContent = skillTag(s);"),
 # foco da pergunta
 ("onStationEnter(s) { prepareStation(s);", "onStationEnter(s) { $('frame').classList.add('qfocus'); prepareStation(s);"),
 ("onStationExit() { $('qpanel').hidden = true; stopType(); stopSpeak(); },", "onStationExit() { $('frame').classList.remove('qfocus'); $('qpanel').hidden = true; stopType(); stopSpeak(); },"),
 ("pl.weapon = stats.weapon; pl.ammo = stats.ammoEnd;", "pl.weapon = stats.weapon; pl.ammo = stats.ammoEnd; pl.wallet = (pl.wallet || 0) + (stats.wallet || 0); $('frame').classList.remove('qfocus');"),
 # loja entre o fim das fases e o termômetro final
 ("function nextTurn() { S.ti++; if (S.ti >= S.turns.length) return doMood('post', 0); beginTurn(); }",
  "function nextTurn() { S.ti++; if (S.ti >= S.turns.length) { S.shopStep = 0; return flowShop(0); } beginTurn(); }\n"
  "function fSprite(pl, i) { const ch = CHARS[pl.char]; const src = frameCanvas(`char_${ch.id}_p${i + 1}`, 0, 150); return src; }\n"
  "function flowShop(i) {\n"
  "  const pl = S.players[i]; pl.cos = pl.cos || newCos(); pl.wallet = pl.wallet || 0; const other = S.mode === 2 ? S.players[1 - i] : null; if (other) other.cos = other.cos || newCos();\n"
  "  const sc = $('sc-shop'); sc.dataset.p = i; $('shop-badge').textContent = 'P' + (i + 1); $('shop-title').textContent = S.mode === 2 ? `LOJA · ${firstName(pl.name).toUpperCase()}` : 'LOJA DO FINAL';\n"
  "  const gn = $('shop-gift-note'); gn.hidden = !pl.cos.giftFrom; if (pl.cos.giftFrom) gn.textContent = `🎁 ${pl.cos.giftFrom.from} te deu: ${ACCS.find((a) => a.id === pl.cos.giftFrom.acc).name}!`;\n"
  "  const draw = () => { const box = $('shop-cv'); box.innerHTML = ''; const src = fSprite(pl, i); if (src) box.appendChild(dressed(src, pl.cos, true)); $('shop-wallet').textContent = '🪙 ' + pl.wallet; };\n"
  "  const btn = (txt, sub, cls, fn, dis) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'si ' + (cls || ''); b.innerHTML = `<b></b><span></span>`; b.firstChild.textContent = txt; b.lastChild.textContent = sub; b.disabled = !!dis; b.addEventListener('click', fn); return b; };\n"
  "  const render = () => {\n"
  "    const sk = $('shop-skins'); sk.innerHTML = ''; SKINS.forEach((k) => { const own = pl.cos.owned.skin.includes(k.id); const on = pl.cos.skin === k.id; sk.appendChild(btn(k.name, on ? '✔ usando' : own ? 'usar' : '🪙 ' + k.price, on ? 'on' : '', () => { if (!own) { if (pl.wallet < k.price) return sfx.back(); pl.wallet -= k.price; pl.cos.owned.skin.push(k.id); } pl.cos.skin = k.id; sfx.select(); render(); }, !own && pl.wallet < k.price)); });\n"
  "    const ac = $('shop-accs'); ac.innerHTML = ''; ac.appendChild(btn('Nenhum', !pl.cos.acc ? '✔ usando' : 'tirar', !pl.cos.acc ? 'on' : '', () => { pl.cos.acc = null; sfx.select(); render(); })); ACCS.forEach((k) => { const own = pl.cos.owned.acc.includes(k.id); const on = pl.cos.acc === k.id; ac.appendChild(btn(k.name, on ? '✔ usando' : own ? 'usar' : '🪙 ' + k.price, on ? 'on' : '', () => { if (!own) { if (pl.wallet < k.price) return sfx.back(); pl.wallet -= k.price; pl.cos.owned.acc.push(k.id); } pl.cos.acc = k.id; sfx.select(); render(); }, !own && pl.wallet < k.price)); });\n"
  "    const gf = $('shop-gift'); gf.hidden = !other; if (other) { $('gift-name').textContent = firstName(other.name); const gl = $('shop-gifts'); gl.innerHTML = ''; ACCS.forEach((k) => { const has = other.cos.owned.acc.includes(k.id); const done = pl.cos.gifted && pl.cos.gifted.acc === k.id; gl.appendChild(btn(k.name, done ? '🎁 enviado' : has ? 'já tem' : '🪙 ' + k.price, done ? 'on' : '', () => { if (pl.cos.gifted || has || pl.wallet < k.price) return sfx.back(); pl.wallet -= k.price; other.cos.owned.acc.push(k.id); if (!other.cos.acc) other.cos.acc = k.id; other.cos.giftFrom = { from: firstName(pl.name), acc: k.id }; pl.cos.gifted = { to: firstName(other.name), acc: k.id }; sfx.clear(); render(); }, !!pl.cos.gifted || has || pl.wallet < k.price)); }); }\n"
  "    draw();\n  };\n"
  "  render(); show('shop');\n}\n"),
 ("$('btn-turn-ok').addEventListener('click',", "$('btn-shop-done').addEventListener('click', () => { sfx.select(); if (S.shopStep + 1 < S.mode) { S.shopStep++; flowShop(S.shopStep); } else doMood('post', 0); });\n  $('btn-turn-ok').addEventListener('click',"),
 ("turma: p.turma, form: p.form, char: CHARS[p.char].id,", "turma: p.turma, form: p.form, char: CHARS[p.char].id, cos: p.cos ? { skin: p.cos.skin, acc: p.cos.acc, gift: p.cos.giftFrom ? p.cos.giftFrom.acc : null } : null,"),
])
sub('app/js/results.js', [
 ("import { frameCanvas } from './gfx.js';", "import { frameCanvas } from './gfx.js';\nimport { dressed } from './cosmetics.js';"),
 ("const pc = frameCanvas(`char_${CHARS[pl.char].id}_p${tab + 1}`, 0, 150); if (pc) head.appendChild(pc);", "const pc = frameCanvas(`char_${CHARS[pl.char].id}_p${tab + 1}`, 0, 150); if (pc) head.appendChild(pl.cos ? dressed(pc, pl.cos, true) : pc);"),
])
open('app/style.css', 'a', encoding='utf-8').write("""
/* ===== v4: carteira, foco da pergunta, loja ===== */
#hud-bank i{display:none}
#hud-bank span::before{content:"🪙 "}
#hud-bank{font-size:clamp(11px,2.8vh,16px)}
#q-skill{font:400 .78em var(--disp);letter-spacing:.8px;color:#06203a;background:#9ff5ff;border-radius:10px;padding:1px 8px;margin-left:8px;white-space:nowrap}
#q-skill:empty{display:none}
#frame::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .5s;background:radial-gradient(ellipse 70% 62% at 50% 76%,rgba(0,0,0,0) 40%,rgba(6,3,24,.62) 100%)}
#frame.qfocus::before{opacity:1}
#frame.qfocus #hud .chip,#frame.qfocus #hud-r,#frame.qfocus #hud-mid{opacity:.5;transition:opacity .4s}
#sc-shop{gap:10px;overflow:auto;padding:14px 12px}
#shop-badge{background:var(--pc,#2f6bff);color:#fff;font:400 20px var(--disp);padding:6px 16px;border-radius:30px;box-shadow:0 3px 0 rgba(0,0,0,.35)}
#sc-shop[data-p="1"] #shop-badge{background:var(--p2)}
#sc-shop h2{margin:0}#sc-shop p{margin:0;text-align:center;max-width:620px}
.giftnote{background:linear-gradient(90deg,#ff6ac8,#ffd23f);color:#1a1240;font-weight:900;border-radius:14px;padding:6px 14px}
.shop-body{display:flex;gap:18px;align-items:flex-start;justify-content:center;flex-wrap:wrap;width:100%;max-width:880px}
.shop-prev{display:flex;flex-direction:column;align-items:center;gap:8px;background:rgba(18,12,51,.55);border-radius:18px;padding:14px 22px;min-width:190px}
#shop-cv{min-height:200px;display:flex;align-items:flex-end;justify-content:center}
#shop-cv .dress{max-height:46vh;width:auto}
#shop-wallet{font:400 22px var(--disp);color:#ffe36b}
.shop-list{flex:1;min-width:260px;display:flex;flex-direction:column;gap:6px}
.shop-list h3{margin:6px 0 2px;font:400 15px var(--disp);color:#9ff5ff;letter-spacing:1px}
.shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:7px}
.si{border:0;border-radius:14px;padding:7px 8px;background:rgba(255,255,255,.1);color:#fff;display:flex;flex-direction:column;gap:2px;align-items:center;box-shadow:inset 0 0 0 2px rgba(255,255,255,.18);font-family:inherit}
.si b{font:400 14px var(--disp)}.si span{font-size:12px;font-weight:800;color:#ffe36b}
.si.on{background:rgba(125,255,163,.25);box-shadow:inset 0 0 0 2px #7dffa3}
.si:disabled{opacity:.45}
""")

# ---- servidor/painel: aviso forte do QR e endereços da rede ----
sub('server.js', [
 ("      if (req.method === 'GET' && p === '/api/admin/state') {",
  "      if (req.method === 'GET' && p === '/api/admin/netinfo') { const ni = require('node:os').networkInterfaces(); const ips = []; for (const k of Object.keys(ni)) for (const a of ni[k] || []) if (a.family === 'IPv4' && !a.internal) ips.push({ name: k, ip: a.address }); return json(res, 200, { ips, port: PORT }); }\n"
  "      if (req.method === 'GET' && p === '/api/admin/state') {"),
])
sub('admin/admin.js', [
 ("$('a_warn').textContent = /localhost|127\\.0\\.0\\.1|192\\.168\\.|100\\.\\d+\\.|10\\.\\d+\\./.test(url) ? 'Atenção: este endereço só funciona neste computador/rede local. Para os alunos usarem o celular, publique o servidor e informe aqui o endereço público (https://...).' : '';",
  "const local = /localhost|127\\.0\\.0\\.1|192\\.168\\.|172\\.(1[6-9]|2\\d|3[01])\\.|100\\.\\d+\\.|10\\.\\d+\\./.test(url) || !/^https:/.test(url); $('a_warn').className = local ? 'warn bad' : 'warn'; $('a_warn').innerHTML = local ? '<b>⚠ ESTE QR NÃO ABRE NO CELULAR COM INTERNET MÓVEL.</b> O endereço aponta para este computador (' + esc(url.split('/q/')[0]) + '). Só funciona em celulares no <u>mesmo Wi-Fi</u> deste PC. Para a turma usar com dados móveis ou Wi-Fi da escola, publique o jogo na internet (veja <b>PUBLICAR_NA_NUVEM.md</b>) e digite aqui o endereço público https://… e gere o QR de novo.' : '';"),
 ("  $('a_kind').addEventListener('change',", "  fetch('/api/admin/netinfo').then((r) => r.json()).then((n) => { const el = document.createElement('p'); el.className = 'muted'; el.innerHTML = 'Endereços deste computador na rede (só valem no mesmo Wi-Fi): ' + n.ips.map((x) => `<code>http://${x.ip}:${n.port}</code>`).join(' · '); $('a_warn').before(el); }).catch(() => {});\n  $('a_kind').addEventListener('change',"),
])
open('admin/admin.css', 'a', encoding='utf-8').write("\n.warn.bad{background:#fff1f0;border:2px solid #e5484d;color:#8c1d20;border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.4}\ncode{background:#eef1f7;padding:1px 6px;border-radius:5px}\n")
# robô de teste passa pela loja
q = open('tools/qa/qa.js', encoding='utf-8').read()
a = "    else if (sc === 'done') {"
assert a in q
q = q.replace(a, "    else if (sc === 'shop') { $('btn-shop-done').click(); await wait(200); }\n" + a, 1)
open('tools/qa/qa.js', 'w', encoding='utf-8').write(q)
