/* Loja do final: skins (filtros de cor) e acessórios desenhados em vetor. Só cosmético; nunca entra na nota. © Thiago Silva. */
export const SKINS = [
  { id: 0, name: 'Original', css: '', price: 0 },
  { id: 1, name: 'Neon', css: 'hue-rotate(95deg) saturate(1.3)', price: 30 },
  { id: 2, name: 'Gelo', css: 'hue-rotate(170deg) brightness(1.08)', price: 30 },
  { id: 3, name: 'Pôr do sol', css: 'hue-rotate(-45deg) saturate(1.35)', price: 30 },
  { id: 4, name: 'Sombra', css: 'grayscale(.9) contrast(1.25)', price: 30 },
];
export const ACCS = [
  { id: 'crown', name: 'Coroa', price: 60 },
  { id: 'halo', name: 'Auréola', price: 40 },
  { id: 'wiz', name: 'Chapéu mágico', price: 50 },
  { id: 'party', name: 'Chapéu de festa', price: 30 },
  { id: 'stars', name: 'Estrelas', price: 45 },
];
export const newCos = () => ({ skin: 0, acc: null, owned: { skin: [0], acc: [] }, giftFrom: null, gifted: null });

function head(src) { // topo e centro da cabeça, medidos pela transparência do sprite
  const w = src.width, h = src.height; const d = src.getContext('2d').getImageData(0, 0, w, h).data; let top = -1;
  for (let y = 0; y < h && top < 0; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { top = y; break; }
  if (top < 0) top = 0; let sx = 0, n = 0, mn = w, mx = 0; const band = Math.max(4, Math.round(h * 0.22));
  for (let y = top; y < Math.min(h, top + band); y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { sx += x; n++; if (x < mn) mn = x; if (x > mx) mx = x; }
  return { top, cx: n ? sx / n : w / 2, hw: Math.max(14, (mx - mn) / 2) };
}
function drawAcc(c, id, cx, ty, hw, t) {
  c.save(); c.lineJoin = 'round';
  if (id === 'crown') { const w = hw * 1.15, h = hw * 0.8, y = ty - h * 0.55; const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, '#fff3a0'); g.addColorStop(1, '#e0a420'); c.fillStyle = g; c.strokeStyle = '#8a5a00'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - w, y); c.lineTo(cx - w, y - h * 0.6); c.lineTo(cx - w * 0.5, y - h * 0.25); c.lineTo(cx, y - h); c.lineTo(cx + w * 0.5, y - h * 0.25); c.lineTo(cx + w, y - h * 0.6); c.lineTo(cx + w, y); c.closePath(); c.fill(); c.stroke(); [['#ff4d78', -w * 0.6], ['#5cecff', 0], ['#7dffa3', w * 0.6]].forEach(([col, dx]) => { c.fillStyle = col; c.beginPath(); c.arc(cx + dx, y - h * 0.22, hw * 0.1, 0, 6.3); c.fill(); }); }
  else if (id === 'halo') { const y = ty - hw * 0.35 + Math.sin(t / 400) * 2; c.strokeStyle = '#ffe36b'; c.lineWidth = hw * 0.16; c.shadowColor = '#ffe36b'; c.shadowBlur = 12; c.beginPath(); c.ellipse(cx, y, hw * 0.85, hw * 0.24, 0, 0, 6.3); c.stroke(); }
  else if (id === 'wiz') { const y = ty + hw * 0.1, h = hw * 1.9; const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, '#9b6bff'); g.addColorStop(1, '#4b2fb3'); c.fillStyle = g; c.strokeStyle = '#2a1670'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - hw * 1.05, y); c.quadraticCurveTo(cx - hw * 0.3, y - h * 0.55, cx + hw * 0.55, y - h); c.quadraticCurveTo(cx + hw * 0.5, y - h * 0.45, cx + hw * 1.05, y); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#ffd23f'; c.fillRect(cx - hw * 0.95, y - hw * 0.28, hw * 1.9, hw * 0.2); c.beginPath(); c.arc(cx + hw * 0.4, y - h * 0.62, hw * 0.12, 0, 6.3); c.fill(); }
  else if (id === 'party') { const y = ty + hw * 0.05, h = hw * 1.5; const g = c.createLinearGradient(cx - hw, 0, cx + hw, 0); g.addColorStop(0, '#ff6ac8'); g.addColorStop(0.5, '#ffd23f'); g.addColorStop(1, '#46d3ff'); c.fillStyle = g; c.strokeStyle = '#6a2f8a'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - hw * 0.75, y); c.lineTo(cx, y - h); c.lineTo(cx + hw * 0.75, y); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, y - h, hw * 0.16, 0, 6.3); c.fill(); }
  else if (id === 'stars') { for (let k = 0; k < 4; k++) { const a = t / 600 + k * 1.57, sx = cx + Math.cos(a) * hw * 1.05, sy = ty - hw * 0.15 + Math.sin(a) * hw * 0.28, r = hw * 0.2; c.fillStyle = k % 2 ? '#fff6a8' : '#ffd23f'; c.shadowColor = '#ffe36b'; c.shadowBlur = 8; c.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, an = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr); } c.closePath(); c.fill(); } }
  c.restore();
}
/* devolve um <div> com o sprite (com a skin) e o acessório por cima; animado se animate=true */
export function dressed(src, cos, animate) {
  const w = src.width, h = src.height, pad = Math.round(h * 0.3); const H = head(src);
  const box = document.createElement('div'); box.className = 'dress'; box.style.cssText = `position:relative;width:${w}px;height:${h + pad}px;max-width:100%`;
  const a = document.createElement('canvas'); a.width = w; a.height = h + pad; a.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%'; a.getContext('2d').drawImage(src, 0, pad);
  const skin = SKINS[(cos && cos.skin) || 0]; if (skin.css) a.style.filter = skin.css;
  const b = document.createElement('canvas'); b.width = w; b.height = h + pad; b.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
  box.append(a, b); const acc = cos && cos.acc;
  if (acc) { const x = b.getContext('2d'); const paint = (t) => { x.clearRect(0, 0, w, h + pad); drawAcc(x, acc, H.cx, pad + H.top, H.hw, t); }; paint(0); if (animate) { let on = true; const loop = (t) => { if (!box.isConnected) { on = false; return; } paint(t); if (on) requestAnimationFrame(loop); }; requestAnimationFrame(loop); } }
  return box;
}
