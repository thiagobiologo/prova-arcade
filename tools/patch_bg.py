import os, sys
d = os.path.dirname(os.path.abspath(__file__)); app = os.path.join(d, '..', 'app', 'js')
p = os.path.join(app, 'art.js'); s = open(p, encoding='utf8').read()
a = s.index('function buildBg(th) {'); b = s.index('export function buildWorld(key) {')
s = s[:a] + open(os.path.join(d, 'bg_new.txt'), encoding='utf8').read() + '\n' + s[b:]
# camadas enviadas pelo autor (PNG 1280x540) substituem as geradas
s = s.replace("  return { th, tex, decor: decorFor(th), bg: buildBg(th) };", "  const bg = buildBg(th); const ov = (typeof window !== 'undefined' && window.__BGOVER && window.__BGOVER[key]) || null; if (ov) for (const k of Object.keys(ov)) bg[k] = ov[k];\n  return { th, tex, decor: decorFor(th), bg };")
open(p, 'w', encoding='utf8').write(s)

p = os.path.join(app, 'game.js'); s = open(p, encoding='utf8').read()
old = "    lay(bg.far, 0.1); lay(bg.mid, 0.25); lay(bg.near, 0.45);\n    if (this.inSecret)"
new = "    lay(bg.far, 0.1); lay(bg.mid, 0.25); if (bg.mist) lay(bg.mist, 0.34); this._bgDynamic(x, th, W, H, f, cam, vy); lay(bg.near, 0.45);\n    if (this.inSecret)"
assert old in s; s = s.replace(old, new)
old2 = "  _glow(x, cx, cy, r, col, a = 1) {"
new2 = """  _bgDynamic(x, th, W, H, f, cam, vy) {
    const wrap = (v, m) => ((v % m) + m) % m;
    if (th.key === 'train') { for (let i = 0; i < 5; i++) { const px = wrap(f * 0.35 + i * 140 - cam.x * 0.06, W + 80) - 40, py = 30 + (i * 23) % 60 + Math.sin(f / 30 + i) * 5 + vy * 0.3, fl = Math.sin(f / 5 + i * 2) * 3; x.strokeStyle = 'rgba(40,50,90,.7)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(px - 6, py + fl); x.quadraticCurveTo(px - 3, py - 3, px, py); x.quadraticCurveTo(px + 3, py - 3, px + 6, py + fl); x.stroke(); } }
    else if (th.key === 's1') { for (let i = 0; i < 6; i++) { const px = wrap(i * 97 - cam.x * 0.18 + Math.sin(f / 90 + i) * 6, W + 60) - 30, py = 36 + (i * 31) % 90 + Math.sin(f / 40 + i * 1.7) * 7 + vy * 0.5; this._glow(x, px, py, 16, 'rgba(160,140,255,.5)', 0.8); x.fillStyle = 'rgba(200,185,255,.85)'; x.beginPath(); x.moveTo(px, py - 6); x.lineTo(px + 3, py); x.lineTo(px, py + 6); x.lineTo(px - 3, py); x.fill(); } }
    else if (th.key === 's2') { for (let i = 0; i < 3; i++) { const px = wrap(f * 0.25 + i * 170 - cam.x * 0.07, W + 80) - 40, py = 44 + i * 22 + Math.sin(f / 50 + i) * 4 + vy * 0.3, fl = Math.sin(f / 9 + i) * 3.5; x.strokeStyle = 'rgba(60,20,50,.7)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(px - 9, py + fl); x.quadraticCurveTo(px - 4, py - 4, px, py); x.quadraticCurveTo(px + 4, py - 4, px + 9, py + fl); x.stroke(); } }
    else { for (let i = 0; i < 7; i++) { const px = wrap(i * 83 - cam.x * 0.5, W + 40) - 20; const sw = Math.sin(f / 45 + i) * 4; x.strokeStyle = 'rgba(30,180,110,.55)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(px, -2); x.quadraticCurveTo(px + sw, 22 + (i % 3) * 8, px + sw * 1.6, 44 + (i % 3) * 16); x.stroke(); this._glow(x, px + sw * 1.6, 44 + (i % 3) * 16, 8, 'rgba(120,255,170,.8)', 0.9); } }
  }
  _glow(x, cx, cy, r, col, a = 1) {"""
assert old2 in s; s = s.replace(old2, new2, 1)
open(p, 'w', encoding='utf8').write(s)

# gfx.js: carregador opcional de fundos entregues pelo autor
p = os.path.join(app, 'gfx.js'); s = open(p, encoding='utf8').read()
s += """
/* fundos entregues pelo autor (PNG 1280x540): /app/gfx/bg/manifest.json lista {"s1":["far","mid","near","mist"], ...} */
export async function loadBgOverrides() {
  try {
    const man = await fetch('/app/gfx/bg/manifest.json').then((r) => (r.ok ? r.json() : {})); const out = {};
    await Promise.all(Object.entries(man).flatMap(([k, layers]) => (layers || []).map((l) => new Promise((res) => { const img = new Image(); img.onload = () => { (out[k] = out[k] || {})[l] = img; res(); }; img.onerror = res; img.src = `/app/gfx/bg/${k}_${l}.png`; }))));
    window.__BGOVER = out;
  } catch (e) { window.__BGOVER = {}; }
}
"""
open(p, 'w', encoding='utf8').write(s)
p = os.path.join(app, 'ui.js'); s = open(p, encoding='utf8').read()
s = s.replace("import { loadGfx, gfx, frameCanvas } from './gfx.js';", "import { loadGfx, gfx, frameCanvas, loadBgOverrides } from './gfx.js';")
s = s.replace("  game = new Game($('game'), hooks); S.game = game; menuBg(); bindInput();", "  await loadBgOverrides(); game = new Game($('game'), hooks); S.game = game; menuBg(); bindInput();")
open(p, 'w', encoding='utf8').write(s)
os.makedirs(os.path.join(d, '..', 'app', 'gfx', 'bg'), exist_ok=True)
open(os.path.join(d, '..', 'app', 'gfx', 'bg', 'manifest.json'), 'w').write('{}\n')
print('ok')
