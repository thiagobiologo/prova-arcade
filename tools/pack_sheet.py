# Recorta uma folha de sprites do autor (fundo magenta liso, grade COLSxROWS) e gera o atlas do jogo.  © Thiago Silva.
# Uso:  python tools/pack_sheet.py <folha.png> <nome> <cols> <rows> <n> [altura] [--p2 outra_folha.png]
#   nome:  char_nina | char_teo | char_byte | char_fox | en_sentinel | boss_colossus | aura ...
#   n:     nº de quadros (chars=11, inimigos=2, chefões=3, aura=2). Ordem = esquerda→direita, cima→baixo.
#   altura padrão: char 150 · en_ 96 · boss_ 300 · aura 160
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); GFX = os.path.join(ROOT, 'app', 'gfx')

def key(cell):
    a = np.asarray(cell).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g
    al = np.clip(1.0 - (m - 40) / 120.0, 0, 1)
    b2 = np.where(m > 0, np.minimum(b, g + 0.15 * np.maximum(m, 0)), b)
    r2 = np.where(m > 0, np.minimum(r, np.maximum(g, r - 0.6 * m)), r)
    return Image.fromarray(np.dstack([r2, g, b2, al * 255]).clip(0, 255).astype(np.uint8), 'RGBA')

def cells(path, cols, rows, n):
    im = Image.open(path).convert('RGB'); W, H = im.size; cw, ch = W / cols, H / rows; out = []
    for i in range(n):
        c, rw = i % cols, i // cols
        x0, y0 = round(c * cw) + 4, round(rw * ch) + 4
        rgba = key(im.crop((x0, y0, round((c + 1) * cw) - 4, round((rw + 1) * ch) - 4)))
        al = np.asarray(rgba.getchannel('A')); ys, xs = np.where(al > 40)
        if len(xs) == 0: raise SystemExit(f'quadro {i + 1} vazio (fundo não é magenta liso?)')
        out.append((rgba, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)))
    return out

def build(path, cols, rows, n, th):
    cs = cells(path, cols, rows, n); maxh = max(b[3] - b[1] for _, b in cs); sc = th / maxh
    cw = round(max(b[2] - b[0] for _, b in cs) * sc) + 4; sheet = Image.new('RGBA', (cw * n, th), (0, 0, 0, 0))
    for k, (rgba, b) in enumerate(cs):
        c = rgba.crop(b); c = c.resize((max(1, round(c.width * sc)), max(1, round(c.height * sc))), Image.LANCZOS)
        sheet.alpha_composite(c, (k * cw + (cw - c.width) // 2, th - c.height - 1))
    return sheet, cw

def main():
    a = [x for x in sys.argv[1:]]; p2 = None
    if '--p2' in a: i = a.index('--p2'); p2 = a[i + 1]; del a[i:i + 2]
    path, name, cols, rows, n = a[0], a[1], int(a[2]), int(a[3]), int(a[4])
    th = int(a[5]) if len(a) > 5 else (150 if name.startswith('char_') else 96 if name.startswith('en_') else 300 if name.startswith('boss_') else 160)
    mf = os.path.join(GFX, 'manifest.json'); m = json.load(open(mf))
    names = [name + '_p1', name + '_p2'] if name.startswith('char_') else [name]
    for k, nm in enumerate(names):
        sheet, cw = build(p2 if (k == 1 and p2) else path, cols, rows, n, th)
        sheet.save(os.path.join(GFX, nm + '.png'), optimize=True); m[nm] = {'cw': cw, 'ch': th, 'n': n}; print(nm, cw, th, sheet.size)
    json.dump(m, open(mf, 'w'), indent=1)

if __name__ == '__main__': main()
