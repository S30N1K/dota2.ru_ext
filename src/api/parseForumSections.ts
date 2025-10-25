import { parseText } from "../utils/api"
import {} from "../types"

interface Req {}

interface Res {
	name: string // Название раздела
	id: number // Идентификатор раздела
}

/**
 * todo: переделать, сделать подгрузку уже установленых в настройках ленты
 * Парсинг разделов форума
 * @returns Promise с массивом разделов форума
 */
export async function parseForumSections({}: Req): Promise<Res[]> {
	try {
		const html = await parseText("/forum/")
		const doc = new DOMParser().parseFromString(html, "text/html")

		const sectionElements = doc.querySelectorAll<HTMLAnchorElement>(
			".forum-page__list .forum-page__item-title-block a"
		)

		return Array.from(sectionElements)
			.map(el => {
				const href = el.getAttribute("href") || ""
				const match = href.match(/forums\/(.*)\.(\d+)\//)
				const id = match ? parseInt(match[2], 10) : null
				const name = el.textContent?.trim() ?? null
				return id && name ? { id, name } : null
			})
			.filter((item): item is Res => item !== null)
	} catch (error) {
		console.error("Ошибка при парсинге разделов форума:", error)
		return []
	}
}
