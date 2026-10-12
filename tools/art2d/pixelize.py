# Converte as ilustrações em PIXEL ART de 16 bits: paleta limitada por personagem, bordas duras, contorno seletivo de 1 px.  © Thiago Silva.
# (Usa o quantizador de cores do Pillow — mesmo algoritmo de "Imagem > Modo > Indexada" do GIMP — e filtros de morfologia.)
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

def _union_box(imgs, thr=40):
    box = None
    for im in imgs:
        b = im.getchannel('A').point(lambda v: 255 if v > thr else 0).getbbox()
        if b: box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    return box

def pixelize(frames, native_h, colors=24, up=4, box=None, pad=2, boost=1.18, sharp=True):
    """frames: lista de RGBA (alta resolução, mesma tela). Retorna (lista de frames pixelados já ampliados `up`x, caixa usada)."""
    box = box or _union_box(frames); box = (max(0, box[0] - pad), max(0, box[1] - pad), min(frames[0].width, box[2] + pad), min(frames[0].height, box[3] + pad))
    cw0, ch0 = box[2] - box[0], box[3] - box[1]; nh = native_h; nw = max(1, round(cw0 * nh / ch0))
    small, masks = [], []
    for im in frames:
        c = im.crop(box); rgb = Image.new('RGB', c.size, (0, 0, 0)); rgb.paste(c.convert('RGB'), (0, 0), c.getchannel('A'))   # cor sem vazamento de preto na borda
        # espalha a cor das bordas antes de reduzir (evita halo escuro)
        a = c.getchannel('A'); rgbp = c.convert('RGB'); big = Image.new('RGB', c.size); big.paste(rgbp, (0, 0), a.point(lambda v: 255 if v > 200 else 0))
        r = big.resize((nw, nh), Image.BOX); al = a.resize((nw, nh), Image.BOX).point(lambda v: 255 if v > 120 else 0)
        if sharp: r = r.filter(ImageFilter.UnsharpMask(radius=0.8, percent=80, threshold=2))
        r = ImageEnhance.Contrast(r).enhance(boost); r = ImageEnhance.Color(r).enhance(1.12)
        small.append(r); masks.append(al)
    # paleta única do personagem (todos os quadros juntos → cores consistentes)
    strip = Image.new('RGB', (nw * len(small), nh)); sm = Image.new('L', (nw * len(small), nh), 0)
    for i, (r, m) in enumerate(zip(small, masks)): strip.paste(r, (i * nw, 0)); sm.paste(m, (i * nw, 0))
    pal = strip.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = []
    for i, (r, m) in enumerate(zip(small, masks)):
        q = r.quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB'); qa = np.array(q); ma = np.array(m) > 0
        # contorno seletivo de 1 px: cor do vizinho opaco escurecida (fica "da mesma família" do personagem)
        H, W = ma.shape; ring = np.zeros_like(ma); ocol = np.zeros((H, W, 3), np.float32); cnt = np.zeros((H, W), np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.zeros_like(ma); shc = np.zeros((H, W, 3), np.float32)
            ys, xs = slice(max(0, dy), H + min(0, dy)), slice(max(0, dx), W + min(0, dx)); yd, xd = slice(max(0, -dy), H + min(0, -dy)), slice(max(0, -dx), W + min(0, -dx))
            sh[ys, xs] = ma[yd, xd]; shc[ys, xs] = qa[yd, xd]; cnt += sh; ocol += shc * sh[..., None]
        ring = (~ma) & (cnt > 0); ocol = ocol / np.maximum(cnt, 1)[..., None]
        rgba = np.zeros((H, W, 4), np.uint8); rgba[ma, :3] = qa[ma]; rgba[ma, 3] = 255
        dark = (ocol * 0.32 + np.array([18, 10, 30]) * 0.5).clip(0, 255); rgba[ring, :3] = dark[ring].astype(np.uint8); rgba[ring, 3] = 255
        im = Image.fromarray(rgba, 'RGBA')
        out.append(im.resize((im.width * up, im.height * up), Image.NEAREST))
    return out, box
