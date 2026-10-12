/* Fluxo de telas: QR/entrada → jogadores → identificação → personagem → termômetro → fases (perguntas na arena) → diagnóstico.
 * © Thiago Silva. */
import { PACK, PRACTICE } from './items.js';
import { PLAYER_COLORS, OPT_COLORS, CHARS, buildWorld } from './art.js';
import { Game } from './game.js';
import { loadGfx, gfx, frameCanvas, loadBgOverrides } from './gfx.js';
import { initAudio, toggleMute, isMuted, playMusic, stopMusic, sfx, duck } from './audio.js';
import { renderResults } from './results.js';
import { SKINS, ACCS, newCos, dressed } from './cosmetics.js';
import { LABELS } from './labels.js';

const $ = (id) => document.getElementById(id);
export const STAGES = {
  train: { name: 'CAMPO DE TREINO', seed: 7, music: 'train', slots: [], n: 1 },
  s1: { name: 'GELEIRA DOS CRISTAIS', seed: 11, music: 's1', slots: [0, 3, 6, 9, 12], n: 5 },
  s2: { name: 'RUÍNAS DOS OSSOS', seed: 23, music: 's2', slots: [1, 4, 7, 10, 13], n: 5 },
  s3: { name: 'FLORESTA DAS SINAPSES', seed: 31, music: 's3', slots: [2, 5, 8, 11, 14], n: 5 },
};
const HINTS = {
  ped: 'Fique PARADO em cima do bloco da sua resposta (cor, forma e letra) até ele acender. Pode trocar até passar pelo portão.',
  door: 'Entre na PORTA da sua resposta e fique parado lá dentro até ela acender. Pode trocar até passar pelo portão.',
  bump: 'PULE e bata com a cabeça por baixo do bloco da sua resposta (como num bloco de interrogação). Pode trocar até passar pelo portão.',
  mimic: 'PISE (pule em cima) no monstrinho da sua resposta: ele é inofensivo. Pode trocar até passar pelo portão.',
  barrel: 'Os barris caem do alto! Quando pararem, PISE (pule em cima) no barril da sua resposta. Eles são inofensivos. Pode trocar até passar pelo portão.',
  balloon: 'PULE e encoste no balão da sua resposta: ele estoura em confete e volta. Pode trocar até passar pelo portão.',
};
const MOODS = [{ e: '😄', t: 'Tranquilo(a)' }, { e: '🙂', t: 'Bem' }, { e: '😐', t: 'Normal' }, { e: '😟', t: 'Preocupado(a)' }, { e: '😣', t: 'Muito tenso(a)' }];
const DEMO_N = { s1: 8, s2: 7 }, DEMO_OFF = { s1: 0, s2: 8 };   // demo FIXO: 5 habilidades × 3 perguntas = 15
export const S = { mode: 1, quick: true, players: [], turns: [], ti: 0, auth: null, charStep: 0, playing: false, paused: false, startedAt: 0, tab: 0 };
let game = null; let scene = 'loading'; let speakTok = 0;

/* ---------- utilidades ---------- */
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function balancedPositions() { for (let k = 0; k < 50; k++) { const N = PACK.slots.length, a = shuffle(Array.from({ length: N }, (_, i) => i % 3)); let ok = true; for (let i = 2; i < N; i++) if (a[i] === a[i - 1] && a[i] === a[i - 2]) ok = false; if (ok) return a; } return Array.from({ length: PACK.slots.length }, (_, i) => (i + (i / 3 | 0)) % 3); }
function makeOrder(item, pos) { const okI = item.opts.findIndex((o) => o.ok); const others = shuffle(item.opts.map((_, i) => i).filter((i) => i !== okI)); const order = [0, 0, 0]; order[pos] = okI; let k = 0; for (let i = 0; i < 3; i++) if (i !== pos) order[i] = others[k++]; return order; }
async function api(path, body) { try { const r = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}); return { status: r.status, json: await r.json().catch(() => ({})) }; } catch (e) { return { status: 0, json: {} }; } }
export function logEvent(type, meta) { api('/api/event', { type, meta }); }
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const firstName = (n) => n.split(' ')[0].toUpperCase();
function spriteCanvas(c, ci, pi, h) { const src = frameCanvas(`char_${CHARS[ci].id}_p${pi + 1}`, 0, h); c.width = src ? src.width : 1; c.height = h; if (src) c.getContext('2d').drawImage(src, 0, 0); }

/* ---------- cenas ---------- */
export function show(name) {
  scene = name; document.body.dataset.scene = name;
  document.querySelectorAll('.scene').forEach((s) => s.classList.toggle('active', s.id === 'sc-' + name));
  $('stage').hidden = name !== 'play'; S.playing = name === 'play';
  if (name !== 'play' && game) game.stop();
  if (['title', 'mode', 'ident', 'char', 'mood'].includes(name)) playMusic('title');
  if (name === 'results') playMusic('results');
  if (name !== 'play') stopSpeak();
  checkOrient(); fit();
}
function checkOrient() { const portrait = innerHeight > innerWidth * 1.12; document.body.classList.toggle('portrait', portrait); document.body.classList.remove('need-landscape'); if (game) game.paused = S.paused; }

