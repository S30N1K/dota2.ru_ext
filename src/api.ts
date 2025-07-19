import {
    IForumSections,
    Thread,
    ISmile,
    ISmileCategory,
    INotificationItem,
    UserRelation,
    IWallPost,
    IFollowings, ParsedPageResult, UserInfo
} from "./types";
import {getCurrentUser, isAuth} from "./utils";

// Парсинг JSON-ответов (POST или GET)
export async function parseJson<T>(url: string, data?: unknown): Promise<T> {
    console.log("parseJson", url, data);
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
export async function parseText(url: string, headers?: {}): Promise<string> {
    console.log("parseText", url, headers);
    const response = await fetch(url, {
        method: "GET",
        headers: headers || {
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
        return id && name ? {id, name} : null;
    }).filter(Boolean) as IForumSections[];
}

// Получение ленты сообщений
export async function parseFeed(offset = 0): Promise<Thread[]> {
    const response = await parseJson<{ items: Thread[] }>(
        "/forum/api/feed/get",
        {offset, order: "new"}
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
        {name: "Все уведомления", page}
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


// Отправить сообщение на стену
export async function makeWallPost(uid: number, content: string, replyTo: number | null): Promise<IWallPost> {
    return await parseJson<IWallPost>("/forum/api/user/makeWallPost", {
        uid, content, replyTo
    })
}

// Вспомогательная функция парсинга страницы подписок
async function parseFollowingsPage(userId: number, page: number): Promise<ParsedPageResult> {
    const html = await parseText(`/forum/members/.${userId}/followings/page-${page}/`);
    const doc = new DOMParser().parseFromString(html, "text/html");

    const links = doc.querySelectorAll('.pagination__link');
    const maxPage = Array.from(links).reduce((max, link) => {
        const page = parseInt(link.getAttribute('data-page') || '', 10);
        return !isNaN(page) && page > max ? page : max;
    }, 1);

    const users = Array.from(doc.querySelectorAll('.member-list li')).map(li => {
        const id = parseInt(li.id.replace('user-', ''), 10);
        const nicknameElement = li.querySelector('.settings-page__ignored-user-info > div');
        const nickname = nicknameElement?.textContent?.trim() || '';
        return {id, nickname};
    });

    return {users, maxPage};
}

// Возвращает список, на кого подписан пользователь
export async function getFollowingsList(userId: number): Promise<IFollowings[]> {
    const firstPage = await parseFollowingsPage(userId, 1);
    let allUsers = [...firstPage.users];

    for (let page = 2; page <= firstPage.maxPage; page++) {
        const {users} = await parseFollowingsPage(userId, page);
        allUsers = allUsers.concat(users);
    }

    return allUsers;
}

// Проверка подписки одного пользователя на другого
export async function isUserFollowed(userId: number, stoppedId: number): Promise<boolean> {
    try {
        const firstPage = await parseFollowingsPage(userId, 1);
        if (firstPage.users.some(u => u.id === stoppedId)) return true;

        for (let page = 2; page <= firstPage.maxPage; page++) {
            await sleep(2000)
            const {users} = await parseFollowingsPage(userId, page);
            if (users.some(u => u.id === stoppedId)) return true;
        }

        return false;
    } catch {
        return false;
    }
}

// Имитация задержки
async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Проверка пользователя (нейтрален/игнорирует/подписчик)
export async function getUserRelation(userId: number): Promise<UserRelation> {

    const currentUserId = getCurrentUser().id;

    if (!isAuth()) {
        return "error"
    }

    if (userId === currentUserId){
        return "me"
    }

    try {

        // Первая проверка, игнорирует ли нас пользователь
        const sendWall = await makeWallPost(userId, "###".repeat(257), null)
        if (sendWall.status === "ignoredByUser") {
            return "ignored"
        }

        // Вторая проверка, ищем нас у пользователя в подписках
        if (await isUserFollowed(userId, currentUserId)) {
            return "subscriber"
        }

        // Если проверки ничего не нашли, значит нейтрален
        return "neutral"

    } catch (e) {
        return "error"
    }
}

export async function getUserNickName(userId: number): Promise<string> {
    const html = await parseText(`/forum/members/.${userId}/`, {})
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc?.querySelector(".forum-profile__head--backwrapped")?.textContent?.trim() || ""
}

export async function getUserSignature(userId: number, nickname: string): Promise<string> {
    const html = await parseText(`/forum/members/${nickname}.${userId}/about/`);
    const doc = new DOMParser().parseFromString(html, "text/html");

    return doc?.querySelector("blockquote")?.innerHTML || ""
}

export async function getUserInfo(id: number): Promise<UserInfo> {
    const nickname = await getUserNickName(id)
    const signature = await getUserSignature(id, nickname)
    const type = nickname.length ? await getUserRelation(id) : "error"
    return {
        id,
        type,
        nickname,
        signature
    }
}