import { UserIgnoreList } from "../types"
import { parseText } from "../utils/api"

interface Req {}

interface Res extends UserIgnoreList {}

/**
 * Получение списка игнорируемых пользователей
 * @returns Promise с массивом игнорируемых пользователей
 */
export async function getIgnoreList({}: Req): Promise<Res[]> {
	const result: Res[] = []

	async function loadPage(url: string) {
		const html = await parseText(url)
		const doc = new DOMParser().parseFromString(html, "text/html")

		const userBlocks = doc.querySelectorAll<HTMLElement>(
			".settings-page__block-splitter[id^='user-']"
		)
		userBlocks.forEach(block => {
			const id = parseInt(block.id.replace("user-", ""), 10)
			const nicknameEl = block.querySelector(".settings-page__ignored-user-info--row.mb4")
			const nickname = nicknameEl?.textContent?.trim() ?? ""

			if (!isNaN(id) && nickname) {
				result.push({ id, nickname })
			}
		})

		return doc
	}

	// Сначала грузим первую страницу, чтобы узнать кол-во страниц
	const firstDoc = await loadPage("/forum/settings/ignorelist/")

	const paginationLinks = firstDoc.querySelectorAll<HTMLAnchorElement>(
		".pagination__link[data-page]"
	)
	const pages = Array.from(paginationLinks)
		.map(a => parseInt(a.dataset.page || "0", 10))
		.filter(p => !isNaN(p))

	const maxPage = pages.length ? Math.max(...pages) : 1

	// Загружаем остальные страницы (если есть)
	for (let page = 2; page <= maxPage; page++) {
		await loadPage(`/forum/settings/ignorelist/page-${page}`)
	}

	// todo:
	localStorage.setItem("ignorelist", JSON.stringify(result))

	return result
}
