# Chefões v2 (mais ameaçadores): Colosso de Cristal, Titã de Ossos, Hidra Sináptica — 3 quadros: parado, preparando ataque, exausto.  © Thiago Silva.
import math
from kit import *
INK = '#1c1430'
BWW, BHH, BGG = 360, 450, 376

def chain(cv, pts, w0, w1, c0, c1, line=INK, lw=2.2, shade=0.2):
    n = len(pts) - 1
    for i in range(n):
        t0, t1 = i / n, (i + 1) / n; cv.limb(pts[i], pts[i + 1], w0 + (w1 - w0) * t0, w0 + (w1 - w0) * t1, c0, c1, line=line, lw=lw, shade=shade)

def crack(cv, pts, col, w=2.0):
    cv.glow(pts[len(pts) // 2][0], pts[len(pts) // 2][1], 22, col, 0.35); cv.stroke(pts, col, w); cv.stroke(pts, '#ffffff', max(0.8, w * 0.35))

def spike(cv, bx, by, tx, ty, w, c0, c1, line=INK):
    a = math.atan2(ty - by, tx - bx); nx, ny = -math.sin(a) * w, math.cos(a) * w
    cv.poly([(bx + nx, by + ny), (tx, ty), (bx - nx, by - ny)], c0, c1, ang=math.degrees(a), line=line, lw=1.8, shade=0.2, hl=0.25)

# ---------------------------------------------------------------- COLOSSO DE CRISTAL
def colosso(kind):
    cv = Cv(BWW, BHH); cv.oy = 44; cx = 180; st = kind == 'stun'; te = kind == 'tele'; drop = 54 if st else 0
    core = '#ffe36b' if st else ('#ff3d4d' if te else '#5ff0ff'); eye = '#ff3030' if te else ('#6a6a88' if st else '#9ffcff')
    V0, V1, V2 = '#8f7cff', '#4b36d6', '#1c1470'
    cv.glow(cx, BGG - 6, 130, '#6a4cff', 0.18)
    # pernas
    for sx in (-1, 1):
        if st: pts = [(cx + sx * 24, BGG - 70), (cx + sx * 74, BGG - 64), (cx + sx * 84, BGG - 8), (cx + sx * 16, BGG - 8)]
        else: pts = [(cx + sx * 14, BGG - 150), (cx + sx * 66, BGG - 150), (cx + sx * 74, BGG - 18), (cx + sx * 8, BGG - 18)]
        cv.poly(pts, V1, V2, ang=80, line=INK, lw=2.4, shade=0.24, hl=0.2)
        cv.poly([pts[0], ((pts[0][0] + pts[1][0]) / 2, pts[0][1] + 22), pts[3]], V0, V1)           # faceta de luz
        if not st: spike(cv, cx + sx * 66, BGG - 116, cx + sx * 96, BGG - 128, 9, '#9af6ff', '#2a62c8')   # espinho no joelho
        cv.poly([(cx + sx * 4, BGG - 20), (cx + sx * 84, BGG - 20), (cx + sx * 94, BGG - 2), (cx + sx * 0, BGG - 2)], V0, V2, line=INK, lw=2.2, shade=0.2)
    ty = 150 + drop
    cv.poly([(cx - 62, ty + 92), (cx + 62, ty + 92), (cx + 54, ty + 128), (cx - 54, ty + 128)], V2, '#0c0848', line=INK, lw=2.2)   # quadril
    # braços
    def arm(sx, mode):
        sh = (cx + sx * 88, ty + 20)
        if mode == 'up': el = (cx + sx * 116, ty - 32); hd = (cx + sx * 54, ty - 100)
        elif mode == 'kneel': el = (cx + sx * 112, ty + 70); hd = (cx + sx * 100, ty + 128)
        else: el = (cx + sx * 118, ty + 56); hd = (cx + sx * 108, ty + 126)
        chain(cv, [sh, el], 30, 26, V0, V2); chain(cv, [el, hd], 28, 22, V1, V2)
        cv.poly([(el[0] - 22, el[1] - 10), (el[0] + 22, el[1] - 10), (el[0] + 16, el[1] + 20), (el[0] - 16, el[1] + 20)], '#a89cff', V1, line=INK, lw=2.0, shade=0.22, hl=0.3)   # cotovelo facetado
        cv.poly(smooth([(hd[0] - 28, hd[1] - 8), (hd[0] + 28, hd[1] - 8), (hd[0] + 34, hd[1] + 24), (hd[0], hd[1] + 36), (hd[0] - 34, hd[1] + 24)], 3), V0, V2, line=INK, lw=2.2, shade=0.24, hl=0.3)
        for k in (-1, 0, 1): spike(cv, hd[0] + k * 17, hd[1] + 28, hd[0] + k * 22, hd[1] + 62, 8, '#bff8ff', '#2a8ae0')   # garras de cristal
    arm(-1, 'up' if te else ('kneel' if st else 'down'))
    # tronco (faces de cristal)
    top = ty - 54
    cv.poly([(cx - 96, ty - 6), (cx - 60, top), (cx + 60, top), (cx + 96, ty - 6), (cx + 64, ty + 96), (cx - 64, ty + 96)], V1, V2, ang=70, line=INK, lw=2.6, shade=0.26, hl=0.2)
    cv.poly([(cx - 96, ty - 6), (cx - 60, top), (cx, top + 6), (cx - 10, ty + 40)], '#b8a8ff', V0)
    cv.poly([(cx, top + 6), (cx + 60, top), (cx + 96, ty - 6), (cx + 12, ty + 40)], V0, V1)
    cv.poly([(cx - 96, ty - 6), (cx - 10, ty + 40), (cx - 64, ty + 96)], V1, V2); cv.poly([(cx + 12, ty + 40), (cx + 96, ty - 6), (cx + 64, ty + 96)], V2, '#0c0848')
    cv.glow(cx, ty + 38, 96, core, 0.5)
    for pts in ([(cx, ty + 38), (cx - 44, ty + 8), (cx - 76, ty + 20)], [(cx, ty + 38), (cx + 38, ty + 70), (cx + 60, ty + 60)], [(cx, ty + 38), (cx - 30, ty + 76), (cx - 52, ty + 88)]): crack(cv, pts, core, 2.2)
    cv.poly([(cx, ty + 8), (cx + 24, ty + 24), (cx + 24, ty + 54), (cx, ty + 70), (cx - 24, ty + 54), (cx - 24, ty + 24)], '#ffffff' if st else '#e8ffff', core, line=INK, lw=2.4)
    cv.poly([(cx, ty + 16), (cx + 12, ty + 28), (cx, ty + 42), (cx - 12, ty + 28)], '#ffffff', '#ffffff')
    # ombreiras: cachos de espinhos
    for sx in (-1, 1):
        for (dx, dy, tx2, ty2, w) in [(70, -8, 130, -78, 14), (88, 6, 150, -34, 12), (50, -22, 84, -92, 11), (96, 22, 150, 20, 10)]:
            spike(cv, cx + sx * dx, ty + dy, cx + sx * tx2, ty + ty2, w, '#c8f8ff' if dx % 2 else '#ffb8f4', '#2a62c8' if dx % 2 else '#8a2aa8')
    # cabeça: elmo angular com chifres e viseira
    hy = ty - 92
    cv.poly([(cx - 40, hy + 34), (cx - 46, hy - 6), (cx - 22, hy - 34), (cx + 22, hy - 34), (cx + 46, hy - 6), (cx + 40, hy + 34), (cx + 20, hy + 50), (cx - 20, hy + 50)], V0, V2, ang=70, line=INK, lw=2.6, shade=0.26, hl=0.3)
    for sx in (-1, 1): spike(cv, cx + sx * 30, hy - 24, cx + sx * 66, hy - 82, 12, '#c8f8ff', '#2a62c8'); spike(cv, cx + sx * 40, hy - 6, cx + sx * 82, hy - 30, 8, '#ffb8f4', '#8a2aa8')
    cv.poly([(cx - 34, hy + 4), (cx + 34, hy + 4), (cx + 28, hy + 20), (cx - 28, hy + 20)], '#0a0620', '#12082e', line=INK, lw=1.6)
    cv.glow(cx, hy + 12, 44, eye, 0.9 if not st else 0.15); cv.poly([(cx - 28, hy + 8), (cx + 28, hy + 8), (cx + 22, hy + 16), (cx - 22, hy + 16)], '#ffffff', eye)
    cv.poly([(cx - 20, hy + 30), (cx + 20, hy + 30), (cx + 14, hy + 46), (cx - 14, hy + 46)], '#0a0620', '#12082e')
    for k in range(-2, 3): cv.poly([(cx + k * 7 - 3, hy + 30), (cx + k * 7 + 3, hy + 30), (cx + k * 7, hy + 38)], '#e8f0ff', '#ffffff')
    arm(1, 'up' if te else ('kneel' if st else 'down'))
    return cv.finish()

# ---------------------------------------------------------------- TITÃ DE OSSOS
def tita(kind):
    cv = Cv(BWW, BHH); cv.oy = 44; cx = 180; st = kind == 'stun'; te = kind == 'tele'; drop = 58 if st else 0
    bone, bone2, bone3 = '#f6edd6', '#bdae88', '#7a6a4c'; core = '#ffe36b' if st else ('#ff4a2a' if te else '#ff8a2e')
    cv.glow(cx, BGG - 6, 120, '#a02a1a', 0.16)
    # manto rasgado atrás
    ty = 150 + drop
    cv.poly(smooth([(cx - 70, ty - 30), (cx - 120, ty + 80), (cx - 104, ty + 150), (cx - 70, ty + 124), (cx - 40, ty + 160), (cx, ty + 130), (cx + 44, ty + 160), (cx + 74, ty + 124), (cx + 110, ty + 150), (cx + 124, ty + 80), (cx + 70, ty - 30)], 3), '#7a1a3a', '#2a0818', ang=80, line=INK, lw=2.4, shade=0.2)
    # pernas (colunas de osso com joelheiras e garras)
    for sx in (-1, 1):
        if st: chain(cv, [(cx + sx * 26, BGG - 90), (cx + sx * 72, BGG - 70), (cx + sx * 50, BGG - 14)], 24, 17, bone, bone2)
        else:
            chain(cv, [(cx + sx * 26, BGG - 168), (cx + sx * 32, BGG - 92), (cx + sx * 30, BGG - 20)], 25, 17, bone, bone2)
            cv.ell(cx + sx * 32, BGG - 92, 19, 17, bone, bone2, line=INK, lw=2.2, shade=0.22, hl=0.28); spike(cv, cx + sx * 40, BGG - 96, cx + sx * 66, BGG - 108, 7, bone, bone3)
        cv.poly([(cx + sx * 8, BGG - 22), (cx + sx * 80, BGG - 22), (cx + sx * 92, BGG - 2), (cx + sx * 0, BGG - 2)], bone, bone3, line=INK, lw=2.2, shade=0.2)
        for k in range(3): spike(cv, cx + sx * (60 + k * 10), BGG - 4, cx + sx * (70 + k * 11), BGG + 8, 4, bone, bone3)
    # pélvis e coluna
    cv.poly(smooth([(cx - 54, ty + 134), (cx - 36, ty + 100), (cx + 36, ty + 100), (cx + 54, ty + 134), (cx + 30, ty + 150), (cx - 30, ty + 150)], 4), bone, bone2, ang=80, line=INK, lw=2.3, shade=0.22)
    for k in range(5): cv.ell(cx, ty + 4 + k * 22, 11 - abs(k - 2) * 0.6, 10, bone, bone2, line=INK, lw=1.6, shade=0.2)
    # caixa torácica
    cv.poly(smooth([(cx - 86, ty + 6), (cx - 58, ty - 32), (cx + 58, ty - 32), (cx + 86, ty + 6), (cx + 64, ty + 92), (cx - 64, ty + 92)], 5), '#1a0a14', '#0c0408', line=INK, lw=2.4)
    cv.glow(cx, ty + 40, 80, core, 0.55)
    for k in range(5):
        y = ty - 10 + k * 20; w = 78 - abs(k - 1) * 10 - k * 3
        for sx in (-1, 1):
            pts = bez((cx, y), (cx + sx * w * 0.5, y - 16), (cx + sx * w, y - 2), (cx + sx * (w - 8), y + 22), 16)
            cv.stroke(pts, INK, 12.0); cv.stroke(pts, bone, 8.5); cv.stroke([(p[0], p[1] - 1.5) for p in pts], '#ffffff', 2.0)
    cv.stroke([(cx, ty - 28), (cx, ty + 96)], INK, 15); cv.stroke([(cx, ty - 28), (cx, ty + 96)], bone2, 10)
    cv.ell(cx, ty + 42, 16, 16, '#ffffff' if st else '#ffd070', core, line=INK, lw=2.0)
    # ombreiras de espinhos
    for sx in (-1, 1):
        cv.poly(smooth([(cx + sx * 56, ty - 30), (cx + sx * 110, ty - 22), (cx + sx * 114, ty + 10), (cx + sx * 70, ty + 4)], 4), bone, bone2, ang=70, line=INK, lw=2.2, shade=0.22, hl=0.3)
        for k in range(3): spike(cv, cx + sx * (74 + k * 14), ty - 26 + k * 4, cx + sx * (88 + k * 18), ty - 74 + k * 10, 9, bone, bone3)
    # braços: esquerdo em garra, direito com cutelo de osso
    def arm(sx, club):
        sh = (cx + sx * 96, ty - 6)
        if te and club: el = (cx + sx * 124, ty - 56); hd = (cx + sx * 80, ty - 126)
        elif st: el = (cx + sx * 124, ty + 58); hd = (cx + sx * 112, ty + 116)
        else: el = (cx + sx * 124, ty + 48); hd = (cx + sx * 116, ty + 112)
        chain(cv, [sh, el, hd], 19, 15, bone, bone2)
        cv.ell(el[0], el[1], 14, 13, bone, bone2, line=INK, lw=1.8, shade=0.2)
        cv.ell(hd[0], hd[1], 19, 17, bone, bone2, line=INK, lw=2.0, shade=0.22, hl=0.25)
        if club:
            if te: tip = (hd[0] + sx * 6, hd[1] - 104)
            else: tip = (hd[0] + sx * 6, hd[1] + 104)
            cv.limb(hd, tip, 10, 22, bone, bone2, line=INK, lw=2.2, shade=0.22)
            sgn = -1 if te else 1
            cv.poly([(tip[0] - 20, tip[1] - sgn * 6), (tip[0] + 20, tip[1] - sgn * 6), (tip[0] + 30, tip[1] + sgn * 36), (tip[0], tip[1] + sgn * 56), (tip[0] - 30, tip[1] + sgn * 36)], '#e8e0d0', '#8a8a9a', ang=90, line=INK, lw=2.4, shade=0.25, hl=0.35)   # lâmina
            crack(cv, [(tip[0], tip[1] - sgn * 2), (tip[0] + 4, tip[1] + sgn * 40)], core, 1.8)
        else:
            for k in (-1, 0, 1): spike(cv, hd[0] + k * 9, hd[1] + 12, hd[0] + k * 14, hd[1] + 40, 5, bone, bone3)
    arm(-1, False)
    # crânio com chifres, coroa e olhos em chamas
    hy = ty - 74
    cv.stroke([(cx, ty - 30), (cx, hy + 30)], INK, 16); cv.stroke([(cx, ty - 30), (cx, hy + 30)], bone2, 11)
    for sx in (-1, 1): cv.poly(smooth([(cx + sx * 38, hy - 6), (cx + sx * 66, hy - 26), (cx + sx * 92, hy - 82), (cx + sx * 84, hy - 28), (cx + sx * 58, hy + 6)], 4), '#fff6dc', '#b89a58', line=INK, lw=2.2, shade=0.24, hl=0.3)
    cv.poly(smooth([(cx - 50, hy + 28), (cx - 56, hy - 10), (cx - 30, hy - 42), (cx + 30, hy - 42), (cx + 56, hy - 10), (cx + 50, hy + 28), (cx + 30, hy + 48), (cx - 30, hy + 48)], 5), '#fbf4e0', bone2, ang=70, line=INK, lw=2.5, shade=0.22, hl=0.3)
    for k in range(-2, 3): spike(cv, cx + k * 14, hy - 38, cx + k * 16, hy - 62 - (2 - abs(k)) * 6, 7, '#ffd23f', '#a8780c')     # coroa de espinhos
    ec = '#ff3a2a' if te else ('#6a5a4a' if st else '#ff9a2e')
    for sx in (-1, 1):
        cv.poly(smooth([(cx + sx * 8, hy + 6), (cx + sx * 40, hy - 6), (cx + sx * 40, hy + 22), (cx + sx * 10, hy + 26)], 4), '#120808', '#060202', line=INK, lw=1.6)
        cv.glow(cx + sx * 24, hy + 10, 30, ec, 0.9 if not st else 0.15)
        cv.poly([(cx + sx * 14, hy + 18), (cx + sx * 24, hy - 4 - (4 if not st else 0)), (cx + sx * 34, hy + 18)], '#ffe8a0' if not st else '#7a6a5a', ec)    # chama
    cv.poly([(cx - 9, hy + 26), (cx + 9, hy + 26), (cx, hy + 12)], '#120808', '#060202')
    cv.poly([(cx - 34, hy + 36), (cx + 34, hy + 36), (cx + 28, hy + 58 + (8 if te else 0)), (cx - 28, hy + 58 + (8 if te else 0))], '#1a0a0a', '#0a0404', line=INK, lw=1.8)
    for k in range(-3, 4): cv.poly([(cx + k * 9 - 4, hy + 36), (cx + k * 9 + 4, hy + 36), (cx + k * 9, hy + 48 + (8 if te else 0))], '#ffffff', '#e0d6bc', line=INK, lw=1.0)
    arm(1, True)
    return cv.finish()

# ---------------------------------------------------------------- HIDRA SINÁPTICA
def hidra(kind):
    cv = Cv(BWW, BHH); cv.oy = 44; cx = 180; st = kind == 'stun'; te = kind == 'tele'
    core = '#ffe36b' if st else ('#ff3d4d' if te else '#ff5ae8'); gl = '#3dff9a'; S0, S1, S2 = '#3fb89c', '#157a68', '#06342e'
    cv.glow(cx, BGG - 10, 150, '#1a9a6a', 0.2)
    by = 288
    # corpo escamoso
    cv.poly(smooth([(cx - 134, by + 80), (cx - 120, by + 4), (cx - 70, by - 52), (cx, by - 64), (cx + 70, by - 52), (cx + 120, by + 4), (cx + 134, by + 80), (cx + 80, BGG - 4), (cx - 80, BGG - 4)], 7), S1, S2, ang=70, line=INK, lw=2.6, shade=0.26, hl=0.2, rim='#9affd8')
    for r in range(5):
        for k in range(-5, 6):
            if abs(k) * 22 + r * 6 > 120: continue
            sx0 = cx + k * 22 + (11 if r % 2 else 0); sy0 = by - 30 + r * 20
            cv.poly(smooth([(sx0 - 10, sy0), (sx0, sy0 + 12), (sx0 + 10, sy0), (sx0, sy0 - 6)], 3), S0, S1, line=None)
            cv.stroke([(sx0 - 10, sy0), (sx0, sy0 + 12), (sx0 + 10, sy0)], 'rgba(0,30,25,160)' if False else (4, 30, 26, 170), 1.2)
    cv.glow(cx, by + 14, 100, core, 0.4 if not st else 0.75)
    for (ax, ay) in [(-84, 18), (-48, -22), (48, -22), (84, 18), (-26, 54), (26, 54)]: crack(cv, [(cx, by + 14), (cx + ax * 0.5, by + 14 + (ay - 14) * 0.5 + 6), (cx + ax, by + ay)], gl, 2.0); cv.dot(cx + ax, by + ay, 5.5, gl); cv.dot(cx + ax, by + ay, 2.4, '#ffffff')
    cv.ell(cx, by + 14, 22, 22, '#ffffff' if st else '#ffd0f6', core, line=INK, lw=2.2)
    for k in range(7):   # espinhos dorsais luminosos
        tx = cx - 100 + k * 33; spike(cv, tx, by - 50 + abs(k - 3) * 9, tx + (k - 3) * 4, by - 92 + abs(k - 3) * 12, 10, '#9affd8', '#157a68')
    def head(p, mode, sc=1.0):
        x, y = p; cv.glow(x + 20 * sc, y, 54 * sc, core, 0.5 if te else 0.2)
        pts = [(x - 36 * sc, y + 4 * sc), (x - 24 * sc, y - 30 * sc), (x + 18 * sc, y - 34 * sc), (x + 64 * sc, y - 6 * sc), (x + 70 * sc, y + 10 * sc), (x + 20 * sc, y + 26 * sc), (x - 26 * sc, y + 22 * sc)]
        cv.poly(smooth(pts, 4), S0, S2, ang=70, line=INK, lw=2.5, shade=0.26, hl=0.3)
        for k in range(3): spike(cv, x - 20 * sc + k * 14 * sc, y - 26 * sc, x - 32 * sc + k * 14 * sc, y - 56 * sc - k * 4 * sc, 7 * sc, '#bffff0', '#157a68')   # crista
        jaw = 20 if te else (3 if not st else 0)
        cv.poly([(x + 6 * sc, y + 16 * sc), (x + 68 * sc, y + 10 * sc + jaw), (x + 56 * sc, y + 28 * sc + jaw), (x + 4 * sc, y + 32 * sc + jaw * 0.6)], S1, S2, line=INK, lw=2.0, shade=0.24)
        if te: cv.glow(x + 40 * sc, y + 20 * sc + jaw * .5, 22, '#ff3b4a', 1.0); cv.poly([(x + 16 * sc, y + 18 * sc), (x + 62 * sc, y + 14 * sc), (x + 52 * sc, y + 26 * sc + jaw), (x + 14 * sc, y + 30 * sc + jaw)], '#3a0810', '#7a1020')
        for tx in range(0, 48, 9): cv.poly([(x + (8 + tx) * sc, y + 15 * sc), (x + (15 + tx) * sc, y + 15 * sc), (x + (11 + tx) * sc, y + 28 * sc)], '#ffffff', '#e0f0e8', line=INK, lw=1.0)
        ec = '#ff3b3b' if te else ('#7a8a9a' if st else '#ff5ae8')
        cv.glow(x + 12 * sc, y - 10 * sc, 20 * sc, ec, 0.9 if not st else 0.1); cv.poly([(x - 2 * sc, y - 6 * sc), (x + 26 * sc, y - 16 * sc), (x + 28 * sc, y - 2 * sc), (x + 2 * sc, y + 2 * sc)], '#0a0a1e', '#0a0a1e', line=INK, lw=1.4); cv.poly([(x + 6 * sc, y - 6 * sc), (x + 24 * sc, y - 13 * sc), (x + 25 * sc, y - 5 * sc), (x + 8 * sc, y - 1 * sc)], '#ffffff', ec)
    L = {'idle': [((cx - 108, 150), [(cx - 74, by - 24), (cx - 124, 236), (cx - 114, 176)]), ((cx, 84), [(cx, by - 46), (cx - 8, 196), (cx, 112)]), ((cx + 100, 150), [(cx + 74, by - 24), (cx + 124, 236), (cx + 114, 176)])],
         'tele': [((cx - 116, 70), [(cx - 74, by - 24), (cx - 134, 220), (cx - 120, 108)]), ((cx, 34), [(cx, by - 46), (cx - 8, 176), (cx, 66)]), ((cx + 116, 70), [(cx + 74, by - 24), (cx + 134, 220), (cx + 120, 108)])],
         'stun': [((cx - 108, 262), [(cx - 74, by - 8), (cx - 140, 320), (cx - 112, 280)]), ((cx - 8, 232), [(cx, by - 34), (cx - 10, 300), (cx - 8, 250)]), ((cx + 108, 262), [(cx + 74, by - 8), (cx + 140, 320), (cx + 112, 280)])]}[kind]
    for (hp, ctrl) in L:
        pts = bez(ctrl[0], ctrl[1], ctrl[2], hp, 14); chain(cv, pts, 28, 17, S0, S2, lw=2.4)
        for q in range(1, 13, 2): cv.dot(pts[q][0] - 2, pts[q][1] - 3, 3.2, gl); cv.dot(pts[q][0] - 2, pts[q][1] - 3, 1.3, '#ffffff')
        for q in range(2, 12, 3): spike(cv, pts[q][0] - 8, pts[q][1] - 6, pts[q][0] - 20, pts[q][1] - 22, 5, '#bffff0', '#157a68')
        head(hp, kind, 1.0)
    return cv.finish()

BOSS = {'boss_colossus': colosso, 'boss_titan': tita, 'boss_hydra': hidra}
if __name__ == '__main__':
    import sys
    from PIL import Image
    fr = []
    for n in (sys.argv[1:] or list(BOSS)):
        for k in ('idle', 'tele', 'stun'): fr.append(BOSS[n](k))
    sheet = Image.new('RGBA', (BWW * 3, BHH * (len(fr) // 3)), (60, 80, 130, 255))
    for i, f in enumerate(fr): sheet.alpha_composite(f, ((i % 3) * BWW, (i // 3) * BHH))
    sheet.save('_boss_test.png'); print('ok')
