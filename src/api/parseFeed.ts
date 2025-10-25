import { ForumThread } from "../types"
import { parseJson } from "../utils/api"

interface Req {
	offset?: number
}

interface Res extends ForumThread {}

/**
 * Получение ленты новостей форума
 * @param offset - Смещение для пагинации (опционально)
 * @returns Promise с массивом тем из ленты
 */
export async function parseFeed({ offset }: Req): Promise<Res[]> {
	try {
		const response = await parseJson<{ items: Res[] }>("/forum/api/feed/get", {
			offset,
			order: "new",
		})
		return response.items
	} catch (error) {
		console.error("Ошибка при получении ленты:", error)
		return []
	}
}
