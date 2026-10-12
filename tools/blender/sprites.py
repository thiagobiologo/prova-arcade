# Prova Arcade — geração dos sprites 3D (Blender, render headless em Cycles/CPU).  © Thiago Silva.
# Uso:  blender -b --python sprites.py -- --part chars|enemies|bosses|props|all --out <pasta> [--test]
import bpy, math, sys, os, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.abspath(arg('--out', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')))
PART = arg('--part', 'all')
TEST = '--test' in ARGS
RES = int(arg('--res', '256'))
SAMPLES = int(arg('--samples', '20'))

def lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def hexc(h, a=1.0):
    h = h.lstrip('#'); return (lin(int(h[0:2], 16)), lin(int(h[2:4], 16)), lin(int(h[4:6], 16)), a)

# ------------------------------------------------------------ cena
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
    try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.render.film_transparent = True
    sc.render.resolution_x = RES; sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'; sc.render.image_settings.color_depth = '8'
    try: sc.view_settings.view_transform = 'Standard'
    except Exception: pass
    try: sc.view_settings.look = 'None'
    except Exception: pass
    cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); sc.collection.objects.link(cam)
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.35; cam.location = (0, -9, 0.95); cam.rotation_euler = (math.radians(90), 0, 0); sc.camera = cam
    def sun(name, rot, energy, col=(1, 1, 1), ang=0.35):
        d = bpy.data.lights.new(name, 'SUN'); d.energy = energy; d.color = col; d.angle = ang
        o = bpy.data.objects.new(name, d); o.rotation_euler = [math.radians(v) for v in rot]; sc.collection.objects.link(o)
    sun('Key', (52, 8, -32), 3.4, (1.0, 0.97, 0.92))
    sun('Rim', (70, 0, 150), 2.0, (0.65, 0.8, 1.0))
    sun('Fill', (80, 0, 40), 0.9, (1.0, 0.95, 1.0), 0.8)
    w = bpy.data.worlds.new('W'); w.use_nodes = True; bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (0.78, 0.82, 1.0, 1); bg.inputs['Strength'].default_value = 0.85; sc.world = w
    return sc

_mats = {}
def mat(key, color, rough=0.3, metal=0.0, emit=None, emit_k=0.0, coat=0.5, alpha=1.0):
    k = (key, color, rough, metal, emit, emit_k, coat)
    if k in _mats: return _mats[k]
    m = bpy.data.materials.new(key); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    def setin(n, v):
        try: b.inputs[n].default_value = v
        except Exception: pass
    setin('Base Color', color if len(color) == 4 else (*color, 1)); setin('Roughness', rough); setin('Metallic', metal)
    setin('Coat Weight', coat); setin('Coat Roughness', 0.15)
    if emit: setin('Emission Color', hexc(emit) if isinstance(emit, str) else emit); setin('Emission Strength', emit_k)
    _mats[k] = m; return m

def new(obj, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), m=None, smooth=True):
    bpy.context.scene.collection.objects.link(obj) if obj.name not in bpy.context.scene.collection.objects else None
    if parent: obj.parent = parent
    obj.location = loc; obj.rotation_euler = rot; obj.scale = scale
    if m is not None and obj.type == 'MESH':
        obj.data.materials.clear(); obj.data.materials.append(m)
        if smooth:
            for p in obj.data.polygons: p.use_smooth = True
    return obj
def sphere(parent, loc, r, scale=(1, 1, 1), m=None, seg=40, rings=20, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg, ring_count=rings, location=(0, 0, 0))
    o = bpy.context.active_object; bpy.context.scene.collection.objects.unlink(o) if o.name in bpy.context.scene.collection.objects and False else None
    return new(o, parent, loc, rot, scale, m)
def cone(parent, loc, r1, r2, h, m, rot=(0, 0, 0), scale=(1, 1, 1), verts=32):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=verts, location=(0, 0, 0)); o = bpy.context.active_object
    return new(o, parent, loc, rot, scale, m)
def cyl(parent, loc, r, h, m, rot=(0, 0, 0), scale=(1, 1, 1), verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=(0, 0, 0)); o = bpy.context.active_object
    return new(o, parent, loc, rot, scale, m)
def torus(parent, loc, R, r, m, rot=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=48, minor_segments=16, location=(0, 0, 0)); o = bpy.context.active_object
    return new(o, parent, loc, rot, scale, m)
