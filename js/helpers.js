import { state } from './state.js';

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function getModifier(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 0;
  return Math.floor((value - 10) / 2);
}

export function fmtSigned(n) {
  const value = Number(n) || 0;
  return value >= 0 ? `+${value}` : `${value}`;
}

export function effectiveScore(abil) {
  const base = Number(state.static[`${abil}-score`]) || 0;
  const enh = Number(state.static[`${abil}-enh`]) || 0;
  return base + enh;
}
