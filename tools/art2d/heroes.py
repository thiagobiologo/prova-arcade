# Heróis em ilustração 2D (Nina, Téo): rig com cinemática inversa → corrida/pulo/queda/dano fluidos.  © Thiago Silva.
import math
from kit import *

W, H, G, CX = 240, 270, 246, 112
INK = '#2a2440'

def pose(kind, ph):
    s = 2 * math.pi * ph
    P = dict(bob=0, lean=0, hx=CX, hip_y=G - 44, tilt=0, eyes='open', mouth='smile')
    if kind == 'idle':
        P['bob'] = 1.4 * math.sin(s); P['hip_y'] = G - 61 + P['bob'] * 0.5
        P['feet'] = [(CX + 12, G), (CX - 10, G)]; P['hands'] = None
    elif kind == 'run':
        P['bob'] = 3.4 * math.cos(2 * s); P['hip_y'] = G - 50 + P['bob']; P['lean'] = 7; P['tilt'] = 3
        f = lambda p: (CX - 4 - 17 * math.cos(p), G - 17 * max(0, math.sin(p)))
        P['feet'] = [f(s), f(s + math.pi)]; P['mouth'] = 'open'
    elif kind == 'jump':
        P['hip_y'] = G - 70; P['lean'] = 5; P['feet'] = [(CX + 22, G - 50), (CX - 16, G - 30)]; P['mouth'] = 'open'; P['tilt'] = 4
    elif kind == 'fall':
        P['hip_y'] = G - 78; P['lean'] = 0; P['feet'] = [(CX + 14, G - 38), (CX - 12, G - 44)]; P['mouth'] = 'o'; P['tilt'] = -2
    elif kind == 'hurt':
        P['hip_y'] = G - 46; P['lean'] = -8; P['feet'] = [(CX + 18, G - 4), (CX - 14, G - 18)]; P['eyes'] = 'hurt'; P['mouth'] = 'o'; P['tilt'] = -9
    hip = (CX + P['lean'] * 0.2, P['hip_y'] - 9); P['hip'] = hip
    P['sh'] = (hip[0] + P['lean'], hip[1] - 46)
    P['head'] = (P['sh'][0] + 6 + P['tilt'] * 0.4, P['sh'][1] - 52)
    sh = P['sh']
    if kind == 'idle': P['hands'] = [(sh[0] + 17, sh[1] + 44), (sh[0] - 17, sh[1] + 42)]
    elif kind == 'run': P['hands'] = [(sh[0] + 6 + 22 * math.cos(s), sh[1] + 36 - 8 * max(0, math.sin(s))), (sh[0] + 6 - 22 * math.cos(s), sh[1] + 36 - 8 * max(0, -math.sin(s)))]
    elif kind == 'jump': P['hands'] = [(sh[0] + 30, sh[1] - 26), (sh[0] - 22, sh[1] - 6)]
    elif kind == 'fall': P['hands'] = [(sh[0] + 28, sh[1] - 30), (sh[0] - 26, sh[1] - 26)]
    else: P['hands'] = [(sh[0] - 26, sh[1] - 8), (sh[0] + 30, sh[1] + 8)]
    return P

def legs(cv, P, pants, boots, sole, far_dark=0.0):
    out = []
    for i, (foot) in enumerate(P['feet']):
        hip = (P['hip'][0] + (6 if i == 0 else -6), P['hip'][1] + 2)
        knee, end = ik2(hip, (foot[0], foot[1] - 9), 30, 30, bend=-1)
        out.append((hip, knee, end, foot))
    return out

