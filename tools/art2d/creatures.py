# Byte, monstros, AURA: ilustração 2D lúdica (contorno colorido, gradiente, luz de borda).  © Thiago Silva.
import math
from kit import *
INK = '#2a2440'

# ---------------- BYTE (robô amarelo) ----------------
BW_, BH_, BG, BCX = 240, 270, 246, 112
def byte(kind, ph=0.0):
    cv = Cv(BW_, BH_); s = 2 * math.pi * ph
    bob = 0; tilt = 0; lf = [0, 0]; arms = [(18, 24), (-16, 22)]; eyes = 'open'; flame = 0
    if kind == 'idle': bob = 2.2 * math.sin(s); flame = 0.5
    elif kind == 'run': bob = 3 * math.cos(2 * s); tilt = 0.14; lf = [max(0, math.sin(s)) * 9, max(0, -math.sin(s)) * 9]; arms = [(26 + 10 * math.cos(s), 14), (-22 - 10 * math.cos(s), 16)]; flame = 0.8
    elif kind == 'jump': bob = -14; tilt = 0.1; arms = [(30, -10), (-26, -6)]; flame = 1.0; lf = [6, 4]
    elif kind == 'fall': bob = -10; tilt = -0.04; arms = [(30, -16), (-28, -14)]; flame = 0.7; eyes = 'wide'; lf = [8, 8]
    elif kind == 'hurt': bob = -4; tilt = -0.2; eyes = 'hurt'; arms = [(-26, -12), (30, 4)]
    cx, cy = BCX + tilt * 20, BG - 104 + bob
    cv.ell(BCX + 2, BG + 3, 40, 6, (20, 10, 40, 0), (20, 10, 40, 0))
    if flame:
        cv.glow(cx - 4, BG - 28 + bob * 0.4, 34, '#58e8ff', 0.5 * flame)
        cv.poly([(cx - 14, BG - 36 + bob * .4), (cx + 6, BG - 36 + bob * .4), (cx - 4, BG - 6 - 12 * flame + bob * .4)], '#c9fbff', '#38d6ff')
    for i, (fx, lift) in enumerate([(-18, lf[1]), (20, lf[0])]):
        cv.poly(smooth([(cx + fx - 13, BG - 24 - lift), (cx + fx + 13, BG - 24 - lift), (cx + fx + 15, BG - 6 - lift), (cx + fx - 15, BG - 6 - lift)], 5), '#d9a010', '#8a5a08', line=INK, lw=1.7, shade=0.2, hl=0.2)
    # braço de trás
    cv.limb((cx - 36, cy + 8), (cx - 36 + arms[1][0] * 0.5, cy + 8 + arms[1][1]), 8, 7, '#c8920c', '#8a5a08', line=INK, lw=1.6)
    # corpo (ovo)
    cv.ell(cx, cy, 55, 62, '#ffe978', '#d99a10', ang=60, rot=tilt, line=INK, lw=2.0, shade=0.2, hl=0.32)
    cv.poly(smooth([(cx - 50, cy + 14), (cx + 50, cy + 14), (cx + 47, cy + 30), (cx - 47, cy + 30)], 6), '#3a3a52', '#1c1c2e', line=INK, lw=1.5)  # faixa
    cv.stroke([(cx - 40, cy + 18), (cx + 40, cy + 18)], (255, 255, 255, 70), 2)
    cv.ell(cx - 38, cy + 4, 9, 9, '#c9c9d6', '#7a7a8a', line=INK, lw=1.4); cv.stroke([(cx - 42, cy + 4), (cx - 34, cy + 4)], '#3a3a4a', 2)  # parafuso lateral
    # visor
    cv.ell(cx + 14, cy - 16, 43, 32, '#0c1426', '#243a5c', ang=70, rot=tilt, line='#2a3a5a', lw=2.4, hl=0.1)
    cv.stroke([(cx - 12, cy - 38), (cx + 20, cy - 44), (cx + 46, cy - 34)], (130, 200, 255, 150), 2.4)
    for ex in (cx + 4, cx + 30):
        if eyes == 'hurt':
            cv.stroke([(ex - 8, cy - 28), (ex + 6, cy - 18), (ex - 8, cy - 8)], '#58f0ff', 4.0)
        elif eyes == 'wide':
            cv.glow(ex, cy - 18, 20, '#58f0ff', 0.6); cv.ell(ex, cy - 18, 8, 15, '#d8ffff', '#58f0ff', line=None)
        else:
            cv.glow(ex, cy - 18, 20, '#58f0ff', 0.55); cv.poly(smooth(ell_pts(ex, cy - 18, 6.5, 14), 3), '#e4ffff', '#46e0ff', line=None)
    # antena
    cv.stroke([(cx + 6, cy - 58), (cx + 8 + tilt * 40, cy - 86)], '#2a2a3c', 4.0)
    cv.glow(cx + 9 + tilt * 40, cy - 90, 20, '#ff3b4a', 0.7); cv.ell(cx + 9 + tilt * 40, cy - 90, 7, 7, '#ff8a92', '#e0102a', line=INK, lw=1.4); cv.dot(cx + 7 + tilt * 40, cy - 92, 2.0, '#ffffff')
    # braço da frente
    cv.limb((cx + 40, cy + 6), (cx + 40 + arms[0][0] * 0.5, cy + 6 + arms[0][1]), 8.5, 7.5, '#ffe060', '#d99a10', line=INK, lw=1.6, shade=0.16)
    return cv.finish()

