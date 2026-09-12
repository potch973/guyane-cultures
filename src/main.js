import './style.css';
import {
  emptyState, exportJSON, parseImportJSON, uid,
  addDays, formatDateFR, formatDateShortFR, MONTHS_SHORT_FR,
  getGuyaneSeason, calcCultureDates, inferPhase,
  getSession, signUp, signIn, signOut,
  listUserFarms, createFarm, loadFarmState, syncFarmState, resetFarmToCatalog,
} from './store.js';
import { supabaseConfigured, supabase } from './supabase.js';
import {
  PREP_TYPES, PREP_METHODS, PREP_STATUSES, PARCEL_STATUSES,
  FAILURE_REASONS, SOIL_TYPES, FERTILIZER_PRESETS, HERBICIDE_PRESETS,
} from './seed.js';

let state = emptyState();
let session = null;
let farm = null;
let syncing = false;
let tab = 'accueil';
let plusView = null; // null | parcelles | preparation | traitements | catalogue | reglages | echecs
let ganttYear = new Date().getFullYear();
let cultureFilter = 'tous';
let authMode = 'login'; // login | signup

const content = () => document.getElementById('content');
const modalRoot = () => document.getElementById('modal-root');
const headerSub = () => document.getElementById('header-sub');

async function persist() {
  if (!farm?.id) return;
  if (syncing) return;
  syncing = true;
  try {
    await syncFarmState(farm.id, state);
  } catch (err) {
    console.error(err);
    toast(err.message || 'Erreur de synchronisation', true);
  } finally {
    syncing = false;
  }
}

function setAppShell(visible) {
  const header = document.querySelector('.app-header');
  const nav = document.querySelector('.bottom-nav');
  if (header) header.style.display = visible ? '' : 'none';
  if (nav) nav.style.display = visible ? '' : 'none';
}

function renderBoot(msg) {
  setAppShell(false);
  content().innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <div class="auth-logo">🌿</div>
        <h2>Guyane Cultures</h2>
        <p class="muted">${msg}</p>
      </div>
    </div>`;
}

function renderConfigMissing() {
  setAppShell(false);
  content().innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <div class="auth-logo">🌿</div>
        <h2>Configuration requise</h2>
        <p class="lead">L'application cloud a besoin de Supabase.</p>
        <ol class="setup-steps">
          <li>Créez un projet sur <strong>supabase.com</strong></li>
          <li>Exécutez le SQL <code>supabase/migrations/001_multi_tenant_farm.sql</code></li>
          <li>Copiez <code>.env.example</code> → <code>.env</code></li>
          <li>Renseignez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code></li>
          <li>Relancez <code>npm run dev</code></li>
        </ol>
      </div>
    </div>`;
}

function renderAuth(errorMsg = '') {
  setAppShell(false);
  const isLogin = authMode === 'login';
  content().innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <div class="auth-logo">🌿</div>
        <h2>Guyane Cultures</h2>
        <p class="lead">Tes cultures synchronisées sur tous tes appareils.</p>
        ${errorMsg ? `<div class="alert alert-warn">${errorMsg}</div>` : ''}
        <div class="filter-chips" style="justify-content:center">
          <button type="button" class="chip ${isLogin ? 'active' : ''}" data-auth="login">Connexion</button>
          <button type="button" class="chip ${!isLogin ? 'active' : ''}" data-auth="signup">Créer un compte</button>
        </div>
        <div class="form-group"><label>E-mail</label>
          <input type="email" id="auth-email" autocomplete="email" placeholder="toi@exemple.com" /></div>
        <div class="form-group"><label>Mot de passe</label>
          <input type="password" id="auth-pass" autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="Au moins 6 caractères" /></div>
        <button type="button" class="btn btn-primary btn-lg" id="auth-submit">
          ${isLogin ? 'Se connecter' : 'Créer mon compte'}
        </button>
        <p class="muted mt-1" style="text-align:center;font-size:0.8rem">
          Chaque exploitation est isolée : seul toi (et tes membres) voyez vos données.
        </p>
      </div>
    </div>`;
  content().querySelectorAll('[data-auth]').forEach((b) => {
    b.onclick = () => { authMode = b.dataset.auth; renderAuth(); };
  });
  content().querySelector('#auth-submit').onclick = async () => {
    const email = content().querySelector('#auth-email').value.trim();
    const password = content().querySelector('#auth-pass').value;
    if (!email || password.length < 6) {
      toast('E-mail et mot de passe (6+ caractères) requis', true);
      return;
    }
    renderBoot('Connexion…');
    try {
      if (isLogin) await signIn(email, password);
      else {
        const res = await signUp(email, password);
        if (!res.session) {
          toast('Compte créé — vérifie ton e-mail si la confirmation est activée');
          authMode = 'login';
          renderAuth('Compte créé. Connecte-toi.');
          return;
        }
      }
      await bootApp();
    } catch (err) {
      renderAuth(err.message || 'Échec de connexion');
    }
  };
}

function renderCreateFarm() {
  setAppShell(false);
  content().innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <div class="auth-logo">🏡</div>
        <h2>Créer mon exploitation</h2>
        <p class="lead">Premier pas : donne un nom à ta ferme ou ton jardin. Tes données resteront privées.</p>
        <div class="form-group"><label>Nom de l'exploitation</label>
          <input type="text" id="farm-name" placeholder="Ex. Jardin de Cayenne" /></div>
        <button type="button" class="btn btn-primary btn-lg" id="farm-create">Créer et continuer</button>
        <button type="button" class="btn btn-ghost btn-block mt-1" id="farm-logout">Se déconnecter</button>
      </div>
    </div>`;
  content().querySelector('#farm-create').onclick = async () => {
    const name = content().querySelector('#farm-name').value.trim();
    if (!name) { toast('Indique un nom', true); return; }
    renderBoot('Création de l\'exploitation…');
    try {
      farm = await createFarm(name, session.user.id);
      state = await loadFarmState(farm.id);
      toast(`Bienvenue sur « ${farm.name} »`);
      enterApp();
    } catch (err) {
      toast(err.message || 'Erreur', true);
      renderCreateFarm();
    }
  };
  content().querySelector('#farm-logout').onclick = async () => {
    await signOut();
    session = null;
    farm = null;
    renderAuth();
  };
}

async function bootApp() {
  if (!supabaseConfigured) {
    renderConfigMissing();
    return;
  }
  renderBoot('Chargement…');
  try {
    session = await getSession();
    if (!session) {
      renderAuth();
      return;
    }
    const farms = await listUserFarms();
    if (!farms.length) {
      renderCreateFarm();
      return;
    }
    farm = farms[0];
    state = await loadFarmState(farm.id);
    enterApp();
  } catch (err) {
    console.error(err);
    renderAuth(err.message || 'Impossible de charger la session');
  }
}

function enterApp() {
  setAppShell(true);
  tab = 'accueil';
  plusView = null;
  render();
  maybeShowWelcome();
}

function toast(msg, isError = false) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.textContent = msg;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

function parcelById(id) {
  return state.parcels.find((p) => p.id === id);
}
function cropById(id) {
  return state.crops.find((c) => c.id === id);
}
function treatmentById(id) {
  return state.treatments.find((t) => t.id === id);
}

function statusPill(status) {
  const map = {
    libre: ['badge-libre', 'Libre'],
    préparation: ['badge-preparation', 'En préparation'],
    culture: ['badge-culture', 'En culture'],
    planifié: ['badge-planifie', 'Prévu'],
    'en cours': ['badge-encours', 'En cours'],
    terminé: ['badge-termine', 'Terminé'],
    annulé: ['badge-annule', 'Annulé'],
    nursery: ['badge-nursery', 'Semis'],
    harvest: ['badge-harvest', 'Récolte'],
    actif: ['badge-culture', 'En cours'],
    terminé_culture: ['badge-termine', 'Terminé'],
  };
  const [cls, label] = map[status] || ['badge-planifie', status];
  return `<span class="badge ${cls} status-pill">${label}</span>`;
}

