import {extLogger} from "../logger";

const log = new extLogger("utils/throttle.ts")
/**
 * Функция throttle для ограничения частоты вызова функции
 * @param fn - Функция, которую нужно ограничить по частоте вызова
 * @param delay - Минимальный интервал между вызовами в миллисекундах
 * @returns Функция с ограниченной частотой вызова
 */
export function throttle(fn: (...args: any[]) => void, delay: number) {
	let lastCall = 0
	return (...args: any[]) => {
		const now = Date.now()
		if (now - lastCall >= delay) {
			lastCall = now
			fn(...args)
		}
	}
}
