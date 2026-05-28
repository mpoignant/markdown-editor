# Conversation — Markdown Editor Desktop App

## Contexte

Construction d'une application desktop d'édition Markdown avec Tauri 2 + Vue.js 3, depuis un fichier de spécification (`Markdown_Editor_Desktop.md`).

---

## 1. Plan de développement

**Demande :** Créer un plan de développement détaillé à partir de la spec.

**Résultat :** Plan en 16 tâches sauvegardé dans `docs/superpowers/plans/2026-05-19-markdown-editor-desktop.md`, couvrant :
- Scaffolding du projet Tauri 2 + Vue 3
- Stores Pinia (editor, settings)
- CSS Foundation avec système de thèmes light/dark
- Composants (EditorPane, PreviewPane, Toolbar, StatusBar)
- Parsing Markdown (marked.js + prism.js)
- Scroll synchronisé
- Opérations fichiers natives (Open/Save/SaveAs)
- Raccourcis clavier
- Personnalisation des polices
- Build & packaging cross-platform

---

## 2. Création du CLAUDE.md

**Demande :** Initialiser un fichier CLAUDE.md pour le projet.

**Résultat :** Fichier créé avec tech stack, commandes dev, architecture et conventions.

---

## 3. Implémentation complète

**Demande :** Implémenter toute l'application de manière autonome.

**Étapes :**
1. Installation de Rust (rustup, toolchain stable 1.95.0)
2. Création manuelle de la structure du projet (le scaffolding interactif ne fonctionnant pas en mode non-TTY)
3. Écriture de tous les fichiers sources : config, styles, stores, composables, composants Vue, backend Rust
4. Installation des dépendances npm
5. Génération des icônes placeholder (PNG, .icns, .ico)
6. Build et packaging réussi (.app + .dmg)

**Résultat :** Application fonctionnelle avec toutes les features de la spec.

---

## 4. Menu File natif

**Demande :** Ajouter les entrées Open/Save/SaveAs dans le menu File.

**Résultat :** Menu natif Rust avec File (New, Open, Save, Save As, Close Window) et Edit (Undo, Redo, Cut, Copy, Paste, Select All). Les événements menu sont transmis au frontend via `app.emit()` + `listen()`.

---

## 5. Scroll synchronisé — itérations

**Problème initial :** Le sync basé sur le ratio scrollTop ne correspondait pas ligne à ligne.

**Itération 1 :** Boucle de feedback — le target déclenchait un scroll retour. Fix : lock timeout de 50ms.

**Itération 2 :** Ajout de `min-height: 0` sur `.preview-wrapper` pour que le overflow-y fonctionne dans le flex container.

**Itération 3 :** Tentative de sync basé sur `data-source-line` injecté via le parser marked.js. Problèmes de calcul d'offsetTop.

**Itération 4 :** Utilisation de `getBoundingClientRect` au lieu de `offsetTop`. Problèmes de padding.

**Itération 5 :** Sync basé uniquement sur les headers. Problème : les `#` dans les blocs de code étaient comptés comme headers.

**Itération 6 :** Utilisation de `marked.lexer()` pour identifier les vrais headings — mapping garanti 1:1 avec le DOM.

**Itération 7 :** Extension à tous les blocs markdown (paragraphs, code, lists, etc.). Problème : les listes imbriquées cassaient le mapping.

**Solution finale :** 
- Basé sur la position du curseur (pas le scroll)
- Utilise `marked.lexer()` pour identifier les tokens de bloc
- Sélecteur CSS `.preview-content > *` pour ne matcher que les enfants directs
- Mapping 1:1 fiable entre tokens source et éléments DOM

---

## 6. Undo/Redo

**Problème :** Le binding réactif `:value` de Vue écrasait la pile undo native du textarea.

**Solution :** 
- Suppression du `:value` binding
- Synchronisation manuelle textarea → store sur `input`
- Utilisation de `document.execCommand('insertText')` pour les modifications programmatiques (Tab, boutons toolbar), ce qui préserve la pile undo native
- Le store ne re-set le textarea que pour les changements externes (Open, New)

---

## 7. Toolbar — mode toggle pour Bold/Italic

