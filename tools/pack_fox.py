# Recorta a folha da Raposa (fundo magenta, 4x3) feita pelo autor e gera char_fox_p1/p2 + manifest.  © Thiago Silva.
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'art_src', 'raposa_sheet.png')
GFX = os.path.join(ROOT, 'app', 'gfx'); TH = 150
im = Image.open(SRC).convert('RGB'); W, H = im.size; cw0, ch0 = W / 4, H / 3
# ordem do jogo: 0-1 parado, 2-7 corrida (6), 8 pulo, 9 queda, 10 dano/derrota
ORDER = [0, 1, 2, 3, 4, 5, 4, 3, 6, 7, 10]

def key(cell):
    a = np.asarray(cell).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g                       # "magentice": alto no fundo, ~0 no pelo
    al = np.clip(1.0 - (m - 40) / 120.0, 0, 1)    # 1 = personagem
    b2 = np.where(m > 0, np.minimum(b, g + 0.15 * np.maximum(m, 0)), b)   # tira o halo rosa
    r2 = np.where(m > 0, np.minimum(r, np.maximum(g * 1.0, r - 0.6 * m)), r)
    out = np.dstack([r2, g, b2, al * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

cells = []
for i in range(11):
    c, rw = i % 4, i // 4
    x0, y0 = round(c * cw0) + 4, round(rw * ch0) + 4
    cell = im.crop((x0, y0, round((c + 1) * cw0) - 4, round((rw + 1) * ch0) - 4))
    rgba = key(cell)
    # mantém só o maior bloco opaco (remove sobras)
    al = np.asarray(rgba.getchannel('A')); ys, xs = np.where(al > 40)
    cells.append((rgba, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)))
# escala única (proporção entre quadros preservada); caixa comum, pés embaixo
maxh = max(b[3] - b[1] for _, b in cells); sc = TH / maxh
CW = round(max(b[2] - b[0] for _, b in cells) * sc) + 4
sheet = Image.new('RGBA', (CW * 11, TH), (0, 0, 0, 0))
for k, i in enumerate(ORDER):
    rgba, b = cells[i]; c = rgba.crop(b)
    c = c.resize((max(1, round(c.width * sc)), max(1, round(c.height * sc))), Image.LANCZOS)
    sheet.alpha_composite(c, (k * CW + (CW - c.width) // 2, TH - c.height - 1))
# contorno escuro fino (mesma linguagem dos outros personagens, do cenário e das plataformas): harmoniza o conjunto sem mexer no desenho
from PIL import ImageFilter, ImageChops
def outline(im, px=2, col=(46, 26, 40)):
    al = im.getchannel('A').point(lambda v: 255 if v > 40 else 0); dil = al.filter(ImageFilter.MaxFilter(px * 2 + 1)); ring = ImageChops.subtract(dil, al)
    base = Image.new('RGBA', im.size, col + (255,)); layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); layer.paste(base, (0, 0), ring); return Image.alpha_composite(layer, im)
if os.environ.get('FOX_OUTLINE', '1') == '1':
    out = Image.new('RGBA', sheet.size, (0, 0, 0, 0))
    for k in range(11): out.paste(outline(sheet.crop((k * CW, 0, (k + 1) * CW, TH))), (k * CW, 0))
    sheet = out
for p in (1, 2): sheet.save(os.path.join(GFX, f'char_fox_p{p}.png'), optimize=True)
mf = os.path.join(GFX, 'manifest.json'); m = json.load(open(mf))
for p in (1, 2): m[f'char_fox_p{p}'] = {'cw': CW, 'ch': TH, 'n': 11}
json.dump(m, open(mf, 'w'), indent=1); print('fox', CW, TH, sheet.size)
