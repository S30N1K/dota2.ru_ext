import { parseJson } from "../utils/api"

interface Req {
	signature: string
}
interface Res {
	status: "success" | "accessDenied"
}

/**
 * Сохранение подписи пользователя
 * @param signature - Текст подписи
 * @returns Promise с результатом сохранения
 */
export async function saveSignature({ signature }: Req): Promise<Res> {
	return await parseJson<Res>("https://dota2.ru/forum/api/user/changeSettings", { signature })
}
