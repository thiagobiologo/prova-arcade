import os
d = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(d, 'enemies_mod.py'); s = open(p, encoding='utf8').read()
a = s.index('    def colossus(kind):'); b = s.index('    # ---------------- props')
s = s[:a] + open(os.path.join(d, 'boss_block.txt'), encoding='utf8').read() + s[b:]
open(p, 'w', encoding='utf8').write(s)
q = os.path.join(d, 'sprites.py'); t = open(q, encoding='utf8').read()
t = t.replace("if o.type in ('MESH', 'EMPTY', 'CURVE') and o.name not in ('Cam',)", "if o.type in ('MESH', 'EMPTY', 'CURVE', 'FONT') and o.name not in ('Cam',)")
open(q, 'w', encoding='utf8').write(t)
print('patched')
