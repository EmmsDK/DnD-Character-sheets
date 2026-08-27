import { state, ABILS } from './state.js';
import { esc, getModifier, fmtSigned, effectiveScore } from './helpers.js';
import { skillTotal } from './rows.js';

export function renderPreview() {
  const s = state.static;
  const preview = document.getElementById('sheet-preview');

  const abilityTbody = ABILS.map((a) => {
    const base = s[`${a}-score`] || '10';
    const enh = Number(s[`${a}-enh`]) || 0;
    const eff = effectiveScore(a);
    const scoreLabel = enh ? `${base} (${eff})` : `${base}`;
    return `<tr><td class="ab-name">${a.toUpperCase()}</td><td>${scoreLabel}</td><td class="ab-mod">${fmtSigned(getModifier(eff))}</td></tr>`;
  }).join('');

  const attacksRows = state.lists.attacks
    .filter((a) => a.name || a.bonus || a.damage)
    .reduce((acc, a, i, arr) => {
      const prev = arr[i - 1];
      if (i > 0 && prev && /melee/i.test(prev.name) && !/melee/i.test(a.name)) {
        acc.push('<tr class="attack-spacer"><td colspan="4"></td></tr>');
      }
      acc.push(`<tr><td>${esc(a.name) || '—'}</td><td>${esc(a.bonus) || '—'}</td><td>${esc(a.damage) || '—'}</td><td>${esc(a.notes) || '—'}</td></tr>`);
      return acc;
    }, [])
    .join('');

  const featsList = state.lists.feats.filter((f) => f.name).map((f) => `<span class="chip">${esc(f.name)}</span>`).join('') || '<span class="muted">—</span>';

  const skillOrder = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const skillsByAbil = {};
  state.lists.skills.filter((sk) => sk.name).forEach((sk) => {
    const key = sk.ability ? sk.ability.toLowerCase() : 'other';
    if (!skillsByAbil[key]) skillsByAbil[key] = [];
    skillsByAbil[key].push(sk);
  });
  const skillsRows = [...skillOrder, 'other']
    .filter((ab) => skillsByAbil[ab])
    .flatMap((ab) => {
      const label = ab === 'other' ? 'Other' : ab.toUpperCase();
      const header = `<tr class="skill-ability-header"><td colspan="5">${label}</td></tr>`;
      const rows = skillsByAbil[ab].map((sk) => {
        const abilMod = sk.ability ? getModifier(effectiveScore(sk.ability)) : 0;
        return `<tr><td>${esc(sk.name)}</td><td><strong>${fmtSigned(skillTotal(sk))}</strong></td><td class="skill-sub">${sk.ranks || 0}</td><td class="skill-sub">${fmtSigned(abilMod)}</td><td class="skill-sub">${fmtSigned(sk.misc || 0)}</td></tr>`;
      });
      return [header, ...rows];
    })
    .join('');

  const favoredRows = state.lists.favoredEnemies.filter((f) => f.enemy).map((f) => `<div><span>${esc(f.enemy)}</span><strong>${esc(f.bonus)}</strong></div>`).join('') || '<span class="muted">—</span>';

  const classFeatureRows = state.lists.classFeatures.filter((c) => c.name).map((c) => `<div class="cf-item"><p class="cf-title">${esc(c.name)}</p>${c.description ? `<p class="cf-desc">• ${esc(c.description)}</p>` : ''}</div>`).join('') || '<p class="muted">—</p>';

  const weaponsList = state.lists.weapons.filter((w) => w.name && !/wand/i.test(w.name)).map((w) => `<li>${esc(w.name)}</li>`).join('') || '<li class="muted">—</li>';
  const wandsHtml = state.lists.weapons.filter((w) => w.name && /wand/i.test(w.name)).map((w) => `<div class="wand-item"><span>${esc(w.name)}</span><span class="charges-label">Charges:</span><span class="charges-box"></span></div>`).join('');
  const gearList = state.lists.gear.filter((g) => g.name).map((g) => `<li>${esc(g.name)}</li>`).join('') || '<li class="muted">—</li>';

  const slotsByLevel = {};
  state.lists.spellSlots.filter((sl) => sl.level).forEach((sl) => { slotsByLevel[sl.level] = sl.perDay; });

  const spellsByLevel = {};
  state.lists.spellsKnown.filter((sp) => sp.name).forEach((sp) => {
    const lvl = sp.level || '?';
    if (!spellsByLevel[lvl]) spellsByLevel[lvl] = [];
    spellsByLevel[lvl].push(sp);
  });
  const spellLevelGroupsHtml = Object.keys(spellsByLevel).sort().map((lvl) => {
    const perDay = slotsByLevel[lvl] ? `${slotsByLevel[lvl]}/day` : '—/day';
    const rows = spellsByLevel[lvl].map((sp) => `<tr><td class="prep-box"></td><td class="spell-name">${esc(sp.name)}</td><td class="spell-desc">${esc(sp.description) || ''}</td></tr>`).join('');
    return `<div class="spell-group"><div class="spell-group-header">${esc(lvl)}. Level (${perDay})</div><table class="spell-detail-table"><tbody>${rows}</tbody></table></div>`;
  }).join('') || '<p class="muted">—</p>';

  const quiverTableRows = state.lists.quiver.filter((q) => q.name).map((q) => {
    const label = q.description ? `${esc(q.name)} (${esc(q.description)})` : esc(q.name);
    return `<tr><td class="qty-box"></td><td>${label}</td></tr>`;
  }).join('');
  const blankQuiverRows = Array(3).fill('<tr><td class="qty-box"></td><td>&nbsp;</td></tr>').join('');

  const fortTotal = Number(s.fortBase || 0) + getModifier(effectiveScore('con'));
  const refTotal  = Number(s.refBase  || 0) + getModifier(effectiveScore('dex'));
  const willTotal = Number(s.willBase || 0) + getModifier(effectiveScore('wis'));
  const initTotal = getModifier(effectiveScore('dex')) + Number(s.initMisc || 0);

  const hpDisplay = `${esc(s.hp) || 0}${s.maxHp ? ` (${esc(s.maxHp)})` : ''}`;
  const combatHpInput = `<input id="combat-hp" class="combat-hp-input" type="text" inputmode="numeric" value="${esc(s.combatHp || '')}" title="Current HP — edit during combat" />`;
  const saveNotesHtml = s.saveNotes
    ? s.saveNotes.split(',').map((n) => `<div class="defense-notes-text">${esc(n.trim())}</div>`).join('')
    : '';

  preview.innerHTML = `
    <header class="sheet-header">
      <div>
        <p class="sheet-kicker">Adventurer Record</p>
        <h2>${esc(s.name) || 'Character Name'}</h2>
        <p>${esc(s.className) || 'Class'} · ${esc(s.race) || 'Race'}</p>
      </div>
      <div class="sheet-badges">
        <span>${esc(s.alignment) || 'Alignment'}</span>
        <span>${esc(s.height) || 'Height'}</span>
        <span>${esc(s.weight) || 'Weight'}</span>
      </div>
    </header>

    <div class="sheet-grid">
      <div class="sheet-section">
        <h3>Ability Scores</h3>
        <table class="sheet-table ability-table">
          <thead><tr><th>Ability</th><th>Score</th><th>Modifier</th></tr></thead>
          <tbody>${abilityTbody}</tbody>
        </table>
      </div>

      <div class="sheet-section">
        <div class="defense-headers">
          <h3>Defense &amp; Saves</h3>
          <h3>Other</h3>
        </div>
        <div class="defense-layout">
          <table class="sheet-table defense-table">
            <tbody>
              <tr><th>AC</th><td>${esc(s.ac) || 10}${s.acBonus ? ` (${esc(s.acBonus)})` : ''}</td></tr>
              <tr><th>Fortitude</th><td>${fmtSigned(fortTotal)}</td></tr>
              <tr><th>Reflex</th><td>${fmtSigned(refTotal)}</td></tr>
              <tr><th>Will</th><td>${fmtSigned(willTotal)}</td></tr>
              <tr><th>Initiative</th><td>${fmtSigned(initTotal)}</td></tr>
              <tr><th>Hit Points</th><td class="hp-track-cell"><span>${hpDisplay}</span>${combatHpInput}</td></tr>
            </tbody>
          </table>
          <div class="defense-other">
            <div class="defense-other-row"><span>Touch AC</span><strong>${esc(s.touchAc) || 10}</strong></div>
            <div class="defense-other-row"><span>Flatfooted AC</span><strong>${esc(s.flatfootedAc) || 10}</strong></div>
            ${saveNotesHtml}
            <div class="defense-other-row"><span>Grapple</span><strong>${fmtSigned(s.grapple)}</strong></div>
          </div>
        </div>
      </div>

      <div class="sheet-section wide">
        <h3>Attacks</h3>
        <table class="sheet-table attacks-table">
          <thead><tr><th>Attack</th><th>Bonus</th><th>Damage</th><th>Notes</th></tr></thead>
          <tbody>${attacksRows || '<tr><td colspan="4" class="muted">—</td></tr>'}</tbody>
        </table>
      </div>

      <div class="sheet-section wide">
        <h3>Feats</h3>
        <div class="chip-row">${featsList}</div>
      </div>

      <div class="skills-and-sidebar">
        <div class="sheet-section">
          <h3>Skills</h3>
          <table class="sheet-table"><thead><tr><th>Skill</th><th>Total</th><th>Ranks</th><th>Ability</th><th>Synergy/Feat</th></tr></thead>
          <tbody>${skillsRows || '<tr><td colspan="5" class="muted">—</td></tr>'}</tbody></table>
        </div>
        <div class="sheet-col">
          <div class="sheet-section sidebar-merged">
            <h3>Languages</h3>
            <p>${esc(s.languages) || '—'}</p>
            <h3>Speed</h3>
            <p>${esc(s.speed) || '30 ft'}</p>
            <h3>Favored Enemies / Bonuses</h3>
            <div class="mini-grid">${favoredRows}</div>
            <h3>Class Features</h3>
            ${classFeatureRows}
          </div>
        </div>
      </div>

      <div class="sheet-section">
        <h3>Weapons &amp; Armor</h3>
        <ul class="sheet-list">${weaponsList}</ul>
        ${wandsHtml}
      </div>

      <div class="sheet-section">
        <h3>General Equipment</h3>
        <ul class="sheet-list">${gearList}</ul>
      </div>

      <div class="sheet-section wide">
        <h3>Coins</h3>
        <div class="mini-grid">
          <div><span>Platinum (PP)</span><strong>${esc(s.pp) || 0}</strong></div>
          <div><span>Gold (GP)</span><strong>${esc(s.gp) || 0}</strong></div>
          <div><span>Silver (SP)</span><strong>${esc(s.sp) || 0}</strong></div>
          <div><span>Copper (CP)</span><strong>${esc(s.cp) || 0}</strong></div>
        </div>
      </div>

      <div class="sheet-section wide print-page-break spells-page">
        <div class="spells-page-top">
          <div class="spells-page-heading">
            <span class="spells-caster-info">Current Caster Level = ${esc(s.casterLevel) || '—'}</span>
            <h3 class="spells-main-title">Spells</h3>
            <span class="spells-level-note">Level = Caster Level</span>
          </div>
        </div>
        <div class="spells-page-layout">
          <div class="quiver-col">
            <table class="spell-detail-table">
              <thead><tr><th colspan="2">Quiver</th></tr></thead>
              <tbody>${quiverTableRows}${blankQuiverRows}</tbody>
            </table>
          </div>
          <div class="spells-col">
            ${spellLevelGroupsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}
