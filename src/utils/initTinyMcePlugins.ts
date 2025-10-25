import { extLogger } from "../logger"
import { settings } from "../storage"
import { Smile } from "../types"
import { getSmileUrl } from "./getSmileUrl"
import { getTinyMCEEditor } from "./getTinyMCEEditor"
import { loadVue } from "./loadVue"
import { uploadToImgbb } from "./uploadToImgbb"
import newSmilesPanel from "../vue/newSmilesPanel.vue"

const log = new extLogger("utils/initTinyMcePlugins.ts")

declare const tinymce: any

export function initTinyMcePlugins() {
	getTinyMCEEditor(editor => {
		if (settings.imagePasteByCtrlV) {
			editor.on("paste", (event: ClipboardEvent) => {
				const items = event.clipboardData?.items
				if (!items) return

				for (const item of Array.from(items)) {
					if (item.type.includes("image")) {
						const file = item.getAsFile()
						if (file) {
							const reader = new FileReader()
							reader.onload = async e => {
								const base64 = e.target?.result as string
								const url = await uploadToImgbb(base64)
								if (url) {
									editor.insertContent(`<img src="${url}" alt="Image"/>`)
								} else {
									log.error("Не удалось загрузить изображение на imgbb")
								}
							}
							reader.readAsDataURL(file)
							event.preventDefault()
							break
						}
					}
				}
			})
		}

		if (settings.newSmilesPanel) {
			let isOpen = false

			const button = editor.container.querySelector('button[aria-label="Смайлы"]') as HTMLElement
			button.addEventListener("click", e => {
				e.preventDefault()
				e.stopPropagation()

				isOpen = !isOpen

				let smilesPanel = editor.container?.parentElement?.querySelector("#smilesPanel")

				if (!smilesPanel) {
					smilesPanel = document.createElement("div")
					smilesPanel.setAttribute("id", "smilesPanel")
					editor.container?.parentElement?.appendChild(smilesPanel)
					loadVue(smilesPanel as HTMLElement, newSmilesPanel, {
						onSmile(smile: Smile) {
							tinymce.activeEditor.plugins.smileys.insert(smile.title, getSmileUrl(smile))
						},
					})
				}

				if (isOpen) {
					smilesPanel.classList.add("opened")
				} else {
					smilesPanel.classList.remove("opened")
				}
			})
		}
	})
}
