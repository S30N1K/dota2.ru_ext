import { parseJson } from "../utils/api"

interface Req {
	ids: number[]
}

interface Res {
	status: string
}

/**
 * Сохранение настроек ленты пользователя
 * @param ids - Массив ID разделов для включения в ленту
 * @returns Promise с результатом сохранения настроек
 */
export async function saveFeedSettings({ ids }: Req): Promise<Res> {
	return await parseJson<Res>("/forum/api/feed/saveSettings", { ids })
}
