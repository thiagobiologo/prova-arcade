P = 'app/js/art.js'
s = open(P, encoding='utf-8').read()
def cut(a, b, new):
    global s
    i = s.index(a); j = s.index(b); s = s[:i] + new + s[j:]
def rep(a, b):
    global s
    assert a in s, a[:70]; s = s.replace(a, b, 1)

cut("function soil(c, th, seed) {", "function texFill(", open('tools/art_tiles.txt', encoding='utf-8').read())
cut("function texPlat(th) {", "function texSpike(", open('tools/art_plat.txt', encoding='utf-8').read())
cut("function texBrick(th) {", "function decorFor(th) {", open('tools/art_brick_decor.txt', encoding='utf-8').read())
# o cabeçalho "/* ---------- decoração ---------- */" aparece duas vezes agora: remove o antigo (logo antes de decorFor já foi cortado)
rep("  return out;\n}\n\n/* ---------- fundos (parallax) ---------- */", "  decorExtras(th, add);\n  return out;\n}\n\n/* ---------- fundos (parallax) ---------- */")
# paleta dos tiles/plataformas (o fundo 3D NÃO muda)
rep("topA: '#9be84e', topB: '#4eb83a', topHi: '#e2ffa8', dirtA: '#b06c3c', dirtB: '#6a3c20', pebble: '#e0aa78', plat: '#ffcf4d', platDark: '#c98a22'", "topA: '#a6ee52', topB: '#3fb23a', topHi: '#eaffb0', dirtA: '#c47a45', dirtB: '#74402a', pebble: '#ecb888', plat: '#f2b94a', platDark: '#b8741c'")
rep("topA: '#5cecff', topB: '#2a98d8', topHi: '#dffcff', dirtA: '#433f9a', dirtB: '#1f1c5e', pebble: '#7a78e8', plat: '#7a76f0', platDark: '#3b39aa'", "topA: '#62f0ff', topB: '#2f8fe0', topHi: '#e6fdff', dirtA: '#4a45b0', dirtB: '#221e66', pebble: '#8a88f0', plat: '#8f86ff', platDark: '#3b3aa8'")
rep("topA: '#ffdc90', topB: '#e8aa5c', topHi: '#fff3d0', dirtA: '#dca058', dirtB: '#9c6232', pebble: '#f3cf98', plat: '#ecd8a8', platDark: '#a99160'", "topA: '#ffd27a', topB: '#e8934a', topHi: '#fff1c8', dirtA: '#e0985a', dirtB: '#a45e36', pebble: '#f6d6a2', plat: '#f0dcae', platDark: '#a88650'")
rep("topA: '#82ffa8', topB: '#2fca7a', topHi: '#e2ffea', dirtA: '#2c5e58', dirtB: '#12302f', pebble: '#4ea090', plat: '#44a592', platDark: '#205d52'", "topA: '#8dffb0', topB: '#2fd382', topHi: '#e8fff0', dirtA: '#2f6a62', dirtB: '#123533', pebble: '#58b0a0', plat: '#4ab89c', platDark: '#1f6a58'")
# primeiro plano (silhuetas que passam à frente, dando profundidade)
rep("export function buildWorld(key) {", """function buildFg(th) {
  const S = 2, H = 34; const [c, x] = cv(BW * S, H * S); x.scale(S, S); const r = rng(th.key.charCodeAt(1) * 31 + 9);
  const col = th.key === 'train' ? '#1d5a2e' : shade(th.abyss, -0.1);
  [-BW, 0, BW].forEach((o) => {
    for (let i = 0; i < 16; i++) {
      const bx = ((i * 41 + 13) % BW) + o, h = 14 + r() * 18;
      if (th.key === 's1') { x.fillStyle = col; x.beginPath(); x.moveTo(bx - 5, H); x.lineTo(bx - 2, H - h); x.lineTo(bx + 2, H - h * 0.8); x.lineTo(bx + 6, H); x.fill(); x.strokeStyle = th.accent; x.globalAlpha = 0.6; x.lineWidth = 1; x.beginPath(); x.moveTo(bx - 2, H - h); x.lineTo(bx - 5, H); x.stroke(); x.globalAlpha = 1; }
      else if (th.key === 's2') { x.strokeStyle = col; x.lineWidth = 3.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, H); x.quadraticCurveTo(bx - 4, H - h * 0.6, bx + 5, H - h); x.stroke(); }
      else if (th.key === 's3') { x.strokeStyle = col; x.lineWidth = 2.4; x.lineCap = 'round'; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(bx, H); x.quadraticCurveTo(bx + k * 3, H - h * 0.7, bx + k * 6, H - h * (0.6 - Math.abs(k) * 0.08)); x.stroke(); } }
      else { x.fillStyle = col; for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(bx + k * 3 - 2, H); x.quadraticCurveTo(bx + k * 3, H - h, bx + k * 6 + 1, H - h * 0.7 - 2); x.quadraticCurveTo(bx + k * 3 + 2, H - h * 0.4, bx + k * 3 + 2, H); x.fill(); } }
    }
  });
  return c;
}

export function buildWorld(key) {""")
rep("return { th, tex, decor: decorFor(th), bg };", "return { th, tex, decor: decorFor(th), bg, fg: buildFg(th) };")
open(P, 'w', encoding='utf-8').write(s)

# game.js: primeiro plano
G = 'app/js/game.js'
g = open(G, encoding='utf-8').read()
a = "    { const by = ROWS * TS - camY; if (by < H) {"
assert a in g
g = g.replace(a, "    if (A.fg && !this.stations.some((st) => st.active) && !(this.boss && this.boss.active)) { const fw = 640; const ox = -(((camX * 1.35) % fw) + fw) % fw; for (let xx = ox; xx < W; xx += fw) x.drawImage(A.fg, xx, H - 34, fw, 34); }\n" + a, 1)
open(G, 'w', encoding='utf-8').write(g)
# levels: decoração mais densa
L = 'app/js/levels.js'
l = open(L, encoding='utf-8').read()
a = "if (top[cc] < 0 || cc - lastDecor < 3 || inArena(cc)) continue;"
assert a in l
l = l.replace(a, "if (top[cc] < 0 || cc - lastDecor < 2 || inArena(cc)) continue;", 1)
a = "if (r() < 0.34) { L.decor.push("
assert a in l
l = l.replace(a, "if (r() < 0.6) { L.decor.push(", 1)
open(L, 'w', encoding='utf-8').write(l)
print('ok')
