import { parseJson } from "../utils/api"

interface Req {
	pid: number
	smileId: number
}
interface Res {
	status: "success" | "invalidRecipientBanned" | "accessDenied"
}

/**
 * Установка рейтинга (смайла) на пост
 * @param pid - ID поста
 * @param smileId - ID смайла для рейтинга
 * @returns Promise с результатом установки рейтинга
 */
export async function setRateOnPost({ pid, smileId }: Req): Promise<Res> {
	return await parseJson<Res>("/forum/api/forum/setRateOnPost", { pid, smileId })
}
