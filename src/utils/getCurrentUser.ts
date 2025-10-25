import { CurrentUser } from "../types"
import {extLogger} from "../logger";

const log = new extLogger("utils/getCurrentUser.ts")


// Возвращает id и ник текущего пользователя
export function getCurrentUser(): CurrentUser {
	const headerUser = document.querySelector(".header__subitem-head")
	const avatar = headerUser?.querySelector("img")?.getAttribute("src") || ""
	const id = parseInt(
		headerUser
			?.querySelector("a")
			?.getAttribute("href")
			?.match(/\.([0-9]+)\//)?.[1] || "0"
	)
	const nickname =
		headerUser?.querySelector(".header__subitem-text--name")?.textContent?.trim() || ""
	return {
		avatar,
		id,
		nickname,
		token: "",
	}
}
