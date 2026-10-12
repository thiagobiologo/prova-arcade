import { buildLevel, tileAt, ROWS } from '../app/js/levels.js';
import { isSolid, TS } from '../app/js/art.js';
const sol = (L, x, y) => isSolid(tileAt(L, Math.floor(x / 16), Math.floor(y / 16)));
const issues = {}; const add = (k, d) => { (issues[k] = issues[k] || []).push(d); };
for (const key of ['train', 's1', 's2', 's3']) for (let seed = 1; seed <= 40; seed++) {
  const L = buildLevel(key, seed, key === 'train' ? 0 : ({ s1: 1, s2: 2, s3: 3 })[key], true, false);
  for (const e of L.enemies) { if (e.type === 'bat' || e.type === 'fly') continue; const fy = e.y + e.h; if (!sol(L, e.x + e.w / 2, fy + 1) && !sol(L, e.x + e.w / 2, fy + 2)) add('enemy', key + seed + ' ' + e.type + ' c' + Math.floor(e.x / 16)); }
  for (const s of L.springs) if (!sol(L, s.x + 8, s.y + s.h + 1)) add('spring', key + seed);
  for (const c of L.checkpoints || []) { const y = c.y + (c.h || 0); if (!sol(L, c.x + 4, (c.y || 0) + 20)) add('cp', key + seed + JSON.stringify(c).slice(0, 60)); }
  for (const st of L.stations) for (const o of st.opts) { if (st.type === 'balloon') continue; const by = o.y + o.h; if (!sol(L, o.x + o.w / 2, by + 1)) add('opt-' + st.type, key + seed + ' i' + o.i + ' y' + o.y + 'h' + o.h + ' rowG' + st.rowG); }
  for (const d of L.decor) if (!sol(L, d.col * 16 + 8, d.row * 16 + 2)) add('decor', key + seed + ' c' + d.col + ' r' + d.row);
  if (L.secretDoor) { const d = L.secretDoor; if (!sol(L, d.x + d.w / 2, d.y + d.h + 1)) add('secretDoor', key + seed); }
  if (L.goal && !L.exitDoor) { /* ajustado em runtime */ }
}
for (const [k, v] of Object.entries(issues)) console.log(k, v.length, v.slice(0, 4).join(' ; '));
console.log('done');
