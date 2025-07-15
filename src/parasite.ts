import {getUniqueSelector} from "./utils";
import "./types";

window.addEventListener('message', (event) => {
    const {data} = event;
    const {source, type, payload} = data
    if (event.source !== window) return;
    if (source !== 'parasite') return;

    switch (type) {
        case 'NOTIFY':
            window.Utils.notify(payload);
            break;
        case "SMILE": {
            const {title, url} = payload;
            window.tinymce.activeEditor.plugins.smileys.insert(title, url)
            break;
        }
        case "ExtensionSettings": {

            break
        }
        case "newSmilesPanel": {

            window.tinymce?.PluginManager.add("smileys", function (editor: any) {
                return {
                    insert(shortcut: string, imgUrl: string) {
                        editor.insertContent(`<img data-smile="1" data-shortcut="${shortcut}" src="${imgUrl}" title="${shortcut}" height="28"/>`);
                    },
                    getMetadata() {
                        return {
                            name: 'Smileys'
                        }
                    }
                }
            });

            function handleEditor(editor: any) {
                editor.on('init', () => {
                    const container = editor.getContainer();
                    const selector = getUniqueSelector(container);
                    window.postMessage({
                        type: "TinyMCE.init",
                        message: {selector},
                    }, "*");
                });
            }

            function setupTinyMCEHook() {
                if (!window.tinymce) return false;
                if (Array.isArray(window.tinymce.editors)) {
                    window.tinymce.editors.forEach((editor: any) => {
                        if (editor.initialized) {
                            handleEditor(editor);
                        } else {
                            editor.on('init', () => handleEditor(editor));
                        }
                    });
                }
                window.tinymce.on?.('AddEditor', function (e: any) {
                    handleEditor(e.editor);
                });
                return true;
            }

            setupTinyMCEHook();

            // (function waitForTinyMCE() {
            //     if (!setupTinyMCEHook()) {
            //         setTimeout(waitForTinyMCE, 1000);
            //     }
            // })();

            break;
        }
    }
});

export {};
