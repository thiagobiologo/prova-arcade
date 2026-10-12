# Gera TODOS os sprites 2D (Nina, Téo, Byte, monstros, chefões, AURA) e empacota no atlas do jogo (app/gfx).  © Thiago Silva.
# Uso:  python tools/art2d/build.py [nina teo byte monstros chefoes aura]   (sem argumentos = tudo)
# A Raposa NÃO é regerada (usa a folha do autor: tools/pack_fox.py). O backup do atlas 3D anterior fica em tools/gfx_blender_backup.
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from PIL import Image
import heroes, creatures, bosses

GFX = os.path.abspath(os.path.join(HERE, '..', '..', 'app', 'gfx'))
mf = os.path.join(GFX, 'manifest.json'); M = json.load(open(mf))

def bbox(imgs, thr=40):
    box = None
    for im in imgs:
        b = im.getchannel('A').point(lambda v: 255 if v > thr else 0).getbbox()
        if b: box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    return box

def strip(names, imgs, th, box=None, pad=3):
    box = box or bbox(imgs); box = (max(0, box[0] - pad), max(0, box[1] - pad), min(imgs[0].width, box[2] + pad), min(imgs[0].height, box[3] + pad))
    cw0, ch0 = box[2] - box[0], box[3] - box[1]; ch = th; cw = max(1, round(cw0 * ch / ch0))
    sheet = Image.new('RGBA', (cw * len(imgs), ch), (0, 0, 0, 0))
    for i, im in enumerate(imgs): sheet.paste(im.crop(box).resize((cw, ch), Image.LANCZOS), (i * cw, 0))
    for n in names: sheet.save(os.path.join(GFX, n + '.png'), optimize=True); M[n] = {'cw': cw, 'ch': ch, 'n': len(imgs)}
    print(names[0], cw, ch, len(imgs))

want = set(sys.argv[1:]) or {'nina', 'teo', 'byte', 'monstros', 'chefoes', 'aura'}
HF = heroes.FRAMES
hero = {}
if 'nina' in want: hero['nina'] = [heroes.nina(k, p) for k, p in HF]
if 'teo' in want: hero['teo'] = [heroes.teo(k, p) for k, p in HF]
if 'byte' in want: hero['byte'] = [creatures.byte(k, p) for k, p in HF]
if hero:
    allimgs = [im for v in hero.values() for im in v]
    cbox = bbox(allimgs)           # caixa comum: mantém a proporção entre os heróis
    for n, imgs in hero.items(): strip([f'char_{n}_p1', f'char_{n}_p2'], imgs, 150, cbox)
if 'monstros' in want:
    for n, fn in creatures.SMALL.items(): strip([n], [fn(0), fn(1)], 96)
if 'chefoes' in want:
    for n, fn in bosses.BOSS.items(): strip([n], [fn('idle'), fn('tele'), fn('stun')], 300)
if 'aura' in want: strip(['aura'], [creatures.aura(0), creatures.aura(1)], 160)
json.dump(M, open(mf, 'w'), indent=1)
print('atlas atualizado em', GFX)
