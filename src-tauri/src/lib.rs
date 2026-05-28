use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager, RunEvent};
use std::sync::Mutex;

struct OpenFilePath(Mutex<Option<String>>);

#[tauri::command]
fn get_open_file_path(state: tauri::State<OpenFilePath>) -> Option<String> {
    state.0.lock().unwrap().take()
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut initial_file: Option<String> = None;

    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 {
        let file_path = &args[1];
        if file_path.ends_with(".md")
            || file_path.ends_with(".markdown")
            || file_path.ends_with(".txt")
        {
            initial_file = Some(file_path.clone());
        }
    }

    let app = tauri::Builder::default()
        .manage(OpenFilePath(Mutex::new(initial_file)))
        .invoke_handler(tauri::generate_handler![get_open_file_path, read_file_content])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let file_menu = SubmenuBuilder::new(app, "File")
                .text("new", "New")
                .text("open", "Open…")
                .separator()
                .text("save", "Save")
                .text("save-as", "Save As…")
                .separator()
                .close_window()
                .build()?;

            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;

            let format_menu = SubmenuBuilder::new(app, "Format")
                .item(&MenuItemBuilder::with_id("heading-1", "Heading 1").accelerator("CmdOrCtrl+1").build(app)?)
                .item(&MenuItemBuilder::with_id("heading-2", "Heading 2").accelerator("CmdOrCtrl+2").build(app)?)
                .item(&MenuItemBuilder::with_id("heading-3", "Heading 3").accelerator("CmdOrCtrl+3").build(app)?)
                .item(&MenuItemBuilder::with_id("heading-4", "Heading 4").accelerator("CmdOrCtrl+4").build(app)?)
                .item(&MenuItemBuilder::with_id("heading-5", "Heading 5").accelerator("CmdOrCtrl+5").build(app)?)
                .item(&MenuItemBuilder::with_id("heading-6", "Heading 6").accelerator("CmdOrCtrl+6").build(app)?)
                .separator()
                .item(&MenuItemBuilder::with_id("bold", "Bold").accelerator("CmdOrCtrl+B").build(app)?)
                .item(&MenuItemBuilder::with_id("italic", "Italic").accelerator("CmdOrCtrl+I").build(app)?)
                .item(&MenuItemBuilder::with_id("strikethrough", "Strikethrough").accelerator("CmdOrCtrl+Shift+X").build(app)?)
                .item(&MenuItemBuilder::with_id("code", "Code").accelerator("CmdOrCtrl+E").build(app)?)
                .separator()
                .item(&MenuItemBuilder::with_id("link", "Link").accelerator("CmdOrCtrl+K").build(app)?)
                .item(&MenuItemBuilder::with_id("image", "Image").accelerator("CmdOrCtrl+Shift+K").build(app)?)
                .separator()
                .item(&MenuItemBuilder::with_id("blockquote", "Blockquote").accelerator("CmdOrCtrl+Shift+.").build(app)?)
                .item(&MenuItemBuilder::with_id("ordered-list", "Ordered List").accelerator("CmdOrCtrl+Shift+7").build(app)?)
                .item(&MenuItemBuilder::with_id("list", "Bullet List").accelerator("CmdOrCtrl+Shift+8").build(app)?)
                .item(&MenuItemBuilder::with_id("task-list", "Task List").accelerator("CmdOrCtrl+Shift+9").build(app)?)
                .build()?;

            let app_menu = SubmenuBuilder::new(app, "Markdown Editor")
                .item(&MenuItemBuilder::with_id("about", "About Markdown Editor").build(app)?)
                .separator()
                .services()
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&app_menu)
                .item(&file_menu)
                .item(&edit_menu)
                .item(&format_menu)
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle, event| {
                let id = event.id().0.as_str();
                match id {
                    "about"
                    | "new" | "open" | "save" | "save-as"
                    | "bold" | "italic" | "strikethrough" | "code"
                    | "link" | "image" | "blockquote"
                    | "ordered-list" | "list" | "task-list"
                    | "heading-1" | "heading-2" | "heading-3"
                    | "heading-4" | "heading-5" | "heading-6" => {
                        let _ = app_handle.emit("menu-event", id);
                    }
                    _ => {}
                }
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let RunEvent::Opened { urls } = &event {
            for url in urls {
                let file_path = if url.scheme() == "file" {
                    url.to_file_path().ok().map(|p| p.to_string_lossy().to_string())
                } else {
                    Some(url.to_string())
                };

                if let Some(fp) = file_path {
                    if fp.ends_with(".md") || fp.ends_with(".markdown") || fp.ends_with(".txt") {
                        let state = app_handle.state::<OpenFilePath>();
                        *state.0.lock().unwrap() = Some(fp.clone());
                        let _ = app_handle.emit("open-file", &fp);
                    }
                }
            }
        }
    });
}
