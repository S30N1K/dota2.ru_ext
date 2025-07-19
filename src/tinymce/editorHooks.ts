import {ExtensionSettings} from "../types";
import {getUniqueSelector, initSmilesPanel} from "../utils";
import {registerSmileyPlugin} from "./plugins/smileyPlugin";
import {registerImagePastePlugin} from "./plugins/imagePastePlugin";

export function handleEditor(editor: any, settings: ExtensionSettings) {
    editor.on("init", () => {
        if (settings.newSmilePanel) {
            const container = editor.getContainer();
            const selector = getUniqueSelector(container);
            const el = document.querySelector(selector) as HTMLElement;
            if (el) initSmilesPanel(el);
        }
    });

    if (settings.pasteImage) {
        registerImagePastePlugin(editor, "05b36feae2ca1f1f63701c921f55e6f0");
    }
}

export function setupTinyMCEHook(settings: ExtensionSettings) {
    const { tinymce } = window;
    if (!tinymce || !Array.isArray(tinymce.editors)) return false;

    if (settings.newSmilePanel) {
        registerSmileyPlugin();
    }

    tinymce.editors.forEach((editor: any) => {
        if (editor.initialized) {
            handleEditor(editor, settings);
        } else {
            editor.on("init", () => handleEditor(editor, settings));
        }
    });

    tinymce.on?.("AddEditor", (e: any) => handleEditor(e.editor, settings));
    return true;
}
