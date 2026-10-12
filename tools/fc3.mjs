import { buildLevel, tileAt } from '../app/js/levels.js';
import { isSolid } from '../app/js/art.js';
let bad = 0, tot = 0;
for (const key of ['s1', 's2', 's3']) for (let seed = 1; seed <= 40; seed++) {
  const L = buildLevel(key, seed, ({ s1: 1, s2: 2, s3: 3 })[key], true, false); const d = L.secretDoor; if (!d) continue; tot++;
  const by = d.y + d.h; let ok = false; for (let x = d.x; x < d.x + d.w; x += 4) { const c = Math.floor(x / 16); const r = Math.floor((by + 1) / 16); if (isSolid(tileAt(L, c, r))) ok = true; }
  if (!ok) { bad++; if (bad < 4) { const c = Math.floor((d.x + 8) / 16); let s = ''; for (let r = 8; r < 20; r++) s += (isSolid(tileAt(L, c - 1, r)) ? '#' : '.') + (isSolid(tileAt(L, c, r)) ? '#' : '.') + (isSolid(tileAt(L, c + 1, r)) ? '#' : '.') + ' '; console.log(key, seed, JSON.stringify(d), s); } }
}
console.log('doors', tot, 'floating', bad);
