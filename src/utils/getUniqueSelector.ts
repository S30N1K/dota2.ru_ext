import {extLogger} from "../logger";

const log = new extLogger("utils/getUniqueSelector.ts")

/**
 * Генерация уникального CSS селектора для элемента
 * @param el - HTML элемент для которого нужно создать селектор
 * @returns Уникальный CSS селектор
 */
export function getUniqueSelector(el: HTMLElement): string {
	if (el.tagName.toLowerCase() === "html") return "html"

	// Если есть уникальный id — используем его
	if (el.id) return `#${CSS.escape(el.id)}`

	// Формируем базовый селектор для элемента
	let selector = el.tagName.toLowerCase()

	if (el.classList.length) {
		selector +=
			"." +
			Array.from(el.classList)
				.map(c => CSS.escape(c))
				.join(".")
	} else {
		// Если нет классов, но есть name или data-* — используем
		const nameAttr = el.getAttribute("name")
		if (nameAttr) selector += `[name="${CSS.escape(nameAttr)}"]`
		else {
			const datasetAttrs = Object.entries(el.dataset)
			if (datasetAttrs.length) {
				const [key, value] = datasetAttrs[0]
				selector += `[data-${CSS.escape(key)}="${CSS.escape(value ?? "")}"]`
			}
		}
	}

	// Проверяем, уникален ли текущий селектор в документе
	if (document.querySelectorAll(selector).length === 1) {
		return selector
	}

	// Если не уникален — добавляем nth-child и родителей
	const parent = el.parentElement
	if (parent instanceof HTMLElement) {
		const index = Array.from(parent.children).indexOf(el) + 1
		selector += `:nth-child(${index})`
		return `${getUniqueSelector(parent)} > ${selector}`
	}

	return selector
}