# ---------------- MONSTROS (2 quadros; viram para a direita) ----------------
MW, MH, MG = 220, 190, 174
def base(): return Cv(MW, MH)
def shadow(cv, cx=110, r=44): cv.ell(cx, MG + 3, r, 6, (20, 10, 40, 0), (20, 10, 40, 0))

def sentinela(f):
    cv = base(); shadow(cv); up = f % 2
    for i, (lx, lf) in enumerate([(-40, up), (-16, 1 - up), (22, up), (46, 1 - up)]):
        y = MG - 12 - lf * 8; cv.limb((110 + lx * .6, 120), (110 + lx, y), 7, 9, '#7a8cb4', '#3a4a70', line=INK, lw=1.6); cv.ell(110 + lx, y, 11, 10, '#a8bde8', '#4a5f98', line=INK, lw=1.8, hl=0.3)
    cv.poly(smooth([(54, 130), (62, 84), (84, 54), (110, 44), (136, 54), (158, 84), (166, 130), (150, 144), (70, 144)], 6), '#7ea4e0', '#34528e', ang=70, line=INK, lw=2.0, shade=0.2, hl=0.3, rim='#d8ebff')
    cv.poly([(56, 118), (164, 118), (166, 132), (54, 132)], '#3c4a70', '#1e2848', line=INK, lw=1.4)
    cv.poly(smooth([(78, 78), (150, 78), (160, 100), (150, 112), (80, 112), (70, 100)], 5), '#2a0f1a', '#40101c', line=INK, lw=2.0)
    cv.glow(120, 96, 36, '#ff3b4a', 0.55); cv.poly(smooth([(86, 86), (146, 86), (152, 100), (146, 106), (88, 106), (82, 100)], 4), '#ff8a92', '#ff2a48', line=None)
    cv.poly([(84, 76), (114, 88), (112, 93), (80, 83)], '#1a1020', '#1a1020'); cv.poly([(150, 76), (126, 88), (128, 93), (156, 83)], '#1a1020', '#1a1020')
    cv.stroke([(110, 46), (108, 22)], '#2a2a3c', 3.5); cv.glow(108, 18, 16, '#ff3b4a', .7); cv.ell(108, 18, 7, 7, '#ff8a92', '#e0102a', line=INK, lw=1.4)
    for rx in (70, 150): cv.dot(rx, 126, 2.4, '#c9d6f0')
    return cv.finish()

