# Guyane Cultures

Planificateur agricole simple pour la Guyane francaise.


Pense pour le telephone, en francais, look tropical sombre.

Suivez parcelles, preparation du sol, semis, plantations, recoltes, engrais / herbicides, et un planning type Gantt annuel.

Donnees sur l appareil (localStorage). Sauvegarde dans Plus > Reglages.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrez l URL affichee (souvent http://localhost:5173).

### Build de production

```bash
npm run build
npm run preview
```

Fichiers generes dans dist/.

## Demo rapide (2 minutes)

1. Lisez le guide d accueil (3 etapes).
2. Accueil : saison Guyane (chaude sept-mars / fraiche avr-aout).
3. Cultures > Nouveau semis : plante + parcelle + date = dates auto.
4. Planning : Gantt (gris prepa, orange semis, vert culture, rouge recolte, bleu engrais, violet herbicide).
5. Plus : Parcelles, Preparation, Traitements, catalogue, echecs, Reglages.

Des exemples sont charges au premier lancement.

## Fonctionnalites

- Accueil : saison, stats, raccourcis, prochaines dates
- Cultures : semis / plantation / recolte, filtres, echecs
- Planning : Gantt mensuel + liste a venir
- Plus : Parcelles, preparation, traitements et stock, catalogue, echecs, reglages
- Catalogue : Salade, Choux, Choux chinois, Bongo/Gombo, Aubergine, Manioc
- Traitements : NPK, fumiers, Glyphosate, Roundup + custom, stock
- Annulation : raisons, pertes euros, correctifs, parcelle liberee

## Hors scope (TODO)

- Meteo (API)
- Bot Discord
- Sync multi-utilisateurs
- Export PDF

## Technique

- Vite + HTML / CSS / JS
- localStorage + export/import JSON (Reglages)
- Mobile-first, 4 onglets (Accueil | Cultures | Planning | Plus)

## Licence

Usage libre pour projets agricoles personnels ou associatifs en Guyane.
