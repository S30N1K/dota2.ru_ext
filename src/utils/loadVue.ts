import { createApp, DefineComponent, h } from "vue"
import {extLogger} from "../logger";

const log = new extLogger("utils/loadVue.ts")

/**
 * Динамическая загрузка Vue компонента в указанный контейнер
 * @param selector - CSS селектор или HTML элемент контейнера
 * @param component - Vue компонент для загрузки
 * @param props - Свойства для передачи в компонент
 */
export function loadVue<P = {}>(
	selector: string | HTMLElement,
	component: DefineComponent<P, {}, any>,
	props?: P
): void {
	const container =
		typeof selector === "string" ? document.querySelector<HTMLElement>(selector) : selector
	if (!container) return

	container.innerHTML = ""

	const app = createApp({
		setup() {
			return () => h(component, props as Record<string, any>)
		},
	})

	app.mount(container)
}
