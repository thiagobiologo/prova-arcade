// Teste de carga: N alunos entrando ao mesmo tempo pelo QR e baixando o jogo.  Uso: node tools/loadtest.mjs [N] [BASE]
import fs from 'node:fs';
const N = Number(process.argv[2] || 40); const BASE = process.argv[3] || 'http://localhost:8899';
const pw = fs.readFileSync(new URL('../data/ADMIN_SENHA.txt', import.meta.url), 'utf8').trim();
const getCookie = (r) => (r.headers.getSetCookie ? r.headers.getSetCookie() : []).map((c) => c.split(';')[0]).join('; ');
const lr = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
const adm = getCookie(lr); const H = { 'Content-Type': 'application/json', Cookie: adm };
const lic = await (await fetch(BASE + '/api/admin/license', { method: 'POST', headers: H, body: JSON.stringify({ holder: 'Teste de carga', org: 'QA', days: 1, maxDevices: 200 }) })).json();
const app = await (await fetch(BASE + '/api/admin/application', { method: 'POST', headers: H, body: JSON.stringify({ licenseId: lic.id, title: 'Carga ' + N, len: 'quick', hours: 1 }) })).json();
const files = ['/app/', '/app/style.css', '/app/js/main.js', '/app/js/ui.js', '/app/js/game.js', '/app/js/art.js', '/app/js/audio.js', '/app/js/gfx.js', '/app/js/items.js', '/app/js/levels.js', '/app/js/results.js', '/app/gfx/manifest.json', '/app/fonts/LilitaOne.ttf', '/app/fonts/Nunito.ttf'];
const gfx = JSON.parse(fs.readFileSync(new URL('../app/gfx/manifest.json', import.meta.url), 'utf8')); Object.keys(gfx).forEach((k) => files.push(`/app/gfx/${k}.png`));
async function student(i) {
  const t0 = performance.now(); let bytes = 0, errs = 0;
  const j = await fetch(`${BASE}/q/${app.token}`, { redirect: 'manual', headers: { 'User-Agent': `LoadTest/${i}` } }); const ck = getCookie(j);
  if (j.status !== 302 || !ck.includes('sid=')) return { ok: false, why: 'join ' + j.status };
  const me = await fetch(BASE + '/api/me', { headers: { Cookie: ck } }); if (!me.ok) return { ok: false, why: 'me ' + me.status };
  await Promise.all(files.map(async (f) => { const r = await fetch(BASE + f, { headers: { Cookie: ck } }); if (!r.ok) errs++; bytes += (await r.arrayBuffer()).byteLength; }));
  await fetch(BASE + '/api/event', { method: 'POST', headers: { ...H, Cookie: ck }, body: JSON.stringify({ type: 'game_start', meta: { i } }) });
  return { ok: errs === 0, ms: performance.now() - t0, bytes, errs };
}
const t0 = performance.now(); const res = await Promise.all(Array.from({ length: N }, (_, i) => student(i)));
const oks = res.filter((r) => r.ok); const ms = oks.map((r) => r.ms).sort((a, b) => a - b);
console.log(`alunos: ${N} · ok: ${oks.length} · falhas: ${N - oks.length}`);
if (oks.length) console.log(`tempo por aluno (ms): mediana ${Math.round(ms[ms.length >> 1])} · p95 ${Math.round(ms[Math.floor(ms.length * 0.95)])} · máx ${Math.round(ms[ms.length - 1])} · total da turma ${Math.round(performance.now() - t0)} ms`);
if (oks.length) console.log(`download por aluno: ${(oks[0].bytes / 1048576).toFixed(2)} MB (${files.length} arquivos)`);
res.filter((r) => !r.ok).slice(0, 3).forEach((r) => console.log('falha:', JSON.stringify(r)));
