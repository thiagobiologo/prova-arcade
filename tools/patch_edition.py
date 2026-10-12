import re
def sub(path, pairs):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        assert a in s, (path, a[:60])
        s = s.replace(a, b, 1)
    open(path, 'w', encoding='utf-8').write(s)

sub('server.js', [
 ("try { db.exec('ALTER TABLE sessions ADD COLUMN app_id TEXT'); } catch (e) { /* coluna já existe */ }",
  "try { db.exec('ALTER TABLE sessions ADD COLUMN app_id TEXT'); } catch (e) { /* coluna já existe */ }\ntry { db.exec(\"ALTER TABLE licenses ADD COLUMN edition TEXT NOT NULL DEFAULT 'pesquisa'\"); } catch (e) { /* coluna já existe */ }"),
 ("function createLicense({ holder, org = '', days = null, maxDevices = 10, note = '', code = null }) {",
  "function createLicense({ holder, org = '', days = null, maxDevices = 10, note = '', code = null, edition = 'pesquisa' }) {"),
 ("  q.licInsert.run(id, hashCode(c), holder, org, 'active', exp, maxDevices, note, now());\n  return { id, code: c };",
  "  q.licInsert.run(id, hashCode(c), holder, org, 'active', exp, maxDevices, note, now());\n  db.prepare('UPDATE licenses SET edition=? WHERE id=?').run(edition === 'premium' ? 'premium' : 'pesquisa', id);\n  return { id, code: c };"),
 ("org: 'Diretoria de Ensino', days: 30, maxDevices: 15, note: 'Licença para avaliação do protótipo' }",
  "org: 'Diretoria de Ensino', days: 30, maxDevices: 15, note: 'Licença para avaliação do protótipo', edition: 'premium' }"),
 ("join: app ? { len: app.len, title: app.title } : null });",
  "edition: g.lic.edition === 'premium' ? 'premium' : 'pesquisa', join: app ? { len: app.len, title: app.title } : null });"),
 ("note: String(b.note || '').slice(0, 200) });\n        logEvent(r.id, null, ip, 'admin_create');",
  "note: String(b.note || '').slice(0, 200), edition: b.edition });\n        logEvent(r.id, null, ip, 'admin_create');"),
 ("(block|unblock|expiry|devices|reset|kick)$/", "(block|unblock|expiry|devices|reset|kick|edition)$/"),
 ("        else if (act === 'kick') { if (b.sid) q.sesRevoke.run(String(b.sid)); }",
  "        else if (act === 'kick') { if (b.sid) q.sesRevoke.run(String(b.sid)); }\n        else if (act === 'edition') db.prepare('UPDATE licenses SET edition=? WHERE id=?').run(lic.edition === 'premium' ? 'pesquisa' : 'premium', id);"),
 ("max_devices: l.max_devices, note: l.note,", "max_devices: l.max_devices, edition: l.edition || 'pesquisa', note: l.note,"),
])
sub('admin/admin.js', [
 ("['ID', 'Titular', 'Órgão', 'Situação',", "['ID', 'Titular', 'Órgão', 'Edição', 'Situação',"),
 ("<td>${esc(l.org)}</td><td><span class=\"tag t-${l.state}\">", "<td>${esc(l.org)}</td><td><span class=\"tag ${l.edition === 'premium' ? 't-a' : 't-c'}\">${l.edition === 'premium' ? 'PREMIUM (vitrine)' : 'PESQUISA (aplicação)'}</span></td><td><span class=\"tag t-${l.state}\">"),
 ("<button class=\"btn ghost sm\" data-a=\"devices\" data-id=\"${l.id}\">Aparelhos</button>", "<button class=\"btn ghost sm\" data-a=\"devices\" data-id=\"${l.id}\">Aparelhos</button> <button class=\"btn ghost sm\" data-a=\"edition\" data-id=\"${l.id}\">Trocar edição</button>"),
 ("maxDevices: $('n_dev').value });", "maxDevices: $('n_dev').value, edition: $('n_ed').value });"),
])
sub('admin/admin.html', [
 ("<label>Aparelhos (máx.)<input id=\"n_dev\" type=\"number\" min=\"1\" max=\"500\" value=\"60\"></label>",
  "<label>Aparelhos (máx.)<input id=\"n_dev\" type=\"number\" min=\"1\" max=\"500\" value=\"60\"></label><label>Edição<select id=\"n_ed\"><option value=\"pesquisa\">PESQUISA · aplicação em sala (coleta de dados)</option><option value=\"premium\">PREMIUM · vitrine (diretoria, LinkedIn)</option></select></label>"),
])
