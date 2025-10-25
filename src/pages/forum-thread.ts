import { extLogger } from "../logger"
import { settings } from "../storage"
import { initTinyMcePlugins } from "../utils/initTinyMcePlugins"

const log = new extLogger("pages/forum-thread.ts")

export default async function () {
	// Полностью скрыть игнорируемых
	if (settings.hideForumMessages) {
		document.querySelectorAll(".ignored").forEach(el => {
			el.remove()
		})
	}

	initTinyMcePlugins()

	for (const tab of Array.from(document.querySelectorAll(".message-tab"))) {
		// const userPanel = tab.querySelector(".theme-user-block")
		// const userLink = userPanel?.querySelector(".forum-theme__item-name a")
		// const userId = parseInt(userLink?.getAttribute("href")?.match(/\.(\d+)\//)?.[1] || "0")
		// const userAvatarImg = userPanel?.querySelector(".forum-theme__item-avatar img")
		// const userInfo = await getOrUpdateUserInfo(userId)
		// const message = tab.querySelector("blockquote")
		// const messageId = parseInt(
		// 	tab.querySelector(".forum-theme__item")?.getAttribute("data-id") || "0"
		// )
		// if (settings.showForumTopicCaptions && userInfo.signature && message?.parentElement) {
		// 	const blockquote = document.createElement("blockquote")
		// 	blockquote.classList.add("signature")
		// 	blockquote.innerHTML = userInfo.signature
		// 	message.parentElement.appendChild(blockquote)
		// 	const contentHeight = blockquote.scrollHeight
		// 	const maxVisibleHeight = 200
		// 	if (contentHeight < maxVisibleHeight) {
		// 		blockquote.classList.add("open")
		// 	}
		// 	blockquote.addEventListener("click", async () => {
		// 		if (!blockquote.classList.contains("open")) {
		// 			blockquote.classList.add("open")
		// 		}
		// 	})
		// }
		// if (settings.followersFrame && userInfo.relationType === "subscriber") {
		//     (config.oldDesign ? userPanel : userAvatarImg)?.classList.add("user-followed");
		// }
		// if (config.ignoredByFrame && userInfo.relationType === "ignored") {
		//     (config.oldDesign ? userPanel : userAvatarImg)?.classList.add("user-ignored");
		// }
	}
}
