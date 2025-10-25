import { DialogList } from "../types"
import { parseText } from "../utils/api"

interface Req {}
interface Res extends DialogList {}

/**
 * Получение списка диалогов пользователя
 * @returns Promise с массивом диалогов
 */
export async function getDialogs({}: Req): Promise<Res[]> {
	try {
		const html = await parseText("https://dota2.ru/forum/conversations/")
		const doc = new DOMParser().parseFromString(html, "text/html")

		const items: Res[] = []

		const dialogElements = doc?.querySelectorAll(
			".forum-section__item:not(.forum-section__item--first)"
		)

		for (const item of Array.from(dialogElements)) {
			const link = item.querySelector(".forum-section__title-middled")
			const userIdMatch = item
				.querySelector(".forum-section__col-1 a")
				?.getAttribute("href")
				?.match(/\.(\d+)\//)
			const dateTimeElement = item.querySelector(".dateTime")

			items.push({
				user_id: userIdMatch?.[1] ?? "",
				avatar_link: item.querySelector("img")?.getAttribute("src") ?? "",
				date_created: parseInt(dateTimeElement?.getAttribute("data-time") || "0", 10),
				description: `<a href="${link?.getAttribute("href")}">${link?.textContent?.trim() || ""}</a>`,
			})
		}

		return items
	} catch (error) {
		console.error("Ошибка при получении диалогов:", error)
		return []
	}
}
