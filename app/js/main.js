/* Inicialização: confere a licença, liga o "batimento" de controle e entrega a interface. © Thiago Silva. */
import { init, lockedScreen } from './ui.js';

const TITLES = { blocked: 'Licença suspensa', expired: 'Licença expirada', auth: 'Sessão encerrada', device_limit: 'Limite de aparelhos' };
async function me() {
  try {
    const r = await fetch('/api/me', { cache: 'no-store' }); const j = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, j };
  } catch (e) { return { ok: false, status: 0, j: {} }; }
}
(async function boot() {
  const r = await me();
  if (!r.ok) { if (r.status === 401 || r.status === 0) { location.href = '/?m=auth'; return; } }
  init(r.j);
  let fails = 0;
  setInterval(async () => {
    const p = await me();
    if (p.ok) { fails = 0; return; }
    if (p.status === 403 || p.status === 401) lockedScreen(TITLES[p.j.error] || 'Acesso encerrado', p.j.msg || 'Entre em contato com o autor.');
    else if (++fails > 6) lockedScreen('Sem conexão', 'Não foi possível confirmar a licença. Verifique a internet.');
  }, 45000);
  document.addEventListener('visibilitychange', async () => { if (!document.hidden) { const p = await me(); if (!p.ok && (p.status === 401 || p.status === 403)) lockedScreen(TITLES[p.j.error] || 'Acesso encerrado', p.j.msg || ''); } });
})();