function phaseLabel(phase) {
  return { nursery: 'Semis', culture: 'Plantation', harvest: 'Récolte', terminé: 'Terminé', annulé: 'Annulé' }[phase] || phase;
}

/* ——— Modal helpers ——— */
function closeModal() {
  modalRoot().innerHTML = '';
}

function openModal({ title, bodyHtml, onMount, primary, secondary, danger }) {
  modalRoot().innerHTML = `
    <div class="modal-overlay" data-close="1">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2>${title}</h2>
          <button type="button" class="icon-btn" data-x aria-label="Fermer">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-footer">
          ${secondary ? `<button type="button" class="btn btn-ghost" data-sec>${secondary.label}</button>` : ''}
          ${danger ? `<button type="button" class="btn btn-danger" data-danger>${danger.label}</button>` : ''}
          ${primary ? `<button type="button" class="btn btn-primary" data-pri>${primary.label}</button>` : ''}
        </div>
      </div>
    </div>`;
  const overlay = modalRoot().querySelector('.modal-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target.dataset.close) closeModal();
  });
  overlay.querySelector('[data-x]')?.addEventListener('click', closeModal);
  overlay.querySelector('.modal')?.addEventListener('click', (e) => e.stopPropagation());
  if (onMount) onMount(overlay.querySelector('.modal-body'));
  overlay.querySelector('[data-pri]')?.addEventListener('click', () => primary?.onClick?.(overlay));
  overlay.querySelector('[data-sec]')?.addEventListener('click', () => {
    if (secondary?.onClick) secondary.onClick(overlay);
    else closeModal();
  });
  overlay.querySelector('[data-danger]')?.addEventListener('click', () => danger?.onClick?.(overlay));
}

function confirmAction({ title, message, confirmLabel = 'Oui', onConfirm }) {
  openModal({
    title,
    bodyHtml: `<p class="confirm-text">${message}</p>`,
    secondary: { label: 'Non, garder' },
    danger: {
      label: confirmLabel,
      onClick: () => { onConfirm(); closeModal(); },
    },
  });
}

/* ——— Welcome first-run ——— */
function maybeShowWelcome() {
  if (localStorage.getItem('guyane-welcome-seen')) return;
  const root = document.createElement('div');
  root.className = 'welcome-overlay';
  root.innerHTML = `
    <div class="welcome-sheet">
      <h2>Bienvenue 🌿</h2>
      <p class="lead">Guyane Cultures t’aide à suivre tes parcelles, semis et récoltes — simplement, sur ton téléphone.</p>
      <div class="tip-card"><span class="step">1</span><strong>Crée une parcelle</strong><p>C’est ton terrain (ex. « Jardin potager »).</p></div>
      <div class="tip-card"><span class="step">2</span><strong>Prépare le sol</strong><p>Labour, désherbage, amendement…</p></div>
      <div class="tip-card"><span class="step">3</span><strong>Sème ou plante</strong><p>Les dates de récolte se calculent toutes seules.</p></div>
      <button type="button" class="btn btn-primary btn-lg" id="welcome-ok">C’est parti</button>
    </div>`;
  document.body.appendChild(root);
  root.querySelector('#welcome-ok').onclick = () => {
    localStorage.setItem('guyane-welcome-seen', '1');
    root.remove();
    toast('Tes données restent synchronisées entre appareils');
  };
}

/* ——— Accueil ——— */
function renderAccueil() {
  headerSub().textContent = farm?.name || 'Mon jardin';
  const season = getGuyaneSeason();
  const actifs = state.cultures.filter((c) => c.status === 'actif');
  const libres = state.parcels.filter((p) => p.status === 'libre').length;
  const preps = state.preparations.filter((p) => p.status !== 'terminé').length;
  const soon = upcomingEvents().slice(0, 4);

  content().innerHTML = `
    <div class="season-banner">
      <span class="season-icon">${season.icon}</span>
      <div>
        <strong>${season.name}</strong> · ${season.period}
        <p>${season.tip}</p>
      </div>
    </div>

    <div class="grid-stats">
      <div class="stat-card"><div class="num">${state.parcels.length}</div><div class="lbl">Parcelles</div></div>
      <div class="stat-card"><div class="num">${actifs.length}</div><div class="lbl">Cultures</div></div>
      <div class="stat-card"><div class="num">${libres}</div><div class="lbl">Libres</div></div>
      <div class="stat-card"><div class="num">${preps}</div><div class="lbl">Prépas</div></div>
    </div>

    <p class="muted mb-1">Que veux-tu faire ?</p>
    <div class="quick-row">
      <button type="button" class="quick-btn" data-go="new-parcel"><span class="qi">🗺️</span>+ Parcelle</button>
      <button type="button" class="quick-btn" data-go="new-prep"><span class="qi">🛠️</span>+ Préparation</button>
      <button type="button" class="quick-btn" data-go="new-semis"><span class="qi">🪴</span>+ Semis</button>
      <button type="button" class="quick-btn" data-go="new-plant"><span class="qi">🌱</span>+ Plantation</button>
    </div>

    <div class="section-head"><h3>Prochaines dates</h3></div>
    ${soon.length ? soon.map((e) => `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${e.color}"></div>
        <div>
          <div class="date">${formatDateFR(e.date)}</div>
          <div class="title">${e.title}</div>
          <div class="muted">${e.sub || ''}</div>
        </div>
      </div>`).join('') : `<div class="empty-state"><div class="emoji">📭</div><p>Rien de prévu pour l’instant.<br>Ajoute un semis pour commencer.</p></div>`}
  `;

  content().querySelector('[data-go="new-parcel"]')?.addEventListener('click', () => openParcelForm());
  content().querySelector('[data-go="new-prep"]')?.addEventListener('click', () => openPrepForm());
  content().querySelector('[data-go="new-semis"]')?.addEventListener('click', () => openCultureWizard('nursery'));
  content().querySelector('[data-go="new-plant"]')?.addEventListener('click', () => openCultureWizard('culture'));
}

function upcomingEvents() {
  const events = [];
  for (const c of state.cultures.filter((x) => x.status === 'actif')) {
    const crop = cropById(c.cropId);
    const parcel = parcelById(c.parcelId);
    const name = crop?.name || 'Culture';
    const p = parcel?.name || '';
    if (c.nurseryStart) events.push({ date: c.nurseryStart, title: `Semis · ${name}`, sub: p, color: 'var(--nursery)' });
    if (c.plantDate) events.push({ date: c.plantDate, title: `Plantation · ${name}`, sub: p, color: 'var(--culture)' });
    if (c.harvestStart) events.push({ date: c.harvestStart, title: `Début récolte · ${name}`, sub: p, color: 'var(--harvest)' });
  }
  for (const pr of state.preparations.filter((x) => x.status !== 'terminé')) {
    const parcel = parcelById(pr.parcelId);
    events.push({
      date: pr.startDate,
      title: `${pr.type} · ${parcel?.name || ''}`,
      sub: pr.method,
      color: 'var(--prep)',
    });
  }
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* ——— Cultures tab ——— */
function renderCultures() {
  headerSub().textContent = 'Semis & plantations';
  const list = state.cultures
    .map((c) => ({ ...c, phaseNow: inferPhase(c) }))
    .filter((c) => {
      if (cultureFilter === 'tous') return c.status === 'actif';
      if (cultureFilter === 'annulés') return c.status === 'annulé';
      return c.status === 'actif' && c.phaseNow === cultureFilter;
    })
    .sort((a, b) => (b.plantDate || b.nurseryStart || '').localeCompare(a.plantDate || a.nurseryStart || ''));

  content().innerHTML = `
    <div class="page-title">
      <span>Cultures</span>
    </div>
    <div class="cta-stack">
      <button type="button" class="btn btn-primary btn-lg" id="btn-semis">🪴 Nouveau semis</button>
      <button type="button" class="btn btn-secondary btn-lg" id="btn-plant">🌱 Nouvelle plantation</button>
    </div>
    <div class="filter-chips">
      ${[['tous', 'En cours'], ['nursery', 'Semis'], ['culture', 'Plantés'], ['harvest', 'Récolte'], ['annulés', 'Annulés']]
        .map(([k, l]) => `<button type="button" class="chip ${cultureFilter === k ? 'active' : ''}" data-f="${k}">${l}</button>`).join('')}
    </div>
    ${list.length ? list.map(cultureCard).join('') : `
      <div class="empty-state">
        <div class="emoji">🌱</div>
        <p>Aucune culture ici.<br>Appuie sur <strong>Nouveau semis</strong> pour commencer.</p>
      </div>`}
  `;

  content().querySelector('#btn-semis').onclick = () => openCultureWizard('nursery');
  content().querySelector('#btn-plant').onclick = () => openCultureWizard('culture');
  content().querySelectorAll('[data-f]').forEach((b) => {
    b.onclick = () => { cultureFilter = b.dataset.f; render(); };
  });
  content().querySelectorAll('[data-culture]').forEach((card) => {
    card.querySelector('[data-done]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      markCultureDone(card.dataset.culture);
    });
    card.querySelector('[data-fail]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openFailureForm(card.dataset.culture);
    });
    card.querySelector('[data-edit]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openCultureEdit(card.dataset.culture);
    });
  });
}