def draw_legs(cv, L, i, pants, pants2, boots, boots2, sole, dark=0.0):
    hip, knee, end, foot = L[i]
    c0 = darker(pants, dark) if dark else pants; c1 = darker(pants2, dark) if dark else pants2
    cv.limb(hip, knee, 10, 8.5, c0, c1, line=INK, lw=1.6, shade=0.18)
    cv.limb(knee, end, 8.5, 7.5, c0, c1, line=INK, lw=1.6, shade=0.18)
    bx, by = foot[0] + 4, foot[1]
    cv.poly([(bx - 14, by - 11), (bx + 6, by - 12), (bx + 17, by - 5), (bx + 18, by + 1), (bx - 14, by + 1)], boots, boots2, line=INK, lw=1.6, shade=0.22, hl=0.15)
    cv.poly([(bx - 14, by - 3), (bx + 18, by - 3), (bx + 18, by + 1.5), (bx - 14, by + 1.5)], sole, sole)

def arm(cv, P, i, sleeve, sleeve2, glove, dark=0.0):
    sh = P['sh']; shp = (sh[0] + (5 if i == 0 else -5), sh[1] + 5)
    elbow, hand = ik2(shp, P['hands'][i], 21, 21, bend=1)
    c0 = darker(sleeve, dark) if dark else sleeve; c1 = darker(sleeve2, dark) if dark else sleeve2
    cv.limb(shp, elbow, 9, 8, c0, c1, line=INK, lw=1.6, shade=0.16)
    cv.limb(elbow, hand, 8, 7, c0, c1, line=INK, lw=1.6, shade=0.16)
    cv.ell(hand[0], hand[1], 8.2, 7.6, glove, darker(glove, 0.18), line=INK, lw=1.6, hl=0.25)

def eyes(cv, hx, hy, P, iris='#7a4a28', lens=True):
    for k, (ex, er, ey) in enumerate([(hx - 5, 12.0, hy + 6), (hx + 29, 13.5, hy + 6)]):
        if P['eyes'] == 'hurt':
            cv.stroke([(ex - 8, ey - 6), (ex + 6, ey), (ex - 8, ey + 6)], INK, 3.0); continue
        cv.ell(ex, ey, er - 1, er + 1.5, '#ffffff', '#e6ecff', line=INK, lw=1.2)
        cv.ell(ex + 2.5, ey + 1, er * 0.62, er * 0.8, iris, darker(iris, 0.45), line=None)
        cv.ell(ex + 3, ey + 2, er * 0.34, er * 0.45, '#1a0f10', '#1a0f10')
        cv.dot(ex + 0.5, ey - 4, 3.2, '#ffffff'); cv.dot(ex + 7, ey + 5, 1.6, '#ffffff')
        cv.stroke([(ex - er + 1, ey - er + 2), (ex - 2, ey - er - 1.5), (ex + er - 2, ey - er + 1)], INK, 2.6)

def mouth(cv, hx, hy, P):
    mx, my = hx + 20, hy + 29
    if P['mouth'] == 'o': cv.ell(mx + 2, my + 1, 4.5, 5.5, '#7a1f2e', '#4a0f1a', line=INK, lw=1.2); return
    if P['mouth'] == 'open': cv.poly([(mx - 8, my - 2), (mx + 12, my - 1), (mx + 8, my + 8), (mx, my + 10), (mx - 6, my + 6)], '#8a2434', '#5a1020', line=INK, lw=1.3); cv.ell(mx + 2, my + 6.5, 5, 2.8, '#ff7a8c', '#ff7a8c'); return
    cv.stroke([(mx - 7, my - 1), (mx, my + 4), (mx + 9, my - 1)], '#7a2a30', 2.2)

def face_base(cv, hx, hy, skin, skin2):
    cv.ell(hx + 4, hy + 3, 44, 40, skin, skin2, ang=70, line=INK, lw=1.8, shade=0.14, hl=0.16)
    cv.ell(hx + 14, hy + 22, 9, 5, '#ff8aa0', '#ff8aa0')   # bochecha
    cv.stroke([(hx + 41, hy + 15), (hx + 45, hy + 20), (hx + 40, hy + 22)], '#c07a5a', 1.8)  # narizinho
    cv.im = cv.im  # noqa

