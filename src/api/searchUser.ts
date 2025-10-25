import { SearchUser } from "../types"
import { parseJson } from "../utils/api"

interface Req {
	query: string
}
interface Res extends SearchUser {}

/**
 * Поиск пользователей по запросу
 * @param query - Строка поиска (минимум 3 символа)
 * @returns Promise с массивом найденных пользователей
 */
export async function searchUser({ query }: Req): Promise<Res[]> {
	return query.length > 2 ? await parseJson<Res[]>("/forum/api/forum/getUsers", { query }) : []
}
