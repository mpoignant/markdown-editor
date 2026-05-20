# Markdown Editor

A cross-platform desktop Markdown editor built with **Tauri 2** and **Vue.js 3**. Distraction-free writing with a live side-by-side preview.

![Tauri](https://img.shields.io/badge/Tauri-2-blue) ![Vue](https://img.shields.io/badge/Vue.js-3-green) ![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

## Features

### Editor
- Live Markdown rendering with synchronized preview (cursor-based sync)
- Syntax highlighting for code blocks (JavaScript, TypeScript, Python, Rust, Java, CSS, Bash, JSON)
- Undo/Redo support (native browser stack, compatible with programmatic edits)
- Tab key inserts spaces

### Formatting Toolbar
All formatting buttons work as toggles — click once to apply, click again to remove:

| Button | Action |
|--------|--------|
| **B** | Bold |
| *I* | Italic |
| ~~S~~ | Strikethrough |
| H | Heading |
| • List | Bullet list |
| 1. List | Ordered list |
| ☐ Task | Task list |
| > Quote | Blockquote |
| Code | Inline code |
| </> | Code block |
| Link | Hyperlink |
| Img | Image |
| — | Horizontal rule |

### Layout Modes
- **Split View** — Editor and preview side by side (default)
- **Preview Only** — Full-width rendered output
- **Focus Mode** — Full-width editor, no distractions

### File Management
- **Open** files via dialog or drag & drop from Finder/Explorer
- **Save / Save As** with native system dialogs
- Window title shows current filename with unsaved changes indicator (*)
- Keyboard shortcuts: `Cmd/Ctrl+N`, `Cmd/Ctrl+O`, `Cmd/Ctrl+S`
- Native **File** menu (New, Open, Save, Save As)

### Design
- Light and Dark themes (syncs with OS preference, or manually toggled)
- Customizable editor font (JetBrains Mono, Fira Code, Source Code Pro)
- Glassmorphism toolbar with backdrop blur
- Status bar with word count, character count, and file info

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (stable)
- Xcode Command Line Tools (macOS) or equivalent C/C++ toolchain

### Development

```bash
cd markdown-editor
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

Produces platform-specific bundles:
- macOS: `.app` + `.dmg`
- Windows: `.msi`
- Linux: `.AppImage` + `.deb`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Tauri 2 (Rust) |
| Frontend | Vite + Vue.js 3 (Composition API) |
| State | Pinia |
| Styling | Vanilla CSS with custom properties |
| Markdown | marked.js |
| Syntax highlighting | Prism.js |
| File system | @tauri-apps/plugin-fs |
| Dialogs | @tauri-apps/plugin-dialog |

## Project Structure

```
markdown-editor/
├── src/                    # Vue.js frontend
│   ├── components/         # EditorPane, PreviewPane, Toolbar, StatusBar
│   ├── composables/        # useMarkdownParser, useSyncScroll, useFileOperations, useKeyboardShortcuts
│   ├── stores/             # Pinia stores (editor, settings)
│   └── assets/styles/      # CSS (variables, themes, layout, components)
├── src-tauri/              # Rust backend
│   ├── src/                # App entry, plugin registration, native menu
│   ├── capabilities/       # Permission configuration
│   └── icons/              # App icons (all sizes)
└── index.html              # Entry point
```

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