def ponytail(cv, hx, hy, ph, col, col2, tie):
    sw = math.sin(2 * math.pi * ph) * 7
    base = (hx - 34, hy - 22); mid = (hx - 62 + sw * 0.5, hy - 8); tip = (hx - 78 + sw, hy + 24 + abs(sw) * 0.4)
    cv.limb(base, mid, 12, 14, col, col2, line=INK, lw=1.8, shade=0.2)
    cv.limb(mid, tip, 14, 6, col, col2, line=INK, lw=1.8, shade=0.2)
    cv.stroke([(base[0] - 4, base[1] + 2), (mid[0] - 2, mid[1] + 2), (tip[0] + 2, tip[1] - 4)], lighter(col, 0.35), 2.0)
    cv.ell(base[0] - 1, base[1] + 1, 6, 9, tie, darker(tie, 0.3), line=INK, lw=1.4, rot=0.6)

def nina(kind, ph=0.0):
    cv = Cv(W, H); P = pose(kind, ph); hx, hy = P['head']; hip = P['hip']; sh = P['sh']
    cv.ell(CX + 4, G + 3, 34, 6, (20, 10, 40, 0), (20, 10, 40, 0))  # sombra no chão
    L = legs(cv, P, None, None, None)
    draw_legs(cv, L, 1, '#434a78', '#262a4a', '#2a2a3c', '#14141f', '#e8ecff', dark=0.25)
    arm(cv, P, 1, '#cfd6ee', '#a9b3d6', '#e4e8f6', dark=0.12)
    # mochila com tubo luminoso (atrás do tronco)
    bx, by = sh[0] - 30, sh[1] - 2
    cv.glow(bx + 11, by + 22, 34, '#58e8ff', 0.35)
    cv.poly([(bx, by + 2), (bx + 22, by), (bx + 24, by + 38), (bx + 3, by + 42)], '#4a5078', '#2a2e4a', line=INK, lw=1.8, shade=0.2, hl=0.2)
    cv.poly([(bx + 6, by + 8), (bx + 17, by + 7), (bx + 18, by + 33), (bx + 8, by + 34)], '#c9fbff', '#38d6ff', line='#0f5f78', lw=1.2)
    cv.stroke([(bx + 11, by + 10), (bx + 12, by + 31)], '#ffffff', 2.2)
    ponytail(cv, hx, hy, ph if kind == 'run' else 0.0, '#8a4a28', '#4e2813', '#46d3ff')
    # tronco (jaleco branco) com camisa escura por baixo
    coat = [(sh[0] - 19, sh[1] + 1), (sh[0] + 17, sh[1] + 1), (sh[0] + 21, sh[1] + 24), (hip[0] + 26, hip[1] + 11), (hip[0] + 6, hip[1] + 15), (hip[0] - 24, hip[1] + 11), (sh[0] - 22, sh[1] + 22)]
    cv.poly(smooth(coat, 6), '#ffffff', '#cdd5ee', ang=80, line=INK, lw=1.9, shade=0.14, hl=0.2)
    cv.poly([(sh[0] - 3, sh[1] + 2), (sh[0] + 9, sh[1] + 2), (sh[0] + 3, sh[1] + 24)], '#2b2f4e', '#1a1d34')  # camisa
    cv.stroke([(sh[0] - 9, sh[1] + 1), (sh[0] - 2, sh[1] + 12), (sh[0] - 8, sh[1] + 26), (sh[0] - 12, hip[1] + 10)], '#9aa4cc', 1.6)  # abertura do jaleco
    cv.poly([(sh[0] + 7, sh[1] + 12), (sh[0] + 15, sh[1] + 12), (sh[0] + 15, sh[1] + 22), (sh[0] + 11, sh[1] + 25), (sh[0] + 7, sh[1] + 22)], '#46d3ff', '#2b7be0', line=INK, lw=1.2)  # crachá
    cv.rect = None
    cv.poly([(hip[0] - 22, hip[1] + 1), (hip[0] + 22, hip[1] + 1), (hip[0] + 22, hip[1] + 8), (hip[0] - 22, hip[1] + 8)], '#3a3f66', '#262a4a', line=INK, lw=1.4)  # cinto
    cv.poly([(hip[0] - 4, hip[1] + 1), (hip[0] + 5, hip[1] + 1), (hip[0] + 5, hip[1] + 8), (hip[0] - 4, hip[1] + 8)], '#ffd23f', '#e0a420')
    draw_legs(cv, L, 0, '#4f5890', '#2a2f56', '#2e2e42', '#14141f', '#ffffff')
    # cabeça
    cv.ell(hx - 4, hy - 3, 49, 45, '#8a4a28', '#4e2813', ang=80, line=INK, lw=1.8)             # cabelo atrás
    face_base(cv, hx, hy, '#ffe0c4', '#f3b88c')
    eyes(cv, hx, hy, P); mouth(cv, hx, hy, P)
    # óculos
    for k, (ex, er, ey) in enumerate([(hx - 5, 16, hy + 6), (hx + 29, 17.5, hy + 6)]):
        cv.ell(ex, ey, er, er + 1.5, (120, 220, 255, 40), (120, 220, 255, 10), line='#15151f', lw=3.0)
        cv.stroke([(ex - er * 0.6, ey - er * 0.55), (ex - er * 0.15, ey - er * 0.85)], (255, 255, 255, 190), 2.0)
    cv.stroke([(hx + 10, hy + 4), (hx + 15, hy + 3), (hx + 19, hy + 4)], '#15151f', 3.0)
    cv.stroke([(hx - 21, hy + 4), (hx - 38, hy - 2)], '#15151f', 3.0)
    cv.stroke([(hx - 8, hy - 20), (hx + 2, hy - 24), (hx + 12, hy - 22)], '#5a2e16', 3.0); cv.stroke([(hx + 18, hy - 22), (hx + 30, hy - 25), (hx + 40, hy - 20)], '#5a2e16', 3.0)
    # franja (cabelo na frente)
    fr = [(hx - 46, hy + 2), (hx - 44, hy - 24), (hx - 28, hy - 42), (hx, hy - 50), (hx + 28, hy - 44), (hx + 44, hy - 24), (hx + 46, hy - 8), (hx + 36, hy - 20), (hx + 24, hy - 14), (hx + 12, hy - 26), (hx - 2, hy - 18), (hx - 16, hy - 28), (hx - 26, hy - 12), (hx - 34, hy - 16), (hx - 40, hy + 8)]
    cv.poly(smooth(fr, 6), '#9a5630', '#5a2e16', ang=70, line=INK, lw=1.8, shade=0.12, hl=0.25)
    cv.stroke([(hx - 30, hy - 36), (hx - 6, hy - 46), (hx + 22, hy - 42)], lighter('#9a5630', 0.5), 2.4)
    arm(cv, P, 0, '#ffffff', '#cdd5ee', '#ffffff')
    if kind == 'idle2': pass
    return cv.finish()

