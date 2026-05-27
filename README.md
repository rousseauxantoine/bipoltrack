# BipolTrack — Redesign editorial chaleureux

Trois directions exploratoires + une direction retenue (**Argile**) prête à essayer en standalone.

## Pages

| Fichier | Quoi | Ouvrir avec |
|---|---|---|
| `redesign/Argile.html` | **Direction retenue**, app entière jouable, panneau Tweaks live | navigateur (file:// ou serveur statique) |
| `redesign/Redesign.html` | Canvas comparatif des 3 directions (Argile · Saison · Almanach) côte à côte | navigateur |

## Direction retenue · Argile

Saisie quotidienne réimaginée en **3 temps** (Humeur → Corps → Mot) avec une **orbe d'argile** glissée sur une piste continue (1–10 invisibilisé). Récompense après chaque journée (soleil dessiné rayon par rayon).

### Écrans inclus

- **Premier jour** — état vide / onboarding
- **Journal** — Humeur, Corps, Mot
- **Récompense** — animation après save
- **Carnet annuel** — courbe 30j + 14j projetés (dashed + bande de confiance), calendrier annuel avec **phases UP/DOWN projetées en hachures**, projection card 8 semaines
- **News** — synthèse IA en gros serif + flux RSS
- **Historique** — liste des entrées
- **Soins** — gestion des traitements + adhérence
- **Rapport médecin** — page imprimée + métriques cliniques
- **Réglages** — Google Drive, API Claude, exports, profil

### Tweaks live (panneau en bas à droite)

- **Démarrer sur** — navigation rapide vers les 11 écrans
- **Finition de l'orbe** — Lisse · Texture · Nacre
- **L'étage** — Lumière · Chambre · Nuit (ambiance autour du téléphone)

## Système visuel

- **Type** — `Instrument Serif` (italique) en display + `DM Sans` en body + `JetBrains Mono` en numérique
- **Palette** — argile (#B85839) · sable (#EDDFC4) · crème (#F8F0DC) · encre (#2B1810) · olive (#5C6A3E)
- **Zones d'humeur** — 5 zones nommées remplaçant l'échelle 1-10 : Sombre · Bas · Stable · Haut · Brûlant

## Stack

- React 18.3.1 + Babel standalone (pas de build step — tout tourne via CDN)
- SVG natif, animations CSS keyframes
- Pas de dépendances backend — l'app cliente lit/écrit en localStorage comme l'`index.html` original

## Pour tester en local

```bash
# Serveur statique simple (Python)
python3 -m http.server 8000
# puis ouvrir : http://localhost:8000/redesign/Argile.html
```

Le `file://` direct fonctionne aussi mais Babel charge plus lentement.

## Intégration ultérieure

Cette redesign est **isolée dans `/redesign/`** et ne modifie pas `index.html`. Pour migrer :

1. Décider si on garde la même structure (HTML statique unique) ou si on adopte un build React
2. Si statique : extraire les composants vers du JS / Web Components plutôt que JSX runtime
3. Repiquer la couche de persistance (localStorage / Google Drive) déjà présente dans `index.html`
