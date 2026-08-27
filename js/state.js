export const STORAGE_KEY = 'dnd-sheet-designer-state-v2';
export const ABILS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const LIST_SECTIONS = {
  attacks: {
    containerId: 'attacks-list',
    fields: [
      { field: 'name', placeholder: 'Attack name (e.g. Melee Attack)', type: 'text' },
      { field: 'bonus', placeholder: 'Bonus (e.g. +16/+11)', type: 'text' },
      { field: 'damage', placeholder: 'Damage (e.g. 1d8+6)', type: 'text' },
      { field: 'notes', placeholder: 'Notes / range', type: 'text' },
    ],
  },
  feats: {
    containerId: 'feats-list',
    fields: [{ field: 'name', placeholder: 'Feat name', type: 'text' }],
  },
  skills: {
    containerId: 'skills-list',
    rowClass: 'skills-row',
    fields: [
      { field: 'name', placeholder: 'Skill name', type: 'text' },
      { field: 'ability', type: 'select', options: ABILS },
      { field: 'ranks', placeholder: '0', type: 'number' },
      { field: 'misc', placeholder: '0', type: 'number' },
    ],
  },
  favoredEnemies: {
    containerId: 'favored-list',
    fields: [
      { field: 'enemy', placeholder: 'Enemy / bonus type', type: 'text' },
      { field: 'bonus', placeholder: 'Bonus (e.g. +4)', type: 'text' },
    ],
  },
  classFeatures: {
    containerId: 'classfeatures-list',
    fields: [
      { field: 'name', placeholder: 'Feature name', type: 'text' },
      { field: 'description', placeholder: 'Description', type: 'text' },
    ],
  },
  weapons: {
    containerId: 'weapons-list',
    fields: [{ field: 'name', placeholder: 'Weapon / armor item', type: 'text' }],
  },
  gear: {
    containerId: 'gear-list',
    fields: [{ field: 'name', placeholder: 'Equipment item', type: 'text' }],
  },
  spellSlots: {
    containerId: 'spellslots-list',
    fields: [
      { field: 'level', placeholder: 'Level', type: 'number' },
      { field: 'perDay', placeholder: 'Per day', type: 'number' },
    ],
  },
  spellsKnown: {
    containerId: 'spellsknown-list',
    fields: [
      { field: 'level', placeholder: 'Level', type: 'number' },
      { field: 'name', placeholder: 'Spell name', type: 'text' },
      { field: 'description', placeholder: 'Effect', type: 'text' },
    ],
  },
  quiver: {
    containerId: 'quiver-list',
    fields: [
      { field: 'name', placeholder: 'Item name', type: 'text' },
      { field: 'count', placeholder: 'Qty', type: 'number' },
      { field: 'description', placeholder: 'Effect', type: 'text' },
    ],
  },
};

export const STATIC_IDS = [
  'name', 'race', 'alignment', 'className', 'height', 'weight',
  'str-score', 'str-enh', 'dex-score', 'dex-enh', 'con-score', 'con-enh',
  'int-score', 'int-enh', 'wis-score', 'wis-enh', 'cha-score', 'cha-enh',
  'ac', 'acBonus', 'touchAc', 'flatfootedAc', 'fortBase', 'refBase', 'willBase',
  'initMisc', 'hp', 'maxHp', 'grapple', 'speed', 'saveNotes',
  'languages', 'pp', 'gp', 'sp', 'cp', 'notes', 'casterLevel',
];

export function createDefaultState() {
  return {
    static: {},
    lists: {
      attacks: [{ name: '', bonus: '', damage: '', notes: '' }],
      feats: [{ name: '' }],
      skills: [{ name: '', ability: 'str', ranks: '', misc: '' }],
      favoredEnemies: [{ enemy: '', bonus: '' }],
      classFeatures: [{ name: '', description: '' }],
      weapons: [{ name: '' }],
      gear: [{ name: '' }],
      spellSlots: [{ level: '', perDay: '' }],
      spellsKnown: [{ level: '', name: '', description: '' }],
      quiver: [{ name: '', count: '', description: '' }],
    },
  };
}

export let state = createDefaultState();

export function setState(newState) {
  state = newState;
}

export function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.static && parsed.lists) state = parsed;
  } catch (error) {
    console.warn('Could not restore saved character sheet data.', error);
  }
}

export function blankRow(sectionKey) {
  const config = LIST_SECTIONS[sectionKey];
  const blank = {};
  config.fields.forEach((f) => { blank[f.field] = f.type === 'select' ? f.options[0] : ''; });
  return blank;
}
