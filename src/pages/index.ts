import {ExtensionConfig, IUserIgnoreList} from "../types";
import {loadVue} from "../utils";
import indexForums from "../vue/indexForums.vue";
import {getIgnoreList, parseFeed} from "../api";

export default async function page(config: ExtensionConfig) {
    try {
        // Загружаем список игнорируемых пользователей
        const user_ignored = JSON.parse(localStorage.getItem("ignorelist") || "[]") as IUserIgnoreList[];
        
        if (config.listTopicSections) {
            // Получаем данные из двух источников
            const [mainFeed, additionalFeed] = await Promise.all([
                parseFeed(),
                parseFeed(10)
            ]);
            
            let list = [...mainFeed, ...additionalFeed];
            
            // Удаляем дубликаты по ID темы
            const seenIds = new Set();
            list = list.filter(item => {
                if (seenIds.has(item.id)) {
                    return false;
                }
                seenIds.add(item.id);
                return true;
            });

            // Фильтруем игнорируемые темы, если включена соответствующая настройка
            if (config.ignoreIndexThemes && user_ignored.length > 0) {
                const ignoredUserIds = new Set(user_ignored.map(user => user.targetUserId));
                list = list.filter(item => !ignoredUserIds.has(item.first_post.user_id));
            }

            // Загружаем Vue компонент с отфильтрованным списком
            loadVue(".forum__list", indexForums, { forumList: list });
        }

        // Логируем список игнорируемых пользователей для отладки
        const ignoreList = await getIgnoreList();
        console.log("Ignore list:", ignoreList);
        
    } catch (error) {
        console.error("Error in index page:", error);
        // Можно добавить уведомление пользователя об ошибке
    }
}