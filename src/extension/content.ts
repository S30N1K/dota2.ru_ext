import { sendToBackground, onInjectedMessage, InjectedMessage } from "./utils/communication"
import browser from "./utils/browser"
import { extLogger } from "../logger"
import type { DatabaseTables } from "../types"
import { startHotReloadSocket } from "./utils/hotReloadSocket"
const log = new extLogger("extension/content.ts")

// Функция отправки сообщения в injected
function sendMessageToInjected<T = any>(message: InjectedMessage<T>) {
	window.dispatchEvent(new CustomEvent("FROM_CONTENT_SCRIPT", { detail: message }))
}

function waitForDOMReady(): Promise<void> {
	return new Promise(resolve => {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => resolve())
		} else {
			resolve()
		}
	})
}

// Обработка сообщений от injected
onInjectedMessage(async (msg: InjectedMessage, sendResponse) => {
	log.info("Сообщение от injected", msg)

	switch (msg.type) {
		case "RESET_SETTINGS": {
			await sendToBackground({ type: "RESET_SETTINGS" })
			break
		}
		case "SAVE_DATABASE": {
			const data = msg.payload as {
				table: string
				data: object
			}
			await sendToBackground({
				type: "SAVE_DATABASE",
				payload: { table: data.table, data: data.data },
			})
			break
		}

		default:
			sendResponse({ success: false, error: "Неизвестный тип сообщения" })
	}
})

// Загружаем скрипты
function loadScript(path: string, cb?: () => void) {
	const script = document.createElement("script")
	script.src = browser.runtime.getURL(path)
	;(document.head || document.documentElement).appendChild(script)
	script.addEventListener("load", () => {
		log.info(`Скрипт ${path} подключен`)
		cb && cb()
		script.remove()
	})
}

// Загружаем стили
function loadCss(path: string, cb?: () => void) {
	const link = document.createElement("link")
	link.rel = "stylesheet"
	link.type = "text/css"
	link.href = browser.runtime.getURL(path)
	link.addEventListener("load", () => {
		log.info(`Стиль ${path} подключен`)
		cb && cb()
	})
	document.head.appendChild(link)
}

async function main() {
	const response = await sendToBackground({ type: "GET_DATABASE" })
	const { currentUser, chatSettings, settings } = response.data as DatabaseTables

	await waitForDOMReady()

	loadScript("injected.js", () => {
		sendMessageToInjected({
			type: "LOADED",
			payload: {
				extensionUrl: browser.runtime.getURL(""),
				database: {
					currentUser,
					chatSettings,
					settings,
				},
			},
		})
	})

	if (settings.restoreOldDesign) {
		loadCss("style/old.css")
	}

	if (settings.chatEnabled) {
		loadCss("style/chat.css")
		loadCss("style/chatInput.css")
	}

	if (settings.newSmilesPanel || settings.chatEnabled) {
		loadCss("style/newSmilesPanel.css")
	}

	if (settings.searchUsersHeader) {
		loadCss("style/searchUserHeader.css")
	}
}

main().catch(error => log.error(error))

if (process.env.NODE_ENV === "dev") {
	startHotReloadSocket()
}
