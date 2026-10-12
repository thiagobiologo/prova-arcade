import { buildLevel, validate, tileAt } from '../app/js/levels.js';
const L = buildLevel(process.argv[2]||'s3', +process.argv[3]||15, 3); const v = validate(L); console.log(v);
const a = Math.max(0, v.maxC - 20);
for(let r=8;r<22;r++){ let s=''; for(let c=a;c<a+60;c++){const t=tileAt(L,c,r); s+= t===0?'.':t===1?'=':t===2?'#':t===4?'-':t===5?'^':t===6?'B':t===8?'G':'W'; } console.log(String(r).padStart(2),s); }
console.log('from col', a, 'movers', JSON.stringify(L.movers.map(m=>m.x/16)));
