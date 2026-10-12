# Inimigos, chefes, pedestais e props 3D (Blender).  © Thiago Silva.
import bpy, math, os, random, bmesh
R = math.radians

def make(S, out):
    os.makedirs(out, exist_ok=True)
    only = S.arg('--only', '') or ('' if S.PART == 'all' else S.PART)
    def want(n): return (not only) or n in only.split(',')
    def cam(zc, scale, elev=0):
        c = bpy.context.scene.camera; c.data.ortho_scale = scale
        d = 9.0; c.location = (0, -d * math.cos(R(elev)), zc + d * math.sin(R(elev))); c.rotation_euler = (R(90 - elev), 0, 0)
    H, M = S.hexc, S.mat
    def shot(name, fi): S.render(os.path.join(out, f'{name}_{fi:02d}.png'))
    def fresh(): S.clear_scene_objects(); S._mats.clear(); return S.empty(name='root')

    # ---------------- caminhantes ----------------
    def sentinel(ph):
        r = fresh(); metal = M('mt', H('#7f93bd'), 0.38, 0.55); dark = M('dk', H('#232a4a'), 0.35, 0.5); red = M('rd', H('#ff3355'), 0.1, 0, emit='#ff3355', emit_k=7.0, coat=0)
        r.rotation_euler = (0, 0, R(-35)); b = S.sphere(r, (0, 0, 0.58 + 0.03 * math.sin(ph * 6.28)), 1.0, (0.64, 0.56, 0.42), metal)
        S.sphere(r, (0, 0, 0.83), 1.0, (0.38, 0.34, 0.22), dark); S.box(r, (0.6, 0, 0.62), (0.12, 0.5, 0.16), red, bevel=0.05); S.box(r, (0.6, 0.12, 0.74), (0.1, 0.3, 0.06), dark, rot=(0, 0, R(-22)), bevel=0.02); S.box(r, (0.6, -0.12, 0.74), (0.1, 0.3, 0.06), dark, rot=(0, 0, R(22)), bevel=0.02)
        S.cyl(r, (-0.1, 0, 1.1), 0.025, 0.4, metal); S.sphere(r, (-0.1, 0, 1.3), 0.07, (1, 1, 1), red)
        for i, (x, y) in enumerate([(0.3, 0.38), (0.3, -0.38), (-0.3, 0.38), (-0.3, -0.38)]):
            p = S.empty(r, (x, y, 0.3)); sg = 1 if (i % 2 == 0) ^ (ph > 0.25) else -1; p.rotation_euler = (0, R(28) * sg, 0)
            S.sphere(p, (0, 0, -0.14), 1.0, (0.13, 0.13, 0.22), dark); S.sphere(p, (0.05, 0, -0.3), 1.0, (0.2, 0.15, 0.09), metal)
        cam(0.62, 2.0, 10)
    def spider(ph):
        r = fresh(); body = M('bd', H('#3b2a78'), 0.25, 0.1); crys = M('cr', H('#7df9ff'), 0.08, 0, emit='#7df9ff', emit_k=3.5, coat=1.0); eye = M('ey', H('#ff4f9a'), 0.1, 0, emit='#ff4f9a', emit_k=8.0, coat=0)
        r.rotation_euler = (0, 0, R(-40)); S.sphere(r, (0, 0, 0.5), 1.0, (0.6, 0.5, 0.36), body); S.sphere(r, (0.42, 0, 0.44), 1.0, (0.3, 0.28, 0.24), body)
        for i in range(5): S.cone(r, (-0.15 + i * 0.07, (i - 2) * 0.1, 0.84), 0.12, 0.0, 0.5 - abs(i - 2) * 0.1, crys, rot=(R((i - 2) * 12), R(-14 + i * 4), 0))
        for s in (-1, 1):
            S.sphere(r, (0.62, s * 0.11, 0.52), 0.07, (1, 1, 1), eye); S.sphere(r, (0.58, s * 0.2, 0.42), 0.045, (1, 1, 1), eye)
        for i in range(4):
            for s in (-1, 1):
                p = S.empty(r, (0.25 - i * 0.2, s * 0.32, 0.42)); a = math.sin(ph * 6.28 + i * 1.7 * s) * R(14)
                p.rotation_euler = (R(s * 52) + a, R(8), 0)
                S.cyl(p, (0, s * 0.2, -0.1), 0.045, 0.5, body, rot=(R(s * -18), 0, 0))
                S.sphere(p, (0, s * 0.34, -0.38), 0.065, (1, 1, 1), crys)
        cam(0.55, 2.2, 14)
    def skull(ph):
        r = fresh(); bone = M('bn', H('#f1e8d0'), 0.45, 0, coat=0.2); sock = M('sk', H('#120a1e'), 0.5, 0, coat=0); fire = M('fi', H('#ff9a2e'), 0.1, 0, emit='#ff9a2e', emit_k=7.0, coat=0)
        r.rotation_euler = (0, 0, R(-38)); j = 0.05 + 0.05 * math.sin(ph * 6.28)
        S.sphere(r, (0, 0, 0.78), 1.0, (0.56, 0.5, 0.5), bone); S.sphere(r, (0.3, 0, 0.5 - j), 1.0, (0.36, 0.34, 0.12), bone)
        for s in (-1, 1):
            S.sphere(r, (0.4, s * 0.2, 0.86), 1.0, (0.2, 0.17, 0.2), sock); S.sphere(r, (0.6, s * 0.2, 0.86), 0.075, (1, 1, 1), fire); S.box(r, (0.52, s * 0.2, 1.02), (0.1, 0.28, 0.06), bone, rot=(0, 0, R(s * 24)), bevel=0.02)
        S.sphere(r, (0.52, 0, 0.7), 1.0, (0.08, 0.06, 0.1), sock)
        for i in range(5): S.box(r, (0.44, (i - 2) * 0.07, 0.56), (0.05, 0.05, 0.1), bone, bevel=0.015)
        for i, x in enumerate((0.25, -0.2)):
            for s in (-1, 1):
                p = S.empty(r, (x, s * 0.3, 0.42)); p.rotation_euler = (0, R(30) * math.sin(ph * 6.28 + i * 3.1 + (0 if s > 0 else 3.14)), 0)
                S.cyl(p, (0, 0, -0.12), 0.05, 0.3, bone); S.sphere(p, (0.04, 0, -0.28), 1.0, (0.13, 0.09, 0.06), bone)
        S.cone(r, (-0.2, 0, 1.12), 0.12, 0, 0.25, bone); cam(0.62, 2.1, 8)
    def spore(ph):
        r = fresh(); jel = M('jl', H('#ff4fd8'), 0.12, 0, emit='#ff2fc0', emit_k=0.5, coat=1.0); glow = M('gl', H('#d6ffe4'), 0.1, 0, emit='#7dffa3', emit_k=5.0, coat=0); eyew = M('ew', H('#ffffff'), 0.1, 0, coat=1.0); pup = M('pp', H('#1a0a2a'), 0.1, 0, coat=1.0)
        r.rotation_euler = (0, 0, R(-35)); sq = 1 + 0.07 * math.sin(ph * 6.28)
        S.sphere(r, (0, 0, 0.62), 1.0, (0.62 * sq, 0.58 * sq, 0.55 / sq), jel, 48, 24)
        S.sphere(r, (0.58, 0, 0.7), 0.26, (0.5, 1, 1), eyew); S.sphere(r, (0.7, 0, 0.7), 0.14, (0.5, 1, 1), pup); S.sphere(r, (0.76, -0.04, 0.76), 0.045, (1, 1, 1), M('h', H('#ffffff'), 0.05, 0, emit='#ffffff', emit_k=3, coat=0))
        for (x, y, z, rr) in [(-0.2, 0.3, 0.9, 0.07), (-0.3, -0.1, 0.78, 0.09), (0.0, -0.4, 0.88, 0.06), (-0.1, 0.1, 1.0, 0.06)]: S.sphere(r, (x, y, z), rr, (1, 1, 1), glow)
        for i, (x, y) in enumerate([(0.15, 0.45), (0.15, -0.45), (-0.4, 0.0)]):
            p = S.empty(r, (x, y, 0.2)); p.rotation_euler = (R(math.copysign(25, y) + 12 * math.sin(ph * 6.28 + i)), 0, 0)
            S.cyl(p, (0, 0, -0.1), 0.07, 0.34, jel); S.sphere(p, (0, 0, -0.28), 0.09, (1, 1, 1), glow)
        cam(0.62, 2.1, 8)
    # ---------------- voadores ----------------
    def drone(ph):
        r = fresh(); body = M('bd', H('#f4f7ff'), 0.2, 0.2); dk = M('dk', H('#2a3358'), 0.3, 0.6); red = M('rd', H('#ff3355'), 0.1, 0, emit='#ff3355', emit_k=7.0, coat=0)
        r.rotation_euler = (0, 0, R(-30)); S.sphere(r, (0, 0, 0.7), 1.0, (0.5, 0.46, 0.4), body); S.sphere(r, (0.5, 0, 0.7), 0.2, (0.5, 1, 1), red); S.box(r, (0.5, 0.0, 0.88), (0.1, 0.34, 0.06), dk, bevel=0.02)
        S.cyl(r, (0, 0, 1.03), 0.04, 0.2, dk)
        for s in (-1, 1): S.cyl(r, (0, s * 0.55, 0.78), 0.03, 0.2, dk, rot=(R(90), 0, 0))
        for s in (-1, 1):
            d = S.cyl(r, (0, s * 0.62, 0.82), 0.3, 0.025, dk, rot=(0, 0, R(ph * 120 + s * 20))); S.cyl(r, (0, s * 0.62, 0.84), 0.04, 0.05, red)
        S.cyl(r, (0, 0, 1.12), 0.55, 0.02, dk, rot=(0, 0, R(ph * 120)))
        cam(0.75, 2.0)
    def wraith(ph):
        r = fresh(); body = M('bd', H('#5a3aa8'), 0.18, 0.1, coat=1.0); wing = M('wg', H('#7df9ff'), 0.1, 0, emit='#3fd9ff', emit_k=1.2, coat=1.0); eye = M('ey', H('#ffffff'), 0.1, 0, emit='#7df9ff', emit_k=9.0, coat=0)
        r.rotation_euler = (0, 0, R(-30)); S.sphere(r, (0, 0, 0.7), 1.0, (0.42, 0.38, 0.5), body); S.cone(r, (0, 0, 0.28), 0.3, 0.02, 0.6, body, rot=(R(180), 0, 0))
        for s in (-1, 1): S.sphere(r, (0.35, s * 0.15, 0.78), 0.1, (0.5, 1, 1.2), eye)
        fl = math.sin(ph * 6.28)
        for s in (-1, 1):
            p = S.empty(r, (0, s * 0.3, 0.78)); p.rotation_euler = (R(s * (20 + 35 * fl)), 0, 0)
            S.cone(p, (0, s * 0.45, 0.1), 0.34, 0.0, 0.9, wing, rot=(R(s * -90), R(0), 0), scale=(1, 0.18, 1))
        cam(0.72, 2.3)
    def vulture(ph):
        r = fresh(); bone = M('bn', H('#f1e8d0'), 0.45, 0, coat=0.2); dk = M('dk', H('#6b4a3a'), 0.5, 0, coat=0); fire = M('fi', H('#ff9a2e'), 0.1, 0, emit='#ff9a2e', emit_k=7.0, coat=0)
        r.rotation_euler = (0, 0, R(-32)); S.sphere(r, (0, 0, 0.7), 1.0, (0.5, 0.36, 0.34), dk); S.sphere(r, (0.45, 0, 0.88), 1.0, (0.24, 0.2, 0.22), bone); S.cone(r, (0.72, 0, 0.84), 0.09, 0, 0.3, M('bk', H('#e0a040'), 0.4, 0, coat=0.3), rot=(0, R(90), 0))
        for s in (-1, 1): S.sphere(r, (0.58, s * 0.1, 0.94), 0.05, (1, 1, 1), fire)
        fl = math.sin(ph * 6.28)
        for s in (-1, 1):
            p = S.empty(r, (0, s * 0.25, 0.8)); p.rotation_euler = (R(s * (15 + 40 * fl)), 0, 0)
            for k in range(4): S.cyl(p, (-0.1 - k * 0.1, s * (0.28 + k * 0.1), 0.0), 0.03, 0.55 - k * 0.07, bone, rot=(R(s * 90), R(-8 * k), 0))
            S.sphere(p, (-0.2, s * 0.42, 0.0), 1.0, (0.5, 0.45, 0.02), M('wb', H('#c8b898'), 0.5, 0, coat=0.1))
        cam(0.72, 2.4)
    def wisp(ph):
        r = fresh(); orb = M('ob', H('#d6ffe4'), 0.1, 0, emit='#3dff8a', emit_k=2.4, coat=1.0); tail = M('tl', H('#7dffa3'), 0.1, 0, emit='#2fd97a', emit_k=1.6, coat=0); eye = M('ey', H('#0a2a1a'), 0.1, 0, coat=1.0)
        r.rotation_euler = (0, 0, R(-30)); S.sphere(r, (0, 0, 0.75), 1.0, (0.44, 0.42, 0.44), orb)
        for s in (-1, 1): S.sphere(r, (0.36, s * 0.14, 0.8), 0.09, (0.5, 1, 1.25), eye); S.sphere(r, (0.41, s * 0.14 - 0.02, 0.84), 0.025, (1, 1, 1), M('h', H('#ffffff'), 0.05, 0, emit='#ffffff', emit_k=3, coat=0))
        for k in range(4):
            a = ph * 6.28 + k * 1.1; S.sphere(r, (-0.35 - k * 0.2, math.sin(a) * 0.12, 0.7 - k * 0.1), 0.2 - k * 0.04, (1, 0.8, 0.8), tail)
        cam(0.72, 2.2)
    # ---------------- chefes ----------------
    def colossus(kind):
        r = fresh(); rock = M('rk', H('#2e2560'), 0.5, 0.05, coat=0.15); rock2 = M('r2', H('#4c3d8f'), 0.4, 0.05, coat=0.25)
        gc = {'idle': '#7df9ff', 'tele': '#ff3355', 'stun': '#3a4468'}[kind]; k = 0.2 if kind == 'stun' else (9.0 if kind == 'tele' else 5.0)
        glow = M('gw', H(gc), 0.1, 0, emit=gc, emit_k=k, coat=0); ec = '#ffe36b' if kind != 'stun' else '#3a4468'
        eyem = M('ey', H(ec), 0.1, 0, emit=ec, emit_k=10.0 if kind != 'stun' else 0.2, coat=0)
        cy = M('cy', H('#5fe8ff'), 0.08, 0, emit='#2fd0ff' if kind != 'tele' else '#ff3355', emit_k=2.6 if kind != 'tele' else 6.0, coat=1.0)
        mg = M('mg', H('#ff6be0'), 0.08, 0, emit='#ff3fd0' if kind != 'tele' else '#ff7a22', emit_k=2.6 if kind != 'tele' else 6.0, coat=1.0)
        r.rotation_euler = (0, 0, R(-32)); lean = R(18) if kind == 'stun' else 0
        tor = S.empty(r, (0, 0, 0.9)); tor.rotation_euler = (0, lean, 0)
        S.box(tor, (0, 0, 0.45), (1.0, 1.55, 1.05), rock, bevel=0.22); S.box(tor, (0, 0, -0.2), (0.8, 1.1, 0.5), rock2, bevel=0.15)
        S.sphere(tor, (0.5, 0, 0.5), 0.2, (0.5, 1, 1), glow)
        for (y, z, h) in [(-0.5, 0.2, 0.5), (0.5, 0.3, 0.6), (-0.3, 0.8, 0.4), (0.3, 0.75, 0.45)]:
            S.box(tor, (0.5, y, z), (0.04, 0.05, h), glow, rot=(R(10 * y), 0, R(20 * y)), bevel=0.01)
        head = S.empty(tor, (0.1, 0, 1.25)); head.rotation_euler = (0, R(20) if kind == 'stun' else R(-6), 0)
        S.box(head, (0, 0, 0.1), (0.62, 0.7, 0.58), rock2, bevel=0.15)
        for sd in (-1, 1):
            S.box(head, (0.33, sd * 0.19, 0.16), (0.1, 0.24, 0.1), eyem, rot=(0, 0, R(sd * 18)), bevel=0.03)
            S.box(head, (0.34, sd * 0.2, 0.3), (0.08, 0.3, 0.07), rock, rot=(0, 0, R(-sd * 24)), bevel=0.02)
        S.box(head, (0.33, 0, -0.08), (0.08, 0.34, 0.1), rock, bevel=0.03)
        for (y, hh, a) in [(-0.6, 1.0, -22), (-0.3, 1.3, -8), (0.3, 1.2, 8), (0.6, 0.9, 22)]:
            S.cone(tor, (-0.35, y, 1.0 + hh * 0.35), 0.17, 0.0, hh, cy if (y > 0) else mg, rot=(R(a), R(-14), 0))
        for sd in (-1, 1):
            sh = S.empty(tor, (0, sd * 1.0, 0.85)); S.sphere(sh, (0, 0, 0), 0.42, (1, 1, 0.9), rock2)
            for q in range(3):
                S.cone(sh, (0, sd * 0.12 * q, 0.35 + q * 0.12), 0.1, 0.0, 0.5 + 0.1 * q, cy if sd < 0 else mg, rot=(R(sd * (14 + q * 10)), 0, 0))
            up = R(-150) if kind == 'tele' else (R(-8) if kind == 'stun' else R(-24))
            sh.rotation_euler = (0, up, 0); S.cyl(sh, (0, 0, -0.5), 0.2, 0.9, rock); S.sphere(sh, (0.05, 0, -1.08), 0.38, (1, 1, 1), rock2); S.sphere(sh, (0.22, 0, -1.08), 0.1, (1, 1, 1), glow)
        for sd in (-1, 1):
            S.box(r, (0, sd * 0.38, 0.38), (0.5, 0.5, 0.9), rock, bevel=0.14); S.box(r, (0.14, sd * 0.38, 0.08), (0.7, 0.55, 0.22), rock2, bevel=0.08)
        cam(1.15, 3.6)
    def titan(kind):
        r = fresh(); bone = M('bn', H('#eadfc2'), 0.5, 0, coat=0.15); bone2 = M('b2', H('#bfae88'), 0.55, 0, coat=0.1); dk = M('dk', H('#150c18'), 0.6, 0, coat=0)
        fc = {'idle': '#ff6a1a', 'tele': '#ff1133', 'stun': '#3a3040'}[kind]; k = 0.2 if kind == 'stun' else (10.0 if kind == 'tele' else 7.0)
        fire = M('fi', H(fc), 0.1, 0, emit=fc, emit_k=k, coat=0); core = M('co', H(fc), 0.1, 0, emit=fc, emit_k=(0.3 if kind == 'stun' else 2.0), coat=0)
        r.rotation_euler = (0, 0, R(-32)); hunch = R(14) if kind == 'stun' else R(-4)
        sp = S.empty(r, (0, 0, 0.75)); sp.rotation_euler = (0, hunch, 0)
        S.sphere(sp, (0, 0, 0.55), 1.0, (0.45, 0.36, 0.62), dk)
        for i in range(5): S.torus(sp, (0, 0, 0.1 + i * 0.22), 0.5 - abs(i - 2) * 0.05, 0.065, bone, rot=(R(90), 0, 0), scale=(0.95, 1.0, 1.0))
        S.sphere(sp, (0.12, 0, 0.55), 0.2, (1, 1, 1), core)
        for i in range(5): S.cone(sp, (-0.42, 0, 0.1 + i * 0.22), 0.07, 0, 0.3, bone2, rot=(0, R(-100), 0))
        sk = S.empty(sp, (0.25, 0, 1.45)); sk.rotation_euler = (0, R(-14) if kind == 'stun' else R(8), 0)
        S.sphere(sk, (0, 0, 0.1), 1.0, (0.55, 0.5, 0.46), bone)
        op = 0.28 if kind == 'tele' else 0.06
        jw = S.empty(sk, (0.2, 0, -0.18)); jw.rotation_euler = (0, R(op * 120), 0); S.box(jw, (0.2, 0, -0.05), (0.5, 0.42, 0.13), bone2, bevel=0.05)
        for i in range(6):
            S.cone(jw, (0.36, (i - 2.5) * 0.065, 0.06), 0.032, 0, 0.14, bone, rot=(0, 0, 0)); S.cone(sk, (0.48, (i - 2.5) * 0.065, -0.15), 0.032, 0, 0.14, bone, rot=(R(180), 0, 0))
        for sd in (-1, 1):
            S.sphere(sk, (0.4, sd * 0.2, 0.18), 1.0, (0.17, 0.16, 0.17), dk); S.sphere(sk, (0.52, sd * 0.2, 0.18), 0.1, (0.6, 1, 1.2), fire)
            S.box(sk, (0.42, sd * 0.2, 0.38), (0.1, 0.32, 0.07), bone2, rot=(0, 0, R(-sd * 26)), bevel=0.02)
            h1 = S.empty(sk, (-0.05, sd * 0.38, 0.4)); h1.rotation_euler = (R(sd * -35), 0, 0); S.cone(h1, (0, 0, 0.35), 0.15, 0.04, 0.8, bone); S.cone(h1, (0.05, 0, 0.9), 0.05, 0.0, 0.4, bone, rot=(0, R(-25), 0))
        up = R(-95) if kind == 'tele' else R(-22)
        for sd in (-1, 1):
            sh = S.empty(sp, (0, sd * 0.78, 1.1)); sh.rotation_euler = (0, up, 0); S.sphere(sh, (0, 0, 0), 0.2, (1, 1, 1), bone2)
            S.cyl(sh, (0, 0, -0.5), 0.09, 1.0, bone); S.sphere(sh, (0, 0, -1.02), 0.2, (1, 1, 0.9), bone)
            for q in (-1, 0, 1): S.cone(sh, (0.2, q * 0.12, -1.15), 0.055, 0, 0.42, bone, rot=(0, R(150), 0))
        for sd in (-1, 1):
            S.cyl(r, (0, sd * 0.32, 0.38), 0.11, 0.8, bone); S.sphere(r, (0.1, sd * 0.32, 0.04), 1.0, (0.3, 0.16, 0.1), bone)
        cam(1.1, 3.5)
    def hydra(kind):
        r = fresh(); jel = M('jl', H('#a82ae0'), 0.2, 0, emit='#8a14c8', emit_k=0.5, coat=1.0); belly = M('bl', H('#e86bff'), 0.25, 0, emit='#c030e8', emit_k=0.4, coat=0.6)
        gc = '#7dffa3' if kind != 'stun' else '#3a4a40'; glow = M('gl', H(gc), 0.1, 0, emit=gc, emit_k=(6.0 if kind != 'stun' else 0.2), coat=0)
        mouth = M('mo', H('#1a0620'), 0.4, 0, coat=0); inner = M('in', H('#ff7a22'), 0.1, 0, emit='#ff7a22', emit_k=(6.0 if kind == 'tele' else 0.5), coat=0)
        tooth = M('th', H('#ffffff'), 0.2, 0, coat=0.5); spike = M('sp', H('#2a0a40'), 0.3, 0.2, coat=0.3)
        r.rotation_euler = (0, 0, R(-30)); S.sphere(r, (-0.1, 0, 0.7), 1.0, (0.95, 0.9, 0.7), jel, 48, 24); S.sphere(r, (0.3, 0, 0.5), 1.0, (0.55, 0.6, 0.45), belly)
        for i in range(7): S.cone(r, (-0.6 + (i % 3) * 0.22, (i - 3) * 0.24, 1.2), 0.11, 0, 0.45 + (i % 2) * 0.15, spike, rot=(R((i - 3) * 9), R(-10), 0))
        cfg = [(-0.62, 0.55, 1.5), (0.0, 0.2 if kind != 'tele' else 0.0, 2.0), (0.62, 0.55, 1.5)]
        for i, (y, lean, h) in enumerate(cfg):
            droop = kind == 'stun'
            n1 = S.empty(r, (0.0, y, 0.95)); n1.rotation_euler = (R(y * -25), R(-40 * lean if not droop else 50), 0)
            S.cyl(n1, (0, 0, h * 0.28), 0.2, h * 0.56, jel)
            n2 = S.empty(n1, (0, 0, h * 0.56)); n2.rotation_euler = (0, R(35 if not droop else 20), 0); S.cyl(n2, (0, 0, h * 0.2), 0.17, h * 0.42, jel)
            hx = S.empty(n2, (0, 0, h * 0.42)); hx.rotation_euler = (0, R(-30 if not droop else 40), 0)
            S.sphere(hx, (0.08, 0, 0.0), 0.36, (1.1, 0.95, 0.9), jel)
            big = (kind == 'tele' and i == 1); op = 0.3 if big else 0.08
            jw = S.empty(hx, (0.12, 0, -0.1)); jw.rotation_euler = (0, R(op * 100), 0); S.sphere(jw, (0.2, 0, -0.04), 1.0, (0.32, 0.26, 0.09), belly)
            S.sphere(hx, (0.3, 0, -0.04), 1.0, (0.2, 0.2, 0.06 + op * 0.5), mouth)
            if big: S.sphere(hx, (0.28, 0, -0.02), 0.13, (1, 1, 1), inner)
            for t in range(4):
                S.cone(hx, (0.42, (t - 1.5) * 0.09, 0.0), 0.03, 0, 0.14, tooth, rot=(0, R(180), 0)); S.cone(jw, (0.34, (t - 1.5) * 0.09, 0.02), 0.03, 0, 0.14, tooth)
            for sd in (-1, 1):
                S.sphere(hx, (0.3, sd * 0.17, 0.16), 0.1, (0.6, 1, 0.7), glow); S.box(hx, (0.3, sd * 0.17, 0.3), (0.1, 0.3, 0.06), spike, rot=(0, 0, R(-sd * 26)), bevel=0.02)
                S.cone(hx, (-0.05, sd * 0.22, 0.34), 0.07, 0, 0.36, spike, rot=(R(sd * -30), 0, 0))
        for k in range(6): S.sphere(r, (-0.3 - k * 0.1, math.sin(k * 1.3) * 0.3, 0.55 + (k % 2) * 0.12), 0.07, (1, 1, 1), glow)
        cam(1.15, 3.9)
    # ---------------- props ----------------
    def coin(a):
        r = fresh(); gold = M('gd', H('#ffcf2e'), 0.22, 0.95, coat=0.5); g2 = M('g2', H('#ffe98a'), 0.2, 0.95, coat=0.5)
        c = S.empty(r, (0, 0, 0.5)); c.rotation_euler = (0, 0, R(a)); o = S.cyl(c, (0, 0, 0), 0.46, 0.12, gold, rot=(R(90), 0, 0), verts=48)
        S.torus(c, (0, -0.0, 0), 0.38, 0.03, g2, rot=(R(90), 0, 0)); S.cyl(c, (0, -0.07, 0), 0.22, 0.03, g2, rot=(R(90), 0, 0)); S.cyl(c, (0, 0.07, 0), 0.22, 0.03, g2, rot=(R(90), 0, 0))
        cam(0.5, 1.2)
    def star(a):
        r = fresh(); gold = M('gd', H('#ffd23f'), 0.15, 0.4, emit='#ffb300', emit_k=0.8, coat=1.0)
        me = bpy.data.meshes.new('star'); pts = []; n = 5
        for i in range(n * 2):
            ang = math.pi / 2 + i * math.pi / n; rad = 0.55 if i % 2 == 0 else 0.26; pts.append((math.cos(ang) * rad, math.sin(ang) * rad))
        bm = bmesh.new(); f = [bm.verts.new((x, -0.1, y)) for (x, y) in pts]; b = [bm.verts.new((x, 0.1, y)) for (x, y) in pts]
        bm.faces.new(f[::-1]); bm.faces.new(b)
        for i in range(n * 2): bm.faces.new((f[i], f[(i + 1) % (n * 2)], b[(i + 1) % (n * 2)], b[i]))
        bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new('star', me); S.new(ob, r, (0, 0, 0.55), (0, 0, R(a)), (1, 1, 1), gold)
        bv = ob.modifiers.new('bv', 'BEVEL'); bv.width = 0.05; bv.segments = 3
        for e in (-1, 1): S.sphere(r, (0.0, -0.0, 0.55), 0.0, (1, 1, 1), gold)
        cam(0.55, 1.4)
    def aura():
        r = fresh(); ce = M('ce', H('#f7f9ff'), 0.12, 0.0, coat=1.0); vis = M('vs', H('#0a0820'), 0.05, 0.2, coat=1.0); led = M('ld', H('#6fe6ff'), 0.1, 0, emit='#6fe6ff', emit_k=7.0, coat=0); halo = M('hl', H('#6fe6ff'), 0.1, 0, emit='#6fe6ff', emit_k=3.0, coat=0)
        r.rotation_euler = (0, 0, R(-30)); S.sphere(r, (0, 0, 0.9), 1.0, (0.62, 0.58, 0.58), ce, 64, 32); S.box(r, (0.45, 0, 0.92), (0.16, 0.78, 0.44), vis, bevel=0.1)
        for s in (-1, 1): S.sphere(r, (0.56, s * 0.18, 0.95), 0.08, (0.3, 1, 1.3), led)
        S.torus(r, (0, 0, 0.5), 0.85, 0.045, halo, rot=(R(10), R(6), 0), scale=(1, 1, 1)); S.sphere(r, (0, 0, 1.58), 0.07, (1, 1, 1), halo)
        for s in (-1, 1): S.sphere(r, (0, s * 0.62, 0.9), 0.14, (0.6, 0.5, 1), ce)
        S.cone(r, (0, 0, 0.18), 0.4, 0.02, 0.5, M('hl2', H('#6fe6ff'), 0.1, 0, emit='#6fe6ff', emit_k=1.0, coat=0), rot=(R(180), 0, 0)); cam(0.95, 2.2)
    def pedestal(i, lit):
        r = fresh(); col = ['#ffd23f', '#3ddc84', '#b46bff'][i]; letter = 'ABC'[i]
        st = M('st', H('#4b4f78'), 0.4, 0.1, coat=0.3); st2 = M('s2', H('#2f3256'), 0.5, 0, coat=0.1); gem = M('gm', H('#ffffff') if lit else H(col), 0.12, 0.0, emit=col, emit_k=(5.0 if lit else 0.7), coat=1.0)
        S.box(r, (0, 0, 0.62), (1.7, 1.3, 1.24), st, bevel=0.09); S.box(r, (0, 0, 0.1), (1.84, 1.44, 0.2), st2, bevel=0.05)
        S.box(r, (0, 0, 1.28), (1.76, 1.36, 0.16), gem, bevel=0.07)
        for sx in (-0.62, 0.62): S.sphere(r, (sx, -0.66, 0.9), 0.1, (1, 0.5, 1), gem)
        cu = bpy.data.curves.new('t', 'FONT'); cu.body = letter; cu.size = 0.8; cu.extrude = 0.04; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
        ob = bpy.data.objects.new('t', cu); bpy.context.scene.collection.objects.link(ob); ob.parent = r; ob.location = (0, -0.68, 0.64); ob.rotation_euler = (R(90), 0, 0)
        ob.data.materials.append(M('tx', H('#ffffff'), 0.3, 0, coat=0.5)); cam(0.7, 2.1, elev=18)

    # ---------------- execução ----------------
    FR = [0.0, 0.5]
    groups = [('sentinel', sentinel), ('spider', spider), ('skull', skull), ('spore', spore), ('drone', drone), ('wraith', wraith), ('vulture', vulture), ('wisp', wisp)]
    if want('enemies'):
        for nm, fn in groups:
            S.RES_override = None
            for fi, ph in enumerate(FR):
                fn(ph); shot('en_' + nm, fi)
            print('enemy', nm, flush=True)
    if want('bosses'):
        bpy.context.scene.render.resolution_x = bpy.context.scene.render.resolution_y = 384
        for nm, fn in [('colossus', colossus), ('titan', titan), ('hydra', hydra)]:
            for fi, k in enumerate(['idle', 'tele', 'stun']):
                fn(k); shot('boss_' + nm, fi)
            print('boss', nm, flush=True)
        bpy.context.scene.render.resolution_x = bpy.context.scene.render.resolution_y = S.RES
    if want('props'):
        for fi in range(8): coin(fi * 45); shot('coin', fi)
        for fi in range(8): star(fi * 45); shot('star', fi)
        aura(); shot('aura', 0)
        for i in range(3):
            pedestal(i, False); shot(f'ped{i}', 0); pedestal(i, True); shot(f'ped{i}', 1)
        print('props', flush=True)