def teo(kind, ph=0.0):
    cv = Cv(W, H); P = pose(kind, ph); hx, hy = P['head']; hip = P['hip']; sh = P['sh']
    cv.ell(CX + 4, G + 3, 34, 6, (20, 10, 40, 0), (20, 10, 40, 0))
    L = legs(cv, P, None, None, None)
    draw_legs(cv, L, 1, '#3c3a52', '#1c1b2c', '#ffcf3a', '#c98a10', '#2a2a36', dark=0.25)
    arm(cv, P, 1, '#e8b81c', '#b8860b', '#f4f4fb', dark=0.14)
    bx, by = sh[0] - 32, sh[1] - 2   # mochila com tela ciano
    cv.poly([(bx, by + 2), (bx + 24, by), (bx + 26, by + 40), (bx + 3, by + 44)], '#3a3d58', '#1c1e32', line=INK, lw=1.8, shade=0.2, hl=0.2)
    cv.poly([(bx + 5, by + 9), (bx + 20, by + 8), (bx + 21, by + 26), (bx + 6, by + 27)], '#1a2a48', '#0c1630', line='#58e8ff', lw=1.4)
    cv.glow(bx + 13, by + 18, 22, '#46d3ff', 0.45); cv.poly([(bx + 9, by + 22), (bx + 13, by + 12), (bx + 17, by + 22), (bx + 14, by + 22), (bx + 13, by + 19), (bx + 12, by + 22)], '#7df9ff', '#7df9ff')
    cv.poly([(bx + 2, by + 30), (bx + 24, by + 29), (bx + 24, by + 38), (bx + 3, by + 40)], '#e8b81c', '#b8860b', line=INK, lw=1.2)
    # jaqueta amarela
    coat = [(sh[0] - 19, sh[1] + 1), (sh[0] + 18, sh[1] + 1), (sh[0] + 21, sh[1] + 24), (hip[0] + 24, hip[1] + 10), (hip[0] - 22, hip[1] + 10), (sh[0] - 22, sh[1] + 22)]
    cv.poly(smooth(coat, 6), '#ffd23a', '#e0a010', ang=80, line=INK, lw=1.9, shade=0.16, hl=0.22)
    cv.poly([(sh[0] - 16, sh[1] + 20), (sh[0] + 19, sh[1] + 22), (hip[0] + 24, hip[1] + 10), (hip[0] - 20, hip[1] + 10)], '#2c2c40', '#1a1a2a', line=INK, lw=1.2, shade=0.0)
    cv.poly([(sh[0] - 4, sh[1] + 2), (sh[0] + 8, sh[1] + 2), (sh[0] + 3, sh[1] + 18)], '#f6f1e0', '#d8cfae')
    cv.stroke([(sh[0] + 3, sh[1] + 4), (sh[0] + 3, hip[1] + 8)], '#8a6a10', 1.6)
    cv.poly([(sh[0] + 8, sh[1] + 13), (sh[0] + 17, sh[1] + 13), (sh[0] + 17, sh[1] + 24), (sh[0] + 12, sh[1] + 27), (sh[0] + 8, sh[1] + 24)], '#46d3ff', '#2b7be0', line=INK, lw=1.2)
    cv.poly([(hip[0] - 22, hip[1] + 1), (hip[0] + 22, hip[1] + 1), (hip[0] + 22, hip[1] + 7), (hip[0] - 22, hip[1] + 7)], '#ff4d5e', '#c42b3c', line=INK, lw=1.2)
    draw_legs(cv, L, 0, '#4a4866', '#222138', '#ffd23a', '#d89a12', '#2a2a36')
    # cabeça
    cv.ell(hx - 6, hy - 2, 47, 42, '#6a3a1e', '#35190a', ang=80, line=INK, lw=1.8)
    face_base(cv, hx, hy, '#ffd9b4', '#eeab7c')
    eyes(cv, hx, hy, P, iris='#5a321a')
    mouth(cv, hx, hy, P)
    cv.stroke([(hx - 10, hy - 14), (hx + 2, hy - 20), (hx + 12, hy - 17)], '#3a1c0a', 3.2); cv.stroke([(hx + 18, hy - 18), (hx + 30, hy - 21), (hx + 40, hy - 15)], '#3a1c0a', 3.2)
    # mechas + boné
    cv.poly(smooth([(hx - 46, hy + 2), (hx - 40, hy - 18), (hx - 30, hy - 8), (hx - 36, hy + 12), (hx - 44, hy + 20)], 5), '#7a4524', '#35190a', line=INK, lw=1.6)
    cap = [(hx - 44, hy - 6), (hx - 40, hy - 32), (hx - 22, hy - 52), (hx + 4, hy - 58), (hx + 30, hy - 50), (hx + 44, hy - 34), (hx + 46, hy - 12), (hx + 30, hy - 18), (hx, hy - 20), (hx - 24, hy - 14)]
    cv.poly(smooth(cap, 6), '#ffd23a', '#e09a10', ang=70, line=INK, lw=1.9, shade=0.16, hl=0.28)
    brim = [(hx + 28, hy - 22), (hx + 56, hy - 22), (hx + 66, hy - 16), (hx + 62, hy - 10), (hx + 34, hy - 12)]
    cv.poly(smooth(brim, 4), '#ffcf3a', '#c98a10', ang=80, line=INK, lw=1.8, shade=0.24, hl=0.2)
    cv.poly([(hx + 2, hy - 36), (hx + 12, hy - 54), (hx + 22, hy - 36), (hx + 17, hy - 36), (hx + 12, hy - 46), (hx + 7, hy - 36)], '#2a2840', '#1a1828')
    # fones vermelhos
    cv.stroke([(hx - 34, hy - 4), (hx - 30, hy - 40), (hx - 6, hy - 58)], '#3a3a52', 5.0)
    cv.ell(hx - 33, hy + 8, 13, 19, '#ff4d5e', '#b8203a', ang=60, line=INK, lw=1.8, shade=0.2, hl=0.3)
    cv.poly([(hx - 37, hy + 13), (hx - 33, hy + 2), (hx - 29, hy + 13), (hx - 31, hy + 13), (hx - 33, hy + 7), (hx - 35, hy + 13)], '#ffffff', '#ffd6dc')
    arm(cv, P, 0, '#ffd23a', '#d89a12', '#ffffff')
    return cv.finish()

