import {extLogger} from "../logger";

const log = new extLogger("utils/debounce.ts")/**

 * Функция debounce для ограничения частоты вызова функции
 * @param fn - Функция, которую нужно ограничить по частоте вызова
 * @param delay - Задержка в миллисекундах (по умолчанию 500мс)
 * @returns Функция с ограниченной частотой вызова
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 500) {
	let timer: number | null = null
	return (...args: Parameters<T>) => {
		if (timer) clearTimeout(timer)
		timer = window.setTimeout(() => fn(...args), delay)
	}
}
