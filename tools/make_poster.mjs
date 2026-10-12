// Gera um cartaz A4 (HTML) com o QR Code.  Uso: node tools/make_poster.mjs "<URL>" "<Título>" "<arquivo.html>"
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire(import.meta.url); const qrcode = require('../admin/qrcode.js');
const [url, title, out] = process.argv.slice(2);
const q = qrcode(0, 'M'); q.addData(url); q.make(); const svg = q.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>Cartaz · ${esc(title)}</title><style>body{font-family:system-ui,Segoe UI,sans-serif;text-align:center;margin:0;padding:28px;color:#14102e}h1{font-size:46px;margin:10px 0 0}h2{font-size:26px;margin:6px 0 18px;color:#2f6bff}.q{width:560px;height:560px;margin:10px auto;padding:14px;border:10px solid #14102e;border-radius:28px}.q svg{width:100%;height:100%}p{font-size:22px;margin:10px 0}.u{font:600 16px ui-monospace,Consolas,monospace;color:#555;word-break:break-all}.s{display:flex;justify-content:center;gap:26px;margin:18px 0;font-size:22px}.s b{display:block;font-size:36px}</style><h1>PROVA ARCADE</h1><h2>${esc(title)}</h2><div class="q">${svg}</div><div class="s"><div><b>1</b>Abra a câmera do celular</div><div><b>2</b>Aponte para o QR</div><div><b>3</b>Toque no link e jogue!</div></div><p>Use o celular na <b>horizontal</b>. Não precisa instalar nada.</p><p class="u">${esc(url)}</p>`);
console.log('cartaz gerado:', out);
