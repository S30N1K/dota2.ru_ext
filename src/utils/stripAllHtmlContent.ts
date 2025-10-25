import {extLogger} from "../logger";

const log = new extLogger("utils/stripAllHtmlContent.ts")

// Вспомогательная функция для декодирования HTML-сущностей
function decodeHtmlEntities(text: string): string {
	const textarea = document.createElement("textarea")
	textarea.innerHTML = text
	return textarea.value
}

export function stripAllHtmlContent(
	html: string,
	options: {
		maxLength?: number
		preserveLineBreaks?: boolean
		removeComments?: boolean
		decodeEntities?: boolean
	} = {}
): string {
	const {
		maxLength = 300,
		preserveLineBreaks = true,
		removeComments = true,
		decodeEntities = true,
	} = options

	try {
		// Создаем временный элемент для парсинга HTML
		const tempDiv = document.createElement("div")
		tempDiv.innerHTML = html

		// Удаляем нежелательные теги
		const tagsToRemove = [
			"script",
			"style",
			"template",
			"noscript",
			"iframe",
			"object",
			"embed",
			"applet",
			"form",
			"input",
			"button",
			"select",
			"textarea",
			"label",
			"fieldset",
			"legend",
		]

		tagsToRemove.forEach(tag => {
			const elements = tempDiv.querySelectorAll(tag)
			elements.forEach(el => el.remove())
		})

		// Удаляем комментарии если требуется
		if (removeComments) {
			const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_COMMENT, null)
			const commentsToRemove: Comment[] = []
			let node
			while ((node = walker.nextNode())) {
				commentsToRemove.push(node as Comment)
			}
			commentsToRemove.forEach(comment => comment.remove())
		}

		// Получаем текстовое содержимое
		let text = tempDiv.textContent || tempDiv.innerText || ""

		// Декодируем HTML-сущности если требуется
		if (decodeEntities) {
			text = decodeHtmlEntities(text)
		}

		// Обрабатываем переносы строк
		if (preserveLineBreaks) {
			// Заменяем <br> и <p> на переносы строк
			text = text.replace(/\s*\n\s*/g, "\n")
		} else {
			// Убираем лишние пробелы и переносы
			text = text.replace(/\s+/g, " ")
		}

		// Очищаем от лишних пробелов
		text = text.trim()

		// Ограничиваем длину
		if (maxLength > 0 && text.length > maxLength) {
			text = text.slice(0, maxLength)
			// Добавляем многоточие если обрезали
			if (text.length === maxLength) {
				text = text + "..."
			}
		}

		return text
	} catch (error) {
		console.warn("Error in stripAllHtmlContent:", error)
		// Fallback: простая очистка через regex
		return html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
			.replace(/<[^>]+>/g, "")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, maxLength)
	}
}
