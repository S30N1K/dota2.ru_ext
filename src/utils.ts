import {createApp, DefineComponent} from "vue";
import smilesPanel from "./vue/smilesPanel.vue";
import {ICurrentUser} from "./types";

// Подключение Vue-компонента
export function loadVue(
    selector: string | HTMLElement,
    component: DefineComponent<{}, {}, any>,
    props?: Record<string, any>
): void {
    const container = typeof selector === "string" ? document.querySelector<HTMLElement>(selector) : selector;
    if (container) {
        container.innerHTML = "";
        const app = createApp(component, props);
        app.mount(container);
    }
}

// Удаление HTML-тегов и скриптов
export function stripAllHtmlContent(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;

    const tagsToRemove = ["script", "style", "template", "noscript"];
    tagsToRemove.forEach(tag =>
        div.querySelectorAll(tag).forEach(el => el.remove())
    );

    return (div.textContent || "").trim().slice(-300);
}

// Отправка кастомного postMessage
export function parasite(type: string, payload: any): void {
    window.postMessage({source: "parasite", type, payload}, "*");
}

// Инициализация панели смайлов
export function initSmilesPanel(selector: HTMLElement): void {
    const smilesContainer = document.createElement("div");
    selector.parentNode?.appendChild(smilesContainer);
    loadVue(smilesContainer, smilesPanel);
}

// Получение уникального CSS-селектора
export function getUniqueSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.classList.length > 0) {
        return `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`;
    }
    return el.tagName.toLowerCase();
}

// Подключение CSS по ссылке
export function loadCss(url: string): void {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;
    document.head.appendChild(link);
}

// Текущая версия расширения
export function getCurrentVersion(): string {
    return chrome.runtime.getManifest().version;
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