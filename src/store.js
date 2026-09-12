import { DEFAULT_CROPS } from './seed.js';
import { requireSupabase } from './supabase.js';

export function uid(_prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function emptyState() {
  return {
    version: 2,
    crops: [],
    parcels: [],
    preparations: [],
    cultures: [],
    nurseries: [],
    treatments: [],
    applications: [],
    failures: [],
  };
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

export function getGuyaneSeason(date = new Date()) {
  const m = date.getMonth();
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

export function exportJSON(state) {
  return JSON.stringify(state, null, 2);
}

export function parseImportJSON(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('JSON invalide');
  if (!Array.isArray(data.parcels) || !Array.isArray(data.crops)) {
    throw new Error('Structure manquante (parcels, crops requis)');
  }
  data.preparations ||= [];
  data.cultures ||= [];
  data.nurseries ||= [];
  data.treatments ||= [];
  data.applications ||= [];
  data.failures ||= [];
  data.version = data.version || 2;
  // Ensure UUID-looking ids for cloud
  const remap = (arr, prefix) => arr.map((row) => ({
    ...row,
    id: isUuid(row.id) ? row.id : uid(),
  }));
  data.parcels = remap(data.parcels);
  data.crops = remap(data.crops);
  data.preparations = remap(data.preparations);
  data.cultures = remap(data.cultures);
  data.nurseries = remap(data.nurseries);
  data.treatments = remap(data.treatments);
  data.applications = remap(data.applications);
  data.failures = remap(data.failures);
  return data;
}

function isUuid(v) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

/* ——— Auth / farm ——— */

export async function getSession() {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp(email, password) {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const sb = requireSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

export async function listUserFarms() {
  const sb = requireSupabase();
  const { data: memberships, error } = await sb
    .from('farm_members')
    .select('farm_id, role, farms(id, name, created_at)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (memberships || [])
    .filter((m) => m.farms)
    .map((m) => ({
      id: m.farms.id,
      name: m.farms.name,
      role: m.role,
      createdAt: m.farms.created_at,
    }));
}

export async function createFarm(name, userId) {
  const sb = requireSupabase();
  const { data: farm, error } = await sb
    .from('farms')
    .insert({ name: name.trim(), created_by: userId })
    .select('id, name, created_at')
    .single();
  if (error) throw error;

  // Seed default crop catalog for this farm
  const crops = DEFAULT_CROPS.map((c) => ({
    id: uid(),
    farm_id: farm.id,
    name: c.name,
    nursery_days: c.nurseryDays,
    growth_days: c.growthDays,
    harvest_days: c.harvestDays,
    notes: c.notes || '',
  }));
  const { error: cropErr } = await sb.from('crop_types').insert(crops);
  if (cropErr) throw cropErr;

  return farm;
}

/* ——— Load / sync ——— */

function mapCrop(r) {
  return {
    id: r.id,
    name: r.name,
    nurseryDays: r.nursery_days,
    growthDays: r.growth_days,
    harvestDays: r.harvest_days,
    notes: r.notes || '',
  };
}

function mapParcel(r) {
  return {
    id: r.id,
    name: r.name,
    surface: Number(r.surface) || 0,
    soilType: r.soil_type,
    status: r.status,
  };
}

function mapPrep(r) {
  return {
    id: r.id,
    parcelId: r.parcel_id,
    type: r.type,
    method: r.method,
    status: r.status,
    startDate: r.start_date,
    endDate: r.end_date,
    notes: r.notes || '',
  };
}

function mapNursery(r) {
  return {
    id: r.id,
    parcelId: r.parcel_id,
    cropId: r.crop_type_id,
    startDate: r.start_date,
    endDate: r.end_date,
    plantsCount: r.plants_count || 0,
    status: r.status,
    notes: r.notes || '',
  };
}

function mapCulture(r) {
  return {
    id: r.id,
    parcelId: r.parcel_id,
    cropId: r.crop_type_id,
    nurseryId: r.nursery_id,
    phase: r.phase,
    plantsCount: r.plants_count || 0,
    surfaceUsed: r.surface_used != null ? Number(r.surface_used) : null,
    nurseryStart: r.nursery_start,
    plantDate: r.plant_date,
    harvestStart: r.harvest_start,
    harvestEnd: r.harvest_end,
    status: r.status,
    notes: r.notes || '',
  };
}

function mapStock(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    unit: r.unit,
    stock: Number(r.stock) || 0,
    stockMax: Number(r.stock_max) || 0,
    notes: r.notes || '',
  };
}

function mapTreatment(r) {
  return {
    id: r.id,
    treatmentId: r.product_stock_id,
    parcelId: r.parcel_id,
    cultureId: r.culture_id,
    date: r.date,
    quantity: Number(r.quantity) || 0,
    notes: r.notes || '',
  };
}

function mapFailure(r) {
  return {
    id: r.id,
    cultureId: r.culture_id,
    parcelId: r.parcel_id,
    cropId: r.crop_type_id,
    reason: r.reason,
    date: r.date,
    plantsLost: r.plants_lost || 0,
    surfaceLost: Number(r.surface_lost) || 0,
    lossEuro: Number(r.loss_euro) || 0,
    description: r.description || '',
    corrective: r.corrective || '',
  };
}

export async function loadFarmState(farmId) {
  const sb = requireSupabase();
  const tables = [
    ['parcels', mapParcel, 'parcels'],
    ['crop_types', mapCrop, 'crops'],
    ['preparations', mapPrep, 'preparations'],
    ['nurseries', mapNursery, 'nurseries'],
    ['cultures', mapCulture, 'cultures'],
    ['product_stock', mapStock, 'treatments'],
    ['treatments', mapTreatment, 'applications'],
    ['failures', mapFailure, 'failures'],
  ];

  const state = emptyState();
  for (const [table, mapper, key] of tables) {
    const { data, error } = await sb.from(table).select('*').eq('farm_id', farmId);
    if (error) throw error;
    state[key] = (data || []).map(mapper);
  }
  return state;
}

/** Ensure each culture with a nursery phase has a linked nurseries row (progression thread). */
function ensureNurseries(state) {
  const nurseries = [...(state.nurseries || [])];
  const byId = new Map(nurseries.map((n) => [n.id, n]));

  for (const c of state.cultures) {
    if (!c.nurseryStart) continue;
    if (c.nurseryId && byId.has(c.nurseryId)) {
      const n = byId.get(c.nurseryId);
      n.parcelId = c.parcelId;
      n.cropId = c.cropId;
      n.startDate = c.nurseryStart;
      n.endDate = c.plantDate || c.nurseryStart;
      n.plantsCount = c.plantsCount || 0;
      n.status = c.status === 'annulé' ? 'annulé' : 'actif';
      n.notes = c.notes || '';
      continue;
    }
    const id = c.nurseryId && isUuid(c.nurseryId) ? c.nurseryId : uid();
    c.nurseryId = id;
    const row = {
      id,
      parcelId: c.parcelId,
      cropId: c.cropId,
      startDate: c.nurseryStart,
      endDate: c.plantDate || c.nurseryStart,
      plantsCount: c.plantsCount || 0,
      status: c.status === 'annulé' ? 'annulé' : 'actif',
      notes: c.notes || '',
    };
    nurseries.push(row);
    byId.set(id, row);
  }
  state.nurseries = nurseries;
  return state;
}

async function upsertRows(sb, table, localRows, toRow, farmId) {
  if (!localRows.length) return;
  const payload = localRows.map((r) => toRow(r, farmId));
  const { error } = await sb.from(table).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

async function deleteMissing(sb, farmId, table, localRows) {
  const { data: remote, error: rErr } = await sb.from(table).select('id').eq('farm_id', farmId);
  if (rErr) throw rErr;
  const localIds = new Set(localRows.map((r) => r.id));
  const toDelete = (remote || []).map((r) => r.id).filter((id) => !localIds.has(id));
  if (!toDelete.length) return;
  const { error } = await sb.from(table).delete().eq('farm_id', farmId).in('id', toDelete);
  if (error) throw error;
}

export async function syncFarmState(farmId, state) {
  const sb = requireSupabase();
  ensureNurseries(state);

  const parcelRow = (p, fid) => ({
    id: p.id, farm_id: fid, name: p.name, surface: p.surface ?? 0,
    soil_type: p.soilType || 'Mixte', status: p.status || 'libre',
  });
  const cropRow = (c, fid) => ({
    id: c.id, farm_id: fid, name: c.name,
    nursery_days: c.nurseryDays ?? 0, growth_days: c.growthDays ?? 0,
    harvest_days: c.harvestDays ?? 0, notes: c.notes || '',
  });
  const prepRow = (p, fid) => ({
    id: p.id, farm_id: fid, parcel_id: p.parcelId || null, type: p.type,
    method: p.method || 'Manuel', status: p.status || 'planifié',
    start_date: p.startDate || null, end_date: p.endDate || null, notes: p.notes || '',
  });
  const nurseryRow = (n, fid) => ({
    id: n.id, farm_id: fid, parcel_id: n.parcelId || null, crop_type_id: n.cropId || null,
    start_date: n.startDate || null, end_date: n.endDate || null,
    plants_count: n.plantsCount ?? 0, status: n.status || 'actif', notes: n.notes || '',
  });
  const cultureRow = (c, fid) => ({
    id: c.id, farm_id: fid, parcel_id: c.parcelId || null, crop_type_id: c.cropId || null,
    nursery_id: c.nurseryId || null, phase: c.phase || 'nursery',
    plants_count: c.plantsCount ?? 0, surface_used: c.surfaceUsed ?? null,
    nursery_start: c.nurseryStart || null, plant_date: c.plantDate || null,
    harvest_start: c.harvestStart || null, harvest_end: c.harvestEnd || null,
    status: c.status || 'actif', notes: c.notes || '',
  });
  const stockRow = (t, fid) => ({
    id: t.id, farm_id: fid, name: t.name, category: t.category || 'engrais',
    unit: t.unit || 'kg', stock: t.stock ?? 0, stock_max: t.stockMax ?? 0, notes: t.notes || '',
  });
  const appRow = (a, fid) => ({
    id: a.id, farm_id: fid, product_stock_id: a.treatmentId || null,
    parcel_id: a.parcelId || null, culture_id: a.cultureId || null,
    date: a.date || null, quantity: a.quantity ?? 0, notes: a.notes || '',
  });
  const failRow = (f, fid) => ({
    id: f.id, farm_id: fid, culture_id: f.cultureId || null, parcel_id: f.parcelId || null,
    crop_type_id: f.cropId || null, reason: f.reason, date: f.date || null,
    plants_lost: f.plantsLost ?? 0, surface_lost: f.surfaceLost ?? 0,
    loss_euro: f.lossEuro ?? 0, description: f.description || '', corrective: f.corrective || '',
  });

  // Upsert parents before children (FK-safe)
  await upsertRows(sb, 'parcels', state.parcels, parcelRow, farmId);
  await upsertRows(sb, 'crop_types', state.crops, cropRow, farmId);
  await upsertRows(sb, 'preparations', state.preparations, prepRow, farmId);
  await upsertRows(sb, 'nurseries', state.nurseries, nurseryRow, farmId);
  await upsertRows(sb, 'cultures', state.cultures, cultureRow, farmId);
  await upsertRows(sb, 'product_stock', state.treatments, stockRow, farmId);
  await upsertRows(sb, 'treatments', state.applications, appRow, farmId);
  await upsertRows(sb, 'failures', state.failures, failRow, farmId);

  // Delete orphans children-first
  await deleteMissing(sb, farmId, 'failures', state.failures);
  await deleteMissing(sb, farmId, 'treatments', state.applications);
  await deleteMissing(sb, farmId, 'cultures', state.cultures);
  await deleteMissing(sb, farmId, 'nurseries', state.nurseries);
  await deleteMissing(sb, farmId, 'preparations', state.preparations);
  await deleteMissing(sb, farmId, 'product_stock', state.treatments);
  await deleteMissing(sb, farmId, 'parcels', state.parcels);
  await deleteMissing(sb, farmId, 'crop_types', state.crops);
}

export async function resetFarmToCatalog(farmId) {
  const state = emptyState();
  state.crops = DEFAULT_CROPS.map((c) => ({
    id: uid(),
    name: c.name,
    nurseryDays: c.nurseryDays,
    growthDays: c.growthDays,
    harvestDays: c.harvestDays,
    notes: c.notes || '',
  }));
  await syncFarmState(farmId, state);
  return state;
}
