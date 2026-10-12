# Empacota os PNGs renderizados no Blender em tiras (strips) otimizadas + manifest.json.  © Thiago Silva.
import os, sys, json, glob
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'out')
DST = os.path.abspath(os.path.join(HERE, '..', '..', 'app', 'gfx'))
os.makedirs(DST, exist_ok=True)
manifest = {}

def union_bbox(imgs):
    box = None
    for im in imgs:
        b = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        if b: box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    return box

def strip(name, files, target_h, box=None, pad=2):
    imgs = [Image.open(f).convert('RGBA') for f in files]
    box = box or union_bbox(imgs)
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(imgs[0].width, box[2] + pad), min(imgs[0].height, box[3] + pad))
    cw0, ch0 = box[2] - box[0], box[3] - box[1]; ch = target_h; cw = max(1, round(cw0 * ch / ch0))
    sheet = Image.new('RGBA', (cw * len(imgs), ch), (0, 0, 0, 0))
    for i, im in enumerate(imgs):
        c = im.crop(box).resize((cw, ch), Image.LANCZOS); sheet.paste(c, (i * cw, 0))
    sheet.save(os.path.join(DST, name + '.png'), optimize=True)
    manifest[name] = {'cw': cw, 'ch': ch, 'n': len(imgs)}
    return box

def frames(prefix, n=None):
    fs = sorted(glob.glob(os.path.join(SRC, prefix + '_*.png')))
    return fs[:n] if n else fs

# personagens: caixa comum para manter proporções entre eles
chars = ['nina', 'teo', 'byte', 'fox']
allc = [Image.open(f).convert('RGBA') for c in chars for p in (1, 2) for f in frames(f'char_{c}_p{p}')]
if allc:
    cbox = union_bbox(allc)
    for c in chars:
        for p in (1, 2):
            fs = frames(f'char_{c}_p{p}')
            if fs: strip(f'char_{c}_p{p}', fs, 150, cbox)
# inimigos
for e in ['sentinel', 'spider', 'skull', 'spore', 'drone', 'wraith', 'vulture', 'wisp']:
    fs = frames('en_' + e)
    if fs: strip('en_' + e, fs, 96)
# chefes
for b in ['colossus', 'titan', 'hydra']:
    fs = frames('boss_' + b)
    if fs: strip('boss_' + b, fs, 300)
# props
for nme, h in [('coin', 64), ('star', 72), ('aura', 160)]:
    fs = frames(nme)
    if fs: strip(nme, fs, h)
for i in range(3):
    fs = frames(f'ped{i}')
    if fs: strip(f'ped{i}', fs, 150)
json.dump(manifest, open(os.path.join(DST, 'manifest.json'), 'w'), indent=1)
tot = sum(os.path.getsize(os.path.join(DST, f)) for f in os.listdir(DST))
print('atlas:', len(manifest), 'strips,', round(tot / 1024), 'KB')
