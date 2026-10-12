/* Carregador dos atlas de sprites (arte 2D). © Thiago Silva. */
let G = null;
const V = '20261012m'; // mude este valor quando trocar qualquer PNG de app/gfx (evita imagem antiga em cache)
export async function loadGfx(onProgress) {
  const man = await fetch('/app/gfx/manifest.json?v=' + V).then((r) => r.json());
  const names = Object.keys(man); let done = 0; const out = {};
  await Promise.all(names.map((n) => new Promise((res) => {
    const img = new Image(); img.decoding = 'async';
    img.onload = () => { out[n] = { img, cw: man[n].cw, ch: man[n].ch, n: man[n].n }; done++; onProgress && onProgress(done / names.length); res(); };
    img.onerror = () => { out[n] = null; done++; res(); };
    img.src = '/app/gfx/' + n + '.png?v=' + V;
  })));
  G = out; return out;
}
export const gfx = () => G;
/* desenha o quadro i da tira `name`, com base no centro-inferior (dx = centro, dy = pés) */
export function drawFoot(ctx, name, i, cx, footY, h, flip = false, sx = 1, sy = 1, alpha = 1) {
  const s = G && G[name]; if (!s) return; const f = Math.max(0, Math.min(s.n - 1, i | 0)); const w = h * s.cw / s.ch;
  ctx.save(); ctx.imageSmoothingEnabled = false; if (alpha !== 1) ctx.globalAlpha *= alpha; ctx.translate(cx, footY); if (flip) ctx.scale(-1, 1); ctx.scale(sx, sy);
  ctx.drawImage(s.img, f * s.cw, 0, s.cw, s.ch, -w / 2, -h, w, h); ctx.restore();
}
export function drawBox(ctx, name, i, x, y, w, h) { const s = G && G[name]; if (!s) return; const f = Math.max(0, Math.min(s.n - 1, i | 0)); ctx.drawImage(s.img, f * s.cw, 0, s.cw, s.ch, x, y, w, h); }
export function frameCanvas(name, i, hpx) { // retorna um canvas com o quadro (para menus)
  const s = G && G[name]; if (!s) return null; const w = Math.round(hpx * s.cw / s.ch); const c = document.createElement('canvas'); c.width = w; c.height = hpx; c.getContext('2d').drawImage(s.img, i * s.cw, 0, s.cw, s.ch, 0, 0, w, hpx); return c;
}

/* fundos entregues pelo autor (PNG 1280x540): /app/gfx/bg/manifest.json lista {"s1":["far","mid","near","mist"], ...} */
export async function loadBgOverrides() {
  try {
    const man = await fetch('/app/gfx/bg/manifest.json').then((r) => (r.ok ? r.json() : {})); const out = {};
    await Promise.all(Object.entries(man).flatMap(([k, layers]) => (layers || []).map((l) => new Promise((res) => { const img = new Image(); img.onload = () => { (out[k] = out[k] || {})[l] = img; res(); }; img.onerror = res; img.src = `/app/gfx/bg/${k}_${l}.png`; }))));
    window.__BGOVER = out;
  } catch (e) { window.__BGOVER = {}; }
}
