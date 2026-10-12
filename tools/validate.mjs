import { buildLevel, validate } from '../app/js/levels.js';
const KEYS = { train: 1, s1: 3, s2: 3, s3: 3 };
let bad = 0, total = 0, doors = 0, types = {};
for (const [k, n] of Object.entries(KEYS)) {
  for (let seed = 1; seed <= 200; seed++) {
    const L = buildLevel(k, seed, n, seed % 2 === 0); const v = validate(L); total++; if (L.secretDoor) doors++; L.stations.forEach((s) => { types[s.type] = (types[s.type] || 0) + 1; });
    if (!v.ok) { bad++; if (bad < 8) console.log('FALHA', k, seed, JSON.stringify(v), 'cols', L.cols); }
  }
}
console.log(`fases testadas: ${total} · inválidas: ${bad} · com porta secreta: ${doors} · tipos de caso: ${JSON.stringify(types)}`);
let rbad = 0; for (const k of ['s1', 's2', 's3']) for (let seed = 1; seed <= 100; seed++) { const L = buildLevel(k, seed + 777, 0, false, true); const v = validate(L); if (!L.exitDoor || !v.goalOk) rbad++; }
console.log('salas secretas (300) com saída inalcançável:', rbad);