def aranha(f):
    cv = base(); shadow(cv, 110, 52); up = f % 2
    for side in (-1, 1):
        for k in range(4):
            bx = 110 + side * (14 + k * 7); ex = 110 + side * (46 + k * 14 + (6 if (k + up) % 2 else -2)); ey = MG - 4 - ((k + up) % 2) * 9
            kx = 110 + side * (36 + k * 10); ky = 78 + k * 4 - 14
            cv.limb((bx, 108), (kx, ky), 4.5, 3.5, '#5fe8ff', '#2a62c8', line=INK, lw=1.4)
            cv.limb((kx, ky), (ex, ey), 3.5, 2.2, '#9af6ff', '#2a62c8', line=INK, lw=1.4)
    cv.poly([(70, 112), (84, 74), (110, 62), (136, 74), (150, 112), (130, 134), (90, 134)], '#8ff5ff', '#2a62c8', ang=60, line=INK, lw=2.0, shade=0.22, hl=0.3)
    cv.poly([(84, 74), (110, 62), (110, 100)], '#c9fbff', '#5fe8ff'); cv.poly([(110, 62), (136, 74), (110, 100)], '#46c8f0', '#1a7ad0'); cv.poly([(84, 74), (110, 100), (70, 112)], '#46c8f0', '#2a62c8'); cv.poly([(136, 74), (150, 112), (110, 100)], '#2a8ae0', '#1a4aa8')
    for i, sx in enumerate((92, 110, 128)): cv.poly([(sx - 6, 64 + abs(i - 1) * 4), (sx, 44 + abs(i - 1) * 8), (sx + 6, 64 + abs(i - 1) * 4)], '#ff9aee', '#b83ad0', line=INK, lw=1.4)
    for ex in (122, 136, 148): cv.glow(ex - 6, 108 + (ex - 122) * 0.2, 12, '#ff4fd8', .7); cv.dot(ex - 6, 108 + (ex - 122) * .2, 4, '#ff9aee'); cv.dot(ex - 7, 106.5 + (ex - 122) * .2, 1.4, '#ffffff')
    return cv.finish()

def cranio(f):
    cv = base(); shadow(cv, 110, 50); op = f % 2
    for i in range(5): cv.ell(50 - i * 12, MG - 10 - i * 2, 8 - i, 8 - i, '#e8dcc0', '#a89a7a', line=INK, lw=1.4)
    for dx in (0, 1):
        hx = 128 + dx * 26 + (6 if (op + dx) % 2 else 0)
        for k in range(4): cv.limb((hx, MG - 10), (hx + 6 + k * 4 - 6, MG - 4 - (k % 2) * 3), 3, 2.4, '#efe6cf', '#a89a7a', line=INK, lw=1.2)
        cv.ell(hx - 2, MG - 12, 9, 7, '#efe6cf', '#a89a7a', line=INK, lw=1.4)
    cv.poly(smooth([(56, 110), (60, 74), (84, 50), (116, 46), (144, 58), (156, 86), (152, 112), (140, 124), (70, 126)], 6), '#fbf4e0', '#c9bb98', ang=70, line=INK, lw=2.0, shade=0.2, hl=0.3)
    for ex in (92, 128):
        cv.ell(ex, 90, 15, 17, '#2a1410', '#120808', line=INK, lw=1.4); cv.glow(ex, 92, 20, '#ff8a2e', .6); cv.ell(ex + 1, 93, 6, 7, '#ffd070', '#ff6a1e', line=None); cv.dot(ex - 1, 90, 2, '#ffffff')
    cv.poly([(108, 108), (114, 100), (120, 108), (116, 112)], '#2a1410', '#120808')
    cv.stroke([(100, 66), (108, 76), (104, 84)], '#8a7a5a', 2.0); cv.stroke([(138, 64), (132, 76)], '#8a7a5a', 2.0)
    jy = 124 + op * 12
    cv.poly(smooth([(76, jy - 4), (146, jy - 4), (140, jy + 14), (108, jy + 20), (82, jy + 14)], 5), '#f2e8cc', '#b8aa88', line=INK, lw=1.8, shade=0.2)
    for tx in range(88, 138, 10): cv.poly([(tx, jy - 3), (tx + 8, jy - 3), (tx + 4, jy + 7)], '#ffffff', '#e0d6bc', line=INK, lw=1.0)
    return cv.finish()