**Demande :** Les boutons Bold et Italic doivent fonctionner en on/off.

**Solution :** Fonction `toggleInlineFormat(marker)` qui :
1. Vérifie si la sélection est déjà entourée par les marqueurs → les retire
2. Vérifie si la sélection contient les marqueurs → les retire
3. Sinon → ajoute les marqueurs

---

## 8. Toolbar — nouveaux éléments

**Demande :** Ajouter tous les éléments markdown possibles à la toolbar.

**Ajouts :**
- Strikethrough (`~~`) — toggle
- Blockquote (`> `) — toggle préfixe de ligne
- Ordered list (`1. `) — toggle préfixe
- Task list (`- [ ] `) — toggle préfixe
- Image (`![](url)`) — insertion
- Code block (triple backticks) — insertion de bloc
- Horizontal rule (`---`) — insertion de bloc

**Fonctions ajoutées :** `insertLinePrefix(prefix)` avec toggle, `insertBlock(block)` pour les blocs multi-lignes.

---

## 9. Icône personnalisée

**Demande :** Intégration d'une icône custom.

**Format requis :** PNG carré 1024x1024 minimum.

**Processus :** L'utilisateur a fourni un PNG 1024x1024. Génération automatique de toutes les déclinaisons (32x32, 128x128, 128x128@2x, .icns, .ico) via `sips` et `iconutil`.

---

## 10. Drag & Drop

**Demande :** Le glisser-déposer depuis le Finder ne fonctionnait pas.

**Solution :**
- Activation de `dragDropEnabled: true` dans tauri.conf.json
- Écoute de l'événement `tauri://drag-drop` côté frontend
- Filtre sur extensions `.md`, `.markdown`, `.txt`
- Ajout de permissions fs avec scope `"**"` pour lire n'importe quel chemin
- Confirmation si modifications non sauvegardées

---

## 11. Push sur GitHub

**Demande :** Pousser le code sur GitHub.

**Résultat :** Repo créé : https://github.com/mpoignant/markdown-editor

---

## 12. README

**Demande :** Ajouter un README décrivant l'application.

**Résultat :** README complet avec features, setup, tech stack, structure du projet.

---

## 13. Licence

**Discussion :** La licence MIT avait été mise par défaut sans demander.

**Résultat :** Changée en GPL v3 selon la préférence de l'utilisateur.

---

## 14. Associations de fichiers — "Ouvrir avec"

**Demande :** Pouvoir ouvrir automatiquement les fichiers `.md` avec l'application depuis le Finder.

**Configuration :** Ajout de `fileAssociations` dans `tauri.conf.json` pour `.md`, `.markdown`, `.txt` avec les bons MIME types.

**Problème :** L'application se lance correctement en double-cliquant sur un `.md` dans le Finder, mais le fichier ne se charge pas dans l'éditeur.

**Investigation :**
- `std::env::args()` ne reçoit pas le chemin du fichier sur macOS (Apple Events ≠ CLI args)
- Utilisation de `RunEvent::Opened { urls }` pour intercepter l'événement macOS
- Double mécanisme : stockage dans un `Mutex<Option<String>>` + émission d'un événement `open-file`
- Le frontend appelle `invoke('get_open_file_path')` au montage pour récupérer le chemin

**Problème persistant :** Le backend recevait et transmettait bien le chemin, mais le fichier ne se chargeait toujours pas.

**Cause racine :** `readTextFile` du plugin `@tauri-apps/plugin-fs` utilise un système de scope qui n'autorise pas automatiquement les fichiers ouverts via Apple Events (contrairement aux fichiers ouverts via le dialog natif ou le drag-drop qui bénéficient de permissions transitoires).

**Solution finale :** Création d'une commande Rust `read_file_content` qui utilise `std::fs::read_to_string` directement, contournant le scope du plugin fs :

```rust
#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}
```

Le frontend utilise `invoke('read_file_content', { path })` au lieu de `readTextFile(path)` pour l'ouverture de fichiers via association ou drag-drop.

---

## 15. Contrôle de fermeture — sauvegarde non enregistrée

**Demande :** Empêcher la perte de données en cas de fermeture accidentelle.

