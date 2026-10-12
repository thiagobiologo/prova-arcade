/* Tela de diagnóstico individual. © Thiago Silva. */
import { PACK } from './items.js';
import { PLAYER_COLORS, CHARS } from './art.js';
import { frameCanvas } from './gfx.js';
import { dressed } from './cosmetics.js';

const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const fmt = (s) => (s == null ? '—' : `${s.toFixed(1)} s`);
const MOODS = ['', '😄 Tranquilo(a)', '🙂 Bem', '😐 Normal', '😟 Preocupado(a)', '😣 Muito tenso(a)'];
const LEVELS = [
  { min: 3, cls: 'a', label: 'CONSOLIDADA', tip: 'Domínio demonstrado nos três itens.' },
  { min: 2, cls: 'b', label: 'EM DESENVOLVIMENTO', tip: 'Domínio parcial: vale uma retomada pontual.' },
  { min: 0, cls: 'c', label: 'PRECISA DE RETOMADA', tip: 'Conceito ainda frágil: retomar com atividades de base.' },
];
export function skillSummary(pl) {
  return PACK.skills.map((sk) => {
    const ans = pl.answers.filter((a) => a.skill === sk.code).sort((a, b) => a.slot - b.slot); const n = ans.filter((a) => a.ok).length; const tot = ans.length || 3; const eq = n >= tot ? 3 : (tot >= 2 && n / tot >= 0.5 ? 2 : 0);
    return { sk, ans, n, tot, lv: LEVELS.find((l) => eq >= l.min), tags: [...new Set(ans.filter((a) => !a.ok && a.tag).map((a) => a.tag))] };
  });
}
export function motorProfile(pl) {
  const m = pl.motor; if (!m) return { label: '—', note: 'Sem calibragem registrada.' };
  if (m.deaths <= 3 && m.seconds <= 170) return { label: 'BOM', note: `Treino concluído em ${Math.round(m.seconds)} s com ${m.deaths} queda(s): o controle do personagem não deve interferir nas respostas.` };
  if (m.deaths <= 9) return { label: 'REGULAR', note: `Treino com ${m.deaths} queda(s). Interpretar tempos de resposta com cautela.` };
  return { label: 'EM ADAPTAÇÃO', note: `Treino com ${m.deaths} quedas. O jogo ofereceu apoio nos trechos de plataforma; considerar a destreza ao ler os tempos.` };
}
function watermark(wrap, text) {
  const c = document.createElement('canvas'); c.width = 520; c.height = 220; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.font = '800 14px system-ui,sans-serif'; x.translate(40, 170); x.rotate(-0.38); x.fillText(text, 0, 0);
  const w = el('div', 'wm'); w.style.backgroundImage = `url(${c.toDataURL()})`; wrap.prepend(w);
}
function reading(sum) {
  const best = [...sum].sort((a, b) => b.n - a.n)[0], worst = [...sum].sort((a, b) => a.n - b.n)[0]; const parts = [];
  if (sum.every((s) => s.n === s.tot)) parts.push('Desempenho pleno nas três habilidades avaliadas.');
  else if (best.n === worst.n) parts.push(`Desempenho semelhante nas três habilidades (${best.n}/${best.tot} em cada): a retomada deve contemplar as três.`);
  else { parts.push(`Maior consistência em ${best.sk.short.toLowerCase()} (${best.n}/${best.tot}).`); if (worst.n < worst.tot) parts.push(`Maior necessidade de retomada em ${worst.sk.short.toLowerCase()} (${worst.n}/${worst.tot}).`); }
  if (sum.flatMap((s) => s.tags).length) parts.push('Os equívocos listados indicam por onde começar a intervenção.');
  parts.push('Leitura indicativa: com 3 itens por habilidade, o resultado orienta o professor, não substitui a avaliação formal.'); return parts.join(' ');
}

