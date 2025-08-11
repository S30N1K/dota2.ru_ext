import {ExtensionConfig, RouteDefinition, DomNode} from "../types";
import rawRoutes from "../routes.json";
import {createDomTree, forceUpdateTime, loadVue, parasite} from "../utils";
import settings from "../vue/settings.vue";
import {getDialogs, getNotifications, getSmiles} from "../api";

export const routes: RouteDefinition[] = rawRoutes;

// Инициализация кнопки настроек в шапке
export function initSettingsButton(): void {
    const settingsButton = document.createElement("li");
    settingsButton.classList.add("header__item");
    settingsButton.style.cursor = "pointer";
    loadVue(settingsButton, settings);

    const headerList = document.querySelector(".header__list");
    if (headerList) {
        headerList.prepend(settingsButton);
    }
}

// Подключение CSS по ссылке
export function loadCss(url: string): void {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;
    document.head.appendChild(link);
}

// Объявления для Webpack require.context
declare var require: {
    context: (
        directory: string,
        useSubdirectories?: boolean,
        regExp?: RegExp
    ) => {
        keys: () => string[];
        (id: string): any;
        <T>(id: string): T;
    };
};

// Загрузка всех модулей из папки /pages/*.ts
export function loadPageModules(): Record<string, any> {
    const requirePage = require.context("../pages", false, /\.ts$/);
    const moduleMap: Record<string, any> = {};

    requirePage.keys().forEach((key: string) => {
        const cleanKey = "pages/" + key.replace("./", "").replace(".ts", ".js");
        moduleMap[cleanKey] = requirePage(key);
    });

    return moduleMap;
}

// Загрузка и выполнение скриптов маршрутов
export async function processRoutes(
    path: string,
    cfg: ExtensionConfig,
    moduleMap: Record<string, any>,
    routes: RouteDefinition[]
): Promise<void> {
    const loadAndRun = async (file: string) => {
        const mod = moduleMap[file];
        if (mod?.default instanceof Function) {
            await mod.default(cfg);
        } else {
            console.warn(`Не удалось загрузить модуль: ${file}`);
        }
    };

    for (const route of routes) {
        const regexp = new RegExp(route.pattern);
        if (regexp.test(path)) {
            for (const script of route.scripts) {
                await loadAndRun(script);
            }
        }
    }
}

// Ожидание загрузки страницы
export function waitForDOMReady(): Promise<void> {
    return new Promise((resolve) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => resolve());
        } else {
            resolve();
        }
    });
}

// Загрузка скриптов
export function loadScript(url: string, cb?: () => void) {
    const script = document.createElement('script');
    script.src = url;
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => {
        script.remove();
        if (cb) cb()
    }
}

// Общая функция для создания и добавления wrapper с нужными классами
function createWrapper(parent: Element | null): HTMLUListElement | null {
    if (!parent) return null;

    const wrapper = document.createElement("ul");
    wrapper.classList.add("ext-last-items", "header__sublist", "header__sublist--active", "hiddenScroll");
    parent.appendChild(wrapper);

    return wrapper;
}

// Общая функция для создания элемента уведомления/диалога
function createItemElement(data: {
    user_id: string | number,
    avatar_link: string,
    description: string,
    date_created: string | number,
    extraChildren?: DomNode[],
}) {
    const children: DomNode[] = [
        {
            tag: "div",
            attrs: { class: "avatar" },
            children: [
                {
                    tag: "a",
                    attrs: { href: `/forum/members/.${data.user_id}/` },
                    children: [
                        {
                            tag: "img",
                            attrs: { src: data.avatar_link },
                        }
                    ],
                },
            ],
        },
        {
            tag: "div",
            attrs: { class: "content-wrapper" },
            children: [
                {
                    tag: "div",
                    attrs: { class: "content" },
                    innerHTML: data.description,
                },
                {
                    tag: "time",
                    attrs: { class: "time", "data-time": data.date_created.toString() },
                }
            ],
        },
        ...(data.extraChildren ?? [])
    ];

    return createDomTree({
        tag: "div",
        attrs: { class: "item" },
        children,
    });
}

// Общая функция для инициализации всплывающего списка
async function initLastItems(
    parentSelector: string,
    fetchData: () => Promise<any[]>,
    config?: ExtensionConfig
) {
    const el = document.querySelector(parentSelector)?.parentElement;
    const wrapper = createWrapper(el as HTMLElement);
    if (!wrapper || !el) return;

    let isInitialized = false;

    el.addEventListener("mouseenter", async () => {
        wrapper.style.opacity = "100";
        wrapper.style.visibility = "visible";

        if (isInitialized) return;

        const items = await fetchData();

        // Если нужны смайлы, загружаем их заранее (для уведомлений)
        let smilesMap: Map<string, string> | undefined;
        if (config?.showNotificationRatings) {
            const smilesList = await getSmiles();
            smilesMap = new Map(smilesList?.smiles.map((s: any) => [String(s.id), s.filename]));
        }

        for (const item of items) {
            const extraChildren = [];

            // Для уведомлений с типом forum_post_liked добавляем эмотикон
            if (
                config?.showNotificationRatings &&
                item.type === "forum_post_liked" &&
                smilesMap
            ) {
                const imgFilename = smilesMap.get(String(item.smile_id));
                if (imgFilename) {
                    extraChildren.push({
                        tag: "div",
                        attrs: { class: "emoticon" },
                        children: [
                            {
                                tag: "img",
                                attrs: { src: `/img/forum/emoticons/${imgFilename}` },
                            }
                        ]
                    });
                }
            }

            wrapper.appendChild(createItemElement({
                user_id: item.user_id,
                avatar_link: item.avatar_link,
                description: item.description,
                date_created: item.date_created,
                extraChildren
            }));

            forceUpdateTime()
        }

        isInitialized = true;
    });

    el.addEventListener("mouseleave", () => {
        wrapper.style.opacity = "0";
        wrapper.style.visibility = "collapse";
    });

}

// Использование:
export async function initLastDialogs(config: ExtensionConfig) {
    await initLastItems('.header__link[href="/forum/conversations/"]', getDialogs);
}

export async function initLastNotifications(config: ExtensionConfig) {
    await initLastItems('.header__link[href="/forum/notifications/"]', () => getNotifications(1), config);
}
