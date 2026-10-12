/* QA interno (NÃO entregar): conduz o jogo como um jogador. */
import { S, show } from './ui.js';
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const log = [];
export async function run(opt = {}) {
  const o = Object.assign({ mode: 1, turbo: 5, wrongSkill: null, names: ['Ana Beatriz Souza', 'Carlos Eduardo Lima'], god: true, stages: 99 }, opt);
  const t0 = Date.now();
  if (document.body.dataset.scene === 'title') { $('btn-start').click(); await wait(200); }
  $(o.mode === 1 ? 'm1' : 'm2').click(); await wait(200);
  $('n1').value = o.names[0]; $('t1').value = '6º A'; if (o.mode === 2) { $('n2').value = o.names[1]; $('t2').value = '6º A'; }
  $('idform').requestSubmit(); await wait(200); $('btn-char-ok').click(); await wait(200); if (o.mode === 2) { $('btn-char-ok').click(); await wait(200); }
  let guard = 0;
  while (guard++ < 800) {
    const sc = document.body.dataset.scene;
    if (sc === 'mood') { document.querySelector('.face[data-v="3"]').click(); await wait(200); }
    else if (sc === 'turn') { log.push('turn ' + S.turns[S.ti].key + ' p' + (S.turns[S.ti].p + 1)); $('btn-turn-ok').click(); await wait(400); const g = S.game; g.stop(); g.bot = true; g.god = o.god; if (!window.__drv) { let last = performance.now(); window.__drv = setInterval(() => { const now = performance.now(); const n = Math.min(4000, Math.floor((now - last) / 16.667 * (window.__turbo || o.turbo))); last += (now - last); if (document.body.dataset.scene === 'play' && !g.paused) { if (g.running) g.stop(); for (let i = 0; i < n; i++) g.update(); g.render(); } }, 100); } g.botWant = (st) => { const okIdx = st.order.findIndex((i) => st.item.opts[i].ok); if (o.wrongSkill && st.meta && st.meta.skill === o.wrongSkill) return (okIdx + 1) % 3; return okIdx; }; }
    else if (sc === 'shop') { $('btn-shop-done').click(); await wait(200); }
    else if (sc === 'done') { log.push('done ' + JSON.stringify(S.game.stats())); await wait(300); $('btn-done-ok').click(); await wait(200); }
    else if (sc === 'results') { log.push('results in ' + Math.round((Date.now() - t0) / 1000) + 's'); return { ok: true, log }; }
    else if (sc === 'play') {
      const g = S.game; const B = g.boss; if (B && B.active && !B.dead && g.frame % 30 === 0 && o.fastBoss) B.hp = Math.min(B.hp, 1);
      if (g.frame > 60 * 60 * 9) { log.push('timeout stage'); return { ok: false, log, pos: [g.p.x, g.p.y], frame: g.frame }; } await wait(250);
    } else await wait(200);
  }
  return { ok: false, log };
}
