'use strict';
/* Resultados: gravação, nota calculada NO SERVIDOR (o cliente só envia qual bloco escolheu), listagem e planilha .xlsx.
 * © Thiago Silva. Sem dependências. */
const path = require('node:path');
const zlib = require('node:zlib');
const { pathToFileURL } = require('node:url');

let PACK = null;
const ready = import(pathToFileURL(path.join(__dirname, 'app', 'js', 'items.js')).href).then((m) => { PACK = m.PACK; });
const MOODS = ['', 'Tranquilo(a)', 'Bem', 'Normal', 'Preocupado(a)', 'Muito tenso(a)'];

function init(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS results(
    id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, license_id TEXT, app_id TEXT, sid TEXT, sim INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL, turma TEXT, form TEXT, nota REAL, acertos INTEGER, total INTEGER, skills TEXT, tags TEXT,
    mood_pre INTEGER, mood_post INTEGER, quick INTEGER, seconds INTEGER, score INTEGER, medal TEXT, data TEXT);
    CREATE INDEX IF NOT EXISTS ix_res_app ON results(app_id, turma);`);
}
const lvl = (n, t = 3) => (t >= 1 && n >= t ? 'A' : t >= 2 && n / t >= 0.5 ? 'B' : 'C');   // proporção de acertos na habilidade (3/3 A, 2/3 B, 0-1/3 C; 2/2 A, 1/2 B)
const LVL_TXT = { A: 'Consolidada', B: 'Em desenvolvimento', C: 'Precisa de retomada' };

/* calcula nota e níveis a partir das ESCOLHAS (índice do bloco → opção) */
function scorePlayer(pl) {
  const per = {}; PACK.skills.forEach((s) => { per[s.code] = { n: 0, tot: 0 }; }); const tags = []; const items = [];
  for (const a of Array.isArray(pl.answers) ? pl.answers.slice(0, 20) : []) {
    const slot = PACK.slots[a.slot]; if (!slot || !slot.forms[a.form] || !Array.isArray(a.order)) continue;
    const item = slot.forms[a.form];
    if (+a.ped === 3) { const okx = item.opts.find((o) => o.ok); per[slot.skill].tot++; tags.push('IDK'); items.push({ slot: a.slot, skill: slot.skill, form: a.form, ctx: item.ctx || '', stem: item.stem, chosen: 'Não sei', expected: okx.t, ok: false, idk: true, tag: 'IDK', changes: +a.changes || 0, tFirst: +a.tFirst || 0, dwell: +a.dwell || 0, visits: +a.visits || 1 }); continue; }
    const idx = a.order[a.ped]; const opt = item.opts[idx]; if (!opt) continue;
    per[slot.skill].tot++; if (opt.ok) per[slot.skill].n++; else if (opt.m) tags.push(opt.m);
    const ok = item.opts.find((o) => o.ok);
    items.push({ slot: a.slot, skill: slot.skill, form: a.form, ctx: item.ctx || '', stem: item.stem, chosen: opt.t, expected: ok.t, ok: !!opt.ok, tag: opt.m || null, changes: +a.changes || 0, tFirst: +a.tFirst || 0, dwell: +a.dwell || 0, visits: +a.visits || 1 });
  }
  const acertos = items.filter((i) => i.ok).length; const nota = items.length ? Math.round((acertos / items.length) * 100) / 10 : 0;
  return { per, tags, items, acertos, total: items.length, nota };
}
function insert(db, meta, pl, root) {
  const sc = scorePlayer(pl); const clean = (s, n) => String(s || '').trim().replace(/\s+/g, ' ').slice(0, n);
  const data = { items: sc.items, stages: pl.stages || {}, motor: pl.motor || null, readUses: +pl.readUses || 0, readAloud: !!pl.readAloud, char: String(pl.char || '').slice(0, 12), mode: root.mode };
  const skills = PACK.skills.map((s) => ({ code: s.code, n: sc.per[s.code].n, tot: sc.per[s.code].tot }));
  const r = db.prepare('INSERT INTO results(ts,license_id,app_id,sid,sim,name,turma,form,nota,acertos,total,skills,tags,mood_pre,mood_post,quick,seconds,score,medal,data) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(meta.ts || Date.now(), meta.license_id, meta.app_id || null, meta.sid || null, meta.sim ? 1 : 0, clean(pl.name, 60), clean(pl.turma, 12), pl.form === 'B' ? 'B' : 'A', sc.nota, sc.acertos, sc.total, JSON.stringify(skills), JSON.stringify(sc.tags),
      [1, 2, 3, 4, 5].includes(+pl.moodPre) ? +pl.moodPre : null, [1, 2, 3, 4, 5].includes(+pl.moodPost) ? +pl.moodPost : null, root.quick ? 1 : 0, Math.min(7200, +root.seconds || 0), Math.min(99999, +pl.score || 0), ['ouro', 'prata', 'bronze'].includes(pl.medal) ? pl.medal : 'bronze', JSON.stringify(data));
  return Number(r.lastInsertRowid);
}
function list(db, q) {
  const w = ['1=1']; const a = [];
  if (q.app) { w.push('r.app_id=?'); a.push(q.app); } if (q.turma) { w.push('r.turma=?'); a.push(q.turma); } if (q.lic) { w.push('r.license_id=?'); a.push(q.lic); } if (q.sim === '0') w.push('r.sim=0'); if (q.sim === '1') w.push('r.sim=1');
  const rows = db.prepare(`SELECT r.*, a.title AS app_title, l.holder FROM results r LEFT JOIN applications a ON a.id=r.app_id LEFT JOIN licenses l ON l.id=r.license_id WHERE ${w.join(' AND ')} ORDER BY r.ts DESC LIMIT 5000`).all(...a);
  return rows.map((r) => ({ id: r.id, ts: r.ts, sim: r.sim, app_id: r.app_id, app_title: r.app_title || (r.sim ? 'DEMONSTRAÇÃO (simulado)' : 'Entrada por código'), holder: r.holder, name: r.name, turma: r.turma, form: r.form, nota: r.nota, acertos: r.acertos, total: r.total, skills: JSON.parse(r.skills || '[]'), tags: JSON.parse(r.tags || '[]'), mood_pre: r.mood_pre, mood_post: r.mood_post, quick: r.quick, seconds: r.seconds, score: r.score, medal: r.medal }));
}
function detail(db, id) {
  const r = db.prepare('SELECT r.*, a.title AS app_title, l.holder FROM results r LEFT JOIN applications a ON a.id=r.app_id LEFT JOIN licenses l ON l.id=r.license_id WHERE r.id=?').get(id); if (!r) return null;
  const rows = list(db, {}).find((x) => x.id === r.id) || {}; return { ...rows, data: JSON.parse(r.data || '{}'), misconceptions: Object.fromEntries(Object.entries(PACK.misconceptions)), skillsInfo: PACK.skills.map((s) => ({ code: s.code, short: s.short })) };
}
const misconceptions = () => PACK.misconceptions; const skillsInfo = () => PACK.skills.map((s) => ({ code: s.code, short: s.short }));

/* ---------- dados simulados (claramente marcados como simulados) ---------- */
function demoData(db, licenseId) {
  const lcg = (() => { let a = 20261011; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
  const P = { '6º A': [0.82, 0.8, 0.7, 0.64, 0.6], '6º B': [0.64, 0.6, 0.54, 0.5, 0.46], '6º C': [0.7, 0.62, 0.46, 0.58, 0.5] }; let n = 0; const t0 = Date.now() - 6 * 86400000;
  for (const turma of Object.keys(P)) for (let i = 1; i <= 12; i++) {
    const ab = 0.7 + lcg() * 0.6; const form = lcg() < 0.5 ? 'A' : 'B'; const answers = [];
    PACK.slots.forEach((slot, si) => { const k = PACK.skills.findIndex((s) => s.code === slot.skill); const item = slot.forms[form]; const okIdx = item.opts.findIndex((o) => o.ok); const good = lcg() < Math.min(0.97, P[turma][k] * ab); const bad = item.opts.map((_, j) => j).filter((j) => j !== okIdx); const pick = good ? okIdx : bad[Math.floor(lcg() * bad.length)]; const order = [0, 1, 2]; const ped = pick; answers.push({ slot: si, form, order, ped, changes: Math.floor(lcg() * 2), tFirst: 3 + lcg() * 20, dwell: 8 + lcg() * 40, visits: 1 }); });
    const pre = 2 + Math.floor(lcg() * 3), post = Math.max(1, Math.min(5, pre + (lcg() < 0.5 ? 0 : (lcg() < 0.5 ? -1 : 1))));
    insert(db, { license_id: licenseId, app_id: null, sim: 1, ts: t0 + Math.floor(lcg() * 6 * 86400000) }, { name: `Aluno ${String(++n).padStart(2, '0')} (simulado)`, turma, form, score: 1500 + Math.floor(lcg() * 2600), medal: 'prata', moodPre: pre, moodPost: post, answers, stages: {}, motor: { seconds: 60 + Math.floor(lcg() * 80), deaths: Math.floor(lcg() * 5) } }, { quick: true, seconds: 420 + Math.floor(lcg() * 300), mode: 1 });
  }
  return n;
}

/* ---------- planilha .xlsx (sem biblioteca) ---------- */
const colName = (i) => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
function cellXml(v, ref, style) {
  if (v === null || v === undefined || v === '') return `<c r="${ref}"${style ? ` s="${style}"` : ''}/>`;
  if (typeof v === 'number') return `<c r="${ref}"${style ? ` s="${style}"` : ''}><v>${Number.isFinite(v) ? v : 0}</v></c>`;
  if (typeof v === 'object' && v.f) return `<c r="${ref}"${style ? ` s="${style}"` : ''}><f>${esc(v.f)}</f><v>${v.v}</v></c>`;
  return `<c r="${ref}" t="inlineStr"${style ? ` s="${style}"` : ''}><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
}
function sheetXml(rows, widths, numCols) {
  let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>';
  x += '<cols>' + widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols><sheetData>';
  rows.forEach((row, ri) => { x += `<row r="${ri + 1}"${ri === 0 ? ' ht="22" customHeight="1"' : ''}>` + row.map((v, ci) => cellXml(v, colName(ci) + (ri + 1), ri === 0 ? 1 : (numCols && numCols.includes(ci) ? 2 : 0))).join('') + '</row>'; });
  x += `</sheetData><autoFilter ref="A1:${colName(Math.max(0, (rows[0] || []).length - 1))}${Math.max(1, rows.length)}"/></worksheet>`; return x;
}
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { if (zlib.crc32) return zlib.crc32(buf) >>> 0; let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zipStore(files) {
  const parts = [], central = []; let off = 0; const dt = ((2026 - 1980) << 9) | (10 << 5) | 11;
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8'); const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, 'utf8'); const crc = crc32(data);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(0, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(dt, 12); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    parts.push(lh, name, data);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(0, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(dt, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(off, 42);
    central.push(ch, name); off += 30 + name.length + data.length;
  }
  const cd = Buffer.concat(central); const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, end]);
}
function buildXlsx(db, rows, title) {
  const SK = PACK.skills; const fmtD = (t) => new Date(t).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const sheets = [];
  // 1) Resultados (a nota é fórmula: o professor pode ajustar o peso)
  const h1 = ['Aluno', 'Turma', 'Aplicação', 'Origem', 'Forma', 'Acertos', 'Nota (0-10)', ...SK.map((s) => s.code + ' (acertos)'), ...SK.map((s) => 'Nível ' + s.code), 'Pontos de jogo', 'Medalha', 'Tempo (min)', 'Tensão antes', 'Tensão depois', 'Data/hora'];
  const r1 = [h1]; rows.forEach((r, i) => { const row = i + 2; const sk = SK.map((s) => (r.skills.find((x) => x.code === s.code) || { n: 0 }).n);
    r1.push([r.name, r.turma, r.app_title, r.sim ? 'SIMULADO' : 'Real', r.form, r.acertos, { f: `ROUND(F${row}/${r.total || 9}*10,1)`, v: r.nota }, ...sk, ...SK.map((s, k) => LVL_TXT[lvl(sk[k], (r.skills.find((x) => x.code === s.code) || { tot: 3 }).tot || 3)]), r.score, r.medal, Math.round((r.seconds / 60) * 10) / 10, MOODS[r.mood_pre] || '', MOODS[r.mood_post] || '', fmtD(r.ts)]); });
  sheets.push({ name: 'Resultados', rows: r1, widths: [30, 8, 34, 10, 7, 12, 11, ...SK.map(() => 14), ...SK.map(() => 22), 14, 10, 12, 16, 16, 20], num: [6] });
  // 2) Itens
  const r2 = [['Aluno', 'Turma', 'Item', 'Habilidade', 'Forma', 'Situação-problema (enunciado)', 'Resposta do aluno', 'Correta?', 'Equívoco identificado', 'Trocas de resposta', 'Tempo na questão (s)']];
  for (const r of rows) { const d = db.prepare('SELECT data FROM results WHERE id=?').get(r.id); const items = JSON.parse((d && d.data) || '{}').items || []; for (const it of items.sort((a, b) => a.slot - b.slot)) r2.push([r.name, r.turma, it.slot + 1, it.skill, it.form, (it.ctx ? it.ctx + ' ' : '') + it.stem, it.chosen, it.ok ? 'Sim' : 'Não', it.ok ? '' : (PACK.misconceptions[it.tag] || ''), it.changes, Math.round(it.dwell * 10) / 10]); }
  sheets.push({ name: 'Itens', rows: r2, widths: [30, 8, 6, 12, 7, 60, 60, 9, 60, 10, 14], num: [] });
  // 3) Resumo por turma
  const turmas = [...new Set(rows.map((r) => r.turma))].sort(); const r3 = [['Turma', 'Alunos', 'Nota média', ...SK.map((s) => '% ' + s.code + ' consolidada'), 'Alunos em risco (2+ habilidades a retomar)']];
  for (const t of turmas) { const g = rows.filter((r) => r.turma === t); const nota = g.reduce((a, r) => a + r.nota, 0) / g.length; const pct = SK.map((s) => Math.round((g.filter((r) => ((r.skills.find((x) => x.code === s.code) || { n: 0 }).n) >= 3).length / g.length) * 1000) / 10); const risk = g.filter((r) => r.skills.filter((x) => x.n <= 1).length >= 2).length; r3.push([t, g.length, Math.round(nota * 10) / 10, ...pct, risk]); }
  sheets.push({ name: 'Resumo por turma', rows: r3, widths: [10, 9, 12, ...SK.map(() => 22), 34], num: [2] });
  // 4) Equívocos
  const cnt = {}; rows.forEach((r) => r.tags.forEach((t) => { cnt[t] = (cnt[t] || 0) + 1; })); const r4 = [['Código', 'Equívoco (o que o aluno provavelmente pensa)', 'Ocorrências']]; Object.entries(cnt).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => r4.push([t, PACK.misconceptions[t] || '', n]));
  sheets.push({ name: 'Equívocos', rows: r4, widths: [10, 100, 12], num: [] });
  // 5) Leia-me
  sheets.push({ name: 'Leia-me', rows: [['Prova Arcade — exportação'], [title], ['Nota (0-10) = acertos ÷ número de itens respondidos × 10 (15 itens na prova completa: 5 habilidades × 3 itens). A coluna de nota é uma fórmula: você pode alterar o peso editando a célula.'], ['Níveis por habilidade: 3/3 = Consolidada; 2/3 = Em desenvolvimento; 0-1/3 = Precisa de retomada. Leitura indicativa (3 itens por habilidade).'], ['Pontos de jogo e medalha NÃO entram na nota. Termômetro de tensão é autorrelato exploratório (1 = Tranquilo, 5 = Muito tenso).'], ['Linhas marcadas SIMULADO são dados fictícios de demonstração.'], ['© Thiago Silva — Prova Arcade. Dados de estudantes: uso restrito, conforme LGPD.']], widths: [120], num: [] });
  const files = [
    { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>' },
    { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>' },
    { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/styles.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.0"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1B2A5C"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows, s.widths, s.num) })),
  ];
  return zipStore(files);
}
module.exports = { init, ready, insert, list, detail, demoData, buildXlsx, misconceptions, skillsInfo, scorePlayer: (p) => scorePlayer(p), get PACK() { return PACK; } };
/* estatística por item (para o painel) */
module.exports.itemStats = function itemStats(db, q) {
  // Análise clássica de itens (TCC/CTT) por ITEM (posição+forma): dificuldade p, discriminação (correlação ponto-bisserial item × resto da prova), taxa de "Não sei", distrator mais escolhido.
  const w = ['1=1']; const a = []; if (q.app) { w.push('app_id=?'); a.push(q.app); } if (q.turma) { w.push('turma=?'); a.push(q.turma); } if (q.sim === '0') w.push('sim=0'); if (q.sim === '1') w.push('sim=1');
  const rows = db.prepare(`SELECT data FROM results WHERE ${w.join(' AND ')}`).all(...a); const st = new Map();
  for (const r of rows) { const its = (JSON.parse(r.data || '{}').items || []); const tot = its.filter((x) => x.ok).length;
    for (const it of its) { const k = it.slot + '|' + it.form; let o = st.get(k); if (!o) { o = { slot: it.slot, form: it.form, skill: it.skill, n: 0, ok: 0, idk: 0, tags: {}, dwell: 0, xs: [], ys: [] }; st.set(k, o); }
      o.n++; o.dwell += it.dwell || 0; if (it.ok) o.ok++; else if (it.idk) o.idk++; else if (it.tag) o.tags[it.tag] = (o.tags[it.tag] || 0) + 1;
      if (its.length > 1) { o.xs.push(it.ok ? 1 : 0); o.ys.push((tot - (it.ok ? 1 : 0)) / (its.length - 1)); } } }
  const corr = (x, y) => { const n = x.length; if (n < 8) return null; const mx = x.reduce((u, v) => u + v, 0) / n, my = y.reduce((u, v) => u + v, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx && syy ? Math.round(sxy / Math.sqrt(sxx * syy) * 100) / 100 : null; };
  const out = [...st.values()].sort((x, y) => x.slot - y.slot || String(x.form).localeCompare(String(y.form))).map((s) => { const top = Object.entries(s.tags).sort((x, y) => y[1] - x[1])[0]; const p = s.n ? s.ok / s.n : null; const r = corr(s.xs, s.ys);
    let flag = s.n < 30 ? 'amostra pequena (n<30)' : ''; if (!flag) { if (p > 0.9) flag = 'muito fácil'; else if (p < 0.2) flag = 'muito difícil/ambíguo'; else if (r != null && r < 0.1) flag = 'discrimina pouco — revisar'; else flag = 'adequado'; }
    return { slot: s.slot, form: s.form, skill: s.skill, n: s.n, pct: p == null ? null : Math.round(p * 1000) / 10, r, idkPct: s.n ? Math.round(s.idk / s.n * 1000) / 10 : null, dwell: s.n ? Math.round((s.dwell / s.n) * 10) / 10 : null, topTag: top ? top[0] : null, topN: top ? top[1] : 0, flag }; });
  return out;
};
