def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:80])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

sub('server.js', [
 # instância independente: pasta de dados e edição forçadas por variável de ambiente
 ("const DATA = path.join(ROOT, 'data');", "const DATA = process.env.PA_DATA ? path.resolve(process.env.PA_DATA) : path.join(ROOT, 'data');\nconst FORCE_EDITION = process.env.PA_EDITION === 'premium' ? 'premium' : (process.env.PA_EDITION === 'pesquisa' ? 'pesquisa' : null);"),
 ("try { db.exec(\"ALTER TABLE licenses ADD COLUMN edition TEXT NOT NULL DEFAULT 'pesquisa'\"); } catch (e) { /* coluna já existe */ }",
  "try { db.exec(\"ALTER TABLE licenses ADD COLUMN edition TEXT NOT NULL DEFAULT 'pesquisa'\"); } catch (e) { /* coluna já existe */ }\n"
  "for (const col of [\"kind TEXT NOT NULL DEFAULT 'sala'\", \"recipient TEXT\", \"max_dev INTEGER\"]) { try { db.exec('ALTER TABLE applications ADD COLUMN ' + col); } catch (e) { /* já existe */ } }"),
 ("edition: g.lic.edition === 'premium' ? 'premium' : 'pesquisa', join: app ? { len: app.len, title: app.title } : null });",
  "edition: FORCE_EDITION || (g.lic.edition === 'premium' ? 'premium' : 'pesquisa'), join: app ? { len: app.len, title: app.title, demo: app.kind === 'demo', recipient: app.recipient || null } : null });"),
 # limite de aparelhos por link (rastreio de vazamento): link de demonstração só abre em N aparelhos
 ("  if (known) q.devTouch.run(now(), lic.id, device); else q.devInsert.run(lic.id, device, now(), now());",
  "  if (a.max_dev) { const used = db.prepare('SELECT COUNT(DISTINCT device) n FROM sessions WHERE app_id=?').get(a.id).n; const mine = db.prepare('SELECT 1 x FROM sessions WHERE app_id=? AND device=?').get(a.id, device); if (!mine && used >= a.max_dev) { logEvent(lic.id, null, ip, 'join_fail', { st: 'link_limit', app: a.id }); res.writeHead(302, { Location: '/?m=device_limit' }); return res.end(); } }\n"
  "  if (known) q.devTouch.run(now(), lic.id, device); else q.devInsert.run(lic.id, device, now(), now());"),
 ("uses: a.uses, holder: a.holder, license_id: a.license_id })) });",
  "uses: a.uses, holder: a.holder, license_id: a.license_id, kind: a.kind || 'sala', recipient: a.recipient || '', max_dev: a.max_dev || null, devices: db.prepare('SELECT COUNT(DISTINCT device) n FROM sessions WHERE app_id=?').get(a.id).n, last_use: (db.prepare('SELECT MAX(created_at) t FROM sessions WHERE app_id=?').get(a.id) || {}).t || null })) });\n"
  "      }\n"
  "      const acc = p.match(/^\\/api\\/admin\\/application\\/(A[0-9A-F]{6})\\/access$/);\n"
  "      if (req.method === 'GET' && acc) {\n"
  "        const rows = db.prepare('SELECT created_at, last_seen, ip, device, ua, revoked FROM sessions WHERE app_id=? ORDER BY created_at DESC LIMIT 200').all(acc[1]).map((r) => ({ ...r, device: String(r.device || '').slice(0, 8) }));\n"
  "        return json(res, 200, { rows });"),
 ("q.appInsert.run(id, lic.id, token, title, b.len === 'full' ? 'full' : 'quick', hours ? now() + hours * 3600000 : null, now());",
  "q.appInsert.run(id, lic.id, token, title, b.len === 'full' ? 'full' : 'quick', hours ? now() + hours * 3600000 : null, now());\n"
  "        if (b.kind === 'demo') db.prepare('UPDATE applications SET kind=?, recipient=?, max_dev=? WHERE id=?').run('demo', String(b.recipient || title).slice(0, 80), Math.max(1, Math.min(Number(b.maxDev) || 3, 50)), id);"),
])

