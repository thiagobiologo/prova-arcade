import { buildLevel, tileAt } from '../app/js/levels.js';
import { isSolid } from '../app/js/art.js';
const L = buildLevel('train', 1, 0, true, false);
const e = L.enemies.find((x) => x.type === 'blob'); console.log('enemy', JSON.stringify(e).slice(0, 200));
const col = Math.floor(e.x / 16); for (let r = 0; r < 24; r++) if (isSolid(tileAt(L, col, r))) { console.log('first solid row at col', col, r, 'y=', r * 16); break; }
console.log('cp', JSON.stringify(L.checkpoints[0])); const cc = Math.floor(L.checkpoints[0].x / 16); for (let r = 0; r < 24; r++) if (isSolid(tileAt(L, cc, r))) { console.log('first solid cp col', r * 16); break; }
const L2 = buildLevel('s1', 1, 1, true, false); const d = L2.secretDoor; console.log('door', JSON.stringify(d)); const dc = Math.floor((d.x + 8) / 16); for (let r = 0; r < 24; r++) if (isSolid(tileAt(L2, dc, r))) { console.log('first solid door col', r * 16); break; }
const L3 = buildLevel('s3', 1, 3, true, false); const st = L3.stations[0]; console.log('bump', st.type, JSON.stringify(st.opts[0]), 'rowG', st.rowG);
