import { getIgnoreList } from "../api/getIgnoreList"
import { parseFeed } from "../api/parseFeed"
import { extLogger } from "../logger"
import { settings } from "../storage"
import { loadVue } from "../utils/loadVue"
import indexForums from "../vue/indexForums.vue"

const log = new extLogger("pages/index.ts")

export default async function () {
    // Скрываем новости с главной
    if (settings.hideNewsFromMain) {
        document.querySelector(".index__main")?.remove()
    }

    // Загружаем список игнорируемых пользователей
    const user_ignored = await getIgnoreList({})

    if (settings.customTopicSections) {

        // Загружаем первую страницу
        const mainFeed = await parseFeed({ offset: 0 })

        // Определяем offset для следующей загрузки
        const nextOffset = mainFeed.length

        // Загружаем вторую страницу только если есть смысл
        const additionalFeed = nextOffset > 0
            ? await parseFeed({ offset: nextOffset })
            : []

        let list = [...mainFeed, ...additionalFeed]

        // Удаляем дубликаты по ID темы
        const seenIds = new Set<number>()
        list = list.filter(item => {
            if (seenIds.has(Number(item.id))) return false
            seenIds.add(Number(item.id))
            return true
        })

        // Фильтруем игнорируемые темы, если включена соответствующая настройка
        if (settings.hideTopicsFromMain && user_ignored.length > 0) {
            const ignoredUserIds = new Set(user_ignored.map(user => user.id))
            list = list.filter(item => !ignoredUserIds.has(item.first_post.user_id))
        }

        // Загружаем Vue компонент с отфильтрованным списком
        loadVue(".forum__list", indexForums, { forumList: list })
    }
}