function cultureCard(c) {
  const crop = cropById(c.cropId);
  const parcel = parcelById(c.parcelId);
  const phase = c.phaseNow || inferPhase(c);
  const cancelled = c.status === 'annulé';
  return `
    <div class="card" data-culture="${c.id}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
        <h3>${crop?.name || 'Culture'}</h3>
        ${statusPill(cancelled ? 'annulé' : phase)}
      </div>
      <div class="card-meta">
        📍 ${parcel?.name || '—'} · ${c.plantsCount || '—'} plants
        ${c.surfaceUsed ? ` · ${c.surfaceUsed} m²` : ''}<br>
        ${c.nurseryStart ? `🪴 Semis : ${formatDateFR(c.nurseryStart)}<br>` : ''}
        ${c.plantDate ? `🌱 Plantation : ${formatDateFR(c.plantDate)}<br>` : ''}
        ${c.harvestStart ? `🍅 Récolte : ${formatDateFR(c.harvestStart)} → ${formatDateFR(c.harvestEnd)}` : ''}
        ${c.notes ? `<br>💬 ${c.notes}` : ''}
      </div>
      ${!cancelled ? `
      <div class="card-actions">
        <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
        <button type="button" class="btn btn-sm btn-secondary" data-done>Terminer</button>
        <button type="button" class="btn btn-sm btn-danger" data-fail>Échec / Annuler</button>
      </div>` : ''}
    </div>`;
}

function markCultureDone(id) {
  confirmAction({
    title: 'Terminer la culture ?',
    message: 'Elle passera en terminé et la parcelle redeviendra libre si plus rien n’y pousse.',
    confirmLabel: 'Oui, terminer',
    onConfirm: () => {
      const c = state.cultures.find((x) => x.id === id);
      if (!c) return;
      c.status = 'terminé';
      c.phase = 'terminé';
      freeParcelIfEmpty(c.parcelId);
      persist();
      toast('Culture terminée');
      render();
    },
  });
}

function freeParcelIfEmpty(parcelId) {
  const still = state.cultures.some((c) => c.parcelId === parcelId && c.status === 'actif');
  const prep = state.preparations.some((p) => p.parcelId === parcelId && p.status !== 'terminé');
  const parcel = parcelById(parcelId);
  if (!parcel) return;
  if (!still && !prep) parcel.status = 'libre';
  else if (!still && prep) parcel.status = 'préparation';
  else parcel.status = 'culture';
}

/* Culture wizard — step by step */
function openCultureWizard(startPhase) {
  if (!state.parcels.length) {
    toast('Crée d’abord une parcelle', true);
    openParcelForm();
    return;
  }
  if (!state.crops.length) {
    toast('Ajoute d’abord une plante au catalogue', true);
    return;
  }

  let step = 1;
  let draft = {
    phase: startPhase,
    cropId: '',
    parcelId: '',
    startDate: new Date().toISOString().slice(0, 10),
    plantsCount: 50,
    surfaceUsed: '',
    notes: '',
  };

  function showStep() {
    if (step === 1) {
      openModal({
        title: startPhase === 'nursery' ? 'Nouveau semis' : 'Nouvelle plantation',
        bodyHtml: `
          <p class="muted mb-1">Quelle plante ?</p>
          <div class="choice-grid" id="crop-choices">
            ${state.crops.map((c) => `
              <button type="button" class="choice-btn" data-id="${c.id}">
                <span class="ci">🥬</span>${c.name}
              </button>`).join('')}
          </div>`,
        secondary: { label: 'Annuler' },
        primary: {
          label: 'Suivant',
          onClick: () => {
            if (!draft.cropId) { toast('Choisis une plante', true); return; }
            step = 2; showStep();
          },
        },
        onMount: (body) => {
          body.querySelectorAll('.choice-btn').forEach((b) => {
            b.onclick = () => {
              draft.cropId = b.dataset.id;
              body.querySelectorAll('.choice-btn').forEach((x) => x.classList.remove('selected'));
              b.classList.add('selected');
            };
          });
        },
      });
    } else if (step === 2) {
      openModal({
        title: 'Où planter ?',
        bodyHtml: `
          <p class="muted mb-1">Quelle parcelle ?</p>
          <div id="parcel-choices" style="display:flex;flex-direction:column;gap:0.5rem">
            ${state.parcels.map((p) => `
              <button type="button" class="plus-item" data-id="${p.id}">
                <span class="pi">🗺️</span>
                <span>${p.name}<span class="sub">${p.surface} m² · ${p.status}</span></span>
              </button>`).join('')}
          </div>`,
        secondary: { label: 'Retour', onClick: () => { step = 1; showStep(); } },
        primary: {
          label: 'Suivant',
          onClick: () => {
            if (!draft.parcelId) { toast('Choisis une parcelle', true); return; }
            step = 3; showStep();
          },
        },
        onMount: (body) => {
          body.querySelectorAll('.plus-item').forEach((b) => {
            b.onclick = () => {
              draft.parcelId = b.dataset.id;
              body.querySelectorAll('.plus-item').forEach((x) => { x.style.borderColor = ''; });
              b.style.borderColor = 'var(--accent)';
            };
          });
        },
      });
    } else {
      const crop = cropById(draft.cropId);
      const labelDate = startPhase === 'nursery' ? 'Date du semis' : 'Date de plantation';
      openModal({
        title: 'Dates & détails',
        bodyHtml: `
          <div class="form-group">
            <label>${labelDate}</label>
            <input type="date" id="f-date" value="${draft.startDate}" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre de plants</label>
              <input type="number" id="f-plants" min="1" value="${draft.plantsCount}" />
            </div>
            <div class="form-group">
              <label>Surface (m²)</label>
              <input type="number" id="f-surf" min="0" step="1" placeholder="optionnel" />
            </div>
          </div>
          <div class="form-group">
            <label>Note (optionnel)</label>
            <input type="text" id="f-notes" placeholder="Ex. variété locale" />
          </div>
          <div class="alert alert-info" id="date-preview">
            Les dates de récolte seront calculées automatiquement
            (${crop?.nurseryDays || 0} j semis · ${crop?.growthDays || 0} j croissance · ${crop?.harvestDays || 0} j récolte).
          </div>`,
        secondary: { label: 'Retour', onClick: () => { step = 2; showStep(); } },
        primary: {
          label: 'Enregistrer',
          onClick: (overlay) => {
            const start = overlay.querySelector('#f-date').value;
            if (!start) { toast('Indique une date', true); return; }
            const plants = Number(overlay.querySelector('#f-plants').value) || 0;
            const surf = overlay.querySelector('#f-surf').value;
            const notes = overlay.querySelector('#f-notes').value.trim();
            const dates = startPhase === 'nursery'
              ? calcCultureDates(crop, start, null)
              : calcCultureDates(crop, null, start);
            const nurseryId = dates.nurseryStart ? uid('n') : null;
            const culture = {
              id: uid('c'),
              parcelId: draft.parcelId,
              cropId: draft.cropId,
              nurseryId,
              phase: startPhase,
              plantsCount: plants,
              surfaceUsed: surf ? Number(surf) : null,
              nurseryStart: dates.nurseryStart,
              plantDate: dates.plantDate,
              harvestStart: dates.harvestStart,
              harvestEnd: dates.harvestEnd,
              status: 'actif',
              notes,
            };
            state.cultures.push(culture);
            const parcel = parcelById(draft.parcelId);
            if (parcel) parcel.status = 'culture';
            persist();
            closeModal();
            toast(`${crop.name} enregistré · récolte vers ${formatDateFR(dates.harvestStart)}`);
            tab = 'cultures';
            render();
          },
        },
      });
    }
  }
  showStep();
}