def box(parent, loc, size, m, rot=(0, 0, 0), bevel=0.05):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0)); o = bpy.context.active_object
    new(o, parent, loc, rot, size, m, smooth=True)
    bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = 4; bv.limit_method = 'ANGLE'
    return o
def empty(parent=None, loc=(0, 0, 0), name='E'):
    e = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(e); e.parent = parent; e.location = loc; return e
def clear_scene_objects():
    for o in list(bpy.data.objects):
        if o.type in ('MESH', 'EMPTY', 'CURVE', 'FONT') and o.name not in ('Cam',): bpy.data.objects.remove(o, do_unlink=True)

def render(path):
    bpy.context.scene.render.filepath = path; bpy.ops.render.render(write_still=True)

R = math.radians
def ell(a, b, c, z0, y, z):  # x na superfície do elipsoide (a,b,c) centrado em z0
    t = 1 - (y / b) ** 2 - ((z - z0) / c) ** 2
    return a * math.sqrt(max(0.0, t))

# ------------------------------------------------------------ personagens
CHARS = ['nina', 'teo', 'byte', 'fox']
PCOL = [('#2f6bff', '#8fb0ff'), ('#ff6a2b', '#ffb48a')]
BODY_A, BODY_B, BODY_C, Z0 = 0.56, 0.50, 0.72, 0.95

