# Mesa de desenho vetorial (Pillow + NumPy): formas com gradiente, contorno colorido, luz de borda e brilho.
# Estilo: ilustração "cel-shaded" lúdica, contorno na cor escura do próprio objeto (nunca preto chapado).  © Thiago Silva.
import math
import numpy as np
from PIL import Image, ImageDraw, ImageChops, ImageFilter

SS = 4  # superamostragem (desenha em 4x e reduz: bordas suaves)

def hexc(h, a=255):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

def mixc(a, b, t):
    a = hexc(a) if isinstance(a, str) else a; b = hexc(b) if isinstance(b, str) else b
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))

def lighter(c, f): c = hexc(c) if isinstance(c, str) else c; return tuple(int(c[i] + (255 - c[i]) * f) for i in range(3)) + (c[3],)
def darker(c, f): c = hexc(c) if isinstance(c, str) else c; return tuple(int(c[i] * (1 - f)) for i in range(3)) + (c[3],)

def bez(p0, p1, p2, p3, n=18):
    out = []
    for i in range(n + 1):
        t = i / n; u = 1 - t
        out.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0], u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))
    return out

def smooth(pts, n=10):  # Catmull-Rom fechada -> polígono liso
    out = []; m = len(pts)
    for i in range(m):
        p0, p1, p2, p3 = pts[(i - 1) % m], pts[i], pts[(i + 1) % m], pts[(i + 2) % m]
        for k in range(n):
            t = k / n; t2 = t * t; t3 = t2 * t
            out.append((0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)))
    return out

def ell_pts(cx, cy, rx, ry, rot=0.0, n=56):
    c, s = math.cos(rot), math.sin(rot)
    return [(cx + rx * math.cos(2 * math.pi * i / n) * c - ry * math.sin(2 * math.pi * i / n) * s,
             cy + rx * math.cos(2 * math.pi * i / n) * s + ry * math.sin(2 * math.pi * i / n) * c) for i in range(n)]

def limb_pts(p0, p1, r0, r1, n=10):  # membro afinado com pontas redondas
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L, dx / L; a = math.atan2(dy, dx)
    pts = []
    for i in range(n + 1):  # tampa em p1
        t = -math.pi / 2 + math.pi * i / n; pts.append((p1[0] + r1 * math.cos(a + t), p1[1] + r1 * math.sin(a + t)))
    for i in range(n + 1):  # tampa em p0
        t = math.pi / 2 + math.pi * i / n; pts.append((p0[0] + r0 * math.cos(a + t), p0[1] + r0 * math.sin(a + t)))
    return pts

def ik2(root, target, l1, l2, bend=1):
    dx, dy = target[0] - root[0], target[1] - root[1]; dist = math.hypot(dx, dy) or 1e-3
    d = min(dist, l1 + l2 - 0.01); a = math.atan2(dy, dx)
    A = math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
    knee = (root[0] + l1 * math.cos(a + bend * A), root[1] + l1 * math.sin(a + bend * A))
    return knee, (root[0] + d * math.cos(a), root[1] + d * math.sin(a))

