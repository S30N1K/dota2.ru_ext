import {createApp, DefineComponent} from "vue";
import {DomNode, ExtensionConfig, ICurrentUser, IinitTinyMcePlugins, ISmile} from "./types";
import browser from "webextension-polyfill";
import newSmilesPanel from "./vue/newSmilesPanel.vue";
import {loadCss} from "./extension/utils";

export function getExtUrl(path: string): string {
    return browser.runtime.getURL(path)
}

// Подключение Vue-компонента
export function loadVue<P = {}>(
    selector: string | HTMLElement,
    component: DefineComponent<P, {}, any>,
    props?: P
): void {
    const container = typeof selector === "string" ? document.querySelector<HTMLElement>(selector) : selector;
    if (container) {
        container.innerHTML = "";
        const app = createApp(component, props as Record<string, any>);
        app.mount(container);
    }
}

// Текущая версия расширения
export function getCurrentVersion(): string {
    return browser.runtime.getManifest().version;
}

// Возвращает id и ник текущего пользователя
export function getCurrentUser(): ICurrentUser {
    const headerUser = document.querySelector(".header__subitem-head");
    const id = parseInt(headerUser?.querySelector("a")?.getAttribute("href")?.match(/\.([0-9]+)\//)?.[1] || "0");
    const nickname = headerUser?.querySelector(".header__subitem-text--name")?.textContent?.trim() || "";
    return {
        id,
        nickname
    };
}

// Простая проверка на авторизацию
export function isAuth(): boolean {
    const user = getCurrentUser();
    return user.id > 0 && user.nickname !== "";
}

// Имитация задержки
export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Удаление HTML-тегов и скриптов
export function stripAllHtmlContent(
    html: string,
    options: {
        maxLength?: number;
        preserveLineBreaks?: boolean;
        removeComments?: boolean;
        decodeEntities?: boolean;
    } = {}
): string {
    const {
        maxLength = 300,
        preserveLineBreaks = true,
        removeComments = true,
        decodeEntities = true
    } = options;

    try {
        // Создаем временный элемент для парсинга HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Удаляем нежелательные теги
        const tagsToRemove = [
            "script", "style", "template", "noscript", "iframe",
            "object", "embed", "applet", "form", "input", "button",
            "select", "textarea", "label", "fieldset", "legend"
        ];

        tagsToRemove.forEach(tag => {
            const elements = tempDiv.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });

        // Удаляем комментарии если требуется
        if (removeComments) {
            const walker = document.createTreeWalker(
                tempDiv,
                NodeFilter.SHOW_COMMENT,
                null
            );
            const commentsToRemove: Comment[] = [];
            let node;
            while (node = walker.nextNode()) {
                commentsToRemove.push(node as Comment);
            }
            commentsToRemove.forEach(comment => comment.remove());
        }

        // Получаем текстовое содержимое
        let text = tempDiv.textContent || tempDiv.innerText || "";

        // Декодируем HTML-сущности если требуется
        if (decodeEntities) {
            text = decodeHtmlEntities(text);
        }

        // Обрабатываем переносы строк
        if (preserveLineBreaks) {
            // Заменяем <br> и <p> на переносы строк
            text = text.replace(/\s*\n\s*/g, '\n');
        } else {
            // Убираем лишние пробелы и переносы
            text = text.replace(/\s+/g, ' ');
        }

        // Очищаем от лишних пробелов
        text = text.trim();

        // Ограничиваем длину
        if (maxLength > 0 && text.length > maxLength) {
            text = text.slice(0, maxLength);
            // Добавляем многоточие если обрезали
            if (text.length === maxLength) {
                text = text + '...';
            }
        }

        return text;
    } catch (error) {
        console.warn('Error in stripAllHtmlContent:', error);
        // Fallback: простая очистка через regex
        return html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, maxLength);
    }
}

// Вспомогательная функция для декодирования HTML-сущностей
function decodeHtmlEntities(text: string): string {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

// Принудительное обновление времени на сайте
export function forceUpdateTime(): void {
    // Ищем все элементы времени на странице
    const timeElements = document.querySelectorAll('time[data-time]');

    timeElements.forEach((timeElement) => {
        const timestamp = timeElement.getAttribute('data-time');
        if (timestamp) {
            const date = new Date(parseInt(timestamp) * 1000);
            const now = new Date();
            const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

            let timeString = '';

            if (diff < 60) {
                timeString = 'только что';
            } else if (diff < 3600) {
                const minutes = Math.floor(diff / 60);
                timeString = `${minutes} мин. назад`;
            } else if (diff < 86400) {
                const hours = Math.floor(diff / 3600);
                timeString = `${hours} ч. назад`;
            } else if (diff < 2592000) {
                const days = Math.floor(diff / 86400);
                timeString = `${days} дн. назад`;
            } else if (diff < 31536000) {
                const months = Math.floor(diff / 2592000);
                timeString = `${months} мес. назад`;
            } else {
                const years = Math.floor(diff / 31536000);
                timeString = `${years} лет назад`;
            }

            timeElement.textContent = timeString;
        }
    });
}


export function createDomTree(node: DomNode): HTMLElement {
    const element = document.createElement(node.tag);

    if (node.attrs) {
        for (const [key, value] of Object.entries(node.attrs)) {
            element.setAttribute(key, value);
        }
    }

    if (node.innerHTML !== undefined) {
        element.innerHTML = node.innerHTML;
    } else if (node.children) {
        for (const child of node.children) {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(createDomTree(child));
            }
        }
    }

    return element;
}

// Отправка кастомного postMessage
export function parasite(type: string, payload: any): void {
    window.postMessage({source: "parasite", type, payload}, "*");
}


export function initTinyMcePlugins(config: ExtensionConfig): void {
    parasite("initTinyMcePlugins", {
        pasteImage: config.pasteImage,
        newSmilesPanel: config.newSmilePanel
    } as IinitTinyMcePlugins);

    if (config.newSmilePanel) {
        loadCss(getExtUrl("style/newSmilesPanel.css"))
    }
}

export function getSmileUrl(smile: ISmile) {
    return `/img/forum/emoticons/${smile.filename}`
}

export function initTinyMceNewSmilesPanel(selector: HTMLElement) {

    let isOpen = false;

    selector.querySelector<HTMLButtonElement>('button[aria-label="Смайлы"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        isOpen = !isOpen;


        let smilesPanel = selector?.parentElement?.querySelector('#smilesPanel');

        if (!smilesPanel) {
            smilesPanel = document.createElement('div');
            smilesPanel.setAttribute('id', 'smilesPanel');
            selector?.parentElement?.appendChild(smilesPanel);
            loadVue(smilesPanel as HTMLElement, newSmilesPanel, {onSmile(smile: ISmile) {
                    parasite("insertSmile", {title: smile.title, url: getSmileUrl(smile)});
            },})
        }

        if (isOpen) {
            smilesPanel.classList.add("opened");
        } else {
            smilesPanel.classList.remove("opened");
        }
    })


}