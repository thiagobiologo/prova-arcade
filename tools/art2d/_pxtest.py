import sys; sys.path.insert(0,'.')
from PIL import Image
import heroes, creatures, bosses, pixelize
fr=[heroes.nina(k,p) for k,p in heroes.FRAMES]; px,box=pixelize.pixelize(fr,64,24,4)
sheet=Image.new('RGBA',(px[0].width*4,px[0].height*3),(60,80,130,255))
for i,f in enumerate(px): sheet.alpha_composite(f,((i%4)*px[0].width,(i//4)*px[0].height))
sheet.save('_px_nina.png'); print(px[0].size)
tx=[creatures.sentinela(0),creatures.aranha(0),creatures.cranio(0),creatures.esporo(0)]
p2,b2=pixelize.pixelize(tx,44,20,4); s2=Image.new('RGBA',(p2[0].width*4,p2[0].height),(60,80,130,255))
for i,f in enumerate(p2): s2.alpha_composite(f,(i*p2[0].width,0))
s2.save('_px_mon.png')