class Cv:
    def __init__(s, w, h):
        s.W, s.H = w, h; s.oy = 0; s.w, s.h = w * SS, h * SS; s.im = Image.new('RGBA', (s.w, s.h), (0, 0, 0, 0))
    def P(s, pts): return [(x * SS, (y + s.oy) * SS) for x, y in pts]
    def mask(s, pts):
        m = Image.new('L', (s.w, s.h), 0); ImageDraw.Draw(m).polygon(s.P(pts), fill=255); return m
    def grad(s, c0, c1, ang=90, box=None):
        c0 = hexc(c0) if isinstance(c0, str) else c0; c1 = hexc(c1) if isinstance(c1, str) else c1
        x0, y0, x1, y1 = box if box else (0, 0, s.w, s.h); x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(s.w, x1), min(s.h, y1)
        bw, bh = max(1, x1 - x0), max(1, y1 - y0)
        yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32); a = math.radians(ang)
        ext = (bw * abs(math.cos(a)) + bh * abs(math.sin(a))) / 2 or 1
        t = np.clip(((xx - bw / 2) * math.cos(a) + (yy - bh / 2) * math.sin(a)) / (2 * ext) + 0.5, 0, 1)[..., None]
        arr = np.array(c0, np.float32) * (1 - t) + np.array(c1, np.float32) * t
        full = Image.new('RGBA', (s.w, s.h), (0, 0, 0, 0)); full.paste(Image.fromarray(arr.astype(np.uint8), 'RGBA'), (x0, y0)); return full
    def paint(s, img, mask):
        layer = Image.new('RGBA', (s.w, s.h), (0, 0, 0, 0)); layer.paste(img, (0, 0), mask); s.im = Image.alpha_composite(s.im, layer)
    def solid(s, col):
        return Image.new('RGBA', (s.w, s.h), hexc(col) if isinstance(col, str) else col)
    def _region(s, pts, pad):
        xs = [p[0] * SS for p in pts]; ys = [(p[1] + s.oy) * SS for p in pts]
        x0 = max(0, int(min(xs)) - pad); y0 = max(0, int(min(ys)) - pad); x1 = min(s.w, int(max(xs)) + pad + 1); y1 = min(s.h, int(max(ys)) + pad + 1)
        return (x0, y0, x1, y1) if x1 > x0 and y1 > y0 else None
    def shape(s, pts, fill, fill2=None, ang=90, line=None, lw=1.6, shade=0.0, hl=0.0, rim=None):
        """polígono com gradiente, contorno e luz/sombra tipo cel-shading (processa só a caixa da forma: rápido)."""
        pad = int(lw * SS) + 6 * SS; box = s._region(pts, pad)
        if not box: return None
        bw, bh = box[2] - box[0], box[3] - box[1]
        m = Image.new('L', (bw, bh), 0); ImageDraw.Draw(m).polygon([(x * SS - box[0], (y + s.oy) * SS - box[1]) for x, y in pts], fill=255)
        bb = m.getbbox()
        if not bb: return None
        c0 = hexc(fill) if isinstance(fill, str) else fill; c1 = hexc(fill2) if isinstance(fill2, str) else (fill2 or c0)
        a = math.radians(ang); yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
        ext = ((bb[2] - bb[0]) * abs(math.cos(a)) + (bb[3] - bb[1]) * abs(math.sin(a))) / 2 or 1
        cxx, cyy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
        t = np.clip(((xx - cxx) * math.cos(a) + (yy - cyy) * math.sin(a)) / (2 * ext) + 0.5, 0, 1)[..., None]
        img = Image.fromarray((np.array(c0, np.float32) * (1 - t) + np.array(c1, np.float32) * t).astype(np.uint8), 'RGBA')
        layer = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
        if line is not None:
            r = max(1, int(lw * SS)); dil = m.filter(ImageFilter.MaxFilter(r * 2 + 1)); ring = ImageChops.subtract(dil, m)
            layer.paste(Image.new('RGBA', (bw, bh), hexc(line) if isinstance(line, str) else line), (0, 0), ring)
        layer.paste(img, (0, 0), m)
        if shade:
            sh = ImageChops.subtract(m, ImageChops.offset(m, -int(3.2 * SS), -int(3.6 * SS))); layer.paste(Image.new('RGBA', (bw, bh), (0, 0, 0, int(255 * shade))), (0, 0), sh)
        if hl:
            hh = ImageChops.subtract(m, ImageChops.offset(m, int(3 * SS), int(3.4 * SS))); layer.paste(Image.new('RGBA', (bw, bh), (255, 255, 255, int(255 * hl))), (0, 0), hh)
        if rim:
            rr = ImageChops.subtract(m, ImageChops.offset(m, int(2.2 * SS), 0)); layer.paste(Image.new('RGBA', (bw, bh), hexc(rim, 190) if isinstance(rim, str) else rim), (0, 0), rr)
        reg = s.im.crop(box); s.im.paste(Image.alpha_composite(reg, layer), (box[0], box[1])); return m
    def ell(s, cx, cy, rx, ry, fill, fill2=None, rot=0, **kw): return s.shape(ell_pts(cx, cy, rx, ry, rot), fill, fill2, **kw)
    def limb(s, p0, p1, r0, r1, fill, fill2=None, **kw): return s.shape(limb_pts(p0, p1, r0, r1), fill, fill2, ang=kw.pop('ang', 0), **kw)
    def poly(s, pts, fill, fill2=None, **kw): return s.shape(pts, fill, fill2, **kw)
    def stroke(s, pts, col, w=2.0, cap=True):
        d = ImageDraw.Draw(s.im); P = s.P(pts); c = hexc(col) if isinstance(col, str) else col
        d.line(P, fill=c, width=max(1, int(w * SS)), joint='curve')
        if cap:
            for q in (P[0], P[-1]): r = w * SS / 2; d.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=c)
    def glow(s, cx, cy, r, col, a=0.6):
        cy = cy + s.oy; x0, y0, x1, y1 = max(0, int((cx - r) * SS)), max(0, int((cy - r) * SS)), min(s.w, int((cx + r) * SS)), min(s.h, int((cy + r) * SS))
        if x1 <= x0 or y1 <= y0: return
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32); d = np.sqrt((xx - cx * SS) ** 2 + (yy - cy * SS) ** 2) / (r * SS)
        al = np.clip(1 - d, 0, 1) ** 2 * a; c = hexc(col) if isinstance(col, str) else col
        arr = np.zeros((y1 - y0, x1 - x0, 4), np.uint8); arr[..., 0], arr[..., 1], arr[..., 2] = c[0], c[1], c[2]; arr[..., 3] = (al * 255).astype(np.uint8)
        reg = s.im.crop((x0, y0, x1, y1)); s.im.paste(Image.alpha_composite(reg, Image.fromarray(arr, 'RGBA')), (x0, y0))
    def dot(s, cx, cy, r, col): cy = cy + s.oy; d = ImageDraw.Draw(s.im); d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=hexc(col) if isinstance(col, str) else col)
    def finish(s, scale=1.0):  # reduz com qualidade e dá um brilho suave de borda ("pintado")
        out = s.im.resize((int(s.W * scale), int(s.H * scale)), Image.LANCZOS) if scale != 1 else s.im.resize((s.W, s.H), Image.LANCZOS)
        return out

def flip(im): return im.transpose(Image.FLIP_LEFT_RIGHT)
