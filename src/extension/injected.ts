import {IinitTinyMcePlugins} from "../types";

declare const tinymce: any
declare const moment: any

// Функция для получения всех редакторов TinyMCE (существующих и будущих)
function getTinyMCEEditor(callback: (editor: any) => void): void {
    // Массив для хранения всех найденных редакторов
    const editors: any[] = [];

    // Функция для обработки найденного редактора
    const processEditor = (editor: any) => {
        if (editor && !editors.includes(editor)) {
            editors.push(editor);

            if (editor.initialized) {
                // уже готов
                callback(editor);
            } else {
                // дождаться готовности
                editor.on('init', () => {
                    callback(editor);
                });
            }
        }
    };

    // Проверяем существующие редакторы
    if (typeof (window as any).tinymce !== 'undefined' && (window as any).tinymce.editors) {
        (window as any).tinymce.editors.forEach(processEditor);
    }

    // Создаем MutationObserver для отслеживания новых редакторов
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Проверяем добавленные узлы
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;

                    // Ищем iframe с редактором TinyMCE
                    const iframes = element.querySelectorAll('iframe');
                    iframes.forEach((iframe) => {
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                            if (iframeDoc && iframeDoc.body) {
                                // Проверяем, есть ли в iframe редактор TinyMCE
                                const editorElement = iframeDoc.body.querySelector('[data-mce-object]');
                                if (editorElement) {
                                    // Получаем редактор по ID
                                    const editorId = editorElement.getAttribute('data-mce-object');
                                    if (editorId && typeof (window as any).tinymce !== 'undefined') {
                                        const editor = (window as any).tinymce.get(editorId);
                                        if (editor) {
                                            processEditor(editor);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            // Игнорируем ошибки доступа к iframe
                        }
                    });
                }
            });
        });
    });

    // Начинаем наблюдение за изменениями в DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Также отслеживаем события TinyMCE для новых редакторов
    if (typeof (window as any).tinymce !== 'undefined') {
        // Слушаем событие создания нового редактора
        (window as any).tinymce.on('AddEditor', (e: any) => {
            if (e.editor) {
                processEditor(e.editor);
            }
        });

        // Слушаем событие инициализации редактора
        (window as any).tinymce.on('init', (e: any) => {
            if (e.target) {
                processEditor(e.target);
            }
        });
    }
}


// Получение уникального CSS-селектора
function getUniqueSelector(el: HTMLElement): string {
    if (el.tagName.toLowerCase() === 'html') return 'html';

    // Если есть уникальный id — используем его
    if (el.id) return `#${CSS.escape(el.id)}`;

    // Формируем базовый селектор для элемента
    let selector = el.tagName.toLowerCase();

    if (el.classList.length) {
        selector += '.' + [...el.classList].map(c => CSS.escape(c)).join('.');
    } else {
        // Если нет классов, но есть name или data-* — используем
        const nameAttr = el.getAttribute('name');
        if (nameAttr) selector += `[name="${CSS.escape(nameAttr)}"]`;
        else {
            const datasetAttrs = Object.entries(el.dataset);
            if (datasetAttrs.length) {
                const [key, value] = datasetAttrs[0];
                selector += `[data-${CSS.escape(key)}="${CSS.escape(value ?? '')}"]`;
            }
        }
    }

    // Проверяем, уникален ли текущий селектор в документе
    if (document.querySelectorAll(selector).length === 1) {
        return selector;
    }

    // Если не уникален — добавляем nth-child и родителей
    const parent = el.parentElement;
    if (parent) {
        const index = [...parent.children].indexOf(el) + 1;
        selector += `:nth-child(${index})`;
        return `${getUniqueSelector(parent)} > ${selector}`;
    }

    return selector;
}

// Выгрузка изображения в imgbb
async function uploadToImgbb(base64Image: string): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", base64Image.split(",")[1]);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=05b36feae2ca1f1f63701c921f55e6f0`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            return result.data.url;
        } else {
            console.error("Imgbb upload failed", result);
            return null;
        }
    } catch (error) {
        console.error("Upload to imgbb failed:", error);
        return null;
    }
}

function sendMessage(type: string, payload: any): void {
    window.postMessage({source: "parasite", type, payload}, "*");
}

window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    console.log("Received event: ", event.data);

    const {source, type, payload} = event.data;
    if (source !== "parasite") return;


    switch (type) {
        case "NOTIFY": {
            // window.Utils.notify(payload);
            break;
        }

        case "updateMoment": {
            const elements = document.querySelectorAll('.time');
            elements.forEach(el => {
                el.textContent = moment().format('HH:mm:ss');
            });
        }

        case "insertSmile": {
            const { title, url } = payload;
            tinymce.activeEditor.plugins.smileys.insert(title, url);

            break;
        }

        case "initTinyMcePlugins": {

            const {pasteImage, newSmilesPanel} = payload as IinitTinyMcePlugins
            const isEnabledTinyMce = pasteImage || newSmilesPanel;

            if (!isEnabledTinyMce) {
                return
            }

            getTinyMCEEditor((editor) => {
                if (pasteImage) {
                    editor.on("paste", (event: ClipboardEvent) => {
                        const items = event.clipboardData?.items;
                        if (!items) return;

                        for (const item of items) {
                            if (item.type.includes("image")) {
                                const file = item.getAsFile();
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = async (e) => {
                                        const base64 = e.target?.result as string;
                                        const url = await uploadToImgbb(base64);
                                        if (url) {
                                            editor.insertContent(`<img src="${url}" alt="Image"/>`);
                                        } else {
                                            console.warn("Не удалось загрузить изображение на imgbb");
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                    event.preventDefault();
                                    break;
                                }
                            }
                        }
                    });
                }

                if (newSmilesPanel) {
                    sendMessage("tinyMCE", getUniqueSelector(editor.container))
                }
            })


            break;
        }
    }
});

