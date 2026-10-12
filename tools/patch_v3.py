P='app/js/game.js'; s=open(P,encoding='utf-8').read()
def rep(a,b):
    global s
    assert a in s, a[:70]; s=s.replace(a,b,1)
rep("const p = this.p, L = this.L; let tx = p.x + p.w / 2 - this.W * 0.42 + p.face * 20, ty = p.y + p.h / 2 - this.H * 0.64;",
    "const p = this.p, L = this.L; const pt = this.portrait; let tx = p.x + p.w / 2 - this.W * (pt ? 0.5 : 0.42) + (pt ? 0 : p.face * 20), ty = p.y + p.h / 2 - this.H * (pt ? 0.74 : 0.64);")
rep("tx = act.xc - this.W / 2; ty = (act.rowG * TS) - this.H * 0.8; }", "tx = act.xc - this.W / 2; ty = (act.rowG * TS) - this.H * (pt ? 0.8 : 0.8); }")
rep("ty = B.rowG * TS - this.H * 0.78; }", "ty = B.rowG * TS - this.H * (pt ? 0.8 : 0.78); }")
rep("ty = Math.max(0, Math.min(ROWS * TS - this.H, ty));\n    this.cam.x", "ty = pt ? Math.max(-this.H, Math.min(ROWS * TS - this.H * 0.6, ty)) : Math.max(0, Math.min(ROWS * TS - this.H, ty));\n    this.cam.x")
rep("this.cam.y = Math.max(0, Math.min(ROWS * TS - this.H, p.y - this.H * 0.64)); }", "this.cam.y = this.portrait ? Math.max(-this.H, Math.min(ROWS * TS - this.H * 0.6, p.y - this.H * 0.74)) : Math.max(0, Math.min(ROWS * TS - this.H, p.y - this.H * 0.64)); }")
rep("const vy = -(cam.y / Math.max(1, ROWS * TS - H)) * 46;", "const vy = this.portrait ? 0 : -(cam.y / Math.max(1, ROWS * TS - H)) * 46;")
rep("const ax = s.x0 + 30, ay = g0 - 46 + Math.sin(f / 22) * 2.5;", "const ax = this.portrait ? Math.max(s.x0 + 30, this.cam.x + 8) : s.x0 + 30, ay = g0 - 46 + Math.sin(f / 22) * 2.5;")
open(P,'w',encoding='utf-8').write(s)
c=open('app/style.css',encoding='utf-8').read()
c+="""
body.portrait #qpanel{top:84px;padding:6px 8px 7px 6px}
body.portrait #q-hint{display:none}
body.portrait #q-opts li{padding:2px 5px}
body.portrait #q-ctx{margin-bottom:2px}
"""
open('app/style.css','w',encoding='utf-8').write(c)
