import { parseJson } from "../utils/api"

interface Req {
	uid: number
	content: string
	replyTo: number | null
}

interface Res {}

/**
 * Создание поста на стене пользователя
 * @param uid - ID пользователя, на чью стену публикуется пост
 * @param content - Содержание поста
 * @param replyTo - ID поста для ответа (опционально)
 * @returns Promise с результатом создания поста
 */
export async function makeWallPost({ uid, content, replyTo }: Req): Promise<Res> {
	return await parseJson<Res>("/forum/api/user/makeWallPost", {
		uid,
		content,
		replyTo,
	})
}
