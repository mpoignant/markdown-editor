use tauri::menu::{MenuBuilder, SubmenuBuilder};
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

            let menu = MenuBuilder::new(app)
                .item(&file_menu)
                .item(&edit_menu)
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle, event| {
                let id = event.id().0.as_str();
                match id {
                    "new" | "open" | "save" | "save-as" => {
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
