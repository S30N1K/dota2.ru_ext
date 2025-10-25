import {extLogger} from "../logger";

const log = new extLogger("utils/getTinyMCEEditor.ts")

// Функция для получения всех редакторов TinyMCE (существующих и будущих)
export function getTinyMCEEditor(callback: (editor: any) => void): void {
	// Массив для хранения всех найденных редакторов
	const editors: any[] = []

	// Функция для обработки найденного редактора
	const processEditor = (editor: any) => {
		if (editor && !editors.includes(editor)) {
			editors.push(editor)

			if (editor.initialized) {
				// уже готов
				callback(editor)
			} else {
				// дождаться готовности
				editor.on("init", () => {
					callback(editor)
				})
			}
		}
	}

	// Проверяем существующие редакторы
	if (typeof (window as any).tinymce !== "undefined" && (window as any).tinymce.editors) {
		;(window as any).tinymce.editors.forEach(processEditor)
	}

	// Создаем MutationObserver для отслеживания новых редакторов
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			// Проверяем добавленные узлы
			mutation.addedNodes.forEach(node => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const element = node as Element

					// Ищем iframe с редактором TinyMCE
					const iframes = element.querySelectorAll("iframe")
					iframes.forEach(iframe => {
						try {
							const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
							if (iframeDoc && iframeDoc.body) {
								// Проверяем, есть ли в iframe редактор TinyMCE
								const editorElement = iframeDoc.body.querySelector("[data-mce-object]")
								if (editorElement) {
									// Получаем редактор по ID
									const editorId = editorElement.getAttribute("data-mce-object")
									if (editorId && typeof (window as any).tinymce !== "undefined") {
										const editor = (window as any).tinymce.get(editorId)
										if (editor) {
											processEditor(editor)
										}
									}
								}
							}
						} catch (e) {
							// Игнорируем ошибки доступа к iframe
						}
					})
				}
			})
		})
	})

	// Начинаем наблюдение за изменениями в DOM
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})

	// Также отслеживаем события TinyMCE для новых редакторов
	if (typeof (window as any).tinymce !== "undefined") {
		// Слушаем событие создания нового редактора
		;(window as any).tinymce.on("AddEditor", (e: any) => {
			if (e.editor) {
				processEditor(e.editor)
			}
		})

		// Слушаем событие инициализации редактора
		;(window as any).tinymce.on("init", (e: any) => {
			if (e.target) {
				processEditor(e.target)
			}
		})
	}
}
