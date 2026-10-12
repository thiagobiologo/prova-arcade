# PIXEL ART de 16 bits para TODO o elenco: heróis, Raposa, monstros, chefões, AURA, moeda, estrela, pedestais.  © Thiago Silva.
# Uso: python tools/art2d/build_px.py       (sem Blender; usa Pillow — quantizador equivalente ao "Indexada" do GIMP)
import os, sys, json, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
from PIL import Image
import heroes, creatures, bosses, pixelize
import pack_sheet

ROOT = os.path.abspath(os.path.join(HERE, '..', '..')); GFX = os.path.join(ROOT, 'app', 'gfx'); BK = os.path.join(ROOT, 'tools', 'gfx_blender_backup')
M = json.load(open(os.path.join(GFX, 'manifest.json')))
UP = 1

def put(names, frames):
    cw, ch = frames[0].size; sheet = Image.new('RGBA', (cw * len(frames), ch), (0, 0, 0, 0))
    for i, f in enumerate(frames): sheet.paste(f, (i * cw, 0))
    for n in names: sheet.save(os.path.join(GFX, n + '.png'), optimize=True); M[n] = {'cw': cw, 'ch': ch, 'n': len(frames), 'px': 1}
    print(names[0], cw, ch, len(frames))

# --- heróis (caixa comum: mantém a proporção entre eles) ---
HF = heroes.FRAMES
hero = {'nina': [heroes.nina(k, p) for k, p in HF], 'teo': [heroes.teo(k, p) for k, p in HF], 'byte': [creatures.byte(k, p) for k, p in HF], 'fox': [heroes.fox(k, p) for k, p in HF]}   # a Raposa agora é desenhada no MESMO estilo dos outros (harmonia)
hb = pixelize._union_box([im for v in hero.values() for im in v])
for n, fr in hero.items():
    px, _ = pixelize.pixelize(fr, 72, 24, UP, box=hb); put([f'char_{n}_p1', f'char_{n}_p2'], px)
if os.environ.get('FOX_SHEET') == '1':   # opcional: usar a folha pintada do autor, convertida para 16 bits
    # --- Raposa: a folha pintada do autor, convertida para 16 bits (mesma ordem de quadros do pack_fox) ---
    cells = pack_sheet.cells(os.path.join(ROOT, 'tools', 'art_src', 'raposa_sheet.png'), 4, 3, 11)
    ORDER = [0, 1, 2, 3, 4, 5, 4, 3, 6, 7, 10]
    fox = []
    for i in ORDER:
        rgba, b = cells[i]; fox.append(rgba.crop(b))
    W0 = max(f.width for f in fox); H0 = max(f.height for f in fox)
    fox = [(lambda f: (lambda canvas: (canvas.paste(f, ((W0 - f.width) // 2, H0 - f.height), f), canvas)[1])(Image.new('RGBA', (W0, H0), (0, 0, 0, 0))))(f) for f in fox]
    px, _ = pixelize.pixelize(fox, 64, 32, UP, boost=1.1, sharp=False); put(['char_fox_p1', 'char_fox_p2'], px)
# --- monstros, chefões, AURA ---
for n, fn in creatures.SMALL.items():
    px, _ = pixelize.pixelize([fn(0), fn(1)], 40, 20, UP); put([n], px)
for n, fn in bosses.BOSS.items():
    px, _ = pixelize.pixelize([fn('idle'), fn('tele'), fn('stun')], 144, 30, UP); put([n], px)
px, _ = pixelize.pixelize([creatures.aura(0), creatures.aura(1)], 48, 14, UP); put(['aura'], px)
# --- moeda, estrela e pedestais (vindos do atlas 3D antigo) viram pixel art também ---
def slice_strip(name):
    mf = json.load(open(os.path.join(BK, 'manifest.json')))[name]; im = Image.open(os.path.join(BK, name + '.png')).convert('RGBA')
    return [im.crop((i * mf['cw'], 0, (i + 1) * mf['cw'], mf['ch'])) for i in range(mf['n'])]
for n, h, cl in [('coin', 22, 10), ('star', 26, 12), ('ped0', 48, 14), ('ped1', 48, 14), ('ped2', 48, 14)]:
    px, _ = pixelize.pixelize(slice_strip(n), h, cl, UP, pad=1); put([n], px)
json.dump(M, open(os.path.join(GFX, 'manifest.json'), 'w'), indent=1)
print('atlas pixel art pronto em', GFX)
