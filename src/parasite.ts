import "./types";
import {ExtensionSettings} from "./types";
import {setupTinyMCEHook} from "./tinymce/editorHooks";

window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    const { source, type, payload } = event.data;
    if (source !== "parasite") return;

    switch (type) {
        case "NOTIFY":
            window.Utils.notify(payload);
            break;

        case "SMILE": {
            const { title, url } = payload;
            window.tinymce.activeEditor?.smileys?.insert(title, url);
            break;
        }

        case "ExtensionSettings": { 
            setupTinyMCEHook(payload as ExtensionSettings);
            break;
        }
    }
});

export {};
