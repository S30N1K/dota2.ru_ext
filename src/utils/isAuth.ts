import { getCurrentUser } from "./getCurrentUser"
import {extLogger} from "../logger";

const log = new extLogger("utils/isAuth.ts")

/**
 * Проверка авторизации пользователя
 * @returns true если пользователь авторизован, false в противном случае
 */
export function isAuth(): boolean {
	const user = getCurrentUser()
	return user.id > 0 && user.nickname !== ""
}
