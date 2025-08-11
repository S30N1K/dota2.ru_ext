import {getCurrentUser, isAuth, sleep} from "./utils";
import {
    DialogList,
    IFollowings,
    IForumSections,
    INotificationItem,
    ISmile,
    ISmileCategory, IUserIgnoreList,
    IWallPost,
    ParsedPageResult,
    Thread,
    UserInfo,
} from "./types";
import {UserRelation} from "./storage";

/**
 * Интерфейс для кешированных смайлов
 */
interface ICachedSmiles {
    categories: ISmileCategory[];
    smiles: ISmile[];
}

/**
 * Интерфейс для настроек запроса
 */
interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
}

/**
 * Парсинг JSON-ответов (POST или GET)
 * @param url - URL для запроса
 * @param data - Данные для отправки (опционально)
 * @param options - Дополнительные опции запроса
 * @returns Promise с результатом парсинга JSON
 */
export async function parseJson<T>(
    url: string, 
    data?: unknown, 
    options: RequestOptions = {}
): Promise<T> {
    const controller = new AbortController();
    const timeoutId = options.timeout 
        ? setTimeout(() => controller.abort(), options.timeout)
        : null;

    try {
        const response = await fetch(url, {
            method: data ? "POST" : "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                ...options.headers
            },
            body: data ? JSON.stringify(data) : null,
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

/**
 * Парсинг HTML-ответа (GET)
 * @param url - URL для запроса
 * @param options - Дополнительные опции запроса
 * @returns Promise с HTML-строкой
 */
export async function parseText(
    url: string, 
    options: RequestOptions = {}
): Promise<string> {
    const controller = new AbortController();
    const timeoutId = options.timeout 
        ? setTimeout(() => controller.abort(), options.timeout)
        : null;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                ...options.headers
            },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.text();
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

/**
 * Парсинг списка разделов форума
 * @returns Promise с массивом разделов форума
 */
export async function parseForumSections(): Promise<IForumSections[]> {
    try {
        const html = await parseText("/forum/");
        const doc = new DOMParser().parseFromString(html, "text/html");

        const sectionElements = doc.querySelectorAll<HTMLAnchorElement>(
            ".forum-page__list .forum-page__item-title-block a"
        );

        return Array.from(sectionElements)
            .map((el) => {
                const href = el.getAttribute("href") || "";
                const match = href.match(/forums\/(.*)\.(\d+)\//);
                const id = match ? parseInt(match[2], 10) : null;
                const name = el.textContent?.trim() ?? null;
                return id && name ? {id, name} : null;
            })
            .filter((item): item is IForumSections => item !== null);
    } catch (error) {
        console.error("Ошибка при парсинге разделов форума:", error);
        return [];
    }
}

/**
 * Получение ленты сообщений
 * @param offset - Смещение для пагинации
 * @returns Promise с массивом тредов
 */
export async function parseFeed(offset = 0): Promise<Thread[]> {
    try {
        const response = await parseJson<{ items: Thread[] }>(
            "/forum/api/feed/get",
            {offset, order: "new"}
        );
        return response.items;
    } catch (error) {
        console.error("Ошибка при получении ленты:", error);
        return [];
    }
}

/**
 * Кешированный запрос смайлов
 * Использует замыкание для кеширования результата
 */
export const getSmiles = (() => {
    let cachedSmiles: ICachedSmiles | null = null;
    let isLoading = false;
    let loadPromise: Promise<ICachedSmiles> | null = null;

    return async (): Promise<ICachedSmiles> => {
        // Возвращаем кешированный результат
        if (cachedSmiles) return cachedSmiles;

        // Если уже загружается, ждем завершения
        if (isLoading && loadPromise) return loadPromise;

        // Начинаем загрузку
        isLoading = true;
        loadPromise = (async () => {
            try {
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
            } finally {
                isLoading = false;
                loadPromise = null;
            }
        })();

        return loadPromise;
    };
})();

/**
 * Получение смайла по ID
 * @param id - ID смайла
 * @returns Promise с найденным смайлом или undefined
 */
export async function getSmileById(id: string): Promise<ISmile | undefined> {
    try {
        const smiles = await getSmiles();
        return smiles.smiles.find((smile) => id === smile.id);
    } catch (error) {
        console.error("Ошибка при поиске смайла:", error);
        return undefined;
    }
}

/**
 * Получение уведомлений
 * @param page - Номер страницы
 * @returns Promise с массивом уведомлений
 */
export async function getNotifications(page = 1): Promise<INotificationItem[]> {
    try {
        const response = await parseJson<{ notices: INotificationItem[] }>(
            "/forum/api/notices/preload",
            {name: "Все уведомления", page}
        );
        return response.notices;
    } catch (error) {
        console.error("Ошибка при получении уведомлений:", error);
        return [];
    }
}

/**
 * Отправить сообщение на стену
 * @param uid - ID пользователя
 * @param content - Содержимое сообщения
 * @param replyTo - ID сообщения для ответа (опционально)
 * @returns Promise с результатом отправки
 */
export async function makeWallPost(
    uid: number, 
    content: string, 
    replyTo: number | null
): Promise<IWallPost> {
    return await parseJson<IWallPost>("/forum/api/user/makeWallPost", {
        uid, content, replyTo
    });
}

/**
 * Вспомогательная функция парсинга страницы подписок
 * @param userId - ID пользователя
 * @param page - Номер страницы
 * @returns Promise с результатом парсинга страницы
 */
async function parseFollowingsPage(userId: number, page: number): Promise<ParsedPageResult> {
    const html = await parseText(`/forum/members/.${userId}/followings/page-${page}/`);
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Находим максимальную страницу
    const links = doc.querySelectorAll('.pagination__link');
    const maxPage = Array.from(links).reduce((max, link) => {
        const page = parseInt(link.getAttribute('data-page') || '', 10);
        return !isNaN(page) && page > max ? page : max;
    }, 1);

    // Парсим пользователей
    const users = Array.from(doc.querySelectorAll('.member-list li')).map(li => {
        const id = parseInt(li.id.replace('user-', ''), 10);
        const nicknameElement = li.querySelector('.settings-page__ignored-user-info > div');
        const nickname = nicknameElement?.textContent?.trim() || '';
        return {id, nickname};
    });

    return {users, maxPage};
}

/**
 * Возвращает список, на кого подписан пользователь
 * @param userId - ID пользователя
 * @returns Promise с массивом подписок
 */
export async function getFollowingsList(userId: number): Promise<IFollowings[]> {
    try {
        const firstPage = await parseFollowingsPage(userId, 1);
        let allUsers = [...firstPage.users];

        // Загружаем остальные страницы
        for (let page = 2; page <= firstPage.maxPage; page++) {
            const {users} = await parseFollowingsPage(userId, page);
            allUsers = allUsers.concat(users);
        }

        return allUsers;
    } catch (error) {
        console.error("Ошибка при получении списка подписок:", error);
        return [];
    }
}

/**
 * Проверка подписки одного пользователя на другого
 * @param userId - ID пользователя, чьи подписки проверяем
 * @param targetId - ID пользователя, которого ищем в подписках
 * @returns Promise с результатом проверки
 */
export async function isUserFollowed(userId: number, targetId: number): Promise<boolean> {
    try {
        const firstPage = await parseFollowingsPage(userId, 1);
        if (firstPage.users.some((u) => u.id === targetId)) return true;

        // Проверяем остальные страницы с задержкой
        for (let page = 2; page <= firstPage.maxPage; page++) {
            await sleep(2000);
            const {users} = await parseFollowingsPage(userId, page);
            if (users.some((u) => u.id === targetId)) return true;
        }

        return false;
    } catch (error) {
        console.error("Ошибка при проверке подписки:", error);
        return false;
    }
}

/**
 * Проверка отношения пользователя (нейтрален/игнорирует/подписчик)
 * @param userId - ID пользователя для проверки
 * @returns Promise с типом отношения
 */
export async function getUserRelation(userId: number): Promise<UserRelation> {
    const currentUserId = getCurrentUser().id;

    // Проверяем авторизацию
    if (!isAuth()) {
        return "error";
    }

    // Проверяем, не проверяем ли мы сами себя
    if (userId === currentUserId) {
        return "me";
    }

    try {
        // Первая проверка: игнорирует ли нас пользователь
        const sendWall = await makeWallPost(userId, "###".repeat(257), null);
        if (sendWall.status === "ignoredByUser") {
            return "ignored";
        }

        // TODO: Вторая проверка - ищем нас у пользователя в подписках
        // if (await isUserFollowed(userId, currentUserId)) {
        //     return "subscriber";
        // }

        // Если проверки ничего не нашли, значит нейтрален
        return "neutral";
    } catch (error) {
        console.error("Ошибка при определении отношения пользователя:", error);
        return "error";
    }
}

/**
 * Получение никнейма пользователя
 * @param userId - ID пользователя
 * @returns Promise с никнеймом пользователя
 */
export async function getUserNickName(userId: number): Promise<string> {
    try {
        const html = await parseText(`/forum/members/.${userId}/`);
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc?.querySelector(".forum-profile__head--backwrapped")?.textContent?.trim() || "";
    } catch (error) {
        console.error("Ошибка при получении никнейма:", error);
        return "";
    }
}

/**
 * Получение подписи пользователя
 * @param userId - ID пользователя
 * @param nickname - Никнейм пользователя
 * @returns Promise с подписью пользователя
 */
export async function getUserSignature(userId: number, nickname: string): Promise<string> {
    try {
        const html = await parseText(`/forum/members/${nickname}.${userId}/about/`);
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc?.querySelector("blockquote")?.innerHTML || "";
    } catch (error) {
        console.error("Ошибка при получении подписи:", error);
        return "";
    }
}

/**
 * Получение полной информации о пользователе
 * @param id - ID пользователя
 * @returns Promise с информацией о пользователе
 */
export async function getUserInfo(id: number): Promise<UserInfo> {
    try {
        const nickname = await getUserNickName(id);
        const signature = nickname.length ? await getUserSignature(id, nickname) : "";
        const type = nickname.length ? await getUserRelation(id) : "error";
        
        return {
            id,
            type,
            nickname,
            signature
        };
    } catch (error) {
        console.error("Ошибка при получении информации о пользователе:", error);
        return {
            id,
            type: "error",
            nickname: "",
            signature: ""
        };
    }
}

/**
 * Сохранить настройки ленты
 * @param ids - Массив ID разделов для включения в ленту
 * @returns Promise с результатом сохранения
 */
export async function saveFeedSettings(ids: number[]): Promise<{ status: string }> {
    return await parseJson<{ status: string }>(
        "/forum/api/feed/saveSettings",
        {ids}
    );
}

/**
 * Получение списка игнорируемых пользователей
 */

export async function getIgnoreList(): Promise<IUserIgnoreList[]> {
    const result: IUserIgnoreList[] = [];

    async function loadPage(url: string) {
        const html = await parseText(url);
        const doc = new DOMParser().parseFromString(html, "text/html");

        const userBlocks = doc.querySelectorAll<HTMLElement>(".settings-page__block-splitter[id^='user-']");
        userBlocks.forEach(block => {
            const targetUserId = parseInt(block.id.replace("user-", ""), 10);
            const nicknameEl = block.querySelector(".settings-page__ignored-user-info--row.mb4");
            const nickname = nicknameEl?.textContent?.trim() ?? "";

            if (!isNaN(targetUserId) && nickname) {
                result.push({ targetUserId, nickname });
            }
        });

        return doc;
    }

    // Сначала грузим первую страницу, чтобы узнать кол-во страниц
    const firstDoc = await loadPage("/forum/settings/ignorelist/");

    const paginationLinks = firstDoc.querySelectorAll<HTMLAnchorElement>(".pagination__link[data-page]");
    const pages = Array.from(paginationLinks)
        .map(a => parseInt(a.dataset.page || "0", 10))
        .filter(p => !isNaN(p));

    const maxPage = pages.length ? Math.max(...pages) : 1;

    // Загружаем остальные страницы (если есть)
    for (let page = 2; page <= maxPage; page++) {
        await loadPage(`/forum/settings/ignorelist/page-${page}`);
    }

    // todo:
    localStorage.setItem("ignorelist", JSON.stringify(result));

    return result;
}


/**
 * Получение списка диалогов
 * @returns Promise с массивом диалогов
 */
export async function getDialogs(): Promise<DialogList[]> {
    try {
        const html = await parseText("https://dota2.ru/forum/conversations/");
        const doc = new DOMParser().parseFromString(html, "text/html");

        const items: DialogList[] = [];

        const dialogElements = doc?.querySelectorAll(".forum-section__item:not(.forum-section__item--first)");
        
        for (const item of dialogElements) {
            const link = item.querySelector(".forum-section__title-middled");
            const userIdMatch = item.querySelector(".forum-section__col-1 a")?.getAttribute("href")?.match(/\.(\d+)\//);
            const dateTimeElement = item.querySelector(".dateTime");
            
            items.push({
                user_id: userIdMatch?.[1] ?? "",
                avatar_link: item.querySelector("img")?.getAttribute("src") ?? "",
                date_created: parseInt(dateTimeElement?.getAttribute("data-time") || "0", 10),
                description: `<a href="${link?.getAttribute('href')}">${link?.textContent?.trim() || ""}</a>`
            });
        }

        return items;
    } catch (error) {
        console.error("Ошибка при получении диалогов:", error);
        return [];
    }
}

/**
 * Установка рейтинга на пост
 * @param pid - ID поста
 * @param smileId - ID смайла для рейтинга
 * @returns Promise с результатом установки рейтинга
 */
export async function setRateOnPost(pid: number, smileId: number): Promise<{ status: string }> {
    return await parseJson<{ status: string }>(
        "/forum/api/forum/setRateOnPost",
        {pid, smileId}
    );
}