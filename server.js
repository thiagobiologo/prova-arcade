'use strict';
/*
 * Prova Arcade — servidor de licença e entrega do protótipo.
 * © Thiago Silva. Todos os direitos reservados. Uso restrito a licenciados.
 * Zero dependências (apenas Node >= 22). Dados em ./data (SQLite).
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const R = require('./lib_results.js');

const ROOT = __dirname;
const DATA = process.env.PA_DATA ? path.resolve(process.env.PA_DATA) : path.join(ROOT, 'data');
const FORCE_EDITION = process.env.PA_EDITION === 'premium' ? 'premium' : (process.env.PA_EDITION === 'pesquisa' ? 'pesquisa' : null);
const PORT = Number(process.env.PORT || 8899);
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const SESSION_TTL_MS = 12 * 3600 * 1000;
fs.mkdirSync(DATA, { recursive: true });

/* ---------- segredos locais ---------- */
const CREATED = {};
function readOrCreate(file, make) {
  const p = path.join(DATA, file);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  const v = make(); CREATED[file] = v;
  fs.writeFileSync(p, v + '\n', { mode: 0o600 });
  return v;
}
const PEPPER = readOrCreate('pepper.key', () => crypto.randomBytes(32).toString('hex'));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || readOrCreate('ADMIN_SENHA.txt', () => genCode(4, 4).replace(/-/g, '') + '-' + genCode(1, 4));

function genCode(groups, size) {
  const alpha = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const out = [];
  for (let g = 0; g < groups; g++) {
    let s = '';
    for (let i = 0; i < size; i++) s += alpha[crypto.randomInt(alpha.length)];
    out.push(s);
  }
  return out.join('-');
}
const hashCode = (c) => crypto.createHash('sha256').update(PEPPER + String(c).trim().toUpperCase()).digest('hex');

