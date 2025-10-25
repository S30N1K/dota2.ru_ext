import { DatabaseTables } from "../types"
import { InjectedMessage } from "./utils/communication"

window.addEventListener("FROM_CONTENT_SCRIPT", async (event: any) => {
	const message = event.detail as InjectedMessage

	switch (message.type) {
		case "LOADED": {
			const data = message.payload as {
				extensionUrl: string
				database: DatabaseTables
			}
			const loader = await import(data.extensionUrl + "pages/loader.js")
			loader?.default(data)
		}
	}
})
