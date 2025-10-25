import { DomNode } from "../types"
import {extLogger} from "../logger";
const log = new extLogger("utils/createDomTree.ts")

export function createDomTree(node: DomNode): HTMLElement {
	const element = document.createElement(node.tag)

	// Установка атрибутов
	if (node.attrs) {
		for (const [key, value] of Object.entries(node.attrs)) {
			element.setAttribute(key, value)
		}
	}

	// Установка событий (click, mouseover и т.д.)
	for (const key of Object.keys(node)) {
		if (key === "click" && typeof node.click === "function") {
			element.addEventListener("click", node.click)
		}
	}

	// innerHTML или дочерние элементы
	if (node.innerHTML !== undefined) {
		element.innerHTML = node.innerHTML
	} else if (node.children) {
		for (const child of node.children) {
			if (typeof child === "string") {
				element.appendChild(document.createTextNode(child))
			} else {
				element.appendChild(createDomTree(child))
			}
		}
	}

	return element
}
