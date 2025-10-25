import { parseJson } from "../utils/api"

interface Req {
	page: number
}

interface Res {
	id: string
	type: string
	data: {
		user_ids: number[]
		title: string
	}
	news_id: number | null
	forum_id: number | null
	topic_id: number | null
	message_id: number | null
	post_id: number | null
	smile_id: string | null
	wall_post_id: number | null
	wall_comment_id: number | null
	description: string
	date_created: number
	user_id: number
	user_id_sender: number
	notify_id: number | null
	is_readed: number
	date_readed: any[]
	"sender.id": string
	"sender.username": string
	"sender.is_online": string
	"sender.avatar_timestamp": number | null
	link: string
	avatar_link: string
	sender_username: string
	created_format: string
}

/**
 * Получение уведомлений пользователя
 * @param page - Номер страницы для пагинации
 * @returns Promise с массивом уведомлений
 */
export async function getNotifications({ page }: Req): Promise<Res[]> {
	const response = await parseJson<{ notices: Res[] }>("/forum/api/notices/preload", {
		name: "Все уведомления",
		page,
	})
	return response.notices
}
