import {createApp, DefineComponent} from "vue";
import smilesPanel from "./vue/smilesPanel.vue"
import {IForumSections, Thread, ISmile, ISmileCategory, INotificationItem} from "./types";

export function safeAlert(msg: string) {
    console.log(msg);
}

export async function parse(url: string, data?: any) {
    const res = await fetch(url, {
        "headers": {
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest"
        },
        "body": data ? JSON.stringify(data) : null,
        "method": data ? "POST" : "GET"
    })

    if (data){
        return res.json()
    }

    return res.text()
}

export function loadVue(
    selector: string | HTMLElement,
    component: DefineComponent<{}, {}, any>,
    props?: Record<string, any>
) {
    const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (container) {
        container.innerHTML = '';
        const app = createApp(component, props);
        app.mount(container);
    }
}

export async function pareForumSections(): Promise<IForumSections[]> {
    const html = await parse("https://dota2.ru/forum/")
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return [...doc.querySelectorAll(".forum-page__list .forum-page__item-title-block a")].map(e => {
        const href = e.getAttribute("href") || "";
        const match = href.match(/forums\/(.*)\.(\d+)\//);
        const id = match ? parseInt(match[2]) : null;
        const name = e.textContent?.trim() || null;
        return id && name ? {id, name} : null;
    }).filter(item => item !== null);
}

export async function parseFeed(offset: number = 0): Promise<Thread[]> {
    return (await parse("https://dota2.ru/forum/api/feed/get", {
        offset,
        order: "new"
    })).items;
}

export function stripAllHtmlContent(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const tagsToRemove = ['script', 'style', 'template', 'noscript'];
    tagsToRemove.forEach(tag => {
        div.querySelectorAll(tag).forEach(el => el.remove());
    });
    const text = div.textContent || '';
    return text.trim().slice(-300);
}

export function parasite(type: string, payload: any) {
    window.postMessage({
        source: 'parasite',
        type,
        payload
    }, '*');
}

export function initSmilesPanel(selector: HTMLElement) {
    const smilesContainer = document.createElement('div');
    selector.parentNode?.appendChild(smilesContainer)
    loadVue(smilesContainer, smilesPanel)
}

export function getUniqueSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
        const classSelector = '.' + Array.from(el.classList).join('.');
        return el.tagName.toLowerCase() + classSelector;
    }
    return el.tagName.toLowerCase();
}

export function loadCss(url: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url
    document.head.appendChild(link);
}

export const getSmiles = (() => {
    let cachedSmiles: { categories: any[]; smiles: any[] } | null = null;

    return async function (): Promise<any> {
        if (cachedSmiles) {
            return cachedSmiles;
        }

        const res = (await parse("/replies/get_smiles", {})).smiles;

        cachedSmiles = {
            categories: res.categories ?? [],
            smiles: Object.values(res.smiles).flat()
        };

        return cachedSmiles;
    };
})();


export async function getNotifications(page: number = 1): Promise<INotificationItem[]> {
    return (await parse("/forum/api/notices/preload", {
        "name": "Все уведомления",
        "page": page
    })).notices;
}