/** Données initiales — catalogue cultures & exemples Guyane */

export const DEFAULT_CROPS = [
  { id: 'crop-salade', name: 'Salade', nurseryDays: 21, growthDays: 35, harvestDays: 14, notes: 'Feuilles — saison fraîche idéale' },
  { id: 'crop-choux', name: 'Choux', nurseryDays: 30, growthDays: 70, harvestDays: 21, notes: 'Choux pommé' },
  { id: 'crop-choux-chinois', name: 'Choux chinois', nurseryDays: 21, growthDays: 45, harvestDays: 14, notes: 'Pak choï / pe-tsaï' },
  { id: 'crop-bongo', name: 'Bongo / Gombo', nurseryDays: 14, growthDays: 60, harvestDays: 45, notes: 'Okra tropical' },
  { id: 'crop-aubergine', name: 'Aubergine', nurseryDays: 35, growthDays: 75, harvestDays: 40, notes: 'Locale / violette' },
  { id: 'crop-manioc', name: 'Manioc', nurseryDays: 0, growthDays: 270, harvestDays: 60, notes: 'Boutures — culture longue' },
];

export const FERTILIZER_PRESETS = [
  'NPK 10-10-20',
  'NPK 15-15-21',
  'NPK 12-12-17',
  'Fumier composté',
  'Fumier de volaille',
];

export const HERBICIDE_PRESETS = [
  'Glyphosate',
  'Roundup',
];

export const PREP_TYPES = ['Labour', 'Désherbage', 'Jachère', 'Amendement', 'Irrigation'];
export const PREP_METHODS = ['Manuel', 'Motoculteur', 'Tracteur', 'Herbicide', 'Autre'];
export const PREP_STATUSES = ['planifié', 'en cours', 'terminé'];
export const PARCEL_STATUSES = ['libre', 'préparation', 'culture'];
export const FAILURE_REASONS = [
  'Catastrophe naturelle',
  'Maladie/Ravageurs',
  'Perte/Vol',
  'Abandon',
  'Erreur technique',
  'Autre',
];

export const SOIL_TYPES = ['Argileux', 'Sableux', 'Limoneux', 'Latéritique', 'Humifère', 'Mixte'];

function daysFrom(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Jeu d'exemple pour première ouverture */
export function createSeedData() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${day}`;

  const parcels = [
    { id: 'p1', name: 'Parcelle Nord', surface: 250, soilType: 'Latéritique', status: 'culture' },
    { id: 'p2', name: 'Parcelle Sud', surface: 180, soilType: 'Argileux', status: 'préparation' },
    { id: 'p3', name: 'Jardin potager', surface: 80, soilType: 'Humifère', status: 'libre' },
    { id: 'p4', name: 'Bas-fond', surface: 320, soilType: 'Limoneux', status: 'culture' },
  ];

  const preparations = [
    {
      id: 'prep1', parcelId: 'p2', type: 'Labour', method: 'Motoculteur',
      status: 'en cours', startDate: daysFrom(todayStr, -5), endDate: daysFrom(todayStr, 2),
      notes: 'Premier passage après pluies',
    },
    {
      id: 'prep2', parcelId: 'p3', type: 'Amendement', method: 'Manuel',
      status: 'planifié', startDate: daysFrom(todayStr, 3), endDate: daysFrom(todayStr, 5),
      notes: 'Fumier composté 2 t/ha',
    },
    {
      id: 'prep3', parcelId: 'p1', type: 'Irrigation', method: 'Autre',
      status: 'terminé', startDate: daysFrom(todayStr, -20), endDate: daysFrom(todayStr, -18),
      notes: 'Mise en place goutte-à-goutte',
    },
  ];

  const cultures = [
    {
      id: 'c1', parcelId: 'p1', cropId: 'crop-aubergine', phase: 'culture',
      plantsCount: 120, surfaceUsed: 200,
      nurseryStart: daysFrom(todayStr, -70),
      plantDate: daysFrom(todayStr, -35),
      harvestStart: daysFrom(todayStr, 40),
      harvestEnd: daysFrom(todayStr, 80),
      status: 'actif', notes: 'Variété locale Cayenne',
    },
    {
      id: 'c2', parcelId: 'p4', cropId: 'crop-manioc', phase: 'culture',
      plantsCount: 400, surfaceUsed: 300,
      nurseryStart: null,
      plantDate: daysFrom(todayStr, -90),
      harvestStart: daysFrom(todayStr, 180),
      harvestEnd: daysFrom(todayStr, 240),
      status: 'actif', notes: 'Boutures manioc doux',
    },
    {
      id: 'c3', parcelId: 'p1', cropId: 'crop-salade', phase: 'nursery',
      plantsCount: 200, surfaceUsed: 20,
      nurseryStart: daysFrom(todayStr, -7),
      plantDate: daysFrom(todayStr, 14),
      harvestStart: daysFrom(todayStr, 49),
      harvestEnd: daysFrom(todayStr, 63),
      status: 'actif', notes: 'Semis sous ombrière',
    },
    {
      id: 'c4', parcelId: 'p4', cropId: 'crop-bongo', phase: 'harvest',
      plantsCount: 80, surfaceUsed: 60,
      nurseryStart: daysFrom(todayStr, -90),
      plantDate: daysFrom(todayStr, -76),
      harvestStart: daysFrom(todayStr, -16),
      harvestEnd: daysFrom(todayStr, 29),
      status: 'actif', notes: 'Récolte progressive',
    },
  ];

  const treatments = [
    {
      id: 't1', name: 'NPK 15-15-21', category: 'engrais', unit: 'kg',
      stock: 50, stockMax: 100, notes: 'Engrais de fond',
    },
    {
      id: 't2', name: 'NPK 10-10-20', category: 'engrais', unit: 'kg',
      stock: 25, stockMax: 80, notes: '',
    },
    {
      id: 't3', name: 'Fumier composté', category: 'engrais', unit: 'kg',
      stock: 200, stockMax: 500, notes: 'Produit local',
    },
    {
      id: 't4', name: 'Glyphosate', category: 'herbicide', unit: 'L',
      stock: 5, stockMax: 20, notes: 'Usage raisonné',
    },
    {
      id: 't5', name: 'Roundup', category: 'herbicide', unit: 'L',
      stock: 2, stockMax: 10, notes: '',
    },
  ];

  const applications = [
    {
      id: 'a1', treatmentId: 't1', parcelId: 'p1', cultureId: 'c1',
      date: daysFrom(todayStr, -10), quantity: 8, notes: 'Apport croissance',
    },
    {
      id: 'a2', treatmentId: 't4', parcelId: 'p2', cultureId: null,
      date: daysFrom(todayStr, -3), quantity: 1.5, notes: 'Désherbage avant labour',
    },
  ];

  const failures = [];

  return {
    version: 1,
    crops: structuredClone(DEFAULT_CROPS),
    parcels,
    preparations,
    cultures,
    treatments,
    applications,
    failures,
    seededAt: todayStr,
  };
}
