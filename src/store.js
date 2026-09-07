import { createSeedData } from './seed.js';

const KEY = 'guyane-cultures-v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seed = createSeedData();
      saveState(seed);
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    const seed = createSeedData();
    saveState(seed);
    return seed;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportJSON(state) {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('JSON invalide');
  if (!Array.isArray(data.parcels) || !Array.isArray(data.crops)) {
    throw new Error('Structure manquante (parcels, crops requis)');
  }
  data.preparations ||= [];
  data.cultures ||= [];
  data.treatments ||= [];
  data.applications ||= [];
  data.failures ||= [];
  data.version = data.version || 1;
  saveState(data);
  return data;
}

export function resetToSeed() {
  const seed = createSeedData();
  saveState(seed);
  return seed;
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function addDays(isoDate, days) {
  if (!isoDate) return null;
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().slice(0, 10);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function monthIndex(iso) {
  if (!iso) return -1;
  return new Date(iso + 'T12:00:00').getMonth();
}

/** Saison Guyane : chaude sept–mars, fraîche avr–août */
export function getGuyaneSeason(date = new Date()) {
  const m = date.getMonth(); // 0=jan
  // chaude: sept(8)–mars(2) ; fraîche: avr(3)–août(7)
  if (m >= 3 && m <= 7) {
    return {
      name: 'Saison fraîche',
      period: 'avril – août',
      icon: '🌧️',
      tip: 'Idéal pour salades, choux et semis délicats. Pluies plus fréquentes.',
    };
  }
  return {
    name: 'Saison chaude',
    period: 'septembre – mars',
    icon: '☀️',
    tip: 'Favorable au manioc, gombo, aubergine. Surveiller l\'irrigation.',
  };
}

export function calcCultureDates(crop, nurseryStart, plantDateOverride) {
  if (!crop) return {};
  let nurseryStartDate = nurseryStart || null;
  let plantDate = plantDateOverride || null;

  if (nurseryStartDate && crop.nurseryDays > 0 && !plantDate) {
    plantDate = addDays(nurseryStartDate, crop.nurseryDays);
  }
  if (!nurseryStartDate && plantDate && crop.nurseryDays > 0) {
    nurseryStartDate = addDays(plantDate, -crop.nurseryDays);
  }
  if (!plantDate && nurseryStartDate && crop.nurseryDays === 0) {
    plantDate = nurseryStartDate;
  }

  const harvestStart = plantDate ? addDays(plantDate, crop.growthDays) : null;
  const harvestEnd = harvestStart ? addDays(harvestStart, crop.harvestDays) : null;

  return { nurseryStart: nurseryStartDate, plantDate, harvestStart, harvestEnd };
}

export function inferPhase(culture, today = new Date()) {
  if (culture.status === 'annulé') return 'annulé';
  const t = today.toISOString().slice(0, 10);
  if (culture.harvestStart && t >= culture.harvestStart) {
    if (culture.harvestEnd && t > culture.harvestEnd) return 'terminé';
    return 'harvest';
  }
  if (culture.plantDate && t >= culture.plantDate) return 'culture';
  if (culture.nurseryStart && t >= culture.nurseryStart) return 'nursery';
  return culture.phase || 'nursery';
}

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** Affiche une date lisible : « 15 avril 2026 » */
export function formatDateFR(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShortFR(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 3)}.`;
}

export const MONTHS_SHORT_FR = MONTHS_FR.map((m) => m.slice(0, 3) + '.');