function openCultureEdit(id) {
  const c = state.cultures.find((x) => x.id === id);
  if (!c) return;
  const crop = cropById(c.cropId);
  openModal({
    title: `Modifier · ${crop?.name || ''}`,
    bodyHtml: `
      <div class="form-group">
        <label>Parcelle</label>
        <select id="f-parcel">${state.parcels.map((p) =>
          `<option value="${p.id}" ${p.id === c.parcelId ? 'selected' : ''}>${p.name}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label>Plante</label>
        <select id="f-crop">${state.crops.map((cr) =>
          `<option value="${cr.id}" ${cr.id === c.cropId ? 'selected' : ''}>${cr.name}</option>`).join('')}</select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Début semis</label><input type="date" id="f-ns" value="${c.nurseryStart || ''}" /></div>
        <div class="form-group"><label>Plantation</label><input type="date" id="f-pd" value="${c.plantDate || ''}" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Début récolte</label><input type="date" id="f-hs" value="${c.harvestStart || ''}" /></div>
        <div class="form-group"><label>Fin récolte</label><input type="date" id="f-he" value="${c.harvestEnd || ''}" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Plants</label><input type="number" id="f-pl" value="${c.plantsCount || ''}" /></div>
        <div class="form-group"><label>Surface m²</label><input type="number" id="f-su" value="${c.surfaceUsed || ''}" /></div>
      </div>
      <div class="form-group"><label>Note</label><input type="text" id="f-no" value="${c.notes || ''}" /></div>
      <button type="button" class="btn btn-secondary btn-block" id="f-recalc">♻️ Recalculer les dates depuis la plante</button>`,
    secondary: { label: 'Annuler' },
    primary: {
      label: 'Enregistrer',
      onClick: (ov) => {
        const oldParcel = c.parcelId;
        c.parcelId = ov.querySelector('#f-parcel').value;
        c.cropId = ov.querySelector('#f-crop').value;
        c.nurseryStart = ov.querySelector('#f-ns').value || null;
        c.plantDate = ov.querySelector('#f-pd').value || null;
        c.harvestStart = ov.querySelector('#f-hs').value || null;
        c.harvestEnd = ov.querySelector('#f-he').value || null;
        c.plantsCount = Number(ov.querySelector('#f-pl').value) || 0;
        c.surfaceUsed = ov.querySelector('#f-su').value ? Number(ov.querySelector('#f-su').value) : null;
        c.notes = ov.querySelector('#f-no').value.trim();
        if (oldParcel !== c.parcelId) {
          freeParcelIfEmpty(oldParcel);
          const p = parcelById(c.parcelId);
          if (p && c.status === 'actif') p.status = 'culture';
        }
        persist();
        closeModal();
        toast('Modifications enregistrées');
        render();
      },
    },
    onMount: (body) => {
      body.querySelector('#f-recalc').onclick = () => {
        const cropId = body.parentElement.querySelector('#f-crop')?.value || body.querySelector('#f-crop').value;
        const cr = cropById(body.querySelector('#f-crop').value);
        const ns = body.querySelector('#f-ns').value;
        const pd = body.querySelector('#f-pd').value;
        const dates = calcCultureDates(cr, ns || null, pd || null);
        if (dates.nurseryStart) body.querySelector('#f-ns').value = dates.nurseryStart;
        if (dates.plantDate) body.querySelector('#f-pd').value = dates.plantDate;
        if (dates.harvestStart) body.querySelector('#f-hs').value = dates.harvestStart;
        if (dates.harvestEnd) body.querySelector('#f-he').value = dates.harvestEnd;
        toast('Dates recalculées');
      };
    },
  });
}

/* Failures */
function openFailureForm(cultureId) {
  const c = state.cultures.find((x) => x.id === cultureId);
  if (!c) return;
  const crop = cropById(c.cropId);
  openModal({
    title: 'Échec ou annulation',
    bodyHtml: `
      <p class="confirm-text">Annuler <strong>${crop?.name || 'cette culture'}</strong> ? Le sol pourra redevenir libre.</p>
      <div class="form-group">
        <label>Raison</label>
        <select id="f-reason">${FAILURE_REASONS.map((r) => `<option>${r}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="f-date" value="${new Date().toISOString().slice(0, 10)}" />
      </div>
      <div class="form-row">
        <div class="form-group"><label>Plants perdus</label><input type="number" id="f-plants" min="0" value="${c.plantsCount || 0}" /></div>
        <div class="form-group"><label>Surface perdue (m²)</label><input type="number" id="f-surf" min="0" value="${c.surfaceUsed || 0}" /></div>
      </div>
      <div class="form-group"><label>Perte estimée (€)</label><input type="number" id="f-loss" min="0" step="0.01" placeholder="0" /></div>
      <div class="form-group"><label>Que s’est-il passé ?</label><textarea id="f-desc" placeholder="Décris brièvement…"></textarea></div>
      <div class="form-group"><label>Que faire ensuite ?</label><textarea id="f-corr" placeholder="Ex. traiter, resemer…"></textarea></div>`,
    secondary: { label: 'Garder la culture' },
    danger: {
      label: 'Confirmer l’annulation',
      onClick: (ov) => {
        const fail = {
          id: uid('fail'),
          cultureId: c.id,
          parcelId: c.parcelId,
          cropId: c.cropId,
          reason: ov.querySelector('#f-reason').value,
          date: ov.querySelector('#f-date').value,
          plantsLost: Number(ov.querySelector('#f-plants').value) || 0,
          surfaceLost: Number(ov.querySelector('#f-surf').value) || 0,
          lossEuro: Number(ov.querySelector('#f-loss').value) || 0,
          description: ov.querySelector('#f-desc').value.trim(),
          corrective: ov.querySelector('#f-corr').value.trim(),
        };
        state.failures.push(fail);
        c.status = 'annulé';
        c.phase = 'annulé';
        freeParcelIfEmpty(c.parcelId);
        persist();
        closeModal();
        toast('Culture annulée · parcelle mise à jour');
        render();
      },
    },
  });
}

/* ——— Planning (Gantt + timeline) ——— */
function renderPlanning() {
  headerSub().textContent = 'Calendrier annuel';
  const months = MONTHS_SHORT_FR;
  const rows = buildGanttRows(ganttYear);

  content().innerHTML = `
    <div class="page-title"><span>Planning</span></div>
    <div class="year-picker">
      <button type="button" id="y-prev" aria-label="Année précédente">‹</button>
      <span>${ganttYear}</span>
      <button type="button" id="y-next" aria-label="Année suivante">›</button>
    </div>
    <div class="legend">
      <span><i class="prep"></i> Préparation</span>
      <span><i class="nursery"></i> Semis</span>
      <span><i class="culture"></i> Culture</span>
      <span><i class="harvest"></i> Récolte</span>
      <span><i class="fertilizer"></i> Engrais</span>
      <span><i class="herbicide"></i> Herbicide</span>
    </div>
    <div class="card gantt-wrap" style="padding:0.4rem;overflow-x:auto">
      <table class="gantt-table">
        <thead><tr><th class="row-label">Activité</th>${months.map((m) => `<th>${m}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.length ? rows.map((r) => `
            <tr>
              <td class="row-label" title="${r.label}">${r.label}</td>
              ${r.cells.map((cls) => `<td class="gantt-cell ${cls || ''}"></td>`).join('')}
            </tr>`).join('') : `<tr><td colspan="13" style="padding:1.5rem;color:var(--text-muted)">Rien à afficher pour ${ganttYear}. Ajoute des cultures ou préparations.</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="section-head"><h3>À venir</h3></div>
    ${upcomingEvents().slice(0, 8).map((e) => `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${e.color}"></div>
        <div>
          <div class="date">${formatDateFR(e.date)}</div>
          <div class="title">${e.title}</div>
          <div class="muted">${e.sub || ''}</div>
        </div>
      </div>`).join('') || '<p class="muted">Aucune date à venir.</p>'}
  `;

  content().querySelector('#y-prev').onclick = () => { ganttYear--; render(); };
  content().querySelector('#y-next').onclick = () => { ganttYear++; render(); };
}

function buildGanttRows(year) {
  const rows = [];

  function paintRange(cells, startIso, endIso, cls) {
    if (!startIso) return;
    const s = new Date(startIso + 'T12:00:00');
    const e = new Date((endIso || startIso) + 'T12:00:00');
    for (let m = 0; m < 12; m++) {
      const ms = new Date(year, m, 1);
      const me = new Date(year, m + 1, 0);
      if (s <= me && e >= ms) {
        // prefer stronger colors if already set? keep first meaningful
        if (!cells[m] || cls === 'harvest' || cls === 'herbicide') cells[m] = cls;
        else if (!cells[m]) cells[m] = cls;
        else if (cells[m] === 'prep') cells[m] = cls;
      }
    }
  }

  for (const pr of state.preparations) {
    const parcel = parcelById(pr.parcelId);
    const cells = Array(12).fill('');
    paintRange(cells, pr.startDate, pr.endDate || pr.startDate, 'prep');
    if (cells.some(Boolean)) {
      rows.push({ label: `${pr.type} · ${parcel?.name || '?'}`, cells });
    }
  }

  for (const c of state.cultures.filter((x) => x.status !== 'annulé')) {
    const crop = cropById(c.cropId);
    const parcel = parcelById(c.parcelId);
    const cells = Array(12).fill('');
    if (c.nurseryStart && c.plantDate) {
      paintRange(cells, c.nurseryStart, addDays(c.plantDate, -1) || c.nurseryStart, 'nursery');
    } else if (c.nurseryStart) {
      paintRange(cells, c.nurseryStart, c.nurseryStart, 'nursery');
    }
    if (c.plantDate && c.harvestStart) {
      paintRange(cells, c.plantDate, addDays(c.harvestStart, -1) || c.plantDate, 'culture');
    } else if (c.plantDate) {
      paintRange(cells, c.plantDate, c.plantDate, 'culture');
    }
    paintRange(cells, c.harvestStart, c.harvestEnd || c.harvestStart, 'harvest');
    if (cells.some(Boolean)) {
      rows.push({ label: `${crop?.name || '?'} · ${parcel?.name || '?'}`, cells });
    }
  }

  for (const a of state.applications) {
    const t = treatmentById(a.treatmentId);
    if (!t || !a.date) continue;
    const d = new Date(a.date + 'T12:00:00');
    if (d.getFullYear() !== year) continue;
    const cells = Array(12).fill('');
    cells[d.getMonth()] = t.category === 'herbicide' ? 'herbicide' : 'fertilizer';
    const parcel = parcelById(a.parcelId);
    rows.push({ label: `${t.name} · ${parcel?.name || ''}`, cells });
  }

  return rows;
}

/* ——— Plus menu ——— */
function renderPlus() {
  if (plusView === 'parcelles') return renderParcelles();
  if (plusView === 'preparation') return renderPreparation();
  if (plusView === 'traitements') return renderTraitements();
  if (plusView === 'catalogue') return renderCatalogue();
  if (plusView === 'echecs') return renderEchecs();
  if (plusView === 'reglages') return renderReglages();

  headerSub().textContent = 'Menu';
  content().innerHTML = `
    <div class="page-title"><span>Plus</span></div>
    <div class="plus-list">
      <button type="button" class="plus-item" data-v="parcelles">
        <span class="pi">🗺️</span><span>Parcelles<span class="sub">${state.parcels.length} terrain(s)</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="preparation">
        <span class="pi">🛠️</span><span>Préparation du sol<span class="sub">Labour, désherbage…</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="traitements">
        <span class="pi">🧴</span><span>Engrais & herbicides<span class="sub">Stock et applications</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="catalogue">
        <span class="pi">📚</span><span>Plantes cultivées<span class="sub">${state.crops.length} plantes · durées</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="echecs">
        <span class="pi">⚠️</span><span>Échecs & annulations<span class="sub">${state.failures.length} enregistré(s)</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="reglages">
        <span class="pi">⚙️</span><span>Réglages<span class="sub">Sauvegarde, réinitialiser…</span></span><span class="chev">›</span>
      </button>
    </div>
    <p class="muted mt-1" style="font-size:0.75rem;text-align:center">
      Cloud · ${farm?.name || ''} · ${session?.user?.email || ''}
    </p>
  `;
  content().querySelectorAll('[data-v]').forEach((b) => {
    b.onclick = () => { plusView = b.dataset.v; render(); };
  });
}

function backPlusBtn() {
  return `<button type="button" class="btn btn-ghost btn-sm" id="back-plus">‹ Retour</button>`;
}
function bindBackPlus() {
  content().querySelector('#back-plus')?.addEventListener('click', () => { plusView = null; render(); });
}

/* Parcelles */
function renderParcelles() {
  headerSub().textContent = 'Parcelles';
  content().innerHTML = `
    <div class="page-title">${backPlusBtn()}<span>Parcelles</span></div>
    <button type="button" class="btn btn-primary btn-lg mb-1" id="new-p">+ Nouvelle parcelle</button>
    ${state.parcels.length ? state.parcels.map((p) => `
      <div class="card" data-id="${p.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <h3>${p.name}</h3>
          ${statusPill(p.status)}
        </div>
        <div class="card-meta">${p.surface} m² · Sol ${p.soilType}</div>
        <div class="card-actions">
          <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
          <button type="button" class="btn btn-sm btn-danger" data-del>Supprimer</button>
        </div>
      </div>`).join('') : `
      <div class="empty-state">
        <div class="emoji">🗺️</div>
        <p>Pas encore de parcelle.<br>Appuie sur <strong>+ Nouvelle parcelle</strong>.</p>
      </div>`}
  `;
  bindBackPlus();
  content().querySelector('#new-p').onclick = () => openParcelForm();
  content().querySelectorAll('.card[data-id]').forEach((card) => {
    card.querySelector('[data-edit]').onclick = () => openParcelForm(card.dataset.id);
    card.querySelector('[data-del]').onclick = () => {
      const p = parcelById(card.dataset.id);
      confirmAction({
        title: 'Supprimer la parcelle ?',
        message: `« ${p?.name} » sera retirée. Les cultures liées resteront dans l’historique mais sans terrain.`,
        confirmLabel: 'Oui, supprimer',
        onConfirm: () => {
          state.parcels = state.parcels.filter((x) => x.id !== card.dataset.id);
          persist();
          toast('Parcelle supprimée');
          render();
        },
      });
    };
  });
}

function openParcelForm(id) {
  const p = id ? parcelById(id) : null;
  openModal({
    title: p ? 'Modifier la parcelle' : 'Nouvelle parcelle',
    bodyHtml: `
      <div class="form-group"><label>Nom</label>
        <input type="text" id="f-name" placeholder="Ex. Jardin potager" value="${p?.name || ''}" /></div>
      <div class="form-group"><label>Surface (m²)</label>
        <input type="number" id="f-surf" min="1" value="${p?.surface || 100}" /></div>
      <div class="form-group"><label>Type de sol</label>
        <select id="f-soil">${SOIL_TYPES.map((s) =>
          `<option ${p?.soilType === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
      <div class="form-group"><label>État</label>
        <select id="f-status">${PARCEL_STATUSES.map((s) =>
          `<option value="${s}" ${p?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>`,
    secondary: { label: 'Annuler' },
    primary: {
      label: 'Enregistrer',
      onClick: (ov) => {
        const name = ov.querySelector('#f-name').value.trim();
        if (!name) { toast('Donne un nom à la parcelle', true); return; }
        const data = {
          name,
          surface: Number(ov.querySelector('#f-surf').value) || 0,
          soilType: ov.querySelector('#f-soil').value,
          status: ov.querySelector('#f-status').value,
        };
        if (p) Object.assign(p, data);
        else state.parcels.push({ id: uid('p'), ...data });
        persist();
        closeModal();
        toast(p ? 'Parcelle mise à jour' : 'Parcelle créée');
        if (!plusView) { plusView = 'parcelles'; tab = 'plus'; }
        render();
      },
    },
  });
}

/* Préparation */
function renderPreparation() {
  headerSub().textContent = 'Préparation';
  const list = [...state.preparations].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  content().innerHTML = `
    <div class="page-title">${backPlusBtn()}<span>Préparation du sol</span></div>
    <button type="button" class="btn btn-primary btn-lg mb-1" id="new-prep">+ Nouvelle préparation</button>
    ${list.length ? list.map((pr) => {
      const parcel = parcelById(pr.parcelId);
      return `
      <div class="card" data-id="${pr.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <h3>${pr.type}</h3>
          ${statusPill(pr.status)}
        </div>
        <div class="card-meta">
          📍 ${parcel?.name || '—'} · ${pr.method}<br>
          ${formatDateFR(pr.startDate)}${pr.endDate ? ` → ${formatDateFR(pr.endDate)}` : ''}
          ${pr.notes ? `<br>💬 ${pr.notes}` : ''}
        </div>
        <div class="card-actions">
          ${pr.status !== 'terminé' ? `<button type="button" class="btn btn-sm btn-primary" data-done>Marquer terminé</button>` : ''}
          <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
          <button type="button" class="btn btn-sm btn-danger" data-del>Supprimer</button>
        </div>
      </div>`;
    }).join('') : `
      <div class="empty-state">
        <div class="emoji">🛠️</div>
        <p>Aucune préparation.<br>Appuie sur <strong>+ Nouvelle préparation</strong>.</p>
      </div>`}
  `;
  bindBackPlus();
  content().querySelector('#new-prep').onclick = () => openPrepForm();
  content().querySelectorAll('.card[data-id]').forEach((card) => {
    const id = card.dataset.id;
    card.querySelector('[data-done]')?.addEventListener('click', () => {
      const pr = state.preparations.find((x) => x.id === id);
      if (!pr) return;
      pr.status = 'terminé';
      freeParcelIfEmpty(pr.parcelId);
      persist();
      toast('Préparation terminée');
      render();
    });
    card.querySelector('[data-edit]').onclick = () => openPrepForm(id);
    card.querySelector('[data-del]').onclick = () => {
      confirmAction({
        title: 'Supprimer cette préparation ?',
        message: 'Elle disparaîtra de la liste.',
        confirmLabel: 'Oui, supprimer',
        onConfirm: () => {
          const pr = state.preparations.find((x) => x.id === id);
          state.preparations = state.preparations.filter((x) => x.id !== id);
          if (pr) freeParcelIfEmpty(pr.parcelId);
          persist();
          toast('Supprimé');
          render();
        },
      });
    };
  });
}

function openPrepForm(id) {
  if (!state.parcels.length) {
    toast('Crée d’abord une parcelle', true);
    openParcelForm();
    return;
  }
  const pr = id ? state.preparations.find((x) => x.id === id) : null;
  openModal({
    title: pr ? 'Modifier la préparation' : 'Nouvelle préparation',
    bodyHtml: `
      <div class="form-group"><label>Parcelle</label>
        <select id="f-parcel">${state.parcels.map((p) =>
          `<option value="${p.id}" ${pr?.parcelId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Type de travail</label>
        <select id="f-type">${PREP_TYPES.map((t) =>
          `<option ${pr?.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="form-group"><label>Méthode</label>
        <select id="f-method">${PREP_METHODS.map((m) =>
          `<option ${pr?.method === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
      <div class="form-group"><label>État</label>
        <select id="f-status">${PREP_STATUSES.map((s) =>
          `<option ${pr?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
      <div class="form-row">
        <div class="form-group"><label>Début</label><input type="date" id="f-start" value="${pr?.startDate || new Date().toISOString().slice(0, 10)}" /></div>
        <div class="form-group"><label>Fin prévue</label><input type="date" id="f-end" value="${pr?.endDate || ''}" /></div>
      </div>
      <div class="form-group"><label>Note</label><input type="text" id="f-notes" value="${pr?.notes || ''}" placeholder="Optionnel" /></div>`,
    secondary: { label: 'Annuler' },
    primary: {
      label: 'Enregistrer',
      onClick: (ov) => {
        const data = {
          parcelId: ov.querySelector('#f-parcel').value,
          type: ov.querySelector('#f-type').value,
          method: ov.querySelector('#f-method').value,
          status: ov.querySelector('#f-status').value,
          startDate: ov.querySelector('#f-start').value,
          endDate: ov.querySelector('#f-end').value || null,
          notes: ov.querySelector('#f-notes').value.trim(),
        };
        if (pr) Object.assign(pr, data);
        else state.preparations.push({ id: uid('prep'), ...data });
        const parcel = parcelById(data.parcelId);
        if (parcel && data.status !== 'terminé' && parcel.status === 'libre') {
          parcel.status = 'préparation';
        }
        if (parcel && data.status === 'terminé') freeParcelIfEmpty(data.parcelId);
        persist();
        closeModal();
        toast('Préparation enregistrée');
        plusView = 'preparation';
        tab = 'plus';
        render();
      },
    },
  });
}

/* Traitements */
function renderTraitements() {
  headerSub().textContent = 'Engrais & herbicides';
  content().innerHTML = `
    <div class="page-title">${backPlusBtn()}<span>Engrais & herbicides</span></div>
    <div class="cta-stack">
      <button type="button" class="btn btn-primary btn-lg" id="new-t">+ Ajouter au stock</button>
      <button type="button" class="btn btn-secondary btn-lg" id="apply-t">💨 Appliquer sur une parcelle</button>
    </div>
    <div class="section-head"><h3>Mon stock</h3></div>
    ${state.treatments.map((t) => {
      const pct = t.stockMax ? Math.min(100, Math.round((t.stock / t.stockMax) * 100)) : 0;
      const low = pct < 20;
      return `
        <div class="card" data-id="${t.id}">
          <div style="display:flex;justify-content:space-between">
            <h3>${t.name}</h3>
            <span class="badge ${t.category === 'herbicide' ? 'badge-annule' : 'badge-planifie'}">${t.category === 'herbicide' ? 'Herbicide' : 'Engrais'}</span>
          </div>
          <div class="card-meta">${t.stock} ${t.unit} restant${t.stockMax ? ` / ${t.stockMax}` : ''}</div>
          <div class="stock-bar ${low ? 'stock-low' : ''}"><div class="fill" style="width:${pct}%"></div></div>
          <div class="card-actions">
            <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
            <button type="button" class="btn btn-sm btn-danger" data-del>Retirer</button>
          </div>
        </div>`;
    }).join('') || '<p class="muted">Stock vide.</p>'}
    <div class="section-head"><h3>Dernières applications</h3></div>
    ${[...state.applications].reverse().slice(0, 8).map((a) => {
      const t = treatmentById(a.treatmentId);
      const p = parcelById(a.parcelId);
      return `<div class="timeline-item">
        <div class="timeline-dot" style="background:${t?.category === 'herbicide' ? 'var(--herbicide)' : 'var(--fertilizer)'}"></div>
        <div>
          <div class="date">${formatDateFR(a.date)}</div>
          <div class="title">${t?.name || '?'} · ${a.quantity} ${t?.unit || ''}</div>
          <div class="muted">${p?.name || ''}${a.notes ? ' — ' + a.notes : ''}</div>
        </div>
      </div>`;
    }).join('') || '<p class="muted">Aucune application encore.</p>'}
  `;
  bindBackPlus();
  content().querySelector('#new-t').onclick = () => openTreatmentForm();
  content().querySelector('#apply-t').onclick = () => openApplyForm();
  content().querySelectorAll('.card[data-id]').forEach((card) => {
    card.querySelector('[data-edit]').onclick = () => openTreatmentForm(card.dataset.id);
    card.querySelector('[data-del]').onclick = () => {
      confirmAction({
        title: 'Retirer du stock ?',
        message: 'Ce produit disparaîtra de la liste (l’historique d’applications reste).',
        confirmLabel: 'Oui, retirer',
        onConfirm: () => {
          state.treatments = state.treatments.filter((x) => x.id !== card.dataset.id);
          persist();
          toast('Retiré du stock');
          render();
        },
      });
    };
  });
}

function openTreatmentForm(id) {
  const t = id ? treatmentById(id) : null;
  openModal({
    title: t ? 'Modifier le produit' : 'Ajouter au stock',
    bodyHtml: `
      <div class="form-group"><label>Type</label>
        <select id="f-cat">
          <option value="engrais" ${t?.category === 'engrais' ? 'selected' : ''}>Engrais</option>
          <option value="herbicide" ${t?.category === 'herbicide' ? 'selected' : ''}>Herbicide</option>
        </select></div>
      <div class="form-group"><label>Nom</label>
        <input type="text" id="f-name" list="preset-names" value="${t?.name || ''}" placeholder="Choisir ou écrire…" />
        <datalist id="preset-names">${[...FERTILIZER_PRESETS, ...HERBICIDE_PRESETS].map((n) => `<option value="${n}">`).join('')}</datalist>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Quantité en stock</label><input type="number" id="f-stock" min="0" step="0.1" value="${t?.stock ?? 10}" /></div>
        <div class="form-group"><label>Unité</label>
          <select id="f-unit"><option ${t?.unit === 'kg' ? 'selected' : ''}>kg</option><option ${t?.unit === 'L' ? 'selected' : ''}>L</option><option ${t?.unit === 'sac' ? 'selected' : ''}>sac</option></select>
        </div>
      </div>
      <div class="form-group"><label>Stock max (pour la jauge)</label><input type="number" id="f-max" min="0" value="${t?.stockMax ?? 50}" /></div>
      <div class="form-group"><label>Note</label><input type="text" id="f-notes" value="${t?.notes || ''}" /></div>`,
    secondary: { label: 'Annuler' },
    primary: {
      label: 'Enregistrer',
      onClick: (ov) => {
        const name = ov.querySelector('#f-name').value.trim();
        if (!name) { toast('Indique un nom', true); return; }
        const data = {
          name,
          category: ov.querySelector('#f-cat').value,
          stock: Number(ov.querySelector('#f-stock').value) || 0,
          unit: ov.querySelector('#f-unit').value,
          stockMax: Number(ov.querySelector('#f-max').value) || 0,
          notes: ov.querySelector('#f-notes').value.trim(),
        };
        if (t) Object.assign(t, data);
        else state.treatments.push({ id: uid('t'), ...data });
        persist();
        closeModal();
        toast('Stock mis à jour');
        plusView = 'traitements';
        tab = 'plus';
        render();
      },
    },
  });
}

function openApplyForm() {
  if (!state.treatments.length) { toast('Ajoute d’abord un produit au stock', true); return; }
  if (!state.parcels.length) { toast('Crée d’abord une parcelle', true); return; }
  openModal({
    title: 'Appliquer un traitement',
    bodyHtml: `
      <div class="form-group"><label>Produit</label>
        <select id="f-t">${state.treatments.map((t) =>
          `<option value="${t.id}">${t.name} (${t.stock} ${t.unit})</option>`).join('')}</select></div>
      <div class="form-group"><label>Parcelle</label>
        <select id="f-p">${state.parcels.map((p) =>
          `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Culture liée (optionnel)</label>
        <select id="f-c"><option value="">— Aucune —</option>
          ${state.cultures.filter((c) => c.status === 'actif').map((c) => {
            const crop = cropById(c.cropId);
            return `<option value="${c.id}">${crop?.name || '?'} · ${parcelById(c.parcelId)?.name || ''}</option>`;
          }).join('')}
        </select></div>
      <div class="form-row">
        <div class="form-group"><label>Quantité utilisée</label><input type="number" id="f-q" min="0.1" step="0.1" value="1" /></div>
        <div class="form-group"><label>Date</label><input type="date" id="f-d" value="${new Date().toISOString().slice(0, 10)}" /></div>
      </div>
      <div class="form-group"><label>Note</label><input type="text" id="f-n" placeholder="Optionnel" /></div>`,
    secondary: { label: 'Annuler' },
    primary: {
      label: 'Enregistrer',
      onClick: (ov) => {
        const treatmentId = ov.querySelector('#f-t').value;
        const qty = Number(ov.querySelector('#f-q').value) || 0;
        const t = treatmentById(treatmentId);
        if (!t || qty <= 0) { toast('Quantité invalide', true); return; }
        if (qty > t.stock) { toast('Pas assez en stock', true); return; }
        t.stock = Math.round((t.stock - qty) * 100) / 100;
        state.applications.push({
          id: uid('a'),
          treatmentId,
          parcelId: ov.querySelector('#f-p').value,
          cultureId: ov.querySelector('#f-c').value || null,
          date: ov.querySelector('#f-d').value,
          quantity: qty,
          notes: ov.querySelector('#f-n').value.trim(),
        });
        persist();
        closeModal();
        toast(`Application enregistrée · reste ${t.stock} ${t.unit}`);
        render();
      },
    },
  });
}

/* Catalogue */
function renderCatalogue() {
  headerSub().textContent = 'Plantes';
  content().innerHTML = `
    <div class="page-title">${backPlusBtn()}<span>Plantes cultivées</span></div>
    <p class="muted mb-1">Durées utilisées pour calculer automatiquement semis → plantation → récolte.</p>
    <button type="button" class="btn btn-primary btn-lg mb-1" id="new-crop">+ Ajouter une plante</button>
    ${state.crops.map((c) => `
      <div class="card" data-id="${c.id}">
        <h3>${c.name}</h3>
        <div class="card-meta">
          🪴 Semis ${c.nurseryDays} j · 🌱 Croissance ${c.growthDays} j · 🍅 Récolte ${c.harvestDays} j
          ${c.notes ? `<br>${c.notes}` : ''}
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
          <button type="button" class="btn btn-sm btn-danger" data-del>Supprimer</button>
        </div>
      </div>`).join('')}
  `;
  bindBackPlus();
  content().querySelector('#new-crop').onclick = () => openCropForm();
  content().querySelectorAll('.card[data-id]').forEach((card) => {
    card.querySelector('[data-edit]').onclick = () => openCropForm(card.dataset.id);
    card.querySelector('[data-del]').onclick = () => {
      confirmAction({
        title: 'Supprimer cette plante ?',
        message: 'Elle disparaîtra du catalogue. Les cultures déjà créées ne sont pas effacées.',
        confirmLabel: 'Oui, supprimer',
        onConfirm: () => {
          state.crops = state.crops.filter((x) => x.id !== card.dataset.id);
          persist();
          toast('Plante retirée');
          render();
        },
      });
    };
  });
}

function openCropForm(id) {
  const c = id ? cropById(id) : null;
  openModal({
    title: c ? 'Modifier la plante' : 'Nouvelle plante',
    bodyHtml: `
      <div class="form-group"><label>Nom</label><input type="text" id="f-name" value="${c?.name || ''}" placeholder="Ex. Tomate cerise" /></div>
      <div class="form-row">
        <div class="form-group"><label>Jours de semis</label><input type="number" id="f-n" min="0" value="${c?.nurseryDays ?? 21}" /></div>
        <div class="form-group"><label>Jours de croissance</label><input type="number" id="f-g" min="0" value="${c?.growthDays ?? 60}" /></div>
      </div>
      <div class="form-group"><label>Jours de récolte</label><input type="number" id="f-h" min="0" value="${c?.harvestDays ?? 21}" /></div>
      <div class="form-group"><label>Note</label><input type="text" id="f-notes" value="${c?.notes || ''}" /></div>`,
    secondary: { label: 'Annuler' },
    primary: {
      label: 'Enregistrer',
      onClick: (ov) => {
        const name = ov.querySelector('#f-name').value.trim();
        if (!name) { toast('Donne un nom', true); return; }
        const data = {
          name,
          nurseryDays: Number(ov.querySelector('#f-n').value) || 0,
          growthDays: Number(ov.querySelector('#f-g').value) || 0,
          harvestDays: Number(ov.querySelector('#f-h').value) || 0,
          notes: ov.querySelector('#f-notes').value.trim(),
        };
        if (c) Object.assign(c, data);
        else state.crops.push({ id: uid('crop'), ...data });
        persist();
        closeModal();
        toast('Plante enregistrée');
        plusView = 'catalogue';
        tab = 'plus';
        render();
      },
    },
  });
}

/* Échecs list */
function renderEchecs() {
  headerSub().textContent = 'Échecs';
  const list = [...state.failures].reverse();
  content().innerHTML = `
    <div class="page-title">${backPlusBtn()}<span>Échecs & annulations</span></div>
    ${list.length ? list.map((f) => {
      const crop = cropById(f.cropId);
      const parcel = parcelById(f.parcelId);
      return `
        <div class="card">
          <div style="display:flex;justify-content:space-between">
            <h3>${crop?.name || 'Culture'}</h3>
            ${statusPill('annulé')}
          </div>
          <div class="card-meta">
            ${f.reason} · ${formatDateFR(f.date)}<br>
            📍 ${parcel?.name || '—'}
            ${f.plantsLost ? ` · ${f.plantsLost} plants` : ''}
            ${f.surfaceLost ? ` · ${f.surfaceLost} m²` : ''}
            ${f.lossEuro ? `<br><span class="loss-amount">Perte ≈ ${f.lossEuro} €</span>` : ''}
            ${f.description ? `<br>${f.description}` : ''}
            ${f.corrective ? `<br>➡️ ${f.corrective}` : ''}
          </div>
        </div>`;
    }).join('') : `
      <div class="empty-state">
        <div class="emoji">✅</div>
        <p>Aucun échec enregistré.<br>Tant mieux ! Tu peux annuler une culture depuis l’onglet Cultures.</p>
      </div>`}
  `;
  bindBackPlus();
}

/* Réglages */
function renderReglages() {
  headerSub().textContent = 'Réglages';
  const email = session?.user?.email || '—';
  const farmName = farm?.name || '—';
  content().innerHTML = `
    <div class="page-title">${backPlusBtn()}<span>Réglages</span></div>
    <div class="card">
      <h3>Compte cloud</h3>
      <p class="card-meta mb-1">
        Connecté : <strong>${email}</strong><br>
        Exploitation : <strong>${farmName}</strong><br>
        Tes données sont synchronisées — même progression sur téléphone, tablette et PC.
      </p>
      <button type="button" class="btn btn-secondary btn-block" id="btn-reload">Rafraîchir depuis le cloud</button>
      <button type="button" class="btn btn-danger btn-block mt-1" id="btn-logout">Se déconnecter</button>
    </div>
    <div class="card">
      <h3>Sauvegarder (fichier)</h3>
      <p class="card-meta mb-1">Copie locale de secours (JSON).</p>
      <button type="button" class="btn btn-primary btn-block" id="btn-export">Télécharger la sauvegarde</button>
    </div>
    <div class="card">
      <h3>Restaurer une sauvegarde</h3>
      <p class="card-meta mb-1">Remplace les données cloud de cette exploitation.</p>
      <input type="file" id="import-file" accept="application/json,.json" hidden />
      <button type="button" class="btn btn-secondary btn-block" id="btn-import">Choisir un fichier…</button>
    </div>
    <div class="card">
      <h3>Revoir l’accueil</h3>
      <button type="button" class="btn btn-secondary btn-block" id="btn-welcome">Afficher le guide de démarrage</button>
    </div>
    <div class="card">
      <h3>Vider l’exploitation</h3>
      <p class="card-meta mb-1">Efface parcelles et cultures ; conserve le catalogue de plantes de base.</p>
      <button type="button" class="btn btn-danger btn-block" id="btn-reset">Réinitialiser les données</button>
    </div>
    <p class="muted" style="font-size:0.75rem;text-align:center;margin-top:1rem">
      Guyane Cultures v2 · sync Supabase multi-appareils<br>
      Isolation par exploitation (RLS)
    </p>
  `;
  bindBackPlus();
  content().querySelector('#btn-reload').onclick = async () => {
    try {
      state = await loadFarmState(farm.id);
      toast('Données à jour');
      render();
    } catch (err) {
      toast(err.message || 'Erreur', true);
    }
  };
  content().querySelector('#btn-logout').onclick = async () => {
    await signOut();
    session = null;
    farm = null;
    state = emptyState();
    renderAuth();
  };
  content().querySelector('#btn-export').onclick = () => {
    const blob = new Blob([exportJSON(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `guyane-cultures-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Sauvegarde téléchargée');
  };
  content().querySelector('#btn-import').onclick = () => content().querySelector('#import-file').click();
  content().querySelector('#import-file').onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      state = parseImportJSON(text);
      await persist();
      toast('Données restaurées dans le cloud');
      render();
    } catch (err) {
      toast(err.message || 'Fichier invalide', true);
    }
  };
  content().querySelector('#btn-welcome').onclick = () => {
    localStorage.removeItem('guyane-welcome-seen');
    maybeShowWelcome();
  };
  content().querySelector('#btn-reset').onclick = () => {
    confirmAction({
      title: 'Tout effacer ?',
      message: 'Parcelles, cultures et stocks de cette exploitation seront effacés dans le cloud. Le catalogue de plantes de base sera rechargé.',
      confirmLabel: 'Oui, réinitialiser',
      onConfirm: async () => {
        try {
          state = await resetFarmToCatalog(farm.id);
          localStorage.removeItem('guyane-welcome-seen');
          toast('Exploitation réinitialisée');
          plusView = null;
          tab = 'accueil';
          render();
          maybeShowWelcome();
        } catch (err) {
          toast(err.message || 'Erreur', true);
        }
      },
    });
  };
}

/* ——— Router ——— */
function render() {
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  if (tab === 'accueil') renderAccueil();
  else if (tab === 'cultures') renderCultures();
  else if (tab === 'planning') renderPlanning();
  else renderPlus();
}

function initNav() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      tab = btn.dataset.tab;
      if (tab !== 'plus') plusView = null;
      render();
    });
  });
}

initNav();

if (supabase) {
  supabase.auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_OUT') {
      session = null;
      farm = null;
      state = emptyState();
      renderAuth();
    }
  });
}

bootApp();