def fox(kind, ph=0.0):
    cv = Cv(W, H); P = pose(kind, ph); hx, hy = P['head']; hip = P['hip']; sh = P['sh']
    OR, OR2, CR, CR2, DK = '#ff9238', '#d4550e', '#fff3e0', '#ead2b2', '#3a1d12'
    sw = (math.sin(2 * math.pi * ph) * 11) if kind == 'run' else (math.sin(2 * math.pi * ph) * 5)
    up = -10 if kind in ('jump', 'fall') else 0
    cv.ell(CX + 4, G + 3, 34, 6, (20, 10, 40, 0), (20, 10, 40, 0))
    # rabo grande (atrás de tudo), ponta branca
    b = (hip[0] - 12, hip[1] - 4); t = (hip[0] - 84 + sw, hip[1] - 40 + up - abs(sw) * 0.4)
    tail = [(b[0], b[1] + 14), (b[0] - 34, b[1] + 22 + sw * 0.3), (t[0] - 6, t[1] + 28), (t[0] - 22, t[1] + 6), (t[0] - 6, t[1] - 22), (b[0] - 26, b[1] - 26), (b[0] - 2, b[1] - 10)]
    cv.poly(smooth(tail, 6), OR, OR2, ang=60, line=INK, lw=1.9, shade=0.2, hl=0.28)
    cv.poly(smooth([(t[0] - 22, t[1] + 6), (t[0] - 6, t[1] - 22), (t[0] + 4, t[1] - 4), (t[0] - 2, t[1] + 20), (t[0] - 14, t[1] + 24)], 5), CR, CR2, ang=70, line=INK, lw=1.7, shade=0.12)
    L = legs(cv, P, None, None, None)
    draw_legs(cv, L, 1, '#d4600f', '#8a3208', '#3a1d12', '#1c0e08', '#5a3a28', dark=0.25)
    arm(cv, P, 1, '#e87a22', '#a8480c', '#3a1d12', dark=0.12)
    # tronco: pelo laranja, barriga clara, arreio de couro com emblema ciano
    coat = [(sh[0] - 19, sh[1] + 1), (sh[0] + 17, sh[1] + 1), (sh[0] + 21, sh[1] + 22), (hip[0] + 21, hip[1] + 8), (hip[0] - 20, hip[1] + 8), (sh[0] - 22, sh[1] + 22)]
    cv.poly(smooth(coat, 6), OR, OR2, ang=80, line=INK, lw=1.9, shade=0.16, hl=0.24)
    cv.ell(sh[0] + 6, sh[1] + 20, 11, 18, CR, CR2, ang=80, line=None)
    cv.stroke([(sh[0] - 16, sh[1] + 3), (sh[0] + 8, sh[1] + 30), (hip[0] + 8, hip[1] + 4)], '#4a2a1a', 4.4)
    cv.glow(sh[0] + 6, sh[1] + 18, 16, '#58e8ff', 0.5); cv.ell(sh[0] + 6, sh[1] + 18, 7, 7, '#2a3a5a', '#12203a', line=INK, lw=1.3)
    cv.poly([(sh[0] + 2, sh[1] + 22), (sh[0] + 6, sh[1] + 13), (sh[0] + 10, sh[1] + 22), (sh[0] + 8, sh[1] + 22), (sh[0] + 6, sh[1] + 17), (sh[0] + 4, sh[1] + 22)], '#7df9ff', '#7df9ff')
    draw_legs(cv, L, 0, '#ee7a22', '#a8480c', '#3a1d12', '#1c0e08', '#5a3a28')
    # cabeça de raposa: orelhas, bochechas de pelo, focinho claro, nariz
    for ex, eh, dk in ((hx - 20, 52, 0.15), (hx + 16, 56, 0)):
        cv.poly([(ex - 14, hy - 24), (ex - 4, hy - 24 - eh), (ex + 16, hy - 20)], OR if not dk else '#c4500e', OR2, ang=70, line=INK, lw=1.8, shade=0.18)
        cv.poly([(ex - 8, hy - 26), (ex - 2, hy - 24 - eh * 0.72), (ex + 9, hy - 24)], '#3a1d12', '#5a2a18')
    cv.ell(hx + 3, hy + 4, 46, 40, OR, OR2, ang=70, line=INK, lw=1.9, shade=0.14, hl=0.2)
    cv.poly(smooth([(hx - 44, hy + 14), (hx - 56, hy + 22), (hx - 40, hy + 30), (hx - 32, hy + 22)], 4), CR, CR2, line=INK, lw=1.4)   # tufos de bochecha
    cv.poly(smooth([(hx + 34, hy + 2), (hx + 66, hy + 14), (hx + 62, hy + 28), (hx + 20, hy + 36), (hx + 6, hy + 24)], 5), CR, CR2, ang=70, line=INK, lw=1.7, shade=0.1)
    cv.ell(hx + 66, hy + 13, 6, 5, '#1a0f10', '#3a2020', line=None); cv.dot(hx + 64, hy + 11, 1.6, '#ffffff')
    eyes(cv, hx, hy, P, iris='#7a3a14'); 
    cv.stroke([(hx - 9, hy - 14), (hx + 2, hy - 20), (hx + 12, hy - 17)], '#8a3a0c', 3.2); cv.stroke([(hx + 18, hy - 18), (hx + 30, hy - 20), (hx + 40, hy - 14)], '#8a3a0c', 3.2)
    P2 = dict(P); mouth(cv, hx + 8, hy + 2, P2)
    cv.poly(smooth([(hx - 6, hy - 38), (hx + 2, hy - 54), (hx + 8, hy - 40), (hx + 16, hy - 52), (hx + 18, hy - 34)], 4), OR, OR2, line=INK, lw=1.4)   # tufo na testa
    arm(cv, P, 0, '#ff9238', '#c4600f', '#3a1d12')
    return cv.finish()

FRAMES = [('idle', 0.0), ('idle', 0.25), ('run', 0.0), ('run', 1 / 6), ('run', 2 / 6), ('run', 3 / 6), ('run', 4 / 6), ('run', 5 / 6), ('jump', 0), ('fall', 0), ('hurt', 0)]

if __name__ == '__main__':
    import sys
    from PIL import Image
    who = sys.argv[1] if len(sys.argv) > 1 else 'nina'
    fn = {'nina': nina, 'teo': teo, 'fox': fox}[who]
    fr = [fn(k, p) for k, p in FRAMES]
    sheet = Image.new('RGBA', (W * 4, H * 3), (60, 80, 130, 255))
    for i, f in enumerate(fr): sheet.alpha_composite(f, ((i % 4) * W, (i // 4) * H))
    sheet.save(f'_{who}_test.png'); print('ok')
