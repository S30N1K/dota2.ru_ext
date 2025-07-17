export function registerSmileyPlugin() {
    window.tinymce?.PluginManager.add("smileys", function(editor: any) {
        editor.smileys = {
            insert(shortcut: string, imgUrl: string) {
                editor.insertContent(
                    `<img data-smile="1" data-shortcut="${shortcut}" src="${imgUrl}" title="${shortcut}" height="28"/>`
                );
            }
        };
        // Можно добавить команду, если нужно
        // editor.addCommand('insertSmile', ...);
    });
}
