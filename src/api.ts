import { IForumSections, Thread, ISmile, ISmileCategory, INotificationItem } from "./types";

// Парсинг JSON-ответов (POST или GET)
export async function parseJson<T>(url: string, data?: unknown): Promise<T> {
    const response = await fetch(url, {
        method: data ? "POST" : "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: data ? JSON.stringify(data) : null
    });

    return response.json();
}

// Парсинг HTML-ответа (GET)
export async function parseText(url: string): Promise<string> {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    });

    return response.text();
}

// Парсинг списка разделов форума
export async function parseForumSections(): Promise<IForumSections[]> {
    const html = await parseText("/forum/");
    const doc = new DOMParser().parseFromString(html, "text/html");

    return Array.from(doc.querySelectorAll<HTMLAnchorElement>(
        ".forum-page__list .forum-page__item-title-block a"
    )).map((el) => {
        const href = el.getAttribute("href") || "";
        const match = href.match(/forums\/(.*)\.(\d+)\//);
        const id = match ? parseInt(match[2]) : null;
        const name = el.textContent?.trim() ?? null;
        return id && name ? { id, name } : null;
    }).filter(Boolean) as IForumSections[];
}

// Получение ленты сообщений
export async function parseFeed(offset = 0): Promise<Thread[]> {
    const response = await parseJson<{ items: Thread[] }>(
        "/forum/api/feed/get",
        { offset, order: "new" }
    );
    return response.items;
}

// Кешированный запрос смайлов
export const getSmiles = (() => {
    let cachedSmiles: { categories: ISmileCategory[]; smiles: ISmile[] } | null = null;

    return async (): Promise<typeof cachedSmiles> => {
        if (cachedSmiles) return cachedSmiles;

        const response = await parseJson<{
            smiles: {
                categories: ISmileCategory[];
                smiles: Record<string, ISmile[]>;
            };
        }>("/replies/get_smiles", {});

        cachedSmiles = {
            categories: response.smiles.categories ?? [],
            smiles: Object.values(response.smiles.smiles).flat()
        };

        return cachedSmiles;
    };
})();

// Получение уведомлений
export async function getNotifications(page = 1): Promise<INotificationItem[]> {
    const response = await parseJson<{ notices: INotificationItem[] }>(
        "/forum/api/notices/preload",
        { name: "Все уведомления", page }
    );
    return response.notices;
}

// Выгрузка изображения в imgbb
export async function uploadToImgbb(base64Image: string, token: string): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", base64Image.split(",")[1]);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${token}`, {
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