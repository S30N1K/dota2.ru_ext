import {extLogger} from "../logger";

const log = new extLogger("utils/sleep.ts")
/**
 * Асинхронная функция задержки выполнения
 * @param ms - Время задержки в миллисекундах
 * @returns Promise, который разрешится после указанной задержки
 */
export async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}
