# Multi-Tab Editor — Design Spec

## Goal

Allow users to edit multiple Markdown files in parallel via a tab bar, without opening multiple windows.

## Decisions

- Tab bar between toolbar and editor (no sidebar)
- Opening an already-open file switches to its tab
- Closing the last tab creates a new empty "Untitled" tab
- No limit on tab count; horizontal scroll when tabs overflow
- Layout mode remains global (not per-tab)

## Store Refactor (`src/stores/editor.js`)

The store manages a reactive array of tabs and an active tab pointer:

```javascript
// State
tabs: [{ id, filePath, content, savedContent }]
activeTabId: string

// Computed (project from active tab)
activeTab → tabs.find(t => t.id === activeTabId)
content → activeTab.content
filePath → activeTab.filePath
savedContent → activeTab.savedContent
isDirty → content !== savedContent
fileName → derived from filePath
windowTitle → derived from fileName + isDirty

// Existing actions (now operate on active tab)
setContent(text)
markSaved()
setLayoutMode(mode)

// New actions
addTab() → push new tab, switch to it
closeTab(id) → remove tab, switch to neighbor, create empty if last
switchTab(id) → set activeTabId
openFile(path, text) → if path already open, switch; else create tab
newFile() → addTab()
```

## New Component: `TabBar.vue`

Position: between Toolbar and main-content in App.vue.

Each tab shows:
- File name (or "Untitled")
- Dirty indicator (dot)
- Close button (x)

Interactions:
- Click tab → switchTab(id)
- Click close → closeTab(id) with dirty confirmation
- Double-click empty area → addTab()
- Scroll horizontally with mouse wheel when tabs overflow

Style: consistent with toolbar (`--color-toolbar-bg`, backdrop-filter, ~34px height). Active tab distinguished with bottom border accent color.

## EditorPane Changes

Maintains a local `Map<tabId, EditorState>` to preserve CodeMirror state (content, cursor position, undo history) per tab.

On tab switch:
1. Save current EditorView state to the map
2. Restore (or create) state for the new active tab
3. Apply it to the EditorView

## useFileOperations Changes

- `openFile()`: checks if the file path is already open in any tab; if so, switches to that tab. Otherwise creates a new tab with the file content.
- `newFile()`: calls `addTab()` instead of resetting state.
- `saveFile()` / `saveFileAs()`: operate on active tab (unchanged conceptually).

## useKeyboardShortcuts Changes

New shortcuts:
- `Cmd+T` → addTab (new file)
- `Cmd+W` → closeTab (active tab)

## Window Close Behavior

When the user closes the window, iterate over all tabs. If any are dirty, prompt before closing (existing logic extended to check all tabs).

## Files Unchanged

- PreviewPane.vue
- Toolbar.vue
- StatusBar.vue
- useSyncScroll.js
- useMarkdownParser.js
- stores/settings.js
