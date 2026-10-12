/* Central de Gestão — Prova Arcade. © Thiago Silva. Sem dependências além de Chart.js e qrcode.js (locais). */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtD = (t) => (t ? new Date(t).toLocaleString('pt-BR') : '—');
  const MOODS = ['', 'Tranquilo(a)', 'Bem', 'Normal', 'Preocupado(a)', 'Muito tenso(a)'];
  const COL = { a: '#1fb26b', b: '#f1a31c', c: '#e5484d', pri: '#2f5bff', teal: '#10b4a4', grey: '#9aa6c6' };
  const lv = (n, t = 3) => (t >= 1 && n >= t ? 'a' : t >= 2 && n / t >= 0.5 ? 'b' : 'c'); const LVT = { a: 'Consolidada', b: 'Em desenvolvimento', c: 'Retomar' };
  const notaCls = (n) => (n >= 7 ? 'a' : n >= 5 ? 'b' : 'c');
  const ST = { state: null, rows: [], skills: [], mis: {}, apps: [], items: [], page: 'overview', sort: { k: 'ts', d: -1 }, pg: 0, q: '', page_size: 12 };
  const CH = {};
  if (window.Chart) { Chart.defaults.font.family = 'Nunito, system-ui, sans-serif'; Chart.defaults.font.weight = '700'; Chart.defaults.color = '#6a7595'; }
  const TITLES = { overview: ['Visão geral', 'Indicadores consolidados das aplicações'], results: ['Resultados', 'Resultado individual de cada aluno'], apps: ['Aplicações e QR Code', 'Gere o QR da sala e acompanhe as leituras'], reports: ['Relatórios e planilhas', 'Excel, PDF da turma e boletins individuais'], licenses: ['Licenças e uso', 'Quem usa, onde e quando; bloqueio em tempo real'], help: ['Ajuda e proteção de dados', 'Fluxo da aula e LGPD'] };

  async function call(url, body) {
    const r = await fetch(url, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.status === 401) { showLogin(); throw new Error('auth'); }
    return r.json();
  }
  const showLogin = () => { $('login').hidden = false; $('shell').hidden = true; };
  const qs = () => { const p = new URLSearchParams(); if ($('f-app').value) p.set('app', $('f-app').value); if ($('f-turma').value) p.set('turma', $('f-turma').value); if ($('f-sim').value !== '') p.set('sim', $('f-sim').value); return p.toString(); };

  /* ---------- login / navegação ---------- */
  $('lf').addEventListener('submit', async (e) => {
    e.preventDefault(); const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('pw').value }) });
    if (r.ok) { $('login').hidden = true; $('shell').hidden = false; load(); } else $('lmsg').textContent = r.status === 429 ? 'Muitas tentativas. Aguarde alguns minutos.' : 'Senha incorreta.';
  });
  $('logout').addEventListener('click', () => { document.cookie = 'adm=; Max-Age=0; path=/'; location.reload(); });
  document.querySelectorAll('#nav button').forEach((b) => b.addEventListener('click', () => go(b.dataset.page)));
  function go(p) {
    ST.page = p; document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.page === p)); document.querySelectorAll('.page').forEach((s) => s.classList.toggle('on', s.id === 'p-' + p));
    $('page-title').textContent = TITLES[p][0]; $('page-sub').textContent = TITLES[p][1]; $('filters').style.visibility = ['overview', 'results', 'reports'].includes(p) ? 'visible' : 'hidden'; render();
  }
  ['f-app', 'f-turma', 'f-sim'].forEach((id) => $(id).addEventListener('change', () => { ST.pg = 0; load(); })); $('f-reload').addEventListener('click', load);

  /* ---------- carga ---------- */
  async function load() {
    let r, s, a, it; try { [r, s, a, it] = await Promise.all([call('/api/admin/results?' + qs()), call('/api/admin/state'), call('/api/admin/applications'), call('/api/admin/item-stats?' + qs())]); } catch (e) { return; }
    ST.rows = r.rows; ST.skills = r.skills; ST.mis = r.misconceptions; ST.state = s; ST.apps = a.applications; ST.items = it.items;
    const fa = $('f-app'), ft = $('f-turma'); const ca = fa.value, ct = ft.value;
    fa.innerHTML = '<option value="">Todas</option>' + r.apps.map((x) => `<option value="${x.id}">${esc(x.title)}</option>`).join(''); fa.value = ca;
    call('/api/admin/results?sim=' + ($('f-sim').value)).then((all) => { const turmas = [...new Set(all.rows.map((x) => x.turma))].sort(); ft.innerHTML = '<option value="">Todas</option>' + turmas.map((t) => `<option>${esc(t)}</option>`).join(''); ft.value = ct; }).catch(() => {});
    const online = s.sessions.filter((x) => !x.revoked && s.now - x.last_seen < 120000).length; $('srv-status').innerHTML = `<span class="dot"></span> Servidor ativo · ${online} online`;
    render();
  }
  function render() { banner(); ({ overview, results, apps, reports, licenses, help })[ST.page](); }
  function banner() {
    const b = $('banner'); const n = ST.rows.length, sim = ST.rows.filter((x) => x.sim).length;
    if (!['overview', 'results', 'reports'].includes(ST.page)) { b.hidden = true; return; }
    if (!n) { b.hidden = false; b.innerHTML = 'Ainda não há resultados neste filtro. Gere o QR Code de uma turma e aplique a prova, ou carregue <b>dados simulados</b> em <a href="#" id="b-demo">Ajuda e proteção de dados</a> para ver o painel preenchido.'; const l = $('b-demo'); if (l) l.onclick = (e) => { e.preventDefault(); go('help'); }; }
    else if (sim) { b.hidden = false; b.innerHTML = `⚠ Esta visão inclui <b>${sim} resultado(s) SIMULADO(S)</b> (fictícios, só para demonstração).`; } else b.hidden = true;
  }
  const mk = (id, cfg) => { if (CH[id]) CH[id].destroy(); CH[id] = new Chart($(id), cfg); };
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const skN = (r, code) => (r.skills.find((x) => x.code === code) || { n: 0 }).n;
  const skT = (r, code) => (r.skills.find((x) => x.code === code) || {}).tot || 3;

  /* ---------- VISÃO GERAL ---------- */
  function overview() {
    const R = ST.rows, S = ST.skills, n = R.length; const st = ST.state;
    const cons = n ? R.reduce((a, r) => a + S.filter((s) => skN(r, s.code) === 3).length, 0) / (n * S.length) * 100 : 0; const risk = R.filter((r) => S.filter((s) => skN(r, s.code) <= 1).length >= 2).length;
    const apps = ST.apps; const act = apps.filter((a) => a.active && !(a.expires_at && a.expires_at < st.now)).length; const lic = st.licenses.filter((l) => l.state === 'ok').length; const online = st.sessions.filter((x) => !x.revoked && st.now - x.last_seen < 120000).length;
    const K = [['Alunos avaliados', n, `${R.filter((r) => !r.sim).length} reais`, COL.pri], ['Nota média', n ? avg(R.map((r) => r.nota)).toFixed(1) : '—', 'escala 0 a 10', COL.teal], ['Habilidades consolidadas', n ? cons.toFixed(0) + '%' : '—', 'todos os itens acertados', COL.a], ['Alunos em risco', risk, n ? Math.round(risk / n * 100) + '% da amostra' : '2+ habilidades a retomar', COL.c], ['Tempo médio', n ? (avg(R.map((r) => r.seconds)) / 60).toFixed(1) + ' min' : '—', 'por aluno', COL.b], ['Aplicações ativas', act + '/' + apps.length, 'QR Codes em uso', COL.pri], ['Licenças ativas', lic, `${st.licenses.length} cadastradas`, COL.teal], ['Online agora', online, 'sessões nos últimos 2 min', COL.a]];
    $('kpis').innerHTML = K.map(([t, v, s, c]) => `<div class="kpi" style="--c:${c}"><span>${t}</span><b>${v}</b><small>${s}</small></div>`).join('');
    const hist = Array(10).fill(0); R.forEach((r) => { hist[Math.min(9, Math.floor(r.nota))]++; });
    mk('c-hist', { type: 'bar', data: { labels: hist.map((_, i) => `${i}–${i + 1}`), datasets: [{ data: hist, backgroundColor: hist.map((_, i) => (i >= 7 ? COL.a : i >= 5 ? COL.b : COL.c)), borderRadius: 6 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef1f8' } }, x: { grid: { display: false }, title: { display: true, text: 'nota' } } } } });
    const lvl = (k) => S.map((s) => (n ? R.filter((r) => lv(skN(r, s.code), skT(r, s.code)) === k).length / n * 100 : 0));
    mk('c-levels', { type: 'bar', data: { labels: S.map((s) => s.code), datasets: [{ label: 'Consolidada', data: lvl('a'), backgroundColor: COL.a }, { label: 'Em desenvolvimento', data: lvl('b'), backgroundColor: COL.b }, { label: 'Retomar', data: lvl('c'), backgroundColor: COL.c }] }, options: { indexAxis: 'y', maintainAspectRatio: false, scales: { x: { stacked: true, max: 100, ticks: { callback: (v) => v + '%' }, grid: { color: '#eef1f8' } }, y: { stacked: true, grid: { display: false } } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.x.toFixed(0)}%` } } } } });
    const turmas = [...new Set(R.map((r) => r.turma))].sort(); const tm = turmas.map((t) => avg(R.filter((r) => r.turma === t).map((r) => r.nota)));
    mk('c-turma', { type: 'bar', data: { labels: turmas.map((t) => `${t} (${R.filter((r) => r.turma === t).length})`), datasets: [{ data: tm, backgroundColor: COL.pri, borderRadius: 6 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 10, grid: { color: '#eef1f8' } }, x: { grid: { display: false } } } } });
    // mapa de calor
    const col = (p) => `hsl(${Math.round(p * 1.15)},62%,${62 + (1 - p / 100) * 4}%)`; let h = '<div class="heat"><div class="h"></div>' + S.map((s) => `<div class="h">${s.code}<br>${esc(s.short)}</div>`).join('');
    turmas.forEach((t) => { const g = R.filter((r) => r.turma === t); h += `<div class="h tl" data-turma="${esc(t)}" title="Abrir o resultado da sala" style="align-self:center">${esc(t)} ›</div>`; S.forEach((s) => { const k = g.filter((r) => skN(r, s.code) === 3).length; const p = g.length ? k / g.length * 100 : 0; h += `<div class="c" style="background:${col(p)}">${p.toFixed(0)}%<small>${k}/${g.length}</small></div>`; }); });
    $('heat').innerHTML = turmas.length ? h + '</div>' : '<p class="muted">Sem dados.</p>';
    // equívocos
    const cnt = {}; R.forEach((r) => r.tags.forEach((t) => { cnt[t] = (cnt[t] || 0) + 1; })); const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 8);
    mk('c-mis', { type: 'bar', data: { labels: top.map(([t]) => t), datasets: [{ data: top.map(([, v]) => v), backgroundColor: COL.c, borderRadius: 6 }] }, options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: (c) => c[0].label, label: (c) => { const t = ST.mis[c.label] || ''; return [`${c.parsed.x} ocorrência(s)`, t.length > 90 ? t.slice(0, 90) + '…' : t]; } } } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef1f8' } }, y: { grid: { display: false } } } } });
    // por dia
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push(d); } const dc = days.map((d) => R.filter((r) => { const x = new Date(r.ts); x.setHours(0, 0, 0, 0); return +x === +d; }).length);
    mk('c-days', { type: 'line', data: { labels: days.map((d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })), datasets: [{ data: dc, borderColor: COL.pri, backgroundColor: 'rgba(47,91,255,.12)', fill: true, tension: .35, pointRadius: 3 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef1f8' } }, x: { grid: { display: false } } } } });
    // tensão
    const pre = [0, 0, 0, 0, 0], post = [0, 0, 0, 0, 0]; R.forEach((r) => { if (r.mood_pre) pre[r.mood_pre - 1]++; if (r.mood_post) post[r.mood_post - 1]++; }); const pairs = R.filter((r) => r.mood_pre && r.mood_post);
    mk('c-mood', { type: 'bar', data: { labels: MOODS.slice(1), datasets: [{ label: 'Antes', data: pre, backgroundColor: COL.grey, borderRadius: 5 }, { label: 'Depois', data: post, backgroundColor: COL.teal, borderRadius: 5 }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef1f8' } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } } });
    $('mood-note').textContent = pairs.length ? `Média antes ${avg(pairs.map((r) => r.mood_pre)).toFixed(2)} → depois ${avg(pairs.map((r) => r.mood_post)).toFixed(2)} (n=${pairs.length}; 1 = tranquilo, 5 = muito tenso). Descritivo: não prova efeito.` : 'Sem pares antes/depois.';
    // itens
    $('t-items').innerHTML = '<thead><tr><th>Item</th><th>Hab.</th><th>n</th><th>Dificuldade (% acerto)</th><th>Discrim. (r)</th><th>Não sei</th><th>Tempo</th><th>Distrator</th><th>Parecer</th></tr></thead><tbody>' + (ST.items.length ? ST.items.map((i) => `<tr><td>${i.slot + 1}${i.form}</td><td>${i.skill.slice(-2)}</td><td>${i.n}</td><td>${i.pct == null ? '—' : `<span class="tag t-${i.pct < 35 ? 'c' : i.pct > 90 ? 'b' : 'a'}">${i.pct}%</span>`}</td><td>${i.r == null ? '—' : i.r}</td><td>${i.idkPct == null ? '—' : i.idkPct + '%'}</td><td>${i.dwell == null ? '—' : i.dwell + ' s'}</td><td>${i.topTag ? `${i.topTag} (${i.topN})` : '—'}</td><td>${i.flag}</td></tr>`).join('') : '<tr><td colspan="9">Sem respostas ainda.</td></tr>') + '</tbody><caption style="caption-side:bottom;text-align:left;font-size:12px;opacity:.75;padding-top:6px">Teoria Clássica dos Testes: dificuldade = proporção de acertos; discriminação = correlação ponto-bisserial do item com o restante da prova (≥0,20 é desejável). Só é confiável com n≥30 por item — para comprovar que a dificuldade é adequada à série é preciso aplicar a um piloto de alunos reais.</caption>';
  }

  /* ---------- RESULTADOS ---------- */
  function sortedRows() {
    const q = ST.q.trim().toLowerCase(); let R = ST.rows.filter((r) => !q || `${r.name} ${r.turma} ${r.app_title}`.toLowerCase().includes(q)); const { k, d } = ST.sort; const val = (r) => (k === 'name' || k === 'turma' || k === 'app_title' ? String(r[k] || '').toLowerCase() : r[k]);
    R = R.slice().sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * d); return R;
  }
  function results() {
    const R = sortedRows(); const pages = Math.max(1, Math.ceil(R.length / ST.page_size)); ST.pg = Math.min(ST.pg, pages - 1); const view = R.slice(ST.pg * ST.page_size, ST.pg * ST.page_size + ST.page_size); const S = ST.skills;
    const th = (k, t) => `<th class="s" data-k="${k}">${t}${ST.sort.k === k ? (ST.sort.d > 0 ? ' ▲' : ' ▼') : ''}</th>`;
    $('t-res').innerHTML = `<thead><tr>${th('name', 'Aluno')}${th('turma', 'Turma')}${th('app_title', 'Aplicação')}${th('nota', 'Nota')}${S.map((s) => `<th>${s.code}</th>`).join('')}<th>Tensão</th>${th('score', 'Pontos')}<th>Origem</th>${th('ts', 'Data')}</tr></thead><tbody>` +
      view.map((r) => `<tr class="click" data-id="${r.id}"><td><b>${esc(r.name)}</b></td><td>${esc(r.turma)}</td><td>${esc(r.app_title)}</td><td><span class="nota t-${notaCls(r.nota)}">${r.nota.toFixed(1)}</span></td>${S.map((s) => { const n = skN(r, s.code), tt = skT(r, s.code); return `<td><span class="tag t-${lv(n, tt)}">${n}/${tt}</span></td>`; }).join('')}<td>${r.mood_pre ? ['😄', '🙂', '😐', '😟', '😣'][r.mood_pre - 1] : '–'} → ${r.mood_post ? ['😄', '🙂', '😐', '😟', '😣'][r.mood_post - 1] : '–'}</td><td>${r.score}</td><td>${r.sim ? '<span class="tag t-sim">SIMULADO</span>' : 'Real'}</td><td>${fmtD(r.ts)}</td></tr>`).join('') + '</tbody>';
    $('count').textContent = `${R.length} resultado(s)`; $('pg-info').textContent = `Página ${ST.pg + 1} de ${pages}`; $('dl-xlsx').href = '/api/admin/export.xlsx?' + qs();
    $('t-res').querySelectorAll('th.s').forEach((h) => h.addEventListener('click', () => { ST.sort = { k: h.dataset.k, d: ST.sort.k === h.dataset.k ? -ST.sort.d : 1 }; results(); }));
    $('t-res').querySelectorAll('tr.click').forEach((tr) => tr.addEventListener('click', () => openStudent(+tr.dataset.id)));
  }
  $('q').addEventListener('input', (e) => { ST.q = e.target.value; ST.pg = 0; results(); }); $('pg-prev').onclick = () => { ST.pg = Math.max(0, ST.pg - 1); results(); }; $('pg-next').onclick = () => { ST.pg++; results(); };
  const detailHtml = (d, forPrint) => {
    const S = d.skills; const items = (d.data.items || []).slice().sort((a, b) => a.slot - b.slot); const stg = d.data.stages || {};
    let h = `<div class="dh"><div class="big t-${notaCls(d.nota)} nota">${d.nota.toFixed(1)}</div><div><h2>${esc(d.name)}</h2><div class="muted">Turma ${esc(d.turma)} · Forma ${d.form} · ${esc(d.app_title)} · ${fmtD(d.ts)}${d.sim ? ' · <b>SIMULADO</b>' : ''}</div><div class="muted">${d.acertos} de ${d.total || 9} itens corretos · pontos de jogo ${d.score} (não entram na nota)</div></div></div>`;
    h += '<div class="sk3">' + S.map((s) => { const code = s.code; const n = (d.skills.find((x) => x.code === code) || {}).n; const info = ST.skills.find((x) => x.code === code) || {}; return `<div><b>${code}</b><div>${esc(info.short || '')}</div><div class="tag t-${lv(s.n, s.tot || 3)}">${s.n}/${s.tot || 3} · ${LVT[lv(s.n, s.tot || 3)]}</div></div>`; }).join('') + '</div>';
    h += `<p><b>Termômetro de tensão:</b> ${MOODS[d.mood_pre] || '—'} → ${MOODS[d.mood_post] || '—'} · <b>Leitura em voz alta:</b> ${d.data.readUses ? d.data.readUses + ' uso(s)' : 'não usou'} · <b>Treino:</b> ${d.data.motor ? `${d.data.motor.seconds}s, ${d.data.motor.deaths} queda(s)` : '—'}</p>`;
    const stl = Object.entries(stg).filter(([k]) => k !== 'train').map(([k, v]) => `${k.toUpperCase()}: ${v.hits} dano(s), ${v.deaths} morte(s), estrelas ${v.secrets}/${v.secretsTotal}${v.secretRoom ? ', fase secreta' : ''}${v.boss ? ', chefe derrotado' : ''}${v.assistMax ? ', apoio nível ' + v.assistMax : ''}`).join(' | '); if (stl) h += `<p class="muted"><b>Jogo:</b> ${esc(stl)}</p>`;
    h += '<h3 style="margin:12px 0 4px">Itens</h3>' + items.map((i) => `<div class="item ${i.ok ? 'good' : 'bad'}"><b>Item ${i.slot + 1} · ${i.skill}</b> ${i.ok ? '<span class="tag t-a">correto</span>' : '<span class="tag t-c">incorreto</span>'}${i.ctx ? `<p class="muted">${esc(i.ctx)}</p>` : ''}<p><b>${esc(i.stem)}</b></p><p><b>Respondeu:</b> ${esc(i.chosen)}</p>${i.ok ? '' : `<p><b>Esperado:</b> ${esc(i.expected)}</p><p class="err"><b>Provável equívoco:</b> ${esc(d.misconceptions[i.tag] || '—')}</p>`}<p class="muted">${i.changes} troca(s) de resposta · ${Number(i.dwell).toFixed(1)} s na questão</p></div>`).join('');
    void forPrint; return h;
  };

  /* ---------- MODAIS: resultado individual e resultado da sala ---------- */
  let modalPrint = null;
  function openModal(title, html, onPrint) { $('modal-title').textContent = title; $('modal-body').innerHTML = html; $('modal').hidden = false; modalPrint = onPrint || null; $('modal-print').hidden = !onPrint; $('modal-body').scrollTop = 0; document.body.style.overflow = 'hidden'; }
  function closeModal() { $('modal').hidden = true; document.body.style.overflow = ''; }
  $('modal-x').onclick = $('modal-bg').onclick = closeModal; document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('modal').hidden) closeModal(); }); $('modal-print').onclick = () => { if (modalPrint) modalPrint(); };
  const SUG = {
    EF06CI08: 'Retomar com atividade prática: lupa/lentes e uma fonte de luz (convergente × divergente), esquema do olho (cristalino e retina) e a diferença entre captar a luz e interpretar a imagem no cérebro. Discutir miopia × hipermetropia com casos.',
    EF06CI09: 'Retomar com um modelo de braço (papelão e elásticos) mostrando músculos em pares; esquema nervo → músculo → osso; vídeos de movimento e de reflexo para ligar os três sistemas.',
    EF06CI10: 'Retomar com roda de conversa orientada: o que são substâncias psicoativas (cafeína, álcool, nicotina), efeito no tempo de reação, dependência e o mito "legal = seguro". Usar o teste de tempo de reação como experimento.',
  };
  const skillOfTag = (t) => ({ V: 0, L: 0, E: 1, M: 1, N: 1, P: 2 }[String(t)[0]]);
  async function openStudent(id) {
    const d = await call('/api/admin/result/' + id); const S = ST.skills;
    const weak = d.skills.map((s) => ({ s, info: S.find((x) => x.code === s.code) || {} })).filter((x) => x.s.n < (x.s.tot || 3));
    const defas = weak.length ? '<h3 style="margin:14px 0 4px">Habilidades em defasagem deste aluno</h3>' + weak.map((x) => `<div class="item ${x.s.n / (x.s.tot || 3) < 0.5 ? 'bad' : ''}"><b>${x.s.code} · ${esc(x.info.short || '')}</b> <span class="tag t-${lv(x.s.n, x.s.tot || 3)}">${x.s.n}/${x.s.tot || 3} · ${LVT[lv(x.s.n, x.s.tot || 3)]}</span><p class="muted">${esc(SUG[x.s.code] || '')}</p></div>`).join('') : '<p class="ok"><b>Nenhuma habilidade em defasagem neste aluno.</b></p>';
    openModal('Resultado individual · ' + d.name, detailHtml(d) + defas, () => printBoletins([d]));
  }
  function classData(turma) {
    const R = ST.rows.filter((r) => !turma || r.turma === turma); const S = ST.skills; const n = R.length; if (!n) return null;
    const notas = R.map((r) => r.nota).sort((a, b) => a - b); const med = n % 2 ? notas[(n - 1) / 2] : (notas[n / 2 - 1] + notas[n / 2]) / 2;
    const skills = S.map((s, k) => {
      const cA = R.filter((r) => skN(r, s.code) === 3), cB = R.filter((r) => skN(r, s.code) === 2), cC = R.filter((r) => skN(r, s.code) <= 1); const tags = {}; R.forEach((r) => r.tags.forEach((t) => { if (skillOfTag(t) === k) tags[t] = (tags[t] || 0) + 1; }));
      const pctNot = (cB.length + cC.length) / n * 100; const pr = pctNot >= 60 ? 'c' : pctNot >= 40 ? 'b' : 'a';
      return { code: s.code, short: s.short, a: cA.length, b: cB.length, c: cC.length, pctNot, pctRet: cC.length / n * 100, pr, tags: Object.entries(tags).sort((x, y) => y[1] - x[1]).slice(0, 3), retomar: cC.map((r) => r.name), desenv: cB.map((r) => r.name), sug: SUG[s.code] || '' };
    }).sort((x, y) => y.pctNot - x.pctNot || y.pctRet - x.pctRet);
    return { turma, R, n, avg: avg(R.map((r) => r.nota)), med, risk: R.filter((r) => S.filter((s) => skN(r, s.code) <= 1).length >= 2).length, skills, sim: R.filter((r) => r.sim).length };
  }
  const PRT = { c: ['PRIORIDADE ALTA', 'c'], b: ['ATENÇÃO', 'b'], a: ['SOB CONTROLE', 'a'] };
  function classHtml(cd, items) {
    const pct = (v) => Math.round(v);
    let h = `<div class="kp3"><div><span>Alunos</span><b>${cd.n}</b></div><div><span>Nota média</span><b>${cd.avg.toFixed(1)}</b></div><div><span>Mediana</span><b>${cd.med.toFixed(1)}</b></div><div><span>Alunos em risco</span><b>${cd.risk}</b><small>${pct(cd.risk / cd.n * 100)}% da sala</small></div></div>`;
    if (cd.sim) h += `<div class="sim">Inclui ${cd.sim} resultado(s) SIMULADO(S) (fictícios).</div>`;
    h += '<h3 style="margin:16px 0 8px">Habilidades em defasagem · prioridade para a próxima aula</h3>';
    h += cd.skills.map((s, i) => `<div class="skrow"><div class="skhead"><b>${i + 1}º · ${s.code}</b> ${esc(s.short)} <span class="tag t-${PRT[s.pr][1]}">${PRT[s.pr][0]}</span><span class="muted"> ${s.b + s.c} de ${cd.n} alunos não consolidaram (${pct(s.pctNot)}%)</span></div>
      <div class="stack"><i class="a" style="width:${s.a / cd.n * 100}%">${s.a || ''}</i><i class="b" style="width:${s.b / cd.n * 100}%">${s.b || ''}</i><i class="c" style="width:${s.c / cd.n * 100}%">${s.c || ''}</i></div>
      <div class="legend"><span class="tag t-a">Consolidada ${s.a}</span> <span class="tag t-b">Em desenvolvimento ${s.b}</span> <span class="tag t-c">Retomar ${s.c}</span></div>
      ${s.tags.length ? `<p><b>Onde erram:</b> ${s.tags.map(([t, k]) => `<span class="mis"><b>${t}</b> ${esc(ST.mis[t] || '')} <em>(${k}×)</em></span>`).join(' ')}</p>` : ''}
      ${s.retomar.length ? `<p><b>Retomar (0–1/3):</b> ${s.retomar.map(esc).join(', ')}</p>` : ''}${s.desenv.length ? `<p><b>Em desenvolvimento (2/3):</b> ${s.desenv.map(esc).join(', ')}</p>` : ''}
      ${s.pr !== 'a' ? `<p class="sug"><b>Sugestão para a aula:</b> ${esc(s.sug)}</p>` : ''}</div>`).join('');
    if (items && items.length) h += '<h3 style="margin:16px 0 6px">Itens (nesta sala)</h3><table><tr><th>Item</th><th>Habilidade</th><th>% de acerto</th><th>Distrator mais escolhido</th></tr>' + items.map((i) => `<tr><td>${i.slot + 1}</td><td>${i.skill}</td><td>${i.pct == null ? '—' : `<span class="tag t-${i.pct < 35 ? 'c' : i.pct < 60 ? 'b' : 'a'}">${i.pct}%</span>`}</td><td>${i.topTag ? `${i.topTag} (${i.topN}×)` : '—'}</td></tr>`).join('') + '</table>';
    h += '<h3 style="margin:16px 0 6px">Resultado de cada aluno</h3><table><tr><th>Aluno</th><th>Turma</th><th>Nota</th>' + ST.skills.map((s) => `<th>${s.code}</th>`).join('') + '</tr>' + cd.R.slice().sort((a, b) => b.nota - a.nota).map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.turma)}</td><td><b>${r.nota.toFixed(1)}</b></td>${ST.skills.map((s) => { const k = skN(r, s.code), tt = skT(r, s.code); return `<td><span class="tag t-${lv(k, tt)}">${k}/${tt}</span></td>`; }).join('')}</tr>`).join('') + '</table>';
    return h;
  }
  async function openClass(turma) {
    const t = turma === undefined ? $('f-turma').value : turma; const cd = classData(t); const turmas = [...new Set(ST.rows.map((r) => r.turma))].sort();
    const head = `<div class="mfilter"><label>Sala <select id="m-turma"><option value="">Todas as turmas</option>${turmas.map((x) => `<option ${x === t ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label></div>`;
    if (!cd) { openModal('Resultado da sala', head + '<p class="muted">Sem resultados neste filtro.</p>'); $('m-turma').onchange = (e) => openClass(e.target.value); return; }
    const p = new URLSearchParams(); if (t) p.set('turma', t); if ($('f-app').value) p.set('app', $('f-app').value); if ($('f-sim').value !== '') p.set('sim', $('f-sim').value);
    let items = []; try { items = (await call('/api/admin/item-stats?' + p.toString())).items; } catch (e) { /* ok */ }
    openModal('Resultado da sala · ' + (t || 'todas as turmas'), head + classHtml(cd, items), () => printClassSala(cd, items));
    $('m-turma').onchange = (e) => openClass(e.target.value);
  }
  function printClassSala(cd, items) {
    $('print').innerHTML = `<div class="pp"><h1>Resultado da sala — ${esc(cd.turma || 'todas as turmas')}</h1><div class="meta">${esc(PACKTITLE)} · gerado em ${new Date().toLocaleString('pt-BR')} · habilidades em defasagem ordenadas por prioridade</div>${classHtml(cd, items)}<p class="meta" style="margin-top:14px">Leitura indicativa (3 itens por habilidade). Responsável: ______________________ Data: ___/___/_____ · © Thiago Silva — Prova Arcade. Dados de estudantes: uso restrito (LGPD).</p></div>`; setTimeout(() => window.print(), 250);
  }
  $('open-class').onclick = () => openClass(); $('rep-sala').onclick = () => openClass();
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-turma]'); if (t) openClass(t.dataset.turma); });

  /* ---------- APLICAÇÕES E QR ---------- */
  let lastApp = null; try { $('a_base').value = localStorage.getItem('pa_base') || location.origin; } catch (e) { $('a_base').value = location.origin; }
  const joinUrl = (tok) => $('a_base').value.replace(/\/+$/, '') + '/q/' + tok;
  const qrSvg = (url) => { const q = qrcode(0, 'M'); q.addData(url); q.make(); return q.createSvgTag({ cellSize: 8, margin: 2, scalable: true }); };
  function showQr(a) {
    lastApp = a; const url = joinUrl(a.token); $('qrout').hidden = false; $('qrimg').innerHTML = qrSvg(url); $('qrtitle').textContent = a.title + ' · ' + (a.len === 'full' ? 'Completo' : 'Demo rápido'); $('qrlink').value = url;
    const local = /localhost|127\.0\.0\.1|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.\d+\.|10\.\d+\./.test(url) || !/^https:/.test(url); $('a_warn').className = local ? 'warn bad' : 'warn'; $('a_warn').innerHTML = local ? '<b>⚠ ESTE QR NÃO ABRE NO CELULAR COM INTERNET MÓVEL.</b> O endereço aponta para este computador (' + esc(url.split('/q/')[0]) + '). Só funciona em celulares no <u>mesmo Wi-Fi</u> deste PC. Para a turma usar com dados móveis ou Wi-Fi da escola, publique o jogo na internet (veja <b>PUBLICAR_NA_NUVEM.md</b>) e digite aqui o endereço público https://… e gere o QR de novo.' : '';
  }
  function apps() {
    const s = ST.state; const sel = $('a_lic'); const cur = sel.value; sel.innerHTML = s.licenses.filter((l) => l.state === 'ok').map((l) => `<option value="${l.id}">${esc(l.holder)} (${l.id})</option>`).join(''); if (cur) sel.value = cur;
    $('ta').innerHTML = '<thead><tr><th>Aplicação</th><th>Tipo / destinatário</th><th>Licença</th><th>Modo</th><th>Aberturas</th><th>Aparelhos</th><th>Resultados</th><th>Validade</th><th>Situação</th><th></th></tr></thead><tbody>' + ST.apps.map((a) => { const exp = a.expires_at && a.expires_at < s.now; const nres = ST.rows.filter((r) => r.app_id === a.id).length; return `<tr><td><b>${esc(a.title)}</b></td><td>${a.kind === 'demo' ? '<span class="tag t-a">DEMO</span> ' + esc(a.recipient) : 'Sala'}</td><td>${esc(a.holder || a.license_id)}</td><td>${a.len === 'full' ? 'Completo' : 'Rápido'}</td><td>${a.uses}</td><td>${a.devices}${a.max_dev ? '/' + a.max_dev : ''}</td><td>${nres}</td><td>${a.expires_at ? fmtD(a.expires_at) : 'sem prazo'}</td><td><span class="tag t-${a.active && !exp ? 'ok' : 'blocked'}">${exp ? 'EXPIRADA' : a.active ? 'ATIVA' : 'PAUSADA'}</span></td><td><button class="btn ghost sm" data-acc="${a.id}" data-title="${esc(a.title)}">Quem abriu</button> <button class="btn ghost sm" data-qr="${a.id}" data-tok="${a.token}" data-title="${esc(a.title)}" data-len="${a.len}">Ver QR</button> <button class="btn ghost sm" data-app="toggle" data-id="${a.id}">${a.active ? 'Pausar' : 'Ativar'}</button> <button class="btn red sm" data-app="delete" data-id="${a.id}">Excluir</button></td></tr>`; }).join('') + '</tbody>';
  }
  fetch('/api/admin/netinfo').then((r) => r.json()).then((n) => { const el = document.createElement('p'); el.className = 'muted'; el.innerHTML = 'Endereços deste computador na rede (só valem no mesmo Wi-Fi): ' + n.ips.map((x) => `<code>http://${x.ip}:${n.port}</code>`).join(' · '); $('a_warn').before(el); }).catch(() => {});
  $('a_kind').addEventListener('change', () => { const d = $('a_kind').value === 'demo'; $('a_rec_w').hidden = !d; $('a_md_w').hidden = !d; });
  document.addEventListener('click', async (e) => { const b = e.target.closest('button[data-acc]'); if (!b) return; const r = await fetch(`/api/admin/application/${b.dataset.acc}/access`).then((x) => x.json()); openModal('Quem abriu · ' + b.dataset.title, `<p class="muted">Cada linha é uma abertura do link. Aparelho = identificador anônimo do navegador. Use para ver se o link foi repassado (muitos aparelhos/IPs diferentes).</p><div class="scroll"><table><thead><tr><th>Quando</th><th>Último sinal</th><th>IP</th><th>Aparelho</th><th>Navegador</th></tr></thead><tbody>${r.rows.map((x) => `<tr><td>${fmtD(x.created_at)}</td><td>${fmtD(x.last_seen)}</td><td>${esc(x.ip)}</td><td>${esc(x.device)}</td><td>${esc((x.ua || '').slice(0, 60))}</td></tr>`).join('') || '<tr><td colspan="5">Ninguém abriu ainda.</td></tr>'}</tbody></table></div>`); });
  $('af').addEventListener('submit', async (e) => { e.preventDefault(); try { localStorage.setItem('pa_base', $('a_base').value); } catch (x) { /* ok */ } const j = await call('/api/admin/application', { licenseId: $('a_lic').value, title: $('a_title').value, len: $('a_len').value, hours: $('a_hours').value, kind: $('a_kind').value, recipient: $('a_rec').value, maxDev: $('a_md').value }); if (j.token) { showQr({ id: j.id, token: j.token, title: $('a_title').value, len: $('a_len').value }); $('a_title').value = ''; await load(); } });
  $('qr-copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('qrlink').value); $('qr-copy').textContent = 'Copiado!'; setTimeout(() => { $('qr-copy').textContent = 'Copiar link'; }, 1500); } catch (e) { $('qrlink').select(); } });
  $('qr-png').addEventListener('click', () => { const svg = $('qrimg').querySelector('svg'); const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 1024, 1024); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, 1024, 1024); const a = document.createElement('a'); a.download = 'qr-prova-arcade.png'; a.href = c.toDataURL('image/png'); a.click(); }; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"')); });
  $('qr-print').addEventListener('click', () => {
    if (!lastApp) return; const url = $('qrlink').value; const w = window.open('', '_blank'); if (!w) { alert('Permita pop-ups para imprimir o cartaz.'); return; }
    w.document.write(`<!doctype html><meta charset="utf-8"><title>Cartaz · ${esc(lastApp.title)}</title><style>body{font-family:system-ui,Segoe UI,sans-serif;text-align:center;margin:0;padding:28px;color:#14102e}h1{font-size:46px;margin:10px 0 0}h2{font-size:26px;margin:6px 0 18px;color:#2f6bff}.q{width:560px;height:560px;margin:10px auto;padding:14px;border:10px solid #14102e;border-radius:28px}.q svg{width:100%;height:100%}p{font-size:22px;margin:10px 0}.u{font:600 16px ui-monospace,Consolas,monospace;color:#555;word-break:break-all}.s{display:flex;justify-content:center;gap:26px;margin:18px 0;font-size:22px}.s b{display:block;font-size:36px}</style><h1>PROVA ARCADE</h1><h2>${esc(lastApp.title)}</h2><div class="q">${$('qrimg').innerHTML}</div><div class="s"><div><b>1</b>Abra a câmera do celular</div><div><b>2</b>Aponte para o QR</div><div><b>3</b>Toque no link e jogue!</div></div><p>Use o celular na <b>horizontal</b>. Não precisa instalar nada.</p><p class="u">${esc(url)}</p>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
  });

  /* ---------- RELATÓRIOS ---------- */
  function reports() { $('rep-xlsx').href = '/api/admin/export.xlsx?' + qs(); }
  $('rep-class').onclick = () => printClass(); $('print-class').onclick = () => printClass();
  $('rep-bol').onclick = async () => { const rows = ST.rows.slice(0, 80); if (!rows.length) return alert('Não há resultados neste filtro.'); const ds = await Promise.all(rows.map((r) => call('/api/admin/result/' + r.id))); printBoletins(ds); };
  function chartImg(cfg, w = 560, h = 240) {
    const wrap = document.createElement('div'); wrap.style.cssText = `position:fixed;left:-9999px;top:0;width:${w}px;height:${h}px;background:#fff`; const cv = document.createElement('canvas'); wrap.appendChild(cv); document.body.appendChild(wrap);
    cfg.options = Object.assign({ animation: false, responsive: false, maintainAspectRatio: false, devicePixelRatio: 2 }, cfg.options || {}); cv.width = w; cv.height = h; const c = new Chart(cv, cfg); const img = c.toBase64Image(); c.destroy(); wrap.remove(); return img;
  }
  function printClass() {
    const R = sortedRows(); if (!R.length) return alert('Não há resultados neste filtro.'); const S = ST.skills; const n = R.length; const sim = R.filter((r) => r.sim).length;
    const hist = Array(10).fill(0); R.forEach((r) => { hist[Math.min(9, Math.floor(r.nota))]++; }); const lvl = (k) => S.map((s) => R.filter((r) => lv(skN(r, s.code), skT(r, s.code)) === k).length / n * 100);
    const imgH = chartImg({ type: 'bar', data: { labels: hist.map((_, i) => `${i}–${i + 1}`), datasets: [{ data: hist, backgroundColor: hist.map((_, i) => (i >= 7 ? COL.a : i >= 5 ? COL.b : COL.c)) }] }, options: { plugins: { legend: { display: false }, title: { display: true, text: 'Distribuição das notas' } }, scales: { y: { ticks: { precision: 0 } } } } });
    const imgL = chartImg({ type: 'bar', data: { labels: S.map((s) => s.code), datasets: [{ label: 'Consolidada', data: lvl('a'), backgroundColor: COL.a }, { label: 'Em desenvolvimento', data: lvl('b'), backgroundColor: COL.b }, { label: 'Retomar', data: lvl('c'), backgroundColor: COL.c }] }, options: { indexAxis: 'y', plugins: { title: { display: true, text: 'Níveis por habilidade (%)' } }, scales: { x: { stacked: true, max: 100 }, y: { stacked: true } } } });
    const cnt = {}; R.forEach((r) => r.tags.forEach((t) => { cnt[t] = (cnt[t] || 0) + 1; })); const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const turmas = [...new Set(R.map((r) => r.turma))].sort();
    const html = `<div class="pp"><h1>Prova Arcade — Relatório da turma</h1><div class="meta">${esc(PACKTITLE)} · gerado em ${new Date().toLocaleString('pt-BR')} · ${n} aluno(s)${$('f-app').selectedOptions[0] && $('f-app').value ? ' · ' + esc($('f-app').selectedOptions[0].textContent) : ''}${$('f-turma').value ? ' · turma ' + esc($('f-turma').value) : ''}</div>${sim ? `<div class="sim">Este relatório inclui ${sim} resultado(s) SIMULADO(S) (fictícios).</div>` : ''}
      <div class="kp"><div><span>Nota média</span><b>${avg(R.map((r) => r.nota)).toFixed(1)}</b></div><div><span>Habilidades consolidadas</span><b>${(R.reduce((a, r) => a + S.filter((s) => skN(r, s.code) === 3).length, 0) / (n * S.length) * 100).toFixed(0)}%</b></div><div><span>Alunos em risco</span><b>${R.filter((r) => S.filter((s) => skN(r, s.code) <= 1).length >= 2).length}</b></div><div><span>Tempo médio</span><b>${(avg(R.map((r) => r.seconds)) / 60).toFixed(1)} min</b></div></div>
      <div class="two"><img src="${imgH}"><img src="${imgL}"></div>
      <h2>Média por turma e mapa de calor</h2><table><tr><th>Turma</th><th>Alunos</th><th>Nota média</th>${S.map((s) => `<th>${s.code} consolidada</th>`).join('')}</tr>${turmas.map((t) => { const g = R.filter((r) => r.turma === t); return `<tr><td>${esc(t)}</td><td>${g.length}</td><td>${avg(g.map((r) => r.nota)).toFixed(1)}</td>${S.map((s) => `<td>${(g.filter((r) => skN(r, s.code) === 3).length / g.length * 100).toFixed(0)}%</td>`).join('')}</tr>`; }).join('')}</table>
      <h2>Equívocos mais frequentes (onde começar a intervenção)</h2><table><tr><th>Cód.</th><th>O que o aluno provavelmente pensa</th><th>Ocorr.</th></tr>${top.map(([t, v]) => `<tr><td>${t}</td><td>${esc(ST.mis[t] || '')}</td><td>${v}</td></tr>`).join('')}</table></div>
      <div class="pp"><h1>Alunos</h1><div class="meta">Nota = acertos ÷ itens respondidos × 10 · Consolidada = todos os itens da habilidade · Em desenvolvimento = metade ou mais · Retomar = menos da metade · Leitura indicativa.</div><table><tr><th>Aluno</th><th>Turma</th><th>Nota</th>${S.map((s) => `<th>${s.code}</th>`).join('')}<th>Tensão</th></tr>${R.slice().sort((a, b) => a.turma.localeCompare(b.turma) || a.name.localeCompare(b.name)).map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.turma)}</td><td><b>${r.nota.toFixed(1)}</b></td>${S.map((s) => { const k = skN(r, s.code), tt = skT(r, s.code); return `<td>${k}/${tt} ${LVT[lv(k, tt)]}</td>`; }).join('')}<td>${MOODS[r.mood_pre] || '–'} → ${MOODS[r.mood_post] || '–'}</td></tr>`).join('')}</table><p class="meta" style="margin-top:14px">Responsável: ______________________________ &nbsp; Data: ___/___/_____ &nbsp;&nbsp; © Thiago Silva — Prova Arcade. Dados de estudantes: uso restrito (LGPD).</p></div>`;
    $('print').innerHTML = html; setTimeout(() => window.print(), 250);
  }
  const PACKTITLE = 'Ciências · 6º ano · 3º bimestre';
  function printBoletins(ds) {
    $('print').innerHTML = ds.map((d) => `<div class="pp"><h1>Boletim diagnóstico — ${esc(d.name)}</h1><div class="meta">${esc(PACKTITLE)} · ${esc(d.app_title)} · ${fmtD(d.ts)}${d.sim ? ' · SIMULADO' : ''}</div>${detailHtml(d, true)}<p class="meta" style="margin-top:12px">Leitura indicativa: 3 itens por habilidade; não substitui avaliação formal. Pontos de jogo, estrelas e chefe não entram na nota. © Thiago Silva — Prova Arcade.</p></div>`).join(''); setTimeout(() => window.print(), 250);
  }

  /* ---------- LICENÇAS ---------- */
  function table(el, head, rows) { el.innerHTML = '<thead><tr>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody>'; }
  function licenses() {
    const s = ST.state;
    table($('tl'), ['ID', 'Titular', 'Órgão', 'Edição', 'Situação', 'Validade', 'Aparelhos', 'Acessos', 'Último uso', 'Ações'], s.licenses.map((l) => `<tr><td>${esc(l.id)}</td><td><b>${esc(l.holder)}</b></td><td>${esc(l.org)}</td><td><span class="tag ${l.edition === 'premium' ? 't-a' : 't-c'}">${l.edition === 'premium' ? 'DEMO PÚBLICA' : 'PESQUISA (alunos)'}</span></td><td><span class="tag t-${l.state}">${l.state === 'ok' ? 'ATIVA' : l.state === 'blocked' ? 'BLOQUEADA' : 'EXPIRADA'}</span></td><td>${l.expires_at ? fmtD(l.expires_at) : 'sem prazo'}</td><td>${l.devices}/${l.max_devices}</td><td>${l.sessions}</td><td>${fmtD(l.last_seen)}</td><td>${l.status === 'active' ? `<button class="btn red sm" data-a="block" data-id="${l.id}">Bloquear</button>` : `<button class="btn grn sm" data-a="unblock" data-id="${l.id}">Reativar</button>`} <button class="btn ghost sm" data-a="expiry" data-id="${l.id}">Validade</button> <button class="btn ghost sm" data-a="devices" data-id="${l.id}">Aparelhos</button> <button class="btn ghost sm" data-a="edition" data-id="${l.id}">Trocar edição</button> <button class="btn ghost sm" data-a="reset" data-id="${l.id}">Zerar</button></td></tr>`));
    table($('ts'), ['Quando', 'Licença', 'Nome informado', 'Aparelho', 'IP', 'Navegador', 'Último sinal', 'Estado', ''], s.sessions.map((x) => `<tr><td>${fmtD(x.created_at)}</td><td>${esc(x.license_id)}</td><td>${esc(x.name)}</td><td>${esc(x.device)}</td><td>${esc(x.ip)}</td><td title="${esc(x.ua)}">${esc((x.ua || '').slice(0, 40))}</td><td>${fmtD(x.last_seen)}</td><td>${x.revoked ? '<span class="tag t-c">encerrada</span>' : (s.now - x.last_seen < 120000 ? '<span class="tag t-a">online</span>' : 'inativa')}</td><td>${x.revoked ? '' : `<button class="btn red sm" data-a="kick" data-id="${x.license_id}" data-sid="${x.full}">Derrubar</button>`}</td></tr>`));
    table($('te'), ['Quando', 'Licença', 'Tipo', 'IP', 'Detalhe'], s.events.map((e) => `<tr><td>${fmtD(e.ts)}</td><td>${esc(e.license_id || '')}</td><td>${esc(e.type)}</td><td>${esc(e.ip)}</td><td>${esc((e.meta || '').slice(0, 120))}</td></tr>`));
  }
  $('nf').addEventListener('submit', async (e) => { e.preventDefault(); const j = await call('/api/admin/license', { holder: $('n_holder').value, org: $('n_org').value, days: $('n_days').value, maxDevices: $('n_dev').value, edition: $('n_ed').value }); if (j.code) { $('newcode').textContent = j.code + '   (id ' + j.id + ') — copie agora; não será exibido de novo.'; $('nf').reset(); $('n_dev').value = 60; load(); } });
  document.addEventListener('click', async (e) => {
    const qb = e.target.closest('button[data-qr]'); if (qb) { showQr({ id: qb.dataset.qr, token: qb.dataset.tok, title: qb.dataset.title, len: qb.dataset.len }); $('qrout').scrollIntoView({ behavior: 'smooth' }); return; }
    const ab = e.target.closest('button[data-app]'); if (ab) { if (ab.dataset.app === 'delete' && !confirm('Excluir esta aplicação? O QR deixa de funcionar.')) return; await call(`/api/admin/application/${ab.dataset.id}/${ab.dataset.app}`, {}); load(); return; }
    const b = e.target.closest('button[data-a]'); if (!b) return; const a = b.dataset.a; const id = b.dataset.id; let body = {};
    if (a === 'block' && !confirm('Bloquear esta licença? Todos os acessos ativos serão derrubados agora.')) return; if (a === 'reset' && !confirm('Zerar aparelhos e derrubar sessões desta licença?')) return;
    if (a === 'expiry') { const d = prompt('Nova validade em dias a partir de hoje (vazio = sem prazo):'); if (d === null) return; body = { days: d }; } if (a === 'devices') { const d = prompt('Máximo de aparelhos:'); if (!d) return; body = { maxDevices: d }; } if (a === 'kick') body = { sid: b.dataset.sid };
    await call(`/api/admin/license/${id}/${a}`, body); load();
  });

  /* ---------- AJUDA / dados simulados ---------- */
  function help() { /* estático */ }
  $('demo-load').onclick = async () => { await call('/api/admin/demo-data', {}); $('f-sim').value = ''; await load(); go('overview'); };
  $('demo-clear').onclick = async () => { if (!confirm('Apagar todos os resultados SIMULADOS?')) return; await call('/api/admin/demo-clear', {}); await load(); };

  setInterval(() => { if (!$('shell').hidden && ['licenses', 'apps'].includes(ST.page)) load(); }, 20000);
  fetch('/api/admin/open-login').catch(() => {}).then(() => call('/api/admin/state')).then(() => { $('login').hidden = true; $('shell').hidden = false; load(); }).catch(() => {});
})();