def esporo(f):
    cv = base(); shadow(cv, 110, 46); sq = f % 2
    for i in range(7):
        a = i * 0.9 + f * 0.7; cv.glow(110 + math.cos(a) * 56, 96 + math.sin(a * 1.3) * 34, 9, '#ff7ae8', .7); cv.dot(110 + math.cos(a) * 56, 96 + math.sin(a * 1.3) * 34, 2.2, '#ffd0f6')
    for lx in (-18, 18): cv.ell(110 + lx, MG - 6, 13, 9, '#e8d6ff', '#8a6ac0', line=INK, lw=1.6)
    cv.poly(smooth([(80, 140), (84, 104), (136, 104), (142, 140), (126, 156), (96, 156)], 5), '#f0e0ff', '#a88ad8', ang=80, line=INK, lw=1.9, shade=0.18, hl=0.25)
    cap_h = 52 - sq * 6
    cv.poly(smooth([(44, 108), (52, 72), (78, 52 + sq * 4), (110, 108 - cap_h - 8), (142, 52 + sq * 4), (168, 72), (176, 108), (150, 118), (110, 112), (70, 118)], 7), '#ff7ae8', '#7a1a9a', ang=75, line=INK, lw=2.1, shade=0.22, hl=0.3, rim='#ffd0f6')
    for (sx, sy, sr) in [(76, 84, 9), (112, 70, 11), (146, 88, 8), (96, 98, 6), (130, 100, 6)]: cv.ell(sx, sy, sr, sr * 0.8, '#ffffff', '#ffd0f6', line=None)
    cv.glow(110, 100, 60, '#ff4fd8', .25)
    for ex in (98, 126):
        cv.ell(ex, 130, 8, 9, '#ffffff', '#e8e0ff', line=INK, lw=1.3); cv.ell(ex + 1.5, 131, 4, 5, '#2a0f3a', '#2a0f3a'); cv.dot(ex, 128, 1.5, '#ffffff')
    cv.stroke([(90, 120), (104, 125)], '#3a1a4a', 2.6); cv.stroke([(134, 120), (120, 125)], '#3a1a4a', 2.6); cv.stroke([(102, 144), (110, 148), (120, 144)], '#7a2a5a', 2.2)
    return cv.finish()

def drone(f):
    cv = base(); cv.glow(110, 110, 70, '#58e8ff', .12); pr = f % 2
    cv.limb((110, 70), (110, 46), 3, 3, '#6a7aa0', '#3a4468', line=INK, lw=1.3)
    for px in (66, 154):
        cv.ell(px, 62, 38 if pr else 30, 5, (200, 220, 255, 150), (200, 220, 255, 60), line=None); cv.limb((px, 80), (px, 62), 3, 3, '#6a7aa0', '#3a4468', line=INK, lw=1.3)
    cv.ell(110, 108, 62, 44, '#8a9acb', '#34406a', ang=70, line=INK, lw=2.1, shade=0.22, hl=0.3, rim='#d8e6ff')
    cv.poly([(60, 112), (160, 112), (156, 124), (64, 124)], '#2a3150', '#161a30', line=INK, lw=1.4)
    cv.ell(124, 100, 26, 24, '#12182c', '#243252', line='#58e8ff', lw=2.4); cv.glow(126, 102, 26, '#ff3b4a', .6); cv.ell(126, 102, 12, 12, '#ffd0d6', '#ff2a48', line=None); cv.ell(126, 102, 5, 5, '#2a0a10', '#2a0a10'); cv.dot(121, 96, 3, '#ffffff')
    for i, lx in enumerate((84, 98)): cv.ell(lx, 118, 5, 3, '#58e8ff' if (i + pr) % 2 else '#1a6a88', '#58e8ff', line=None)
    cv.limb((86, 148), (80, 164), 4, 3, '#5a6a90', '#2a3150', line=INK, lw=1.3); cv.limb((134, 148), (140, 164), 4, 3, '#5a6a90', '#2a3150', line=INK, lw=1.3)
    return cv.finish()

