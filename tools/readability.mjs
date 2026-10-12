// Legibilidade dos itens: Índice de Facilidade de Leitura de Flesch ADAPTADO ao português (Martins et al., 1996/NILC):
//   IFL = 248,835 − 1,015 × (palavras/sentenças) − 84,6 × (sílabas/palavras)
// Faixas usadas na literatura brasileira: 75–100 muito fácil (até 4ª série) · 50–75 fácil (até 8ª série) · 25–50 difícil (ensino médio) · 0–25 muito difícil (superior).
// Contagem de sílabas por heurística (grupos vocálicos, ditongos colapsados): erro típico de poucos %, por isso o valor é APROXIMADO.
import { PACK, PRACTICE } from '../app/js/items.js';
export function syllables(w) {
  w = w.toLowerCase().normalize('NFC').replace(/[^a-záàâãéêíóôõúüç]/g, ''); if (!w) return 0;
  const g = w.match(/[aeiouáàâãéêíóôõúü]+/g) || []; let n = 0;
  for (const s of g) { n += 1; if (/[aeo][aeo]|[áéíóú][aeiou]{0}[aeo]/.test(s) && s.length >= 2 && !/[iu]/.test(s)) n += 1; if (/^[aeiouáâãéêíóôõú]{3,}$/.test(s) && !/[iu]/.test(s)) n += 0; }   // hiato aproximado: vogais abertas seguidas (ex.: "oe", "ae")
  return Math.max(1, n);
}
export function ifl(text) {
  const sents = text.split(/[.!?;:]+(?:\s|$)/).filter((s) => /\p{L}/u.test(s)); const words = text.match(/[\p{L}]+(?:-[\p{L}]+)*/gu) || [];
  if (!sents.length || !words.length) return null; const syl = words.reduce((a, w) => a + syllables(w), 0);
  const asl = words.length / sents.length, asw = syl / words.length; return { ifl: 248.835 - 1.015 * asl - 84.6 * asw, asl, asw, words: words.length };
}
export const band = (v) => (v >= 75 ? 'muito fácil' : v >= 50 ? 'fácil' : v >= 25 ? 'difícil' : 'muito difícil');
if (process.argv[1] && process.argv[1].endsWith('readability.mjs')) {
  const rows = []; PACK.slots.forEach((s, si) => { for (const [f, it] of Object.entries(s.forms)) { const r = ifl([it.ctx, it.stem, ...it.opts.map((o) => o.t)].join(' ')); const q = ifl((it.ctx || '') + ' ' + it.stem); rows.push({ k: `${si}${f}`, skill: s.skill, all: r.ifl, q: q.ifl, asl: r.asl, words: r.words }); } });
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length; const cnt = {}; rows.forEach((r) => { const b = band(r.all); cnt[b] = (cnt[b] || 0) + 1; });
  console.log('itens', rows.length, '| IFL médio (enunciado+alternativas):', avg(rows.map((r) => r.all)).toFixed(1), '| faixas:', JSON.stringify(cnt));
  console.log('palavras por item (média):', avg(rows.map((r) => r.words)).toFixed(0), '| palavras por frase (média):', avg(rows.map((r) => r.asl)).toFixed(1));
  for (const sk of PACK.skills.map((x) => x.code)) { const a = rows.filter((r) => r.skill === sk); console.log(sk, 'IFL médio', avg(a.map((r) => r.all)).toFixed(1), 'mín', Math.min(...a.map((r) => r.all)).toFixed(0), 'máx', Math.max(...a.map((r) => r.all)).toFixed(0)); }
  console.log('mais difíceis:', rows.sort((a, b) => a.all - b.all).slice(0, 8).map((r) => `${r.k}:${r.all.toFixed(0)}`).join(' '));
}