/* ---------- banco ---------- */
const db = new DatabaseSync(path.join(DATA, 'licencas.db'));
db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS licenses(
  id TEXT PRIMARY KEY, code_hash TEXT UNIQUE NOT NULL, holder TEXT NOT NULL, org TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active', expires_at INTEGER, max_devices INTEGER NOT NULL DEFAULT 10,
  note TEXT DEFAULT '', created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(
  sid TEXT PRIMARY KEY, license_id TEXT NOT NULL, name TEXT NOT NULL, device_id TEXT, ip TEXT, ua TEXT,
  created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS devices(
  license_id TEXT NOT NULL, device_id TEXT NOT NULL, first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL,
  PRIMARY KEY(license_id, device_id));
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, license_id TEXT, sid TEXT, ip TEXT, type TEXT NOT NULL, meta TEXT);
CREATE INDEX IF NOT EXISTS ix_sessions_lic ON sessions(license_id);
CREATE INDEX IF NOT EXISTS ix_events_lic ON events(license_id, ts);
`);
R.init(db);
db.exec(`CREATE TABLE IF NOT EXISTS applications(
  id TEXT PRIMARY KEY, license_id TEXT NOT NULL, token TEXT UNIQUE NOT NULL, title TEXT NOT NULL, len TEXT NOT NULL DEFAULT 'quick',
  active INTEGER NOT NULL DEFAULT 1, expires_at INTEGER, created_at INTEGER NOT NULL, uses INTEGER NOT NULL DEFAULT 0);`);
try { db.exec('ALTER TABLE sessions ADD COLUMN app_id TEXT'); } catch (e) { /* coluna já existe */ }
try { db.exec("ALTER TABLE licenses ADD COLUMN edition TEXT NOT NULL DEFAULT 'pesquisa'"); } catch (e) { /* coluna já existe */ }
for (const col of ["kind TEXT NOT NULL DEFAULT 'sala'", "recipient TEXT", "max_dev INTEGER"]) { try { db.exec('ALTER TABLE applications ADD COLUMN ' + col); } catch (e) { /* já existe */ } }
const q = {
  appInsert: db.prepare('INSERT INTO applications(id,license_id,token,title,len,active,expires_at,created_at) VALUES(?,?,?,?,?,1,?,?)'),
  appByToken: db.prepare('SELECT * FROM applications WHERE token=?'),
  appById: db.prepare('SELECT * FROM applications WHERE id=?'),
  appAll: db.prepare('SELECT a.*, l.holder FROM applications a LEFT JOIN licenses l ON l.id=a.license_id ORDER BY a.created_at DESC'),
  appActive: db.prepare('UPDATE applications SET active=? WHERE id=?'),
  appDel: db.prepare('DELETE FROM applications WHERE id=?'),
  appUse: db.prepare('UPDATE applications SET uses=uses+1 WHERE id=?'),
  sesInsertApp: db.prepare('INSERT INTO sessions(sid,license_id,name,device_id,ip,ua,created_at,last_seen,app_id) VALUES(?,?,?,?,?,?,?,?,?)'),
  licByHash: db.prepare('SELECT * FROM licenses WHERE code_hash=?'),
  licById: db.prepare('SELECT * FROM licenses WHERE id=?'),
  licAll: db.prepare('SELECT * FROM licenses ORDER BY created_at DESC'),
  licInsert: db.prepare('INSERT INTO licenses(id,code_hash,holder,org,status,expires_at,max_devices,note,created_at) VALUES(?,?,?,?,?,?,?,?,?)'),
  licStatus: db.prepare('UPDATE licenses SET status=? WHERE id=?'),
  licExpiry: db.prepare('UPDATE licenses SET expires_at=? WHERE id=?'),
  licMaxDev: db.prepare('UPDATE licenses SET max_devices=? WHERE id=?'),
  sesInsert: db.prepare('INSERT INTO sessions(sid,license_id,name,device_id,ip,ua,created_at,last_seen) VALUES(?,?,?,?,?,?,?,?)'),
  sesGet: db.prepare('SELECT * FROM sessions WHERE sid=?'),
  sesTouch: db.prepare('UPDATE sessions SET last_seen=? WHERE sid=?'),
  sesRevokeLic: db.prepare('UPDATE sessions SET revoked=1 WHERE license_id=?'),
  sesRevoke: db.prepare('UPDATE sessions SET revoked=1 WHERE sid=?'),
  sesRecent: db.prepare('SELECT * FROM sessions ORDER BY last_seen DESC LIMIT 300'),
  devGet: db.prepare('SELECT * FROM devices WHERE license_id=? AND device_id=?'),
  devCount: db.prepare('SELECT COUNT(*) AS n FROM devices WHERE license_id=?'),
  devInsert: db.prepare('INSERT INTO devices(license_id,device_id,first_seen,last_seen) VALUES(?,?,?,?)'),
  devTouch: db.prepare('UPDATE devices SET last_seen=? WHERE license_id=? AND device_id=?'),
  devClear: db.prepare('DELETE FROM devices WHERE license_id=?'),
  evInsert: db.prepare('INSERT INTO events(ts,license_id,sid,ip,type,meta) VALUES(?,?,?,?,?,?)'),
  evRecent: db.prepare('SELECT * FROM events ORDER BY id DESC LIMIT 500'),
  usage: db.prepare(`SELECT l.id, COUNT(DISTINCT s.device_id) AS devices, COUNT(s.sid) AS sessions, MAX(s.last_seen) AS last_seen
                     FROM licenses l LEFT JOIN sessions s ON s.license_id=l.id GROUP BY l.id`),
};
const now = () => Date.now();
const logEvent = (lic, sid, ip, type, meta) => q.evInsert.run(now(), lic || null, sid || null, ip || '', type, meta ? JSON.stringify(meta).slice(0, 600) : null);

function createLicense({ holder, org = '', days = null, maxDevices = 10, note = '', code = null, edition = 'pesquisa' }) {
  const c = code || 'PROVA-' + genCode(2, 4);
  const id = 'L' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const exp = days ? now() + days * 86400000 : null;
  q.licInsert.run(id, hashCode(c), holder, org, 'active', exp, maxDevices, note, now());
  db.prepare('UPDATE licenses SET edition=? WHERE id=?').run(edition === 'premium' ? 'premium' : 'pesquisa', id);
  return { id, code: c };
}

/* licenças de demonstração na primeira execução */
if (!q.licAll.all().length) {
  const out = [];
  const a = createLicense({ holder: 'Gestora PEC (demonstração)', org: 'Diretoria de Ensino', days: 30, maxDevices: 15, note: 'Licença para avaliação do protótipo', edition: 'premium' });
  const b = createLicense({ holder: 'Thiago Silva (autor / testes)', org: 'Autor', days: null, maxDevices: 50, note: 'Licença do autor' });
  out.push(`Gestora PEC (demo): ${a.code}   [id ${a.id}, 30 dias, 15 aparelhos]`);
  out.push(`Autor (testes)    : ${b.code}   [id ${b.id}, sem validade, 50 aparelhos]`);
  fs.writeFileSync(path.join(DATA, 'CODIGOS_DE_ACESSO.txt'), out.join('\n') + '\n\nGuarde este arquivo. Os códigos não são armazenados em texto puro no banco.\n', { mode: 0o600 });
  console.log('\n  === PRIMEIRA EXECUÇÃO: anote os acessos (aparecem só agora) ===');
  out.forEach((l) => console.log('  ' + l)); if (CREATED['ADMIN_SENHA.txt']) console.log('  Senha do painel do autor: ' + CREATED['ADMIN_SENHA.txt']);
}

/* ---------- utilidades HTTP ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
function baseHeaders(extra = {}) {
  return Object.assign({
    'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'Cache-Control': 'no-store',
  }, extra);
}
function send(res, code, body, type = 'text/plain; charset=utf-8', extra = {}) {
  res.writeHead(code, baseHeaders(Object.assign({ 'Content-Type': type }, extra)));
  res.end(body);
}
const json = (res, code, obj, extra) => send(res, code, JSON.stringify(obj), MIME['.json'], extra);
function clientIp(req) {
  if (TRUST_PROXY) { const f = req.headers['x-forwarded-for']; if (f) return String(f).split(',')[0].trim(); }
  return (req.socket.remoteAddress || '').replace('::ffff:', '');
}
function isHttps(req) { return req.socket.encrypted || (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https'); }
function parseCookies(req) {
  const o = {}; (req.headers.cookie || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return o;
}
function cookie(name, val, req, maxAgeSec) {
  return `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${isHttps(req) ? '; Secure' : ''}`;
}
function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', (c) => { n += c.length; if (n > limit) { reject(new Error('big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(new Error('json')); } });
    req.on('error', reject);
  });
}
const hits = new Map();
function rateLimited(key, max, windowMs) {
  const t = now(); const arr = (hits.get(key) || []).filter((x) => t - x < windowMs);
  arr.push(t); hits.set(key, arr); return arr.length > max;
}
setInterval(() => { const t = now(); for (const [k, v] of hits) if (!v.some((x) => t - x < 600000)) hits.delete(k); }, 300000).unref();

/* ---------- sessão de licença ---------- */
function licenseState(lic) {
  if (!lic) return 'invalid';
  if (lic.status !== 'active') return 'blocked';
  if (lic.expires_at && lic.expires_at < now()) return 'expired';
  return 'ok';
}
const MSG = {
  invalid: 'Código de acesso inválido.', blocked: 'Licença suspensa pelo autor. Entre em contato com Thiago Silva.',
  expired: 'Licença expirada. Entre em contato com Thiago Silva.', device_limit: 'Limite de aparelhos da licença atingido.',
};
function getSession(req) {
  const sid = parseCookies(req).sid; if (!sid || !/^[a-f0-9]{48}$/.test(sid)) return null;
  const s = q.sesGet.get(sid); if (!s || s.revoked) return null;
  if (now() - s.last_seen > SESSION_TTL_MS) return null;
  const lic = q.licById.get(s.license_id);
  return { s, lic, state: licenseState(lic) };
}
const adminSessions = new Map();
function isAdmin(req) {
  const t = parseCookies(req).adm; const e = t && adminSessions.get(t);
  if (!e || e < now()) return false; return true;
}

/* ---------- API ---------- */
async function api(req, res, url) {
  const ip = clientIp(req); const p = url.pathname;
  try {
    if (req.method === 'POST' && p === '/api/login') {
      if (rateLimited('login:' + ip, 8, 60000)) return json(res, 429, { error: 'rate', msg: 'Muitas tentativas. Aguarde 1 minuto.' });
      const b = await readBody(req);
      const code = String(b.code || '').slice(0, 40); const name = String(b.name || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      const device = String(b.deviceId || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 48);
      if (!code || name.length < 3 || device.length < 8) return json(res, 400, { error: 'campos', msg: 'Informe o código e seu nome completo.' });
      const lic = q.licByHash.get(hashCode(code)); const st = licenseState(lic);
      if (st !== 'ok') { logEvent(lic && lic.id, null, ip, 'login_fail', { st }); return json(res, 403, { error: st, msg: MSG[st] }); }
      const known = q.devGet.get(lic.id, device);
      if (!known && q.devCount.get(lic.id).n >= lic.max_devices) { logEvent(lic.id, null, ip, 'login_fail', { st: 'device_limit' }); return json(res, 403, { error: 'device_limit', msg: MSG.device_limit }); }
  if (known) q.devTouch.run(now(), lic.id, device); else q.devInsert.run(lic.id, device, now(), now());
      const sid = crypto.randomBytes(24).toString('hex');
      q.sesInsert.run(sid, lic.id, name, device, ip, String(req.headers['user-agent'] || '').slice(0, 220), now(), now());
      logEvent(lic.id, sid, ip, 'login_ok', { name });
      return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('sid', sid, req, SESSION_TTL_MS / 1000) });
    }
    if (p === '/api/me' || p === '/api/ping') {
      const g = getSession(req);
      if (!g) return json(res, 401, { error: 'auth', msg: 'Sessão encerrada. Entre novamente.' });
      if (g.state !== 'ok') return json(res, 403, { error: g.state, msg: MSG[g.state] });
      q.sesTouch.run(now(), g.s.sid);
      const app = g.s.app_id ? q.appById.get(g.s.app_id) : null;
      return json(res, 200, { ok: true, holder: g.lic.holder, licenseId: g.lic.id, user: g.s.name, sid: g.s.sid.slice(0, 8), exp: g.lic.expires_at, edition: FORCE_EDITION || (g.lic.edition === 'premium' ? 'premium' : 'pesquisa'), join: app ? { len: app.len, title: app.title, demo: app.kind === 'demo', recipient: app.recipient || null } : null });
    }
    if (req.method === 'POST' && p === '/api/event') {
      const g = getSession(req); if (!g || g.state !== 'ok') return json(res, 403, { error: 'auth' });
      const b = await readBody(req); const type = String(b.type || '').replace(/[^a-z_]/g, '').slice(0, 24);
      if (!['game_start', 'game_finish', 'stage_done'].includes(type)) return json(res, 400, { error: 'type' });
      logEvent(g.lic.id, g.s.sid, ip, type, b.meta && typeof b.meta === 'object' ? b.meta : null);
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && p === '/api/result') {
      const g = getSession(req); if (!g || g.state !== 'ok') return json(res, 403, { error: 'auth' });
      if (rateLimited('res:' + g.s.sid, 6, 600000)) return json(res, 429, { error: 'rate' });
      await R.ready; const b = await readBody(req, 250000); const players = Array.isArray(b.players) ? b.players.slice(0, 2) : []; if (!players.length) return json(res, 400, { error: 'vazio' });
      const ids = players.map((pl) => R.insert(db, { license_id: g.lic.id, app_id: g.s.app_id || null, sid: g.s.sid }, pl, { quick: b.quick, seconds: b.seconds, mode: b.mode }));
      logEvent(g.lic.id, g.s.sid, ip, 'result_saved', { n: ids.length }); return json(res, 200, { ok: true, ids });
    }
    if (req.method === 'POST' && p === '/api/logout') {
      const g = getSession(req); if (g) q.sesRevoke.run(g.s.sid);
      return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('sid', '', req, 0) });
    }

    /* ----- admin ----- */
    if (req.method === 'GET' && p === '/api/admin/open-login') {   // painel sem senha: SÓ com ADMIN_OPEN=1, fora da nuvem (sem proxy) e a partir de rede local
      const lan = /^(127\.|::1$|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
      if (process.env.ADMIN_OPEN !== '1' || TRUST_PROXY || !lan) return json(res, 404, { error: 'nf' });
      const t = crypto.randomBytes(24).toString('hex'); adminSessions.set(t, now() + 4 * 3600 * 1000);
      return json(res, 200, { ok: true, open: true }, { 'Set-Cookie': cookie('adm', t, req, 4 * 3600) });
    }
    if (req.method === 'POST' && p === '/api/admin/login') {
      if (rateLimited('adm:' + ip, 5, 300000)) return json(res, 429, { error: 'rate' });
      const b = await readBody(req);
      const a = Buffer.from(String(b.password || '')); const k = Buffer.from(ADMIN_PASSWORD);
      const ok = a.length === k.length && crypto.timingSafeEqual(a, k);
      logEvent(null, null, ip, ok ? 'admin_ok' : 'admin_fail');
      if (!ok) return json(res, 403, { error: 'senha' });
      const t = crypto.randomBytes(24).toString('hex'); adminSessions.set(t, now() + 4 * 3600 * 1000);
      return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('adm', t, req, 4 * 3600) });
    }
    if (p.startsWith('/api/admin/')) {
      if (!isAdmin(req)) return json(res, 401, { error: 'auth' });
      if (req.method === 'GET' && p === '/api/admin/netinfo') { const ni = require('node:os').networkInterfaces(); const ips = []; for (const k of Object.keys(ni)) for (const a of ni[k] || []) if (a.family === 'IPv4' && !a.internal) ips.push({ name: k, ip: a.address }); return json(res, 200, { ips, port: PORT }); }
      if (req.method === 'GET' && p === '/api/admin/state') {
        const usage = Object.fromEntries(q.usage.all().map((u) => [u.id, u]));
        const lics = q.licAll.all().map((l) => ({ id: l.id, holder: l.holder, org: l.org, status: l.status, state: licenseState(l), expires_at: l.expires_at, max_devices: l.max_devices, edition: l.edition || 'pesquisa', note: l.note, created_at: l.created_at, devices: usage[l.id]?.devices || 0, sessions: usage[l.id]?.sessions || 0, last_seen: usage[l.id]?.last_seen || null }));
        return json(res, 200, { now: now(), licenses: lics, sessions: q.sesRecent.all().map((s) => ({ sid: s.sid.slice(0, 8), full: s.sid, license_id: s.license_id, name: s.name, device: (s.device_id || '').slice(0, 8), ip: s.ip, ua: s.ua, created_at: s.created_at, last_seen: s.last_seen, revoked: s.revoked })), events: q.evRecent.all() });
      }
      if (req.method === 'GET' && p === '/api/admin/results') {
        await R.ready; const sp = url.searchParams; const rows = R.list(db, { app: sp.get('app') || '', turma: sp.get('turma') || '', lic: sp.get('lic') || '', sim: sp.get('sim') || '' });
        return json(res, 200, { rows, skills: R.skillsInfo(), misconceptions: R.misconceptions(), apps: q.appAll.all().map((a) => ({ id: a.id, title: a.title })) });
      }
      const rm = p.match(/^\/api\/admin\/result\/(\d+)$/);
      if (req.method === 'GET' && rm) { await R.ready; const d = R.detail(db, Number(rm[1])); return d ? json(res, 200, d) : json(res, 404, { error: 'nf' }); }
      if (req.method === 'GET' && p === '/api/admin/export.xlsx') {
        await R.ready; const sp = url.searchParams; const rows = R.list(db, { app: sp.get('app') || '', turma: sp.get('turma') || '', sim: sp.get('sim') || '' });
        const buf = R.buildXlsx(db, rows, `Exportado em ${new Date().toLocaleString('pt-BR')} · ${rows.length} resultado(s)`); logEvent(null, null, ip, 'admin_export_xlsx', { n: rows.length });
        return send(res, 200, buf, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', { 'Content-Disposition': 'attachment; filename="prova-arcade-resultados.xlsx"' });
      }
      if (req.method === 'GET' && p === '/api/admin/item-stats') { await R.ready; const sp = url.searchParams; return json(res, 200, { items: R.itemStats(db, { app: sp.get('app') || '', turma: sp.get('turma') || '', sim: sp.get('sim') || '' }) }); }
      if (req.method === 'POST' && p === '/api/admin/demo-data') { await R.ready; const lic = q.licAll.all()[0]; const n = R.demoData(db, lic ? lic.id : null); return json(res, 200, { ok: true, n }); }
      if (req.method === 'POST' && p === '/api/admin/demo-clear') { db.exec('DELETE FROM results WHERE sim=1'); return json(res, 200, { ok: true }); }
      if (req.method === 'GET' && p === '/api/admin/applications') {
        return json(res, 200, { now: now(), applications: q.appAll.all().map((a) => ({ id: a.id, token: a.token, title: a.title, len: a.len, active: a.active, expires_at: a.expires_at, created_at: a.created_at, uses: a.uses, holder: a.holder, license_id: a.license_id, kind: a.kind || 'sala', recipient: a.recipient || '', max_dev: a.max_dev || null, devices: db.prepare('SELECT COUNT(DISTINCT device_id) n FROM sessions WHERE app_id=?').get(a.id).n, last_use: (db.prepare('SELECT MAX(created_at) t FROM sessions WHERE app_id=?').get(a.id) || {}).t || null })) });
      }
      const acc = p.match(/^\/api\/admin\/application\/(A[0-9A-F]{6})\/access$/);
      if (req.method === 'GET' && acc) {
        const rows = db.prepare('SELECT created_at, last_seen, ip, device_id AS device, ua, revoked FROM sessions WHERE app_id=? ORDER BY created_at DESC LIMIT 200').all(acc[1]).map((r) => ({ ...r, device: String(r.device || '').slice(0, 8) }));
        return json(res, 200, { rows });
      }
      if (req.method === 'POST' && p === '/api/admin/application') {
        const b = await readBody(req); const lic = q.licById.get(String(b.licenseId || '')); const title = String(b.title || '').trim().slice(0, 80);
        if (!lic || !title) return json(res, 400, { error: 'dados' });
        const id = 'A' + crypto.randomBytes(3).toString('hex').toUpperCase(); const token = crypto.randomBytes(7).toString('base64url');
        const hours = b.hours ? Math.min(Number(b.hours) || 0, 24 * 90) : 0; q.appInsert.run(id, lic.id, token, title, b.len === 'full' ? 'full' : 'quick', hours ? now() + hours * 3600000 : null, now());
        if (b.kind === 'demo') db.prepare('UPDATE applications SET kind=?, recipient=?, max_dev=? WHERE id=?').run('demo', String(b.recipient || title).slice(0, 80), Math.max(1, Math.min(Number(b.maxDev) || 3, 50)), id);
        logEvent(lic.id, null, ip, 'admin_app_create', { id, title }); return json(res, 200, { id, token });
      }
      const am = p.match(/^\/api\/admin\/application\/(A[0-9A-F]{6})\/(toggle|delete)$/);
      if (req.method === 'POST' && am) {
        const a = q.appById.get(am[1]); if (!a) return json(res, 404, { error: 'nf' });
        if (am[2] === 'toggle') q.appActive.run(a.active ? 0 : 1, a.id); else q.appDel.run(a.id);
        logEvent(a.license_id, null, ip, 'admin_app_' + am[2], { id: a.id }); return json(res, 200, { ok: true });
      }
      if (req.method === 'POST' && p === '/api/admin/license') {
        const b = await readBody(req); const holder = String(b.holder || '').trim().slice(0, 80);
        if (!holder) return json(res, 400, { error: 'holder' });
        const r = createLicense({ holder, org: String(b.org || '').slice(0, 80), days: b.days ? Math.min(Number(b.days) || 0, 3650) : null, maxDevices: Math.max(1, Math.min(Number(b.maxDevices) || 10, 500)), note: String(b.note || '').slice(0, 200), edition: b.edition });
        logEvent(r.id, null, ip, 'admin_create'); return json(res, 200, r);
      }
      const m = p.match(/^\/api\/admin\/license\/(L[0-9A-F]{6})\/(block|unblock|expiry|devices|reset|kick|edition)$/);
      if (req.method === 'POST' && m) {
        const [, id, act] = m; const lic = q.licById.get(id); if (!lic) return json(res, 404, { error: 'nf' });
        const b = await readBody(req);
        if (act === 'block') { q.licStatus.run('blocked', id); q.sesRevokeLic.run(id); }
        else if (act === 'unblock') q.licStatus.run('active', id);
        else if (act === 'expiry') q.licExpiry.run(b.days ? now() + Math.min(Number(b.days) || 0, 3650) * 86400000 : null, id);
        else if (act === 'devices') q.licMaxDev.run(Math.max(1, Math.min(Number(b.maxDevices) || 10, 500)), id);
        else if (act === 'reset') { q.devClear.run(id); q.sesRevokeLic.run(id); }
        else if (act === 'kick') { if (b.sid) q.sesRevoke.run(String(b.sid)); }
        else if (act === 'edition') db.prepare('UPDATE licenses SET edition=? WHERE id=?').run(lic.edition === 'premium' ? 'pesquisa' : 'premium', id);
        logEvent(id, null, ip, 'admin_' + act); return json(res, 200, { ok: true });
      }
      if (req.method === 'GET' && p === '/api/admin/export.csv') {
        const rows = [['quando', 'licenca', 'tipo', 'ip', 'detalhe']];
        for (const e of q.evRecent.all()) rows.push([new Date(e.ts).toISOString(), e.license_id || '', e.type, e.ip || '', (e.meta || '').replace(/"/g, "'")]);
        return send(res, 200, rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'), 'text/csv; charset=utf-8', { 'Content-Disposition': 'attachment; filename="uso-prova-arcade.csv"' });
      }
    }
    return json(res, 404, { error: 'nf' });
  } catch (e) {
    if (e.message !== 'big') console.error('[erro]', req.url, e && e.message);
    return json(res, e.message === 'big' ? 413 : 400, { error: 'bad' });
  }
}

/* ---------- entrada por QR Code: /q/<token> abre direto no jogo ---------- */
function joinApp(req, res, token) {
  const ip = clientIp(req);
  if (rateLimited('join:' + ip, 400, 60000)) return send(res, 429, 'Muitos acessos agora. Aguarde alguns segundos e leia o QR de novo.');
  const a = /^[A-Za-z0-9_-]{6,20}$/.test(token) ? q.appByToken.get(token) : null; const lic = a && q.licById.get(a.license_id);
  let st = !a || !a.active ? 'invalid' : (a.expires_at && a.expires_at < now()) ? 'expired' : licenseState(lic);
  if (st !== 'ok') { logEvent(lic && lic.id, null, ip, 'join_fail', { st }); res.writeHead(302, { Location: '/?m=' + (st === 'invalid' ? 'auth' : st) }); return res.end(); }
  const cookies = parseCookies(req); let device = /^[a-f0-9]{24}$/.test(cookies.pa_dev || '') ? cookies.pa_dev : crypto.randomBytes(12).toString('hex');
  const known = q.devGet.get(lic.id, device);
  if (!known && q.devCount.get(lic.id).n >= lic.max_devices) { logEvent(lic.id, null, ip, 'join_fail', { st: 'device_limit' }); res.writeHead(302, { Location: '/?m=device_limit' }); return res.end(); }
      if (a.max_dev) { const used = db.prepare('SELECT COUNT(DISTINCT device_id) n FROM sessions WHERE app_id=?').get(a.id).n; const mine = db.prepare('SELECT 1 x FROM sessions WHERE app_id=? AND device_id=?').get(a.id, device); if (!mine && used >= a.max_dev) { logEvent(lic.id, null, ip, 'join_fail', { st: 'link_limit', app: a.id }); res.writeHead(302, { Location: '/?m=device_limit' }); return res.end(); } }
  if (known) q.devTouch.run(now(), lic.id, device); else q.devInsert.run(lic.id, device, now(), now());
  const sid = crypto.randomBytes(24).toString('hex'); q.sesInsertApp.run(sid, lic.id, 'Aluno (QR)', device, ip, String(req.headers['user-agent'] || '').slice(0, 220), now(), now(), a.id); q.appUse.run(a.id);
  logEvent(lic.id, sid, ip, 'join_qr', { app: a.id });
  res.writeHead(302, baseHeaders({ Location: '/app/', 'Set-Cookie': [cookie('sid', sid, req, SESSION_TTL_MS / 1000), cookie('pa_dev', device, req, 365 * 86400)] })); res.end();
}

/* ---------- estáticos ---------- */
function serveFile(req, res, file, cache) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Não encontrado');
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, baseHeaders({ 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': cache ? 'private, max-age=300' : 'no-store' }));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}
function safeJoin(base, rel) {
  const f = path.normalize(path.join(base, rel));
  return f.startsWith(base + path.sep) || f === base ? f : null;
}

let DEMO_TOKEN = null;
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'); let p;
  try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Requisição inválida'); }
  if (p.startsWith('/api/')) return api(req, res, url);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido');
  if ((p === '/' || p === '/index.html') && DEMO_TOKEN && !url.searchParams.get('m')) { res.writeHead(302, { Location: '/q/' + DEMO_TOKEN, 'Cache-Control': 'no-store' }); return res.end(); }   // demo: entra direto, sem painel de código
  if (p === '/' || p === '/index.html') return serveFile(req, res, path.join(ROOT, 'public', 'login.html'));
  if (p.startsWith('/q/')) return joinApp(req, res, p.slice(3));
  if (p === '/health') return send(res, 200, 'ok');
  if (p === '/favicon.ico') return serveFile(req, res, path.join(ROOT, 'public', 'favicon.svg'), true);
  if (p.startsWith('/public/')) { const f = safeJoin(path.join(ROOT, 'public'), p.slice(8)); return f ? serveFile(req, res, f, true) : send(res, 400, 'Inválido'); }
  if (p === '/admin' || p === '/admin/') return serveFile(req, res, path.join(ROOT, 'admin', 'admin.html'));
  if (p.startsWith('/admin/')) { const f = safeJoin(path.join(ROOT, 'admin'), p.slice(7)); return f ? serveFile(req, res, f) : send(res, 400, 'Inválido'); }
  if (p === '/app') { res.writeHead(302, { Location: '/app/' }); return res.end(); }
  if (p.startsWith('/app/')) {
    const g = getSession(req);
    if (!g || g.state !== 'ok') { res.writeHead(302, { Location: '/?m=' + (g ? g.state : 'auth') }); return res.end(); }
    const rel = p === '/app/' ? 'index.html' : p.slice(5); const f = safeJoin(path.join(ROOT, 'app'), rel);
    return f ? serveFile(req, res, f, /^(gfx|fonts)\//.test(rel)) : send(res, 400, 'Inválido');
  }
  return send(res, 404, 'Não encontrado');
});
server.on('error', (e) => { if (e && (e.code === 'EAFNOSUPPORT' || e.code === 'EADDRNOTAVAIL')) server.listen(PORT, '0.0.0.0'); else { console.error('Falha ao iniciar o servidor:', e && e.message); process.exit(1); } });
server.listen(PORT, '::', () => {   // dupla pilha: aceita http://localhost (IPv6) e http://127.0.0.1 (IPv4)
  console.log(`\n  Prova Arcade (demo) rodando em http://localhost:${PORT}`);
  if (process.env.PA_DEMO_LINK === '1') {   // instância da demo: garante um link de entrada direto (sem digitar código) e o grava em LINK_DEMO.txt
    try { const lic = q.licAll.all()[0]; let ap = db.prepare("SELECT * FROM applications WHERE title='Demo local' LIMIT 1").get();
      if (!ap && lic) { const id = 'A' + crypto.randomBytes(3).toString('hex').toUpperCase(); const token = crypto.randomBytes(7).toString('base64url'); q.appInsert.run(id, lic.id, token, 'Demo local', 'quick', null, now()); ap = { token }; }
      if (ap) DEMO_TOKEN = ap.token;
      if (ap) fs.writeFileSync(path.join(DATA, 'LINK_DEMO.txt'), `http://127.0.0.1:${PORT}/q/${ap.token}
`); } catch (e) { console.error('[demo-link]', e.message); }
  }
  if (process.env.ADMIN_OPEN === '1' && !TRUST_PROXY) console.log('  ⚠ PAINEL SEM SENHA (ADMIN_OPEN=1): só para ver a demo no seu computador/rede local. Não use na internet.');
  console.log(`  Painel do autor:       http://localhost:${PORT}/admin   (senha em data/ADMIN_SENHA.txt)`);
  console.log(`  Códigos de acesso:     data/CODIGOS_DE_ACESSO.txt\n`);
});