def espectro(f):
    cv = base(); sw = (f % 2) * 2 - 1; cv.glow(110, 100, 78, '#58e8ff', .22)
    tail = [(62, 126), (66, 96), (80, 70), (110, 58), (140, 70), (154, 96), (158, 126)]
    t2 = [(150 + sw * 4, 142), (136 - sw * 6, 156), (118 + sw * 6, 150), (100 - sw * 8, 164), (82 + sw * 6, 154), (68 - sw * 4, 164), (62, 140)]
    cv.poly(smooth(tail + t2, 7), (190, 245, 255, 235), (70, 170, 235, 230), ang=75, line=(30, 90, 170, 255), lw=2.0, shade=0.1, hl=0.35)
    cv.limb((70, 108), (44, 126 + sw * 5), 8, 4, (190, 245, 255, 230), (70, 170, 235, 200), line=(30, 90, 170, 255), lw=1.5)
    cv.limb((150, 108), (176, 120 - sw * 5), 8, 4, (190, 245, 255, 230), (70, 170, 235, 200), line=(30, 90, 170, 255), lw=1.5)
    for ex in (96, 126):
        cv.ell(ex, 92, 11, 15, '#0a1830', '#142a50', line=None); cv.glow(ex + 2, 94, 14, '#9ff5ff', .9); cv.ell(ex + 2, 94, 4, 6, '#e8ffff', '#9ff5ff', line=None)
    cv.poly(smooth([(100, 122), (112, 118), (124, 122), (112, 134)], 4), '#0a1830', '#142a50')
    return cv.finish()

def abutre(f):
    cv = Cv(300, MH); up = f % 2; cx = 150
    wy = -34 if up else 22
    for side, dark in ((-1, 0.2), (1, 0)):
        pts = [(cx + side * 8, 92), (cx + side * 54, 78 + wy * 0.4), (cx + side * 104, 60 + wy), (cx + side * 138, 78 + wy * 1.1), (cx + side * 112, 88 + wy * 0.7), (cx + side * 96, 100 + wy * 0.4), (cx + side * 66, 104), (cx + side * 34, 112)]
        cv.poly(smooth(pts, 6), darker('#8a2a3a', dark), darker('#3a0a1a', dark), ang=0 if side > 0 else 180, line=INK, lw=1.8, shade=0.15, hl=0.2)
        for k in range(5):
            fx = cx + side * (60 + k * 16); cv.stroke([(fx, 96 + wy * 0.3), (fx + side * 6, 100 + wy * 0.9 + k * 4)], '#f4ecd6', 3.2)
    cv.poly(smooth([(cx - 26, 106), (cx - 20, 80), (cx, 70), (cx + 22, 80), (cx + 26, 106), (cx + 8, 124), (cx - 12, 124)], 6), '#f0e4c8', '#a89a7a', ang=80, line=INK, lw=1.9, shade=0.2, hl=0.25)
    for k in range(4): cv.stroke([(cx - 16, 88 + k * 8), (cx, 92 + k * 8), (cx + 16, 88 + k * 8)], '#7a6a4a', 1.8)
    cv.limb((cx + 10, 82), (cx + 26, 60), 8, 7, '#efe4c8', '#a89a7a', line=INK, lw=1.6)
    cv.ell(cx + 30, 52, 17, 14, '#fbf4e0', '#c9bb98', line=INK, lw=1.9, shade=0.2, hl=0.25)
    cv.poly([(cx + 40, 50), (cx + 66, 58), (cx + 42, 64)], '#ffcf5a', '#c98a20', line=INK, lw=1.6)
    cv.ell(cx + 32, 50, 6, 6, '#2a1410', '#2a1410'); cv.glow(cx + 33, 50, 10, '#ff8a2e', .8); cv.dot(cx + 33, 50, 2.5, '#ffd070')
    cv.stroke([(cx + 24, 42), (cx + 38, 44)], '#3a2a1a', 2.6)
    for lx in (-6, 8): cv.limb((cx + lx, 122), (cx + lx + 2, 146), 3.5, 2.5, '#efe4c8', '#a89a7a', line=INK, lw=1.3); cv.poly([(cx + lx - 6, 150), (cx + lx + 8, 146), (cx + lx + 10, 152), (cx + lx - 4, 154)], '#e0d4b8', '#a89a7a', line=INK, lw=1.2)
    return cv.finish()