**Solution :**
- Interception de `onCloseRequested` sur la fenêtre Tauri
- Appel systématique de `event.preventDefault()` (nécessaire car le handler async empêche sinon la fermeture normale)
- Boîte de dialogue native via `message()` du plugin dialog avec boutons personnalisés : "Enregistrer", "Ne pas enregistrer", "Annuler"
- Fermeture explicite via `win.destroy()` dans tous les cas sauf "Annuler"
- Si "Enregistrer" et que le fichier n'existe pas encore → dialogue "Enregistrer sous" puis fermeture

**Difficulté :** La valeur de retour de `message()` avec boutons personnalisés est le texte du label (ex: `"Enregistrer"`) et non les clés génériques (`"Yes"`, `"Cancel"`).

**Permission ajoutée :** `core:window:allow-destroy` dans les capabilities.

---

## 16. Remplacement du textarea par CodeMirror 6

**Problème :** Le Cmd+Z annulait tout le contenu d'un coup au lieu de revenir mot par mot. Le binding réactif et les modifications programmatiques détruisaient la pile undo native du textarea.

**Solution choisie :** Remplacement complet du textarea par CodeMirror 6.

**Packages installés :** `codemirror`, `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`, `@codemirror/lang-markdown`, `@codemirror/language-data`, `@codemirror/theme-one-dark`

**Implémentation :**
- `EditorPane.vue` réécrit avec `EditorView` + `EditorState`
- Extension `history()` de `@codemirror/commands` pour undo/redo granulaire
- Thème personnalisé utilisant les CSS custom properties existantes
- Synchro bidirectionnelle avec le store Pinia (flag `ignoreUpdate` pour éviter les boucles)
- Fonctions exposées (`insertText`, `toggleInlineFormat`, `insertLinePrefix`, `insertBlock`) réécrites avec l'API CodeMirror (`view.dispatch`)
- Line wrapping activé, gutters masqués

**Problème annexe :** Le dossier `src-tauri/target/doc/` (312 Mo de docs Rust générées) saturait le file watcher de Vite, empêchant le dev server de répondre. Fix : exclusion de `**/src-tauri/**` dans `vite.config.js` + suppression des docs.

---

## 17. Raccourcis clavier de formatage

**Demande :** Ajouter des raccourcis clavier pour la mise en forme Markdown.

**Raccourcis implémentés :**
- Cmd+B — Gras
- Cmd+I — Italique
- Cmd+Shift+X — Barré
- Cmd+E — Code inline
- Cmd+K — Lien
- Cmd+Shift+K — Image
- Cmd+Shift+. — Blockquote
- Cmd+Shift+7 — Liste ordonnée
- Cmd+Shift+8 — Liste à puces
- Cmd+Shift+9 — Liste de tâches
- Cmd+Shift+H — Header ##
- Cmd+1 à 6 — H1 à H6

**Problème :** Cmd+3 et Cmd+4 ne fonctionnaient pas — macOS/WebKit interceptait ces raccourcis avant que le keydown n'arrive au JavaScript (même avec `capture: true` sur le listener).

**Solution :** Enregistrement de tous les raccourcis de formatage dans un menu natif Rust "Format" avec des accélérateurs (`CmdOrCtrl+1` etc.). Les événements menu sont transmis au frontend via `app.emit("menu-event", id)` et traités dans le listener existant. Les headings Cmd+1-6 passent par le menu natif, les autres raccourcis sont gérés à la fois par le keymap CodeMirror et le menu natif.

---

## Résumé technique final

| Composant | Technologie |
|-----------|------------|
| Backend | Tauri 2 (Rust) |
| Frontend | Vite + Vue.js 3 (Composition API) |
| State | Pinia |
| Styling | Vanilla CSS (custom properties) |
| Markdown | marked.js (preview), CodeMirror 6 (éditeur) |
| Syntax highlighting | Prism.js (preview), CodeMirror lang-markdown (éditeur) |
| Plugins Tauri | fs, dialog, shell |
| Packaging | .app/.dmg (macOS), .msi (Windows), .AppImage/.deb (Linux) |

**Repo :** https://github.com/mpoignant/markdown-editor