/* ---------- fundo animado dos menus (personagens 3D correndo) ---------- */
function menuBg() {
  const c = $('menubg'); const x = c.getContext('2d'); const w = buildWorld('train'); const bg = w.bg; let t = 0, W = 384, H = 216;
  const size = () => { const dpr = Math.min(1.5, devicePixelRatio || 1); c.width = innerWidth * dpr; c.height = innerHeight * dpr; H = 216; W = 216 * innerWidth / innerHeight; };
  size(); addEventListener('resize', size); const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function loop() {
    const s = c.height / H; x.setTransform(s, 0, 0, s, 0, 0); if (!reduce) t += 1;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, w.th.sky[0]); g.addColorStop(0.6, w.th.sky[1]); g.addColorStop(1, w.th.sky[2]); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const lay = (img, k) => { const ox = -((t * k) % bg.W); for (let xx = ox; xx < W; xx += bg.W) x.drawImage(img, xx, -10, bg.W, bg.H); };
    lay(bg.far, 0.15); lay(bg.mid, 0.4); lay(bg.near, 0.9);
    x.fillStyle = '#6a3c20'; x.fillRect(0, H - 30, W, 30); x.fillStyle = w.th.topB; x.fillRect(0, H - 34, W, 7); x.fillStyle = w.th.topA; x.fillRect(0, H - 34, W, 3);
    const G = gfx(); if (G) (S.edition === 'premium' ? [CHARS[3], CHARS[3], CHARS[3]] : CHARS).forEach((ch, i) => { const sp = G[`char_${ch.id}_p${(i % 2) + 1}`]; if (!sp) return; const px = ((i * 150 + t * 1.5) % (W + 120)) - 40; const f = 2 + (Math.floor(t / 4 + i) % 6); const h = 46; x.drawImage(sp.img, f * sp.cw, 0, sp.cw, sp.ch, px, H - 32 - h, h * sp.cw / sp.ch, h); });
    requestAnimationFrame(loop);
  })();
}

/* ---------- enquadramento do jogo ---------- */
function fit() {
  if (!game) return; const vw = window.visualViewport ? window.visualViewport.width : innerWidth, vh = window.visualViewport ? window.visualViewport.height : innerHeight;
  let fw, fh; if (vh > vw * 1.12) { fw = Math.floor(vw); fh = Math.floor(vh); } else { const W = Math.max(330, Math.min(500, Math.round(216 * vw / vh / 2) * 2)); const sc = Math.min(vw / W, vh / 216); fw = Math.floor(W * sc); fh = Math.floor(216 * sc); }
  const fr = $('frame'); fr.style.width = fw + 'px'; fr.style.height = fh + 'px'; game.resize(fw, fh);
}

