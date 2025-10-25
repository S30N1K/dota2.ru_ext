import { sendToContent } from "./utils/communication"
import { extLogger } from "../logger"
import { chatSettings, currentUser, extensionUrl, settings } from "../storage"
import type { DatabaseTables } from "../types"
import { toRaw, watch } from "vue"
import Settings from "../vue/header/settings.vue"
import Chat from "../vue/header/chat.vue"
import SearchUsersHeader from "../vue/header/search.vue"
import { routes } from "../routes"
import { debounce } from "../utils/debounce"
import { getExtUrl } from "../utils/getExtUrl"
import { loadVue } from "../utils/loadVue"
import { getCurrentUser } from "../utils/getCurrentUser"
import { initLastDialogs, initLastNotifications } from "../utils/initHeaderLast"

const log = new extLogger("extension/loader.ts")

// ====================
// 🔄 Отслеживание изменений хранилища
// ====================
/**
 * Следит за изменениями объекта хранилища и
 * отправляет обновления контент-скрипту с debounce.
 */
function watchStorageChanges<T extends object>(table: string, obj: T): void {
	const sendUpdate = debounce(async (data: T) => {
		log.info("Store update", table, data)

		await sendToContent<{}, { info: string }>({
			type: "SAVE_DATABASE",
			payload: { table, data: toRaw(data) },
		})
	}, 500)

	watch(obj, sendUpdate, { deep: true })
}

// ====================
// ⚙️ Кнопка настроек расширения
// ====================
/**
 * Добавляет кнопку настроек в шапку сайта.
 * При клике загружает Vue-компонент настроек.
 */
function initButtonSettings(): void {
	const li = createHeaderItem(getExtUrl("assets/settings.svg"), "settings")

	const loadComponent = () => {
		li.removeEventListener("click", loadComponent)
		loadVue(li, Settings)
	}

	li.addEventListener("click", loadComponent)
	insertHeaderItem(li)
}

// ====================
// 💬 Добавление чата
// ====================
/**
 * Встраивает компонент чата в шапку, если включён в настройках.
 */
function initChat(): void {
	const li = createHeaderItem()
	loadVue(li, Chat)
	insertHeaderItem(li)
}

// ====================
// 🔍 Поиск пользователей в шапке
// ====================
/**
 * Добавляет компонент поиска пользователей в шапку.
 */
export function initSearchUsersHeader(): void {
	const searchButton = document.querySelector(".header__link-search__button")

	const loadComponent = () => {
		searchButton?.removeEventListener("click", loadComponent)

		const searchContainer = document.querySelector(".header__item-search")
		if (!searchContainer) return

		const searchComponent = document.createElement("div")
		searchComponent.classList.add("searchHeaderElement")
		searchContainer.appendChild(searchComponent)

		loadVue(searchComponent, SearchUsersHeader)
	}

	searchButton?.addEventListener("click", loadComponent)
}

// ====================
// 🧩 Загрузка внешних скриптов
// ====================
/**
 * Динамически подключает скрипты из routes,
 * соответствующие текущему URL.
 */
async function loadScripts(baseUrl: string): Promise<void> {
	for (const route of routes) {
		if (new RegExp(route.pattern).test(location.pathname)) {
			for (const script of route.scripts) {
				const module = await import(`${baseUrl}${script}`)
				if (module.default) await module.default(settings)
			}
		}
	}
}

// ====================
// 🧱 Вспомогательные функции
// ====================
/**
 * Создаёт элемент списка в шапке с иконкой.
 */
function createHeaderItem(iconUrl?: string, altText?: string): HTMLLIElement {
	const li = document.createElement("li")
	li.classList.add("header__item")
	li.style.cursor = "pointer"

	if (iconUrl) {
		const a = document.createElement("a")
		a.classList.add("header__link")

		const img = document.createElement("img")
		img.src = iconUrl
		img.alt = altText || ""

		a.appendChild(img)
		li.appendChild(a)
	}

	return li
}

/**
 * Вставляет элемент в шапку сайта перед кнопкой поиска.
 */
function insertHeaderItem(li: HTMLLIElement): void {
	const headerList = document.querySelector(".header__list")
	const searchItem = headerList?.querySelector(".header__item-search")
	if (headerList && searchItem) headerList.insertBefore(li, searchItem)
}

// ====================
// 🚀 Основная функция инициализации
// ====================
export default function initExtension(data: {
	extensionUrl: string
	database: DatabaseTables
}): void {
	// Сохраняем URL расширения
	extensionUrl.value = data.extensionUrl

	// Инициализируем локальные объекты
	Object.assign(currentUser, data.database.currentUser)
	Object.assign(chatSettings, data.database.chatSettings)
	Object.assign(settings, data.database.settings)

	// Обновляем данные текущего пользователя
	const user = getCurrentUser()
	Object.assign(currentUser, {
		id: user.id,
		nickname: user.nickname,
		avatar: user.avatar,
	})

	// Следим за изменениями данных
	watchStorageChanges("currentUser", currentUser)
	watchStorageChanges("chatSettings", chatSettings)
	watchStorageChanges("settings", settings)

	// Добавляем кнопку настроек
	initButtonSettings()

	// Загружаем чат (если включён)
	if (settings.chatEnabled) initChat()

	// Загружаем дополнительные скрипты по маршрутам
	loadScripts(data.extensionUrl)

	// Инициализация всплывающих окон и поиска
	if (settings.showRecentDialogsOnHover) initLastDialogs()
	if (settings.showRecentNotificationsOnHover) initLastNotifications()
	if (settings.searchUsersHeader) initSearchUsersHeader()
}