def fogo(f):
    cv = base(); sw = (f % 2) * 2 - 1; cv.glow(110, 112, 80, '#3dff9a', .3)
    for k, (dx, h) in enumerate([(-32, 52), (-12, 78), (12, 70), (34, 46)]):
        cv.poly(smooth([(110 + dx - 14, 130), (110 + dx - 10 + sw * 3, 130 - h * .6), (110 + dx + sw * 6, 130 - h), (110 + dx + 12 + sw * 3, 130 - h * .5), (110 + dx + 14, 130)], 5), '#9dffb8', '#1fbf6a', ang=80, line=None)
    cv.poly(smooth([(64, 122), (66, 96), (82, 76), (110, 70), (138, 78), (154, 98), (156, 124), (140, 144), (110, 152), (82, 144)], 7), '#d8ffe4', '#2fd382', ang=70, line=(20, 120, 70, 255), lw=2.0, hl=0.3)
    for ex in (94, 126):
        cv.ell(ex, 112, 9, 12, '#0a2a1a', '#0a2a1a', line=None); cv.dot(ex + 2, 109, 3, '#ffffff')
    cv.stroke([(92, 134), (110, 142), (128, 134)], '#0a2a1a', 3.0)
    for i in range(5): a = i * 1.3 + f; cv.dot(110 + math.cos(a) * 62, 100 + math.sin(a * 1.4) * 40, 2.2, '#eaffd0')
    return cv.finish()

def aura(f):
    cv = Cv(200, 210); cx, cy = 100, 100; pu = 1 + 0.05 * (f % 2)
    cv.glow(cx, cy, 90, '#7dfbff', .45)
    cv.poly(smooth(ell_pts(cx, cy + 36, 78 * pu, 17, -0.18), 5), (130, 240, 255, 0), (130, 240, 255, 0))
    def ring(back):
        pts = []; n = 60
        for i in range(n + 1):
            t = math.pi * i / n if back else math.pi + math.pi * i / n; pts.append((cx + math.cos(t) * 78 * pu, cy + 30 + math.sin(t) * 17))
        cv.stroke([(x, y) for x, y in pts], '#7dfbff', 6.0, cap=True)
        cv.stroke([(x, y - 1.5) for x, y in pts], '#e8ffff', 2.0, cap=True)
    ring(True)
    cv.ell(cx, cy, 56, 54, '#ffffff', '#b8e8ff', ang=70, line='#3aa0d8', lw=2.2, hl=0.0, shade=0.1)
    cv.ell(cx - 14, cy - 18, 20, 11, (255, 255, 255, 220), (255, 255, 255, 120), rot=-0.5, line=None)
    for ex in (cx - 16, cx + 18): cv.stroke([(ex - 8, cy - 2), (ex, cy - 9), (ex + 8, cy - 2)], '#1a4a78', 4.0)
    cv.stroke([(cx - 8, cy + 14), (cx, cy + 20), (cx + 8, cy + 14)], '#1a4a78', 3.4)
    cv.ell(cx - 30, cy + 10, 8, 5, '#ffb0c8', '#ffb0c8', line=None); cv.ell(cx + 32, cy + 10, 8, 5, '#ffb0c8', '#ffb0c8', line=None)
    ring(False)
    return cv.finish()

SMALL = {'en_sentinel': sentinela, 'en_spider': aranha, 'en_skull': cranio, 'en_spore': esporo, 'en_drone': drone, 'en_wraith': espectro, 'en_vulture': abutre, 'en_wisp': fogo}

if __name__ == '__main__':
    import sys
    from PIL import Image
    names = sys.argv[1:] or list(SMALL)
    fr = []
    for n in names:
        fn = SMALL[n]; fr += [fn(0), fn(1)]
    cols = 4; wmax = max(f.width for f in fr); hmax = max(f.height for f in fr)
    sheet = Image.new('RGBA', (wmax * cols, hmax * ((len(fr) + cols - 1) // cols)), (60, 80, 130, 255))
    for i, f in enumerate(fr): sheet.alpha_composite(f, ((i % cols) * wmax, (i // cols) * hmax))
    sheet.save('_mon_test.png'); b = [byte(k, p) for k, p in [('idle', 0), ('run', 0.25), ('jump', 0), ('hurt', 0)]] + [aura(0), aura(1)]
    sh2 = Image.new('RGBA', (240 * 3, 270 * 2), (60, 80, 130, 255))
    for i, f in enumerate(b): sh2.alpha_composite(f, ((i % 3) * 240, (i // 3) * 270))
    sh2.save('_byte_test.png'); print('ok')