def build_char(ci, pi):
    clear_scene_objects(); _mats.clear()
    main = hexc(PCOL[pi][0]); light = hexc(PCOL[pi][1])
    root = empty(name='root'); body_m = mat('body', main, 0.22, 0.0, coat=0.8)
    # corpo (bean)
    body = empty(root, (0, 0, 0), 'bodyp')
    sphere(body, (0, 0, Z0), 1.0, (BODY_A, BODY_B, BODY_C), body_m, 64, 32)
    belly = hexc('#ffffff') if False else light
    sphere(body, (0.10, 0, Z0 - 0.22), 1.0, (BODY_A * 0.86, BODY_B * 0.8, BODY_C * 0.56), mat('belly', light, 0.35, 0, coat=0.4))   # barriga clara
    # olhos
    ez = 1.33; ey = 0.2
    if ci != 2:
        for s in (-1, 1):
            ex = ell(BODY_A, BODY_B, BODY_C, Z0, ey, ez) + 0.02
            sphere(body, (ex, s * ey, ez), 0.145, (0.55, 1, 1.15), mat('eyew', hexc('#ffffff'), 0.1, 0, coat=1.0))
            sphere(body, (ex + 0.065, s * (ey - 0.015), ez - 0.005), 0.085, (0.5, 1, 1.1), mat('pup', hexc('#12102a'), 0.1, 0, coat=1.0))
            sphere(body, (ex + 0.105, s * (ey - 0.015) - 0.03, ez + 0.045), 0.032, (1, 1, 1), mat('hl', hexc('#ffffff'), 0.05, 0, emit='#ffffff', emit_k=2.0, coat=0))
    # boca
    mx = ell(BODY_A, BODY_B, BODY_C, Z0, 0.0, 1.12) + 0.005
    if ci != 2:
        cyl(body, (mx, 0, 1.12), 0.045, 0.2, mat('mouth', hexc('#3a1020'), 0.4, 0, coat=0), rot=(R(90), 0, 0), scale=(0.6, 0.6, 1))
    # pernas / braços
    legs = []; arms = []
    shoe_m = mat('shoe', hexc('#1b1840'), 0.35, 0, coat=0.5)
    leg_m = mat('leg', hexc('#3a3f7a') if False else hexc(PCOL[pi][0]), 0.25, 0, coat=0.6)
    for s in (-1, 1):
        p = empty(root, (0, s * 0.2, 0.46), 'hip'); legs.append(p)
        sphere(p, (0, 0, -0.2), 1.0, (0.16, 0.16, 0.24), leg_m)
        sphere(p, (0.08, 0, -0.42), 1.0, (0.24, 0.17, 0.12), shoe_m)
        q = empty(root, (0, s * 0.55, 1.12), 'sh'); arms.append(q)
        sphere(q, (0, 0, -0.2), 1.0, (0.12, 0.12, 0.25), leg_m)
        sphere(q, (0, 0, -0.45), 0.13, (1, 1, 1), mat('glove', hexc('#ffffff'), 0.3, 0, coat=0.5))
    # acessórios por personagem
    if ci == 0:   # Nina — cabelo + rabo de cavalo + óculos de proteção
        hair = mat('hair', hexc('#4a2a14'), 0.45, 0, coat=0.3)
        sphere(body, (-0.06, 0, 1.6), 1.0, (0.57, 0.52, 0.25), hair, 48, 24)
        sphere(body, (-0.56, 0, 1.38), 0.2, (0.9, 0.8, 1.3), hair); sphere(body, (-0.7, 0, 1.15), 0.14, (0.8, 0.8, 1.5), hair)
        for sd in (-1, 1):
            torus(body, (ell(BODY_A, BODY_B, BODY_C, Z0, 0.2, 1.33) + 0.05, sd * 0.2, 1.33), 0.17, 0.03, mat('strap', hexc('#1b1840'), 0.35, 0.2, coat=0.3), rot=(0, R(90), 0), scale=(1, 1, 1))
        cyl(body, (0.0, 0, 1.33), 0.5, 0.03, mat('strap2', hexc('#1b1840'), 0.4, 0, coat=0.2), scale=(1.0, 0.92, 1.0))
    elif ci == 1:   # Téo — boné + fone
        capm = mat('cap', hexc('#ffd23f'), 0.35, 0, coat=0.6)
        sphere(body, (-0.04, 0, 1.6), 1.0, (0.58, 0.53, 0.28), capm, 48, 24)
        cyl(body, (0.48, 0, 1.58), 0.25, 0.06, capm, rot=(0, R(8), 0), scale=(1.4, 1.5, 1))
        torus(body, (0, 0, 1.4), 0.5, 0.045, mat('hp', hexc('#1b1840'), 0.3, 0, coat=0.3), rot=(R(90), 0, 0), scale=(1.0, 1.0, 1.0))
        for s in (-1, 1): sphere(body, (-0.02, s * 0.52, 1.3), 0.13, (0.7, 0.8, 1.0), mat('cup', hexc('#ff4f6d'), 0.3, 0, coat=0.7))
    elif ci == 2:   # Byte — robô: visor, antena, parafusos
        metal = mat('metal', hexc('#dfe6f5'), 0.18, 0.7, coat=0.4)
        vx = ell(BODY_A, BODY_B, BODY_C, Z0, 0.0, 1.33) - 0.02
        box(body, (vx + 0.045, 0, 1.33), (0.14, 0.74, 0.4), mat('visor', hexc('#0a0820'), 0.05, 0.2, coat=1.0), bevel=0.1)
        for s in (-1, 1): sphere(body, (vx + 0.12, s * 0.17, 1.35), 0.075, (0.3, 1, 1.3), mat('led', hexc('#6fe6ff'), 0.1, 0, emit='#6fe6ff', emit_k=6.0, coat=0))
        cyl(body, (0, 0, 1.77), 0.025, 0.28, metal); sphere(body, (0, 0, 1.94), 0.065, (1, 1, 1), mat('bulb', hexc('#ff4f6d'), 0.2, 0, emit='#ff4f6d', emit_k=4.0, coat=0))
        for s in (-1, 1): sphere(body, (0, s * 0.51, 1.3), 0.1, (0.6, 0.5, 1.0), metal)
        cyl(body, (0.02, 0, 0.86), 0.5, 0.05, mat('band', hexc('#1b1840'), 0.3, 0.2, coat=0.2), scale=(1.0, 0.9, 1))
    else:   # Raposa — orelhas, focinho, rabo
        inner = mat('earin', hexc('#2a1030'), 0.5, 0, coat=0); white = mat('fw', hexc('#fff6ee'), 0.4, 0, coat=0.3)
        for s in (-1, 1):
            cone(body, (-0.06, s * 0.3, 1.78), 0.2, 0.0, 0.46, body_m, rot=(s * R(-12), R(-6), 0)); cone(body, (-0.02, s * 0.3, 1.74), 0.11, 0.0, 0.32, inner, rot=(s * R(-12), R(-6), 0))
        sphere(body, (ell(BODY_A, BODY_B, BODY_C, Z0, 0, 1.16) + 0.02, 0, 1.12), 1.0, (0.2, 0.3, 0.2), white)
        sphere(body, (ell(BODY_A, BODY_B, BODY_C, Z0, 0, 1.2) + 0.2, 0, 1.2), 0.05, (1, 1.2, 0.9), mat('nose', hexc('#12102a'), 0.2, 0, coat=0.8))
        tail = empty(root, (-0.5, 0, 0.7), 'tail')
        sphere(tail, (-0.2, 0, 0.1), 1.0, (0.3, 0.2, 0.2), body_m); sphere(tail, (-0.42, 0, 0.26), 1.0, (0.28, 0.2, 0.22), body_m); sphere(tail, (-0.6, 0, 0.45), 1.0, (0.2, 0.18, 0.2), white)
    root['legs'] = 0
    return root, body, legs, arms

