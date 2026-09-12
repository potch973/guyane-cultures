# Guyane Cultures (cloud)

Planificateur agricole simple pour la Guyane française — **multi-appareils**, synchronisé via Supabase.

Pensé pour le téléphone, en français, look tropical sombre. Suivez parcelles, préparation du sol, semis, plantations, récoltes, engrais / herbicides, et un planning type Gantt annuel.

**Données dans le cloud** (Supabase Auth + Postgres + RLS). Même compte sur téléphone / tablette / PC = même progression. Isolation multi-tenant par exploitation (`farm_id`).

## Prérequis

- Node.js 18+ (20 recommandé)
- Un projet Supabase (voir ci-dessous)

## Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (ex. `guyane-cultures`).
2. Ouvrez **SQL Editor** et exécutez le fichier :
   `supabase/migrations/001_multi_tenant_farm.sql`
3. Dans **Authentication → Providers**, gardez **Email** activé (mot de passe).
4. Dans **Project Settings → API**, copiez :
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` / `public` key → `VITE_SUPABASE_ANON_KEY`

```bash
cp .env.example .env
# éditez .env avec vos valeurs
```

Exemple `.env` :

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrez l’URL affichée (souvent http://localhost:5173).

### Build de production

```bash
npm run build
npm run preview
```

Fichiers générés dans `dist/`.

## Déploiement

Tout hébergeur de sites statiques convient (Vercel, Netlify, GitHub Pages, Cloudflare Pages…).

1. Build : `npm run build`
2. Publiez le dossier `dist/`
3. Définissez les variables d’environnement **au build** :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Sur Vercel / Netlify : ajoutez ces variables dans les réglages du projet, puis redéployez.

## Première utilisation

1. Créez un compte (e-mail + mot de passe).
2. Créez votre exploitation (ferme / jardin) — isolée des autres utilisateurs.
3. Catalogue de plantes de base déjà chargé (Salade, Choux, Manioc…).
4. Ajoutez une parcelle → préparation → semis / plantation → suivi Gantt.

## Fonctionnalités

- Connexion / inscription cloud
- Accueil : saison Guyane, stats, raccourcis, prochaines dates
- Cultures : semis → plantation → récolte (fil de progression), filtres, échecs
- Planning : Gantt mensuel + liste à venir
- Plus : Parcelles, préparation, traitements et stock, catalogue, échecs, réglages
- Sync cloud : rafraîchir / déconnecter dans Réglages
- Export / import JSON de secours

## Schéma (multi-tenant)

Tables scopées par `farm_id` + RLS (`is_farm_member`) :

`farms`, `farm_members`, `parcels`, `crop_types`, `preparations`, `nurseries`, `cultures`, `product_stock`, `treatments`, `failures`

Le fil de progression (préparation → pépinière → culture → récolte) reste queryable pour le Gantt via dates et relations (`cultures.nursery_id` → `nurseries`).

## Technique

- Vite + HTML / CSS / JS
- `@supabase/supabase-js` (Auth e-mail/mot de passe, Postgres, RLS)
- Mobile-first, 4 onglets (Accueil | Cultures | Planning | Plus)

## Licence

Usage libre pour projets agricoles personnels ou associatifs en Guyane.