/* ---------- entrada ---------- */
function bindInput() {
  const I = () => game.input; const map = { x: 'fire', X: 'fire', k: 'fire', K: 'fire', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', z: 'jump', Z: 'jump' };
  addEventListener('keydown', (e) => { if (e.target && e.target.tagName === 'INPUT') return; if (e.key === 'Escape' && scene === 'play') return pause(true); const k = map[e.key]; if (k && scene === 'play') { I()[k] = true; e.preventDefault(); } });
  addEventListener('keyup', (e) => { const k = map[e.key]; if (k && game) I()[k] = false; });
  const hold = (id, key) => { const b = $(id); const on = (e) => { e.preventDefault(); I()[key] = true; b.classList.add('dn'); try { b.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } }; const off = (e) => { e.preventDefault(); I()[key] = false; b.classList.remove('dn'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); b.addEventListener('contextmenu', (e) => e.preventDefault()); };
  hold('t-left', 'left'); hold('t-right', 'right'); hold('t-jump', 'jump'); hold('t-fire', 'fire');
  document.addEventListener('touchmove', (e) => { if (scene === 'play') e.preventDefault(); }, { passive: false });
  document.addEventListener('visibilitychange', () => { if (document.hidden && scene === 'play') pause(true); });
}
function pause(on) { if (on && scene !== 'play') return; S.paused = on; if (game) game.paused = on || document.body.classList.contains('need-landscape'); if (on) { game.input.left = game.input.right = game.input.jump = false; $('sc-pause').classList.add('active'); } else $('sc-pause').classList.remove('active'); }

/* ---------- leitura em voz alta (acessibilidade: aluno não alfabetizado / dislexia) ---------- */
function pickVoice() { const v = (window.speechSynthesis && speechSynthesis.getVoices()) || []; return v.find((x) => /pt[-_]BR/i.test(x.lang)) || v.find((x) => /^pt/i.test(x.lang)) || null; }
function stopSpeak() { speakTok++; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* ok */ } duck && ctxDuck(false); const b = $('q-say'); if (b) b.classList.remove('on'); document.querySelectorAll('#q-opts li').forEach((l) => l.classList.remove('say')); }
function ctxDuck(on) { try { duck(on); } catch (e) { /* ok */ } }
function speakItem(s) {
  if (!('speechSynthesis' in window) || !s || !s.item) { const h = $('q-hint'); if (h) h.textContent = 'Este aparelho não tem leitura em voz alta.'; return; }
  const tok = ++speakTok; speechSynthesis.cancel(); const t = S.turns[S.ti]; const pl = S.players[t.p]; pl.readUses = (pl.readUses || 0) + 1; const it = s.item; const v = pickVoice();
  const parts = []; if (it.ctx) parts.push({ t: it.ctx }); parts.push({ t: it.stem });
  for (let i = 0; i < 3; i++) parts.push({ t: `Opção ${OPT_COLORS[i].letter}, bloco ${OPT_COLORS[i].name}. ${it.opts[s.order[i]].t}`, opt: i });
  parts.push({ t: 'Caixa cinza: não sei. Se você ainda não aprendeu isso, marque a caixa cinza.', opt: 3 });
  $('q-say').classList.add('on'); ctxDuck(true); let k = 0;
  const next = () => {
    if (tok !== speakTok) return; if (k >= parts.length) { stopSpeak(); return; } const p = parts[k++]; const u = new SpeechSynthesisUtterance(p.t); u.lang = 'pt-BR'; u.rate = 0.92; if (v) u.voice = v;
    if (p.opt === undefined) { if (!s.typed) finishType(s); } else if (game && s.rev && !s.rev[p.opt]) game.reveal(s, p.opt);
    document.querySelectorAll('#q-opts li').forEach((l, i) => l.classList.toggle('say', p.opt === i)); u.onend = next; u.onerror = () => { if (tok === speakTok) stopSpeak(); }; speechSynthesis.speak(u);
  };
  next();
}

/* ---------- fluxo ---------- */
function newPlayers(n) { S.players = Array.from({ length: n }, (_, i) => ({ weapon: false, ammo: 0, idx: i, name: '', turma: '', char: i, form: i === 0 ? 'A' : 'B', pos: balancedPositions(), answers: [], stages: {}, score: 0, motor: null, readAloud: false, readUses: 0, moodPre: null, moodPost: null })); }
function flowIdent() { $('id2').hidden = S.mode !== 2; $('iderr').hidden = true; show('ident'); setTimeout(() => $('n1').focus(), 80); }
function submitIdent(e) {
  e.preventDefault(); const err = $('iderr'); const names = [$('n1').value.trim(), $('n2').value.trim()]; const turmas = [$('t1').value.trim(), $('t2').value.trim()]; const reads = [$('r1').checked, $('r2').checked];
  for (let i = 0; i < S.mode; i++) {
    if (names[i].replace(/\s+/g, ' ').length < 5 || !/\s/.test(names[i])) { err.textContent = `Jogador ${i + 1}: digite nome e sobrenome.`; err.hidden = false; return; }
    if (!turmas[i]) { err.textContent = `Jogador ${i + 1}: informe a turma.`; err.hidden = false; return; }
  }
  if (S.mode === 2 && names[0].toLowerCase() === names[1].toLowerCase()) { err.textContent = 'Os dois jogadores precisam ter identificações diferentes.'; err.hidden = false; return; }
  newPlayers(S.mode); S.players.forEach((p, i) => { p.name = names[i]; p.turma = turmas[i]; p.readAloud = reads[i]; }); S.charStep = 0; sfx.select();
  if (S.edition === 'premium') { const fi = CHARS.findIndex((c) => c.id === 'fox'); S.players.forEach((p) => { p.char = fi; }); doMood('pre', 0); return; }
  flowChar();
}
function flowChar() {
  const i = S.charStep; const pl = S.players[i]; $('sc-char').dataset.p = i; $('char-title').textContent = S.mode === 2 ? `JOGADOR ${i + 1} · ${firstName(pl.name)}: ESCOLHA` : 'ESCOLHA SEU PERSONAGEM';
  const box = $('chars'); box.innerHTML = '';
  CHARS.forEach((ch, ci) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ch' + (ci === pl.char ? ' sel' : ''); b.innerHTML = '<canvas></canvas><b></b><span></span>'; b.querySelector('b').textContent = ch.name; b.querySelector('span').textContent = ch.desc; spriteCanvas(b.querySelector('canvas'), ci, i, 150);
    b.addEventListener('click', () => { pl.char = ci; box.querySelectorAll('.ch').forEach((x, k) => x.classList.toggle('sel', k === ci)); sfx.blip(); }); box.appendChild(b); });
  show('char');
}
function charOk() { sfx.select(); if (S.charStep + 1 < S.mode) { S.charStep++; flowChar(); } else doMood('pre', 0); }
function doMood(kind, i) {
  const pl = S.players[i]; const sc = $('sc-mood'); sc.dataset.p = i; $('mood-badge').textContent = 'P' + (i + 1); $('mood-name').textContent = S.mode === 2 ? firstName(pl.name) : firstName(pl.name);
  $('mood-title').textContent = kind === 'pre' ? 'COMO VOCÊ ESTÁ SE SENTINDO AGORA?' : 'E AGORA, COMO VOCÊ ESTÁ?';
  $('mood-sub').textContent = kind === 'pre' ? 'Toque na carinha. Não vale nota: é só para a gente saber como você chega à aventura.' : 'Última pergunta! Toque na carinha que combina com você agora.';
  const f = $('faces'); f.innerHTML = '';
  MOODS.forEach((m, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'face'; b.innerHTML = `<span>${m.e}</span><small>${m.t}</small>`; b.dataset.v = k + 1;
    b.addEventListener('click', () => { pl[kind === 'pre' ? 'moodPre' : 'moodPost'] = k + 1; sfx.select(); if (i + 1 < S.mode) doMood(kind, i + 1); else if (kind === 'pre') startRun(); else finish(); }); f.appendChild(b); });
  show('mood');
}
function startRun() { const seq = S.edition === 'premium' ? ['train', 's1', 's2'] : ['train', 's1', 's2', 's3']; S.turns = []; for (const k of seq) for (let p = 0; p < S.mode; p++) S.turns.push({ key: k, p }); S.ti = 0; S.startedAt = Date.now(); logEvent('game_start', { mode: S.mode, quick: S.quick }); beginTurn(); }
function beginTurn() {
  const t = S.turns[S.ti]; const pl = S.players[t.p]; const st = STAGES[t.key]; const sc = $('sc-turn'); sc.dataset.p = t.p; $('turn-badge').textContent = 'P' + (t.p + 1);
  $('turn-title').textContent = S.mode === 2 ? `VEZ DO JOGADOR ${t.p + 1}` : (t.key === 'train' ? 'TREINO' : 'PREPARE-SE'); $('turn-name').textContent = pl.name.toUpperCase();
  $('turn-sub').textContent = t.key === 'train' ? 'Aquecimento: aprenda os controles · ' + st.name : `Fase ${t.key.slice(1)} · ${st.name}`;
  $('turn-rules').hidden = t.key !== 'train' || t.p !== 0;
  const pass = $('turn-pass'); if (S.mode === 2) { pass.hidden = false; pass.textContent = `Entregue o aparelho para ${firstName(pl.name)}. Só toque em ESTOU PRONTO quando estiver com ele.`; } else pass.hidden = true;
  spriteCanvas($('turn-sprite'), pl.char, t.p, 180); show('turn'); sfx.turn();
}
function startPlay() {
  initAudio(); const t = S.turns[S.ti]; const pl = S.players[t.p]; const st = STAGES[t.key];
  $('frame').dataset.p = t.p; $('hud-badge').textContent = 'P' + (t.p + 1); $('hud-name').textContent = firstName(pl.name); $('hud-stage').textContent = st.name; $('bossbar').hidden = true; $('hud-assist').hidden = true; $('qpanel').hidden = true;
  show('play'); S.paused = false; game.paused = false; game.input.left = game.input.right = game.input.jump = false;
  game.load({ key: t.key, seed: st.seed, nStations: (S.edition === 'premium' && DEMO_N[t.key]) || st.n, charIdx: pl.char, playerIdx: t.p, quick: S.quick, weapon: pl.weapon, ammo: pl.ammo });
  updateDots(); game.start(); fit(); playMusic(st.music); const f = $('turnflash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
function updateDots() { const d = $('hud-dots'); d.innerHTML = ''; game.stations.forEach((s) => { const i = document.createElement('i'); if (s.locked) i.className = 'on'; d.appendChild(i); }); $('hud-score').textContent = game.score; }

/* ---------- estações (a "pergunta" chega como mensagem da AURA) ---------- */
function prepareStation(s) {
  if (s.item) return; const t = S.turns[S.ti]; const pl = S.players[t.p];
  const fin = (key) => { const n = (s.item.ctx || '').length + s.item.stem.length + [0, 1, 2].reduce((a, i) => a + s.item.opts[s.order[i]].t.length, 0); s.readNeed = Math.round(Math.min(1200, Math.max(480, n / 22 * 60))); s.labels = [0, 1, 2].map((i) => s.item.opts[s.order[i]].l || (LABELS[key] || [])[s.order[i]] || '').concat(['NÃO SEI']); };
  if (s.practice) { s.item = PRACTICE; s.order = makeOrder(PRACTICE, Math.floor(Math.random() * 3)); s.meta = { practice: true }; fin('P'); return; }
  let slotIdx = STAGES[t.key].slots[s.idx], fk = pl.form;
  if (S.edition === 'premium') {   // demo: banco ampliado, sorteado a cada partida (uma pergunta de cada habilidade por fase, sem repetir)
    const NS = PACK.skills.length, g0 = ((DEMO_OFF[t.key] + s.idx) % NS) * 3;   // 3 slots (componentes) por habilidade
    pl.used = pl.used || new Set(); let pool = []; for (let k = 0; k < 3; k++) for (const f of Object.keys(PACK.slots[g0 + k].forms)) if (!pl.used.has((g0 + k) + f)) pool.push([g0 + k, f]);
    if (!pool.length) { pl.used.clear(); for (let k = 0; k < 3; k++) for (const f of Object.keys(PACK.slots[g0 + k].forms)) pool.push([g0 + k, f]); }
    const pk = pool[Math.floor(Math.random() * pool.length)]; slotIdx = pk[0]; fk = pk[1]; pl.used.add(pk[0] + pk[1]);
  }
  const slot = PACK.slots[slotIdx]; const item = slot.forms[fk]; s.formKey = fk; s.item = item; s.order = makeOrder(item, pl.pos[slotIdx]); fin(slotIdx + fk); s.meta = { slotIdx, skill: slot.skill };
}
let twTimer = null;
function stopType() { if (twTimer) { clearInterval(twTimer); twTimer = null; } }
function finishType(s) { stopType(); s.typed = true; const c = $('q-ctx'); c.textContent = s.item.ctx || ''; $('q-stem').textContent = s.item.stem; }
function startType(s) {
  stopType(); if (s.typed) { finishType(s); return; }
  const a = s.item.ctx || '', b = s.item.stem, tot = a.length + b.length; let i = 0; $('q-ctx').textContent = ''; $('q-stem').textContent = '';
  twTimer = setInterval(() => { i += 3; $('q-ctx').textContent = a.slice(0, Math.min(i, a.length)); $('q-stem').textContent = i > a.length ? b.slice(0, i - a.length) : ''; if (i >= tot) finishType(s); }, 34);
}
function progDots(s) { const n = (s.rev || []).slice(0, 3).filter(Boolean).length; return 'VERSÕES OUVIDAS ' + '●'.repeat(n) + '○'.repeat(3 - n); }
function setLi(li, s, i) { const o = s.item.opts[s.order[i]]; const sp = li.querySelector('span'); const rv = s.rev && s.rev[i]; li.classList.toggle('lk', !rv); sp.textContent = rv ? o.t : `🔒 Chegue perto de ${OPT_COLORS[i].shape} ${OPT_COLORS[i].letter} e ouça esta versão`; }
function skillTag(s) { if (S.edition !== 'premium') return ''; if (s.practice) return 'TREINO DA AURA'; const k = PACK.skills.find((x) => x.code === (s.meta && s.meta.skill)); return k ? `${k.code} · ${k.short}` : ''; }
function renderPanel(s) {
  const t = S.turns[S.ti]; const pl = S.players[t.p]; $('q-who').textContent = s.practice ? 'AURA · SIMULAÇÃO' : `AURA · UM CASO PARA ${firstName(pl.name)}`;
  const c = $('q-ctx'); c.textContent = s.item.ctx || ''; c.hidden = !s.item.ctx; $('q-stem').textContent = ''; c.textContent = ''; const ul = $('q-opts'); ul.innerHTML = '';
  for (let i = 0; i < 3; i++) { const o = s.item.opts[s.order[i]]; const li = document.createElement('li'); li.dataset.ped = i; if (s.selected === i) li.className = 'sel'; const b = document.createElement('b'); b.textContent = OPT_COLORS[i].shape + ' ' + OPT_COLORS[i].letter; b.style.background = OPT_COLORS[i].main; const sp = document.createElement('span'); li.append(b, sp); ul.appendChild(li); setLi(li, s, i); void o; }
  { const li = document.createElement('li'); li.dataset.ped = 3; li.className = 'idk' + (s.selected === 3 ? ' sel' : ''); const b = document.createElement('b'); b.textContent = '◇ ?'; b.style.background = OPT_COLORS[3].main; const sp = document.createElement('span'); sp.textContent = 'NÃO SEI — se você ainda não aprendeu isso, marque a caixa cinza. É melhor do que chutar.'; li.append(b, sp); ul.appendChild(li); }
  $('q-time').style.width = '0%';
  startType(s); $('q-prog').textContent = progDots(s); $('q-skill').textContent = skillTag(s);
  $('q-say').classList.remove('on'); S.seen = S.seen || {}; $('q-hint').textContent = s.ready ? (HINTS[s.type] || HINTS.ped) : 'PASSO 1: chegue perto de cada objeto e ouça as 3 versões (🔒). PASSO 2: responda do jeito do objeto.'; $('q-hint').hidden = false; $('q-hint').classList.remove('nag'); $('qpanel').classList.toggle('ready', !!s.ready); $('qpanel').hidden = false;
}
const hooks = {
  onStationEnter(s) { $('frame').classList.add('qfocus'); prepareStation(s); renderPanel(s); const pl = S.players[S.turns[S.ti].p]; if (pl.readAloud) setTimeout(() => { if (s.active) speakItem(s); }, 500); },
  onReveal(s, i) { const li = $('q-opts').children[i]; if (li) { setLi(li, s, i); li.classList.add('rv'); setTimeout(() => li.classList.remove('rv'), 900); } $('q-prog').textContent = progDots(s); },
  onReady(s) { $('qpanel').classList.add('ready'); const h = $('q-hint'); h.classList.remove('nag'); const first = !S.seen[s.type] || s.practice; S.seen[s.type] = 1; h.textContent = '✔ Agora escolha: ' + (HINTS[s.type] || HINTS.ped); h.hidden = !first; },
  onReadTick(s, f) { $('q-time').style.width = Math.round(f * 100) + '%'; $('q-timebar').classList.toggle('done', f >= 1); },
  onNag(s) { const p = $('qpanel'); const h = $('q-hint'); h.hidden = false; h.classList.add('nag'); if (s.typed && s.rev.every(Boolean)) h.textContent = 'Leia com calma: a barra de tempo precisa encher antes de você responder.'; p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); setTimeout(() => p.classList.remove('shake'), 500); },
  onNear(i) { $('q-opts').querySelectorAll('li').forEach((li, k) => li.classList.toggle('near', k === i)); },
  onSelect(s, ped) { $('q-opts').querySelectorAll('li').forEach((li, i) => li.classList.toggle('sel', i === ped)); },
  onStationExit() { $('frame').classList.remove('qfocus'); $('qpanel').hidden = true; stopType(); stopSpeak(); },
  onSpeak(s) { if (s.active) speakItem(s); },
  onStationLock(s) {
    updateDots(); if (s.practice) return; const t = S.turns[S.ti]; const pl = S.players[t.p]; const oi = s.order[s.selected]; const opt = s.selected === 3 ? { t: 'Não sei', ok: false, m: 'IDK' } : s.item.opts[oi]; const okOpt = s.item.opts.find((o) => o.ok);
    pl.answers.push({ slot: s.meta.slotIdx, skill: s.meta.skill, stage: t.key, form: s.formKey || pl.form, rd: (s.rd || []).slice(), stem: s.item.stem, chosen: opt.t, expected: okOpt.t, ok: !!opt.ok, tag: opt.m || null, ped: s.selected, order: s.order.slice(), changes: s.changes, tFirst: s.tFirstF / 60, dwell: s.dwellF / 60, visits: s.visits });
  },
  onHud() { $('hud-score').textContent = game.score; },
  onAura(fx) { const p = $('qpanel'); if (p.hidden) return; const fr = $('frame'); const ax = fx * fr.clientWidth; const pr = p.getBoundingClientRect(), fr0 = fr.getBoundingClientRect(); const left = Math.max(26, Math.min(pr.width - 26, ax - (pr.left - fr0.left))); const t = $('q-tail'); if (t) t.style.left = left + 'px'; },
  onHp(h) { const box = $('hud-hp'); const prev = box.dataset.hp ? +box.dataset.hp : h.hp; box.dataset.hp = h.hp; let html = ''; for (let i = 0; i < h.max; i++) html += `<i class="${i < h.hp ? 'full' : 'empty'}${i < h.hp && h.hp > prev && i === h.hp - 1 ? ' pop' : ''}">${i < h.hp ? '❤' : '♡'}</i>`; for (let i = 0; i < h.shield; i++) html += '<i class="sh">🛡</i>'; box.innerHTML = html; $('bank-txt').textContent = h.bank; },
  onSecret(on) { const a = $('hud-assist'); const st = $('hud-stage'); if (on) { st.textContent = '★ FASE SECRETA ★'; } else { const t = S.turns[S.ti]; if (t) st.textContent = STAGES[t.key].name; } void a; },
  onAmmo(a) { const box = $('hud-ammo'); box.hidden = !a.weapon; if (a.weapon) box.innerHTML = '<span>ORBE</span>' + Array.from({ length: a.max }, (_, i) => `<i class="${i < a.ammo ? 'on' : ''}">✦</i>`).join(''); $('t-fire').hidden = !a.weapon; $('t-fire').classList.toggle('empty', a.ammo === 0); },
  onAssist(n) { $('hud-assist').hidden = n < 1; },
  onBoss(b) { const bar = $('bossbar'); if (!b || !b.show) { bar.hidden = true; return; } bar.hidden = false; $('bb-name').textContent = b.name; $('bb-fill').style.width = Math.max(0, (b.hp / b.max) * 100) + '%'; },
  onStageDone(stats) {
    const t = S.turns[S.ti]; const pl = S.players[t.p]; pl.stages[t.key] = stats; pl.score += stats.score; pl.weapon = stats.weapon; pl.ammo = stats.ammoEnd; pl.wallet = (pl.wallet || 0) + (stats.wallet || 0); $('frame').classList.remove('qfocus'); if (t.key === 'train') pl.motor = stats; logEvent('stage_done', { stage: t.key, p: t.p + 1 });
    setTimeout(() => { $('qpanel').hidden = true; showDone(t, pl, stats); }, 200);
  },
};
function showDone(t, pl, rec) {
  const sc = $('sc-done'); sc.dataset.p = t.p; $('done-badge').textContent = 'P' + (t.p + 1); $('done-title').textContent = t.key === 'train' ? 'TREINO CONCLUÍDO!' : (rec.boss ? 'CHEFE DERROTADO!' : 'FASE CONCLUÍDA!'); $('done-name').textContent = pl.name.toUpperCase();
  const st = $('done-stats'); st.innerHTML = ''; [[fmtTime(rec.seconds), 'TEMPO'], [rec.coins + '/' + rec.coinsTotal, 'MOEDAS'], [rec.killed, 'INIMIGOS'], ['❤ ' + rec.hpEnd, 'VIDAS NO FIM'], [rec.hearts, 'CORAÇÕES GANHOS'], [rec.score, 'PONTOS']].forEach(([a, b]) => { const d = document.createElement('div'); d.innerHTML = '<b></b><span></span>'; d.firstChild.textContent = a; d.lastChild.textContent = b; st.appendChild(d); });
  sc.querySelectorAll('.badges').forEach((b) => b.remove()); const bd = document.createElement('div'); bd.className = 'badges'; const add = (s) => { const i = document.createElement('i'); i.textContent = s; i.style.animationDelay = bd.children.length * 0.15 + 's'; bd.appendChild(i); };
  if (rec.hits === 0) add('🛡 SEM DANO'); else if (rec.deaths === 0) add('❤ SEM MORRER'); if (rec.secretRoom) add('🚪 FASE SECRETA'); if (rec.coins / Math.max(1, rec.coinsTotal) >= 0.8) add('💰 CAÇADOR DE MOEDAS'); if (rec.killed >= 4) add('⚔ EXTERMINADOR'); if (rec.boss) add('👑 CHEFE DERROTADO'); if (rec.secretsTotal && rec.secrets >= rec.secretsTotal) add('★ TODAS AS ESTRELAS');
  if (bd.children.length) st.after(bd); show('done'); sfx.clear();
}
function nextTurn() { S.ti++; if (S.ti >= S.turns.length) { S.shopStep = 0; return flowShop(0); } beginTurn(); }
function fSprite(pl, i) { const ch = CHARS[pl.char]; const src = frameCanvas(`char_${ch.id}_p${i + 1}`, 0, 150); return src; }
function flowShop(i) {
  const pl = S.players[i]; pl.cos = pl.cos || newCos(); pl.wallet = pl.wallet || 0; const other = S.mode === 2 ? S.players[1 - i] : null; if (other) other.cos = other.cos || newCos();
  const sc = $('sc-shop'); sc.dataset.p = i; $('shop-badge').textContent = 'P' + (i + 1); $('shop-title').textContent = S.mode === 2 ? `LOJA · ${firstName(pl.name).toUpperCase()}` : 'LOJA DO FINAL';
  const gn = $('shop-gift-note'); gn.hidden = !pl.cos.giftFrom; if (pl.cos.giftFrom) gn.textContent = `🎁 ${pl.cos.giftFrom.from} te deu: ${ACCS.find((a) => a.id === pl.cos.giftFrom.acc).name}!`;
  const draw = () => { const box = $('shop-cv'); box.innerHTML = ''; const src = fSprite(pl, i); if (src) box.appendChild(dressed(src, pl.cos, true)); $('shop-wallet').textContent = '🪙 ' + pl.wallet; };
  const btn = (txt, sub, cls, fn, dis) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'si ' + (cls || ''); b.innerHTML = `<b></b><span></span>`; b.firstChild.textContent = txt; b.lastChild.textContent = sub; b.disabled = !!dis; b.addEventListener('click', fn); return b; };
  const render = () => {
    const sk = $('shop-skins'); sk.innerHTML = ''; SKINS.forEach((k) => { const own = pl.cos.owned.skin.includes(k.id); const on = pl.cos.skin === k.id; sk.appendChild(btn(k.name, on ? '✔ usando' : own ? 'usar' : '🪙 ' + k.price, on ? 'on' : '', () => { if (!own) { if (pl.wallet < k.price) return sfx.back(); pl.wallet -= k.price; pl.cos.owned.skin.push(k.id); } pl.cos.skin = k.id; sfx.select(); render(); }, !own && pl.wallet < k.price)); });
    const ac = $('shop-accs'); ac.innerHTML = ''; ac.appendChild(btn('Nenhum', !pl.cos.acc ? '✔ usando' : 'tirar', !pl.cos.acc ? 'on' : '', () => { pl.cos.acc = null; sfx.select(); render(); })); ACCS.forEach((k) => { const own = pl.cos.owned.acc.includes(k.id); const on = pl.cos.acc === k.id; ac.appendChild(btn(k.name, on ? '✔ usando' : own ? 'usar' : '🪙 ' + k.price, on ? 'on' : '', () => { if (!own) { if (pl.wallet < k.price) return sfx.back(); pl.wallet -= k.price; pl.cos.owned.acc.push(k.id); } pl.cos.acc = k.id; sfx.select(); render(); }, !own && pl.wallet < k.price)); });
    const gf = $('shop-gift'); gf.hidden = !other; if (other) { $('gift-name').textContent = firstName(other.name); const gl = $('shop-gifts'); gl.innerHTML = ''; ACCS.forEach((k) => { const has = other.cos.owned.acc.includes(k.id); const done = pl.cos.gifted && pl.cos.gifted.acc === k.id; gl.appendChild(btn(k.name, done ? '🎁 enviado' : has ? 'já tem' : '🪙 ' + k.price, done ? 'on' : '', () => { if (pl.cos.gifted || has || pl.wallet < k.price) return sfx.back(); pl.wallet -= k.price; other.cos.owned.acc.push(k.id); if (!other.cos.acc) other.cos.acc = k.id; other.cos.giftFrom = { from: firstName(pl.name), acc: k.id }; pl.cos.gifted = { to: firstName(other.name), acc: k.id }; sfx.clear(); render(); }, !!pl.cos.gifted || has || pl.wallet < k.price)); }); }
    draw();
  };
  render(); show('shop');
}

