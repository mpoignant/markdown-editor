# App Store — Notes & Stratégie

## 1. Options pour iPad

**Question initiale :** que faudrait-il faire pour que l'application fonctionne sur iPad ?

### Tauri 2 Mobile (iOS) — Recommandé

Le chemin le plus naturel vu l'architecture actuelle — une seule codebase, le gros du code ne change pas.

- Tauri 2 supporte officiellement iOS
- Le frontend Vue.js reste identique
- Nécessite un compte Apple Developer (99 $/an)
- Ajouter la cible iOS : `npm run tauri ios init`
- Adapter les plugins (file dialog, shell) aux API iOS — certains n'ont pas d'équivalent mobile
- Gérer le stockage fichier via Files.app / iCloud au lieu du filesystem libre (pas de chemins libres, il faut passer par le document picker d'Apple)
- Builder via Xcode, distribuer via TestFlight ou l'App Store

### PWA (Alternative)
- Ajouter un `manifest.json` + service worker
- Remplacer les appels Tauri (fs, dialog) par les API web (File System Access API, IndexedDB pour le stockage local)
- Zéro coût de distribution, fonctionne immédiatement sur iPad depuis Safari
- Limitations : pas d'accès libre au filesystem, pas de "Ouvrir avec", UX moins native

---

## 2. Distribution

### TestFlight (bêta-testing)

TestFlight est l'outil de bêta-testing d'Apple. Il permet d'installer des apps sur des appareils iOS/iPadOS sans passer par l'App Store public.

**Fonctionnement :**
1. Compiler l'app dans Xcode et l'uploader sur App Store Connect
2. Apple fait une revue légère (moins stricte que pour l'App Store)
3. Inviter des testeurs (soi-même, ou jusqu'à 10 000 personnes) par email ou lien public
4. Les testeurs installent l'app TestFlight (gratuite), et téléchargent la bêta depuis là

**Contraintes :**
- Nécessite un compte Apple Developer (99 $/an)
- Chaque build expire après 90 jours — il faut re-uploader régulièrement
- L'app passe une revue minimale (pas de crash au lancement, pas de malware)

**Alternative pour dev pur :** Xcode peut déployer directement sur iPad branché en USB avec un simple Apple ID gratuit — mais le build expire après 7 jours et c'est limité à 3 apps simultanées.

**Pour un usage personnel**, c'est le moyen le plus simple d'installer sa propre app sur son iPad sans la publier. On se déclare comme testeur de sa propre app.

### App Store (publication)

**Prérequis :**
- Compte Apple Developer (99 $/an)
- Xcode avec un certificat de distribution
- Respecter les Human Interface Guidelines d'Apple

**Étapes :**
1. **Préparation** — configurer les métadonnées sur App Store Connect : nom, description, captures d'écran (résolutions iPad requises), catégorie, mots-clés, politique de confidentialité (obligatoire, même si l'app ne collecte rien)
2. **Build & upload** — archiver l'app dans Xcode, uploader sur App Store Connect
3. **Revue Apple** — test manuel de chaque app, délai typique 24-48h. Motifs de rejet fréquents :
   - Crash ou bug évident
   - UI non conforme aux guidelines iOS
   - App jugée trop simple ou "wrapper web" sans valeur ajoutée
   - Métadonnées incomplètes (screenshots, description)
4. **Publication** — une fois approuvée, choix de la date de mise en ligne

**Points d'attention pour un éditeur Markdown :**
- La catégorie "Productivité" est très concurrentielle
- Apple pourrait demander ce qui distingue l'app des alternatives
- L'accès fichiers doit passer par le document picker iOS
- Gratuit ou payant, c'est au choix — Apple prend 30% sur les ventes

**Coût total minimum :** 99 $/an, pas de frais par publication.

---

## 3. Concurrence (éditeurs Markdown iPad)

| App | Modèle | Positionnement |
|-----|--------|----------------|
| **iA Writer** | ~50 € (achat unique) | Référence du minimalisme, focus mode, export multi-format |
| **Ulysses** | ~6 €/mois (abo) | Écriture longue, bibliothèque intégrée, sync iCloud |
| **Bear** | Gratuit + 3 €/mois | Notes Markdown, tags, design soigné, écosystème Apple |
| **Obsidian** | Gratuit | Knowledge base, liens bidirectionnels, plugins, vault local |
| **Byword** | ~6 € (achat unique) | Simple et efficace, publication WordPress/Medium |
| **1Writer** | Léger | Intégration Shortcuts, accès filesystem iOS |
| **Taio** | — | Clipboard + éditeur Markdown, actions automatisées |
| **FSNotes** | Open source | Rapide, stockage local |
| **GitJournal** | — | Sync Git natif |

**Ce qui les différencie de notre éditeur :**
- La plupart sont des apps de prise de notes (bibliothèque, tags, recherche) plutôt que des éditeurs purs
- Sync iCloud / multi-appareils est quasi systématique
- Plusieurs proposent l'export PDF/HTML/DOCX
- Le split-screen live preview (comme le nôtre) est un différenciateur — peu le font aussi bien sur iPad

**Positionnement naturel :** éditeur open source, gratuit, focalisé sur l'édition pure avec preview live split-screen — niche face aux apps à abonnement.

---

## 4. ASO (App Store Optimization)

L'ASO est le SEO appliqué à l'App Store — l'ensemble des techniques pour maximiser la visibilité et les téléchargements dans les résultats de recherche.

**Leviers principaux :**
1. **Métadonnées textuelles** — Nom (30 car. max, facteur le plus important), Sous-titre (30 car.), champ Keywords (100 car., invisible pour l'utilisateur), Description (influence la conversion)
2. **Visuels** — Icône (impact majeur sur le taux de clic), Screenshots (les 3 premiers visibles sans scroller), Vidéo preview (optionnelle, 30s max, autoplay)
3. **Signaux de performance** — Note et avis (quantité + fraîcheur), taux de téléchargement et rétention, vitesse de croissance
4. **Localisation** — Traduire les métadonnées multiplie les mots-clés indexés

### Nom + Sous-titre

**Nom retenu : Markdown Live**

Raisons :
- "Markdown" en premier = meilleur ranking ASO (Apple pondère les premiers mots plus fortement)
- "Live" comme qualificatif évoque immédiatement le live preview
- Plus naturel en anglais (nom + adjectif), pattern similaire à Ableton Live, Xbox Live

Sous-titre recommandé : **Open Source Editor**

### Champ Keywords (100 caractères)

```
writing,notes,text,code,preview,split,syntax,highlight,markup,md,plain,distraction,free,lightweight
```

Principes : pas de doublons avec le titre, singulier uniquement, pas d'espaces après les virgules.

### Screenshots (les 3 premiers sont critiques)

1. Split-screen avec un document Markdown réaliste — "Live Preview as You Type"
2. Thème sombre avec du code coloré — "Syntax Highlighting"
3. Vue de l'app avec toolbar visible — "Free & Open Source"
4. (Optionnel) Raccourcis clavier, thème clair, drag & drop

### Description

```
Ligne 1 (accroche visible) :
"A clean, fast Markdown editor with real-time split preview. Free and open source."

Features clés :
• Live split-screen preview
• Syntax highlighting (code blocks)
• Dark & light themes
• Keyboard shortcuts for all formatting
• Open and save .md files
• No account, no subscription, no ads

Différenciateur :
"Unlike other editors, [Name] is 100% free with no feature gates.
Built with Tauri and Vue.js — the source code is available on GitHub."
```

### Catégories

- Primaire : **Productivity**
- Secondaire : **Utilities**

### Localisation prioritaire

Français, allemand, japonais — marchés avec recherches "markdown" fréquentes et concurrence ASO plus faible.

### Stratégie de lancement

1. Publier avec métadonnées optimisées
2. Soumettre à Product Hunt et r/markdown la même semaine (pic de téléchargements = boost algorithmique)
3. Demander des avis in-app après 3 utilisations
4. Itérer les screenshots A/B via App Store Connect

---

## 5. Monétisation (In-App Purchases)

### Modèle : Freemium avec "Pro" unlock unique

Un seul achat non-consumable (pas d'abonnement). Prix suggéré : 4,99 € ou 6,99 €.

### Gratuit (le cœur)

- Édition Markdown complète
- Live preview split-screen
- Thème clair/sombre
- Ouverture/sauvegarde de fichiers
- Raccourcis clavier
- Syntax highlighting

### Features Pro

| Feature | Effort dev | Valeur perçue |
|---------|-----------|---------------|
| Thèmes supplémentaires (sépia, nord, solarized, custom) | Faible | Moyenne |
| Export PDF/HTML/DOCX | Moyen | Élevée |
| Sync iCloud (multi-appareil) | Moyen-élevé | Élevée |
| Custom CSS pour le preview | Faible | Moyenne |
| Typographies premium | Faible | Moyenne |
| Focus mode | Moyen | Élevée |
| Statistiques (mots, temps de lecture, objectif) | Faible | Moyenne |
| Éditeur visuel de tableaux Markdown | Moyen | Élevée |
| Multi-tabs / Multi-fichiers | Moyen | Élevée |

### Premier "Pro pack" recommandé

1. **Export PDF/HTML** — use-case le plus demandé sur mobile
2. **Focus mode** — visuellement impressionnant, effort moyen
3. **Thèmes supplémentaires** — coût quasi nul, rentabilise immédiatement

### Implémentation technique (StoreKit 2)

- Type d'IAP : Non-consumable (un seul achat, déverrouille tout)
- Persistance statut : `tauri-plugin-store`
- Validation du reçu locale avec StoreKit 2 (pas besoin de serveur)

### Licence — Point de tension GPL v3 + App Store

La GPL v3 et l'App Store ont des frictions (DRM Apple incompatibles avec la liberté GPL). Options :

- **Dual-licensing** : code GPL sur GitHub, version App Store sous licence propriétaire
- **Séparer les features Pro** : module propriétaire non inclus dans le repo GPL
- **Changer de licence** : passer en MIT/Apache 2.0

### Revenus estimés (conservateur)

- 500-2000 téléchargements/mois
- Taux de conversion Pro : 3-5%
- À 4,99 € → 75-500 €/mois brut (52-350 € net après commission Apple 30%)
