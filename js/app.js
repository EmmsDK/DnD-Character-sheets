import { STATIC_IDS, state, createDefaultState, setState, persist, loadFromStorage, blankRow } from './state.js';
import { renderAllLists, renderList } from './rows.js';
import { renderPreview } from './preview.js';

function applyStaticState() {
  STATIC_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = state.static[id] ?? '';
  });
}

function render() {
  renderAllLists();
  renderPreview();
}

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target.id === 'combat-hp') {
    state.static.combatHp = target.value;
    persist();
    return;
  }
  if (STATIC_IDS.includes(target.id)) {
    state.static[target.id] = target.value;
    renderPreview();
    persist();
    return;
  }
  const section = target.dataset.section;
  if (section) {
    const index = Number(target.dataset.index);
    const field = target.dataset.field;
    state.lists[section][index][field] = target.value;
    renderPreview();
    persist();
  }
});

document.addEventListener('click', (event) => {
  const addKey = event.target.dataset.add;
  if (addKey) {
    state.lists[addKey].push(blankRow(addKey));
    renderList(addKey);
    renderPreview();
    persist();
    return;
  }
  const removeKey = event.target.dataset.remove;
  if (removeKey) {
    const index = Number(event.target.dataset.removeIndex);
    state.lists[removeKey].splice(index, 1);
    if (state.lists[removeKey].length === 0) {
      state.lists[removeKey].push(blankRow(removeKey));
    }
    renderList(removeKey);
    renderPreview();
    persist();
  }
});

document.getElementById('print-btn').addEventListener('click', () => window.print());

document.getElementById('new-btn').addEventListener('click', () => {
  if (!confirm('Start a new character? Unsaved changes will be lost unless exported.')) return;
  setState(createDefaultState());
  applyStaticState();
  render();
  persist();
});

document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = (state.static.name || 'character').trim().replace(/[^a-z0-9-_]+/gi, '_');
  a.href = url;
  a.download = `${filename || 'character'}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import-btn').addEventListener('click', () => {
  document.getElementById('import-input').click();
});

document.getElementById('import-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.static || !parsed.lists) throw new Error('Invalid character file');
      setState(parsed);
      applyStaticState();
      render();
      persist();
    } catch (error) {
      alert('Could not import that file: ' + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
});

loadFromStorage();
applyStaticState();
render();
