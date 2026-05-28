# Évaluation RGESN — Markdown Editor (Tauri + Vue 3)

Date : 2026-05-28

## 1. Stratégie & Spécifications — Bon

| Critère | Évaluation |
|---------|------------|
| Besoin réel et défini | L'app répond à un besoin précis : éditer du Markdown avec preview |
| Fonctionnalités limitées au nécessaire | 5 composants, pas de feature creep |
| Pas de dark pattern | Interface utilitaire sobre |

## 2. Architecture — Très bon

| Point fort | Détail |
|-----------|--------|
| Tauri (Rust) vs Electron | ~10x plus léger en RAM et en taille binaire |
| Backend minimal | Quasi pas de logique serveur, tout est local |
| Pas de base de données | Lecture/écriture fichier directe |
| 3 devDeps seulement | Chaîne de build minimale |

## 3. UX/UI — Bon

| Critère | Évaluation |
|---------|------------|
| Interface sobre | Pas d'animations superflues, pas de vidéo |
| Thème sombre disponible | Réduit la consommation écran OLED |
| Pas d'autoplay/notifications | Aucune sollicitation non désirée |

## 4. Frontend — Correct, améliorable

| Critère | Statut | Commentaire |
|---------|--------|-------------|
| Poids total du build | 1.9 MB | Acceptable pour une app desktop |
| Plus gros chunk | 692 KB (Prism.js) | 130+ langages chargés alors que 5-8 suffiraient |
| Lazy loading | Aucun | AboutDialog et Prism chargés dès le démarrage |
| Code splitting | Minimal | Pas de chunks séparés vendor/app |
| Polices web | 5 Google Fonts via CDN | Bloquant au rendu, réseau externe requis |
| CSS | 371 lignes, bien organisé | Les 2 thèmes chargés simultanément |

## 5. Contenus & Médias — Très bon

| Critère | Statut |
|---------|--------|
| Médias embarqués | Uniquement l'icône app (~41 KB) |
| Pas de vidéo/audio | Aucun |
| Compression images | Icons en PNG multi-résolution (standard Tauri) |

## 6. Backend (Rust/Tauri) — Excellent

| Critère | Statut |
|---------|--------|
| Dépendances Rust | 7 (minimum vital) |
| Traitements serveur | Aucun — tout est côté client/OS |
| Pas de requêtes réseau | Sauf Google Fonts |
| Pas de télémétrie | Aucune donnée envoyée |

## 7. Hébergement — Non applicable

App desktop, pas de serveur. C'est en soi le meilleur choix éco-numérique possible pour ce type d'outil.

## Score synthétique

| Thématique | Note /5 |
|-----------|---------|
| Stratégie | 5 |
| Architecture | 5 |
| UX/UI | 4 |
| Frontend | 3 |
| Contenus | 5 |
| Backend | 5 |
| Hébergement | N/A |
| **Moyenne** | **4.5 / 5** |

## Axes d'amélioration prioritaires

1. **Prism.js** — Ne charger que les 5-8 langages pertinents (JS, Python, Bash, JSON, Rust, HTML, CSS, YAML). Gain potentiel : ~500 KB soit -60% du bundle.

2. **Google Fonts** — Passer en polices système (`system-ui`, `-apple-system`) ou embarquer uniquement Inter en subset WOFF2. Élimine les requêtes réseau et le FOIT/FOUT.

3. **Lazy loading** — `defineAsyncComponent()` pour `AboutDialog.vue` (rarement affiché) et chargement dynamique des langages Prism.

4. **Code splitting** — Séparer CodeMirror en chunk vendor (cache navigateur durable dans le contexte WebView).

## Conclusion

Le projet est déjà très bien positionné par rapport à la RGESN grâce au choix de Tauri (vs Electron), à l'absence de réseau/serveur, et à une architecture frontend sobre. Les marges de progression sont essentiellement sur l'optimisation du bundle (Prism.js) et la suppression de la dépendance aux Google Fonts.
