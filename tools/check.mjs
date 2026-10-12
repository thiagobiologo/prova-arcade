// Verificações automáticas: sintaxe de todo o JavaScript + validação de 800 fases e 300 salas secretas.  © Thiago Silva.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { if (['node_modules', 'data', 'data_demo', '.git', 'gfx_blender_backup'].includes(f)) continue; const p = join(d, f); const s = statSync(p); if (s.isDirectory()) walk(p); else if (/\.(js|mjs)$/.test(f) && !/chart\.umd|qrcode/.test(f)) files.push(p); } };
walk(root); let bad = 0;
for (const f of files) { const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' }); if (r.status !== 0) { bad++; console.error('SINTAXE:', f, '\n', r.stderr); } }
console.log(`sintaxe: ${files.length} arquivos, ${bad} com erro`);
const v = spawnSync(process.execPath, [join(root, 'tools', 'validate.mjs')], { encoding: 'utf8' }); console.log(v.stdout.trim()); if (v.status !== 0 || /inválidas: [1-9]/.test(v.stdout) || /inalcançável: [1-9]/.test(v.stdout)) bad++;
process.exit(bad ? 1 : 0);