const resultActions = { onReplay() { S.paused = false; show('mode'); }, onPrint() { window.print(); }, onQuit() { show('title'); }, onTab(i) { S.tab = i; renderResults(S, $('res-wrap'), i, resultActions); } };
function finish() { saveResults(); logEvent('game_finish', { mode: S.mode, sec: Math.round((Date.now() - S.startedAt) / 1000) }); S.tab = 0; renderResults(S, $('res-wrap'), 0, resultActions); show('results'); $('sc-results').scrollTop = 0; sfx.clear(); }

/* ---------- inicialização ---------- */
export async function init(auth) {
  S.auth = auth; S.edition = auth.edition === 'premium' ? 'premium' : 'pesquisa'; if (S.edition === 'premium') { S.quick = true; const lenEl = $('len'); if (lenEl) lenEl.hidden = true; } document.body.dataset.edition = S.edition; $('ed-badge').hidden = true; $('pitch').hidden = S.edition !== 'premium'; if (auth.join && auth.join.demo) { const w = $('wm-demo'); const tag = `DEMO · ${auth.join.recipient || auth.user} · ${auth.licenseId} · ${auth.sid}`; w.innerHTML = Array.from({ length: 80 }, () => `<span>${tag.replace(/</g, '')}</span>`).join(''); w.hidden = false; $('terms').hidden = false; } else if (S.edition === 'premium') { $('terms').hidden = false; } document.body.classList.toggle('touch', matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
  try { await Promise.all([document.fonts.load('16px "Lilita One"'), document.fonts.load('700 16px "Nunito"')]); } catch (e) { /* ok */ }
  await loadGfx((p) => { $('load-fill').style.width = Math.round(p * 100) + '%'; });
  await loadBgOverrides(); game = new Game($('game'), hooks); S.game = game; menuBg(); bindInput();
  $('lic-line').textContent = S.edition === 'premium' ? 'Prova Arcade · demonstração do protótipo · © Thiago Silva' : `Licenciado para: ${auth.holder} · ${auth.user} · ${auth.licenseId} — © Thiago Silva`;
  if (auth.join) { S.quick = auth.join.len !== 'full'; $('len').hidden = true; $('title-pack').textContent = auth.join.title || $('title-pack').textContent; }
  const setLen = (q) => { S.quick = q; $('len-q').classList.toggle('on', q); $('len-f').classList.toggle('on', !q); }; $('len-q').addEventListener('click', () => setLen(true)); $('len-f').addEventListener('click', () => setLen(false)); setLen(S.quick);
  $('btn-start').addEventListener('click', () => { initAudio(); sfx.select(); goFull(); show('mode'); });
  $('btn-full').addEventListener('click', goFull);
  const mute = () => { const m = toggleMute(); $('btn-mute2').textContent = m ? 'SOM: OFF' : 'SOM: ON'; $('btn-mute').textContent = m ? '✕' : '♪'; };
  $('btn-mute2').addEventListener('click', () => { initAudio(); mute(); }); $('btn-mute').addEventListener('click', mute); $('btn-mute2').textContent = isMuted() ? 'SOM: OFF' : 'SOM: ON';
  $('btn-out').addEventListener('click', async () => { await api('/api/logout', {}); location.href = '/'; });
  $('m1').addEventListener('click', () => { S.mode = 1; sfx.select(); flowIdent(); }); $('m2').addEventListener('click', () => { S.mode = 2; sfx.select(); flowIdent(); });
  document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { sfx.back(); show(b.dataset.back); }));
  $('idform').addEventListener('submit', submitIdent); $('btn-char-ok').addEventListener('click', charOk);
  $('btn-shop-done').addEventListener('click', () => { sfx.select(); if (S.shopStep + 1 < S.mode) { S.shopStep++; flowShop(S.shopStep); } else doMood('post', 0); });
  $('btn-turn-ok').addEventListener('click', () => { initAudio(); sfx.select(); startPlay(); }); $('btn-done-ok').addEventListener('click', () => { sfx.select(); nextTurn(); });
  $('q-say').addEventListener('click', () => { const s = game.stations.find((x) => x.active); if (!s) return; if ($('q-say').classList.contains('on')) stopSpeak(); else speakItem(s); });
  function photo() {   // gera a imagem DENTRO do jogo (sem print do navegador): quadro atual ampliado 3× sem suavizar, em PNG
    const g = S.game; if (!g || !g.cv) return; const c = g.cv, k = 3, o = document.createElement('canvas'); o.width = c.width * k; o.height = c.height * k; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, o.width, o.height);
    o.toBlob((b) => { const u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = 'prova-arcade-foto-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.png'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }, 'image/png'); }
  window.__photo = photo; $('btn-photo').addEventListener('click', photo); addEventListener('keydown', (e) => { if (e.key === 'F2') { e.preventDefault(); photo(); } });
  $('btn-pause').addEventListener('click', () => pause(true)); $('btn-resume').addEventListener('click', () => pause(false)); $('btn-quit').addEventListener('click', () => { pause(false); show('title'); });
  addEventListener('resize', () => { checkOrient(); fit(); }); addEventListener('orientationchange', () => setTimeout(() => { checkOrient(); fit(); }, 200)); if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  document.addEventListener('contextmenu', (e) => { if (scene === 'play') e.preventDefault(); }); if (window.speechSynthesis) speechSynthesis.getVoices();
  // entrada por QR Code: já cai na escolha de jogadores e começa
  if (auth.join) { show('mode'); } else show('title');
}
function goFull() { const d = document.documentElement; try { const p = d.requestFullscreen && d.requestFullscreen({ navigationUI: 'hide' }); if (p && p.then) p.catch(() => {}); } catch (e) { /* ok */ } }
export function lockedScreen(title, msg) { if (game) game.stop(); stopMusic(); $('lk-title').textContent = title; $('lk-msg').textContent = msg; $('locked').hidden = false; $('lk-btn').onclick = () => { location.href = '/'; }; }
export { fit, flowShop };

/* ---------- grava os resultados no servidor (só nesta aplicação) ---------- */
function medal(score) { return score >= 3500 ? 'ouro' : score >= 2200 ? 'prata' : 'bronze'; }
function saveResults() {
  const payload = { quick: S.quick, mode: S.mode, seconds: Math.round((Date.now() - S.startedAt) / 1000), players: S.players.map((p) => ({ name: p.name, turma: p.turma, form: p.form, char: CHARS[p.char].id, cos: p.cos ? { skin: p.cos.skin, acc: p.cos.acc, gift: p.cos.giftFrom ? p.cos.giftFrom.acc : null } : null, score: p.score, medal: medal(p.score), moodPre: p.moodPre, moodPost: p.moodPost, readUses: p.readUses, readAloud: p.readAloud, motor: p.motor ? { seconds: p.motor.seconds, deaths: p.motor.deaths, hits: p.motor.hits } : null, stages: p.stages, answers: p.answers.map((a) => ({ rd: a.rd, slot: a.slot, skill: a.skill, form: a.form, order: a.order, ped: a.ped, changes: a.changes, tFirst: a.tFirst, dwell: a.dwell, visits: a.visits })) })) };
  api('/api/result', payload).then((r) => { S.saved = r.status === 200; });
}
