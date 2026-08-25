import { LIST_SECTIONS, state } from './state.js';
import { esc, getModifier, effectiveScore } from './helpers.js';

export function renderRowField(section, item, index, fieldDef) {
  const value = item[fieldDef.field] ?? '';
  if (fieldDef.type === 'select') {
    const opts = fieldDef.options
      .map((o) => `<option value="${o}" ${o === value ? 'selected' : ''}>${o.toUpperCase()}</option>`)
      .join('');
    return `<select data-section="${section}" data-index="${index}" data-field="${fieldDef.field}">${opts}</select>`;
  }
  return `<input data-section="${section}" data-index="${index}" data-field="${fieldDef.field}" type="${fieldDef.type}" placeholder="${esc(fieldDef.placeholder || '')}" value="${esc(value)}" />`;
}

export function renderList(sectionKey) {
  const config = LIST_SECTIONS[sectionKey];
  const container = document.getElementById(config.containerId);
  if (!container) return;
  const items = state.lists[sectionKey];
  container.innerHTML = items
    .map((item, index) => {
      const fields = config.fields.map((f) => renderRowField(sectionKey, item, index, f)).join('');
      return `<div class="row-group ${config.rowClass || ''}" data-row-section="${sectionKey}" data-row-index="${index}">${fields}<button type="button" class="remove-row" data-remove="${sectionKey}" data-remove-index="${index}" title="Remove">✕</button></div>`;
    })
    .join('');
}

export function renderAllLists() {
  Object.keys(LIST_SECTIONS).forEach(renderList);
}

export function skillTotal(item) {
  const ranks = Number(item.ranks) || 0;
  const misc = Number(item.misc) || 0;
  const abilMod = item.ability ? getModifier(effectiveScore(item.ability)) : 0;
  return ranks + misc + abilMod;
}