export function renderResults(S, root, tab, act) {
  root.innerHTML = ''; root.dataset.p = tab; const pl = S.players[tab]; const sum = skillSummary(pl); const mp = motorProfile(pl);
  const total = pl.answers.filter((a) => a.ok).length; const nAns = pl.answers.length; const avgDwell = nAns ? pl.answers.reduce((a, b) => a + b.dwell, 0) / nAns : 0; const changes = pl.answers.reduce((a, b) => a + b.changes, 0);
  watermark(root, `Licenciado: ${S.auth.holder} · ${S.auth.licenseId} · ${S.auth.user}`);
  const top = el('div', 'r-top'); top.appendChild(el('h2', null, 'DIAGNÓSTICO'));
  if (S.players.length > 1) { const tabs = el('div', 'r-tabs'); S.players.forEach((p, i) => { const b = el('button', `t${i}${i === tab ? ' on' : ''}`, `P${i + 1} · ${p.name.split(' ')[0].toUpperCase()}`); b.addEventListener('click', () => act.onTab(i)); tabs.appendChild(b); }); top.appendChild(tabs); }
  root.appendChild(top);

  const head = el('div', 'r-head'); const pc = frameCanvas(`char_${CHARS[pl.char].id}_p${tab + 1}`, 0, 150); if (pc) head.appendChild(pl.cos ? dressed(pc, pl.cos, true) : pc);
  const info = el('div'); info.appendChild(el('h1', null, pl.name.toUpperCase())); info.appendChild(el('p', null, `Turma ${pl.turma} · ${PLAYER_COLORS[tab].name} · ${PACK.title}`)); info.appendChild(el('p', null, `${new Date().toLocaleString('pt-BR')} · ${S.edition === 'premium' ? 'banco ampliado (itens sorteados)' : 'Forma de prova ' + pl.form} · ${S.auth.holder}`)); head.appendChild(info); root.appendChild(head);

  const kv = el('div', 'kv');
  [[`${total}/${nAns}`, 'ACERTOS NOS ITENS'], [fmt(avgDwell), 'TEMPO MÉDIO NA QUESTÃO'], [String(changes), 'TROCAS DE RESPOSTA'], [mp.label, 'CONTROLE DO PERSONAGEM'], [pl.readAloud || pl.readUses ? `${pl.readUses} uso(s)` : 'não usou', 'LEITURA EM VOZ ALTA'], [String(pl.score), 'PONTOS DE JOGO (NÃO VALEM)']].forEach(([a, b]) => { const d = el('div'); d.appendChild(el('b', null, a)); d.appendChild(el('span', null, b)); kv.appendChild(d); }); root.appendChild(kv);

  const grid = el('div', 'r-grid'); grid.style.marginTop = '12px';
  sum.forEach(({ sk, ans, n, tot, lv, tags }) => {
    const c = el('div', 'sk'); c.appendChild(el('h3', null, sk.code)); c.appendChild(el('div', 'nm', sk.short)); c.appendChild(el('span', 'lvl ' + lv.cls, lv.label));
    const dots = el('div', 'dots'); for (let i = 0; i < tot; i++) { const a = ans[i]; dots.appendChild(el('i', a ? (a.ok ? 'y' : 'n') : '', a ? (a.ok ? '✓' : '✗') : '·')); } c.appendChild(dots);
    const tip = el('div', null, `${n}/${tot} · ${lv.tip}`); tip.style.cssText = 'font-size:12px;color:#cfc9ff;font-weight:700'; c.appendChild(tip);
    if (tags.length) { const h = el('div', null, 'Equívocos identificados:'); h.style.cssText = 'margin-top:8px;font-size:12px;color:var(--pcl);font-weight:900'; c.appendChild(h); const ul = el('ul'); tags.forEach((t) => ul.appendChild(el('li', null, PACK.misconceptions[t]))); c.appendChild(ul); }
    grid.appendChild(c);
  }); root.appendChild(grid);

  const rd = el('div', 'panel'); rd.appendChild(el('h3', null, 'LEITURA PEDAGÓGICA')); const rp = el('p', null, reading(sum)); rp.style.cssText = 'margin:0;font-size:14px;line-height:1.5;font-weight:700'; rd.appendChild(rp); root.appendChild(rd);

  const tn = el('div', 'panel'); tn.appendChild(el('h3', null, 'TERMÔMETRO DE TENSÃO (EXPLORATÓRIO)'));
  const mt = el('p', null, `Antes: ${MOODS[pl.moodPre] || '—'}   →   Depois: ${MOODS[pl.moodPost] || '—'}`); mt.style.cssText = 'margin:0 0 4px;font-size:16px;font-weight:900'; tn.appendChild(mt);
  const mn = el('p', null, 'Autorrelato de 1 a 5, coletado antes e depois da aventura. Serve como dado para estudo da relação entre formato de jogo e tensão de prova; para pesquisa formal, usar escala validada (ex.: escala de ansiedade ao teste) em paralelo.'); mn.style.cssText = 'margin:0;font-size:12px;color:#cfc9ff;font-weight:700'; tn.appendChild(mn); root.appendChild(tn);

  const ctl = el('div', 'panel'); ctl.appendChild(el('h3', null, 'CONTROLE DO PERSONAGEM, APOIO E CHEFE (FORA DA PROVA)')); const c1 = el('p', null, mp.note); c1.style.cssText = 'margin:0 0 6px;font-size:13px;font-weight:700'; ctl.appendChild(c1);
  const asst = Object.entries(pl.stages).filter(([k]) => k !== 'train').map(([k, v]) => `${k.toUpperCase()}: ${v.assistMax ? 'apoio nível ' + v.assistMax : 'sem apoio'} · ${v.deaths} queda(s) · estrelas ${v.secrets}/${v.secretsTotal}${v.boss ? ' · chefe derrotado' : ''}`).join('   |   ');
  const c2 = el('p', null, 'O apoio adaptativo atua somente nos trechos de plataforma e na luta de chefe. Nas estações de pergunta tudo é igual para todos. ' + asst); c2.style.cssText = 'margin:0;font-size:12px;color:#cfc9ff;font-weight:700'; ctl.appendChild(c2); root.appendChild(ctl);

  const tb = el('div', 'panel'); tb.appendChild(el('h3', null, 'EVIDÊNCIAS POR ITEM')); const sc = el('div', 'scroll'); const t = el('table'); const hr = el('tr'); ['#', 'Habilidade', 'Resposta do aluno', 'Esperado', 'Trocas', 'Tempo'].forEach((h) => hr.appendChild(el('th', null, h))); t.appendChild(hr);
  pl.answers.slice().sort((a, b) => a.slot - b.slot).forEach((a) => { const r = el('tr'); [String(a.slot + 1), a.skill, (a.ok ? '✓ ' : '✗ ') + a.chosen, a.ok ? '—' : a.expected, String(a.changes), fmt(a.dwell)].forEach((v, i) => { const td = el('td', null, v); if (i === 2) td.style.color = a.ok ? 'var(--ok)' : '#ffb3c0'; r.appendChild(td); }); t.appendChild(r); });
  sc.appendChild(t); tb.appendChild(sc); root.appendChild(tb);

  const m = el('div', 'panel'); const d = el('details', 'm'); d.appendChild(el('summary', null, 'METODOLOGIA E REFERÊNCIAS')); const ul = el('ul');
  ['As perguntas chegam como "casos" da assistente do laboratório dentro da fase, e a resposta é uma ação do jogo: pisar no bloco. Não há pop-up, relógio nem aviso de certo/errado durante a prova.',
    'A posição da alternativa correta é balanceada e sorteada por aluno; os pontos do jogo não dependem do acerto (a gamificação não altera o resultado).',
    'Cada alternativa errada carrega uma tag de equívoco: o diagnóstico mostra o que o aluno provavelmente pensa, não só que errou.',
    'Calibragem no treino separa dificuldade de jogo de dificuldade conceitual. O apoio adaptativo e o chefe ficam fora das estações de pergunta; durante as perguntas a música fica calma.',
    'Leitura em voz alta disponível a todos (Desenho Universal para a Aprendizagem), reduzindo variância irrelevante ao construto (leitura) em uma avaliação de Ciências.',
    'O motor é neutro: troca-se o pacote de itens (JSON) para outra disciplina ou ano.',
    'Mislevy, R. J., Almond, R. G., & Lukas, J. F. (2003). A brief introduction to evidence-centered design. ETS Research Report RR-03-16.',
    'Shute, V. J. (2011). Stealth assessment in computer-based games to support learning. In S. Tobias & J. D. Fletcher (Eds.), Computer games and instruction (pp. 503–524). IAP.',
    'Habgood, M. P. J., & Ainsworth, S. E. (2011). Motivating children to learn effectively: exploring the value of intrinsic integration in educational games. Journal of the Learning Sciences, 20(2), 169–206.',
    'Sadler, P. M. (1998). Psychometric models of student conceptions in science. Journal of Research in Science Teaching, 35(3), 265–296.',
    'Hamari, J., Koivisto, J., & Sarsa, H. (2014). Does gamification work? A literature review of empirical studies on gamification. HICSS 47, 3025–3034.',
    'Messick, S. (1995). Validity of psychological assessment. American Psychologist, 50(9), 741–749.',
    'Cassady, J. C., & Johnson, R. E. (2002). Cognitive test anxiety and academic performance. Contemporary Educational Psychology, 27(2), 270–295.',
    'Habilidades: ' + PACK.source + '. (Referências sujeitas a conferência final de DOI/paginação antes de publicação.)'].forEach((s) => ul.appendChild(el('li', null, s))); d.appendChild(ul); m.appendChild(d); root.appendChild(m);

  const ac = el('div', 'r-act'); const mk = (txt, fn) => { const b = el('button', 'btn ghost', txt); b.addEventListener('click', fn); ac.appendChild(b); };
  mk('VER PAINEL DA TURMA (SIMULADO)', () => { window.open('/app/painel.html', '_blank', 'noopener'); }); mk('IMPRIMIR / SALVAR PDF', act.onPrint); mk('JOGAR DE NOVO', act.onReplay); mk('SAIR', act.onQuit); root.appendChild(ac);
  const foot = el('p', null, `© Thiago Silva · Licenciado para ${S.auth.holder} (${S.auth.licenseId}) · Protótipo de demonstração: os resultados não são gravados.`); foot.style.cssText = 'font-size:11px;color:var(--mute);margin-top:14px'; root.appendChild(foot);
}