sub('admin/admin.html', [
 ("<label>Modo<select id=\"a_len\">", "<label>Tipo<select id=\"a_kind\"><option value=\"sala\">Sala de aula (QR da turma)</option><option value=\"demo\">Demonstração para um destinatário (link rastreado)</option></select></label>\n          <label class=\"w2\" id=\"a_rec_w\" hidden>Destinatário (nome / empresa / diretoria)<input id=\"a_rec\" placeholder=\"Ex.: Diretoria de Ensino X · Maria\"></label><label id=\"a_md_w\" hidden>Máx. aparelhos deste link<input id=\"a_md\" type=\"number\" min=\"1\" max=\"50\" value=\"3\"></label>\n          <label>Modo<select id=\"a_len\">"),
])
sub('admin/admin.js', [
 ("<th>Aplicação</th><th>Licença</th><th>Modo</th><th>Leituras</th>", "<th>Aplicação</th><th>Tipo / destinatário</th><th>Licença</th><th>Modo</th><th>Aberturas</th><th>Aparelhos</th>"),
 ("return `<tr><td><b>${esc(a.title)}</b></td><td>${esc(a.holder || a.license_id)}</td><td>${a.len === 'full' ? 'Completo' : 'Rápido'}</td><td>${a.uses}</td>",
  "return `<tr><td><b>${esc(a.title)}</b></td><td>${a.kind === 'demo' ? '<span class=\"tag t-a\">DEMO</span> ' + esc(a.recipient) : 'Sala'}</td><td>${esc(a.holder || a.license_id)}</td><td>${a.len === 'full' ? 'Completo' : 'Rápido'}</td><td>${a.uses}</td><td>${a.devices}${a.max_dev ? '/' + a.max_dev : ''}</td>"),
 ("<button class=\"btn ghost sm\" data-qr=\"${a.id}\"", "<button class=\"btn ghost sm\" data-acc=\"${a.id}\" data-title=\"${esc(a.title)}\">Quem abriu</button> <button class=\"btn ghost sm\" data-qr=\"${a.id}\""),
 ("licenseId: $('a_lic').value, title: $('a_title').value, len: $('a_len').value, hours: $('a_hours').value });",
  "licenseId: $('a_lic').value, title: $('a_title').value, len: $('a_len').value, hours: $('a_hours').value, kind: $('a_kind').value, recipient: $('a_rec').value, maxDev: $('a_md').value });"),
 ("  $('af').addEventListener('submit',", "  $('a_kind').addEventListener('change', () => { const d = $('a_kind').value === 'demo'; $('a_rec_w').hidden = !d; $('a_md_w').hidden = !d; });\n"
  "  document.addEventListener('click', async (e) => { const b = e.target.closest('button[data-acc]'); if (!b) return; const r = await fetch(`/api/admin/application/${b.dataset.acc}/access`).then((x) => x.json()); openModal('Quem abriu · ' + b.dataset.title, `<p class=\"muted\">Cada linha é uma abertura do link. Aparelho = identificador anônimo do navegador. Use para ver se o link foi repassado (muitos aparelhos/IPs diferentes).</p><div class=\"scroll\"><table><thead><tr><th>Quando</th><th>Último sinal</th><th>IP</th><th>Aparelho</th><th>Navegador</th></tr></thead><tbody>${r.rows.map((x) => `<tr><td>${fmtD(x.created_at)}</td><td>${fmtD(x.last_seen)}</td><td>${esc(x.ip)}</td><td>${esc(x.device)}</td><td>${esc((x.ua || '').slice(0, 60))}</td></tr>`).join('') || '<tr><td colspan=\"5\">Ninguém abriu ainda.</td></tr>'}</tbody></table></div>`); });\n"
  "  $('af').addEventListener('submit',"),
])

# marca d'água do destinatário + termos no jogo
sub('app/index.html', [
 ("<canvas id=\"menubg\" aria-hidden=\"true\"></canvas>", "<canvas id=\"menubg\" aria-hidden=\"true\"></canvas>\n<div id=\"wm-demo\" aria-hidden=\"true\" hidden></div>"),
 ("    <p class=\"lic\" id=\"lic-line\"></p>", "    <p class=\"lic\" id=\"lic-line\"></p>\n    <p class=\"terms\" id=\"terms\" hidden>Demonstração licenciada e rastreada. É proibido copiar, comercializar, extrair personagens, arte, código ou perguntas, ou redistribuir este link (Lei 9.610/98 e Lei 9.609/98). © Thiago Silva.</p>"),
])
sub('app/js/ui.js', [
 ("$('ed-badge').hidden = $('pitch').hidden = S.edition !== 'premium';",
  "$('ed-badge').hidden = $('pitch').hidden = S.edition !== 'premium'; if (auth.join && auth.join.demo) { const w = $('wm-demo'); const tag = `DEMO · ${auth.join.recipient || auth.user} · ${auth.licenseId} · ${auth.sid}`; w.innerHTML = Array.from({ length: 80 }, () => `<span>${tag.replace(/</g, '')}</span>`).join(''); w.hidden = false; $('terms').hidden = false; } else if (S.edition === 'premium') { $('terms').hidden = false; }"),
])
open('app/style.css', 'a', encoding='utf-8').write("""
#wm-demo{position:fixed;inset:-20%;z-index:60;pointer-events:none;display:flex;flex-wrap:wrap;gap:46px 70px;align-content:flex-start;transform:rotate(-24deg);opacity:.085;user-select:none;overflow:hidden}
#wm-demo span{font:800 15px var(--body);color:#fff;white-space:nowrap;text-shadow:0 0 2px #000}
.terms{margin:0;max-width:640px;font-size:clamp(9px,1.7vmin,11.5px);color:rgba(217,212,255,.75);text-align:center;line-height:1.35}
""")
