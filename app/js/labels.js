/* Rótulos curtos que aparecem em cima de cada objeto depois que o aluno ouviu a versão (ajuda a lembrar qual é qual). © Thiago Silva. */
export const LABELS = {
  '0A': ['Cérebro não interpreta', 'Olho interpreta sozinho', 'Olho emite raios'],
  '0B': ['Reflexo da luz da tela', 'Olho emite feixe', 'Poltrona com luz própria'],
  '1A': ['Divergente', 'Convergente', 'Nenhuma lente'],
  '1B': ['Divergente (fina)', 'Convergente (grossa)', 'Convergente: aumenta'],
  '2A': ['Paulo conv. · Rita div.', 'Paulo div. · Rita conv.', 'Mesma lente'],
  '2B': ['Convergente', 'Divergente', 'Lente escura'],
  '3A': ['Esqueleto também apoia', 'Só protege órgãos', 'Ossos movem tudo'],
  '3B': ['Sustenta e protege', 'Produz calor', 'Move sozinho'],
  '4A': ['Músculos se alternam', 'Músculos empurram', 'Contraem juntos'],
  '4B': ['Músculo enfraqueceu', 'Ossos dobram sozinhos', 'Músculos são molas'],
  '5A': ['Sinal olhos→músculos', 'Ossos comandam', 'Músculos decidem'],
  '5B': ['Sinal não chega', 'Ossos sem ordens', 'Músculos sem comando'],
  '6A': ['Cafeína, nicotina, álcool', 'Só as proibidas', 'Todas as substâncias'],
  '6B': ['Cafeína estimula', 'Age só no estômago', 'Natural: não atua'],
  '7A': ['Sistema nervoso mais lento', 'Acelera o sistema', 'Só o fígado'],
  '7B': ['Reduz atenção e reflexos', 'Só estômago e fígado', 'Aumenta a força'],
  '8A': ['Adaptação à nicotina', 'Falta de vontade', 'Legal não vicia'],
  '8B': ['É falsa', 'É verdadeira', 'Só as legais'],
  P: ['Plantas iguais: claro × escuro', 'Plantas diferentes', 'Uma planta só'],
};
import { EXTRA_LABELS } from './bank_extra.js';
Object.assign(LABELS, EXTRA_LABELS);