def pose(root, body, legs, arms, name, ph, ci):
    # reset
    for o in legs + arms: o.rotation_euler = (0, 0, 0)
    body.location = (0, 0, 0); body.rotation_euler = (0, 0, 0); body.scale = (1, 1, 1); root.location = (0, 0, 0)
    yaw = R(-50)   # 3/4 para a câmera
    root.rotation_euler = (0, 0, yaw)
    if name == 'idle':
        b = math.sin(ph * 2 * math.pi) * 0.025
        body.location.z = b; body.scale = (1, 1, 1 - b * 0.5)
        arms[0].rotation_euler.y = R(8 + 4 * math.sin(ph * 6.28)); arms[1].rotation_euler.y = R(8 - 4 * math.sin(ph * 6.28))
    elif name == 'run':
        s = math.sin(ph * 2 * math.pi); c = math.cos(ph * 2 * math.pi)
        legs[0].rotation_euler.y = R(55) * s; legs[1].rotation_euler.y = -R(55) * s
        legs[0].location.z = 0.46 + max(0, -c) * 0.1; legs[1].location.z = 0.46 + max(0, c) * 0.1
        arms[0].rotation_euler.y = -R(50) * s; arms[1].rotation_euler.y = R(50) * s
        body.location.z = abs(c) * 0.07 - 0.02; body.rotation_euler = (0, R(12), 0)
    elif name == 'jump':
        legs[0].rotation_euler.y = R(-35); legs[1].rotation_euler.y = R(45); legs[0].location.z = 0.54
        arms[0].rotation_euler.y = R(-150); arms[1].rotation_euler.y = R(-140)
        body.scale = (0.95, 0.95, 1.08); body.rotation_euler = (0, R(6), 0)
    elif name == 'fall':
        legs[0].rotation_euler.y = R(20); legs[1].rotation_euler.y = R(-20)
        arms[0].rotation_euler.y = R(-120); arms[1].rotation_euler.y = R(-120); arms[0].rotation_euler.x = R(-20); arms[1].rotation_euler.x = R(20)
        body.scale = (1.04, 1.04, 0.95)
    elif name == 'hurt':
        legs[0].rotation_euler.y = R(30); legs[1].rotation_euler.y = R(-10)
        arms[0].rotation_euler.y = R(-60); arms[1].rotation_euler.y = R(-80); arms[0].rotation_euler.x = R(-50); arms[1].rotation_euler.x = R(50)
        body.rotation_euler = (0, R(-20), 0); body.location.z = 0.04
    for o in root.children_recursive:
        pass
    if ci == 3:
        t = [o for o in root.children if o.name.startswith('tail')]
        if t: t[0].rotation_euler.y = R(-18) * math.sin(ph * 6.28 + 1) - (R(15) if name == 'run' else 0)

FRAMES = [('idle', 0.0), ('idle', 0.5), ('run', 0.0), ('run', 1/6), ('run', 2/6), ('run', 3/6), ('run', 4/6), ('run', 5/6), ('jump', 0), ('fall', 0), ('hurt', 0)]

def make_chars(out):
    os.makedirs(out, exist_ok=True)
    cs = [int(v) for v in arg('--chs', '0,1,2,3').split(',')] if not TEST or arg('--chs') else [0]; ps = [0] if TEST else range(2)
    for ci in cs:
        for pi in ps:
            root, body, legs, arms = build_char(ci, pi)
            for fi, (nm, ph) in enumerate(FRAMES[:(3 if TEST else len(FRAMES))]):
                pose(root, body, legs, arms, nm, ph, ci); render(os.path.join(out, f'char_{CHARS[ci]}_p{pi + 1}_{fi:02d}.png'))
            print('char', CHARS[ci], pi, flush=True)

if __name__ == '__main__':
    reset()
    if PART in ('chars', 'all'): make_chars(OUT)
    if PART in ('enemies', 'all'):
        try:
            import enemies_mod; enemies_mod.make(sys.modules[__name__], OUT)
        except ImportError: print('enemies_mod ausente')
