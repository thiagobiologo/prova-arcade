// Gera a pasta ../prova-arcade-showcase: versão PÚBLICA para o GitHub (portfólio), SEM o banco de itens da prova e SEM dados.  © Thiago Silva.
// Uso: node tools/make_public_showcase.mjs        (depois: cd ../prova-arcade-showcase && git init && ...)
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'); const out = join(root, '..', 'prova-arcade-showcase');
if (existsSync(out)) rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const skip = new Set(['data', 'data_demo', 'node_modules', '.git', 'gfx_blender_backup', 'qa', 'art_src']);
cpSync(root, out, { recursive: true, filter: (src) => { const n = src.split(/[\\/]/).pop(); return !skip.has(n) && !/^_.*\.png$/.test(n) && !/\.(log|bak\d*|db|db-shm|db-wal)$/.test(n) && !/ADMIN_SENHA|CODIGOS_DE|pepper\.key/.test(n); } });
// banco de itens: troca TODO o texto por conteúdo de exemplo (a estrutura continua igual para o motor funcionar)
const { PACK, PRACTICE } = await import(pathToFileURL(join(root, 'app', 'js', 'items.js')).href);
const sam = JSON.parse(JSON.stringify(PACK)); let n = 0;
for (const slot of sam.slots) for (const f of Object.values(slot.forms)) { n++; f.ctx = '[Situação de exemplo — o texto real dos itens não é publicado neste repositório.]'; f.stem = `Pergunta de exemplo ${n}: qual alternativa é a mais adequada?`; f.opts.forEach((o, i) => { o.t = `Alternativa ${'ABC'[i]} (exemplo)`; }); }
sam.title = 'Pacote de EXEMPLO (itens reais omitidos)';
writeFileSync(join(out, 'app', 'js', 'items.js'), `/* Pacote de EXEMPLO. O banco de itens real é privado (publicá-lo invalidaria a avaliação). Mesmo formato do pacote real. */\nexport const PACK = ${JSON.stringify(sam, null, 2)};\nexport const PRACTICE = ${JSON.stringify(PRACTICE, null, 2)};\n`);
writeFileSync(join(out, 'SHOWCASE.md'), '# Versão de vitrine\n\nEste repositório é a versão pública do Prova Arcade: o **banco de itens real foi trocado por itens de exemplo** e não há dados de alunos, licenças ou senhas.\n');
console.log('Showcase criado em', out, '\nConfira o conteúdo antes de publicar.');
