'use strict';
(function () {
  // device id estável para controle de licença
  function deviceId() {
    try {
      let d = localStorage.getItem('pa_dev');
      if (!d) { d = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)); localStorage.setItem('pa_dev', d); }
      return d;
    } catch (e) { return 'tmp-' + Math.random().toString(16).slice(2, 14) + Date.now().toString(16); }
  }
  const MSGS = { blocked: 'Licença suspensa pelo autor.', expired: 'Licença expirada.', auth: 'Sessão encerrada. Entre novamente.', device_limit: 'Limite de aparelhos atingido.' };
  const $ = (id) => document.getElementById(id);
  const m = new URLSearchParams(location.search).get('m');
  const show = (t) => { const e = $('msg'); e.textContent = t; e.hidden = !t; };
  if (m && MSGS[m]) show(MSGS[m]);
  try { const n = localStorage.getItem('pa_name'); if (n) $('name').value = n; } catch (e) { /* ok */ }

  $('f').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const code = $('code').value.trim(); const name = $('name').value.trim();
    if (!code) return show('Digite o código de acesso.');
    if (name.length < 3) return show('Digite seu nome completo.');
    $('go').disabled = true; show('');
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, name, deviceId: deviceId() }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { try { localStorage.setItem('pa_name', name); } catch (e) { /* ok */ } location.href = '/app/'; return; }
      show(j.msg || 'Não foi possível entrar.');
    } catch (e) { show('Sem conexão com o servidor. Verifique a internet e tente de novo.'); }
    $('go').disabled = false;
  });

  // fundo animado leve (estrelas pixel)
  const c = $('bg'); const x = c.getContext('2d'); let W, H, stars = [];
  function size() { W = c.width = Math.ceil(innerWidth / 4); H = c.height = Math.ceil(innerHeight / 4); stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 0.25 + 0.05, t: Math.random() * 6 })); }
  size(); addEventListener('resize', size);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function loop(t) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0820'); g.addColorStop(0.6, '#2a1b63'); g.addColorStop(1, '#5b2a86');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (const s of stars) { if (!reduce) { s.x -= s.s; if (s.x < 0) s.x = W; } x.fillStyle = (Math.sin(t / 500 + s.t) > 0) ? '#fff' : '#9aa0ff'; x.fillRect(s.x | 0, s.y | 0, 1, 1); }
    x.fillStyle = '#120d33'; for (let i = 0; i < W; i += 2) { const h = 6 + Math.sin(i * 0.11) * 4 + Math.sin(i * 0.037) * 7; x.fillRect(i, H - h, 2, h); }
    requestAnimationFrame(loop);
  })(0);
})();
