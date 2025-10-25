import { parseJson } from "../utils/api"

interface Req {
	title: string
	content: string
	recipients: number[]
}

interface Res {
	status: "success" | "invalidRecipientBanned" | "accessDenied"
	id?: number
	shortName?: string
}

/**
 * Создание нового диалога (беседы) на форуме
 * @param title - Заголовок диалога
 * @param content - Содержание сообщения
 * @param recipients - Массив ID получателей
 * @returns Promise с результатом создания диалога
 */
export async function createConversationNew({ title, content, recipients }: Req): Promise<Res> {
	return await parseJson("/forum/api/message/createConversationNew", { title, content, recipients })
}
