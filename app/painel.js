/* Painel da turma (BI) — DADOS SIMULADOS para demonstração. © Thiago Silva. */
import { PACK } from './js/items.js';
import { rng } from './js/art.js';

const r = rng(20261011); const $ = (id) => document.getElementById(id);
const TURMAS = ['6º A', '6º B', '6º C']; const SK = PACK.skills;
const LV = (n) => (n >= 3 ? 'a' : n === 2 ? 'b' : 'c'); const LVT = { a: 'Consolidada', b: 'Em desenvolvimento', c: 'Retomar' };
// probabilidade-base de acerto por turma × habilidade (simulação: turmas com perfis diferentes)
const P = { '6º A': [0.78, 0.7, 0.62], '6º B': [0.6, 0.55, 0.5], '6º C': [0.68, 0.46, 0.58] };
const students = [];
TURMAS.forEach((t) => { for (let i = 1; i <= 12; i++) {
  const ab = 0.7 + r() * 0.6; const row = { id: `Aluno ${String(students.length + 1).padStart(2, '0')}`, turma: t, sk: [], tags: [] };
  SK.forEach((sk, k) => { let n = 0; for (let q = 0; q < 3; q++) { const slot = PACK.slots[k * 3 + q]; const form = r() < 0.5 ? 'A' : 'B'; const ok = r() < Math.min(0.97, P[t][k] * ab); if (ok) n++; else { const d = slot.forms[form].opts.filter((o) => !o.ok); row.tags.push({ tag: d[Math.floor(r() * d.length)].m, slot: k * 3 + q, form }); } } row.sk.push(n); });
  row.tot = row.sk.reduce((a, b) => a + b, 0); row.risk = row.sk.filter((n) => n <= 1).length >= 2; students.push(row); } });

function kpis() {
  const cons = students.reduce((a, s) => a + s.sk.filter((n) => n === 3).length, 0) / (students.length * 3) * 100; const risk = students.filter((s) => s.risk).length;
  const avg = students.reduce((a, s) => a + s.tot, 0) / students.length;
  $('kpis').innerHTML = [[students.length, 'ALUNOS (3 TURMAS)'], [avg.toFixed(1) + '/9', 'MÉDIA DE ACERTOS'], [cons.toFixed(0) + '%', 'HABILIDADES CONSOLIDADAS'], [risk, 'ALUNOS EM RISCO']].map(([a, b]) => `<div class="kpi"><b>${a}</b><span>${b}</span></div>`).join('');
}
let sel = null;
function heat() {
  const col = (p) => `hsl(${Math.round(p * 1.2)},70%,${55 + (1 - p / 100) * 5}%)`; let h = '<div class="heat"><div class="h"></div>' + SK.map((s) => `<div class="h">${s.code}<br>${s.short}</div>`).join('');
  TURMAS.forEach((t) => { h += `<div class="h" style="align-self:center">${t}</div>`; SK.forEach((s, k) => { const g = students.filter((x) => x.turma === t); const p = g.filter((x) => x.sk[k] === 3).length / g.length * 100; h += `<div class="c ${sel && sel.t === t && sel.k === k ? 'sel' : ''}" data-t="${t}" data-k="${k}" style="background:${col(p)}">${p.toFixed(0)}%<small>${g.filter((x) => x.sk[k] === 3).length}/${g.length} alunos</small></div>`; }); });
  $('heat').innerHTML = h + '</div>';
  $('heat').querySelectorAll('.c').forEach((c) => c.addEventListener('click', () => { const t = c.dataset.t, k = +c.dataset.k; sel = sel && sel.t === t && sel.k === k ? null : { t, k }; heat(); stu(); }));
}
function dist() {
  $('dist').innerHTML = SK.map((s, k) => { const c = { a: 0, b: 0, c: 0 }; students.forEach((x) => c[LV(x.sk[k])]++); const T = students.length; return `<div class="lab">${s.code} <small>${s.short}</small></div><div class="bar">${['a', 'b', 'c'].map((q) => `<i class="${q}" style="width:${c[q] / T * 100}%">${c[q] ? c[q] : ''}</i>`).join('')}</div>`; }).join('') + `<p class="note"><span class="chip a">&nbsp;</span> Consolidada · <span class="chip b">&nbsp;</span> Em desenvolvimento · <span class="chip c">&nbsp;</span> Retomar</p>`;
}
function mis() {
  const cnt = {}; students.forEach((s) => s.tags.forEach((t) => { cnt[t.tag] = (cnt[t.tag] || 0) + 1; })); const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 8); const mx = top[0][1];
  $('mis').innerHTML = top.map(([tag, n]) => `<div class="mrow"><div class="t"><b>${tag}</b> · ${PACK.misconceptions[tag]} <small>(${n} ocorrências)</small></div><div class="m"><i style="width:${n / mx * 100}%"></i></div></div>`).join('');
}
function items() {
  let h = '<tr><th>Item</th><th>Habilidade</th><th>% acerto</th><th>Distrator mais escolhido</th></tr>';
  PACK.slots.forEach((sl, i) => { const k = Math.floor(i / 3); const ts = students.flatMap((s) => s.tags.filter((t) => t.slot === i).map((t) => t.tag)); const tot = students.length; const ok = tot - ts.length; const c = {}; ts.forEach((t) => { c[t] = (c[t] || 0) + 1; }); const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    h += `<tr><td>${i + 1}</td><td>${sl.skill}</td><td>${(ok / tot * 100).toFixed(0)}%</td><td>${top ? `${top[0]} (${top[1]})` : '—'}</td></tr>`; }); $('items').innerHTML = h;
}
function stu() {
  const tf = $('f-turma').value, rf = $('f-risk').value; let list = students.filter((s) => (!tf || s.turma === tf) && (!rf || s.risk) && (!sel || (s.turma === sel.t && s.sk[sel.k] === 3)));
  $('flt').textContent = `${list.length} aluno(s)` + (sel ? ` · ${sel.t} · ${SK[sel.k].code} consolidada` : '');
  $('stu').innerHTML = '<tr><th>Aluno</th><th>Turma</th>' + SK.map((s) => `<th>${s.code}</th>`).join('') + '<th>Total</th><th>Situação</th></tr>' + list.sort((a, b) => a.tot - b.tot).map((s) => `<tr><td>${s.id}</td><td>${s.turma}</td>` + s.sk.map((n) => `<td><span class="chip ${LV(n)}">${n}/3 · ${LVT[LV(n)]}</span></td>`).join('') + `<td>${s.tot}/9</td><td class="${s.risk ? 'risk' : ''}">${s.risk ? 'EM RISCO' : '—'}</td></tr>`).join('');
}
$('f-turma').innerHTML += TURMAS.map((t) => `<option>${t}</option>`).join(''); $('f-turma').onchange = $('f-risk').onchange = stu;
$('prt').onclick = () => window.print();
$('csv').onclick = () => { const rows = [['aluno', 'turma', ...SK.map((s) => s.code), 'total']].concat(students.map((s) => [s.id, s.turma, ...s.sk, s.tot])); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map((x) => x.join(';')).join('\n')], { type: 'text/csv' })); a.download = 'painel-simulado.csv'; a.click(); };
kpis(); heat(); dist(); mis(); items(); stu();
