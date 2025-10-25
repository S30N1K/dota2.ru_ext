import {extLogger} from "../logger";

const log = new extLogger("utils/declineWords.ts")

/**
 * Возвращает строку с числом и правильно склонённым словом
 * @param n - число
 * @param forms - массив из 3 форм слова:
 *   [единственное, родительный ед.ч., родительный мн.ч.]
 *   пример: ["пользователь", "пользователя", "пользователей"]
 */
export function declineWord(
	n: number,
	forms: [string, string, string],
	full: boolean = false
): string {
	const mod10 = n % 10
	const mod100 = n % 100

	let word
	if (mod10 === 1 && mod100 !== 11) {
		word = forms[0] // 1 пользователь
	} else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
		word = forms[1] // 2 пользователя
	} else {
		word = forms[2] // 5 пользователей
	}

	if (full) {
		return `${n} ${word}`
	} else {
		return word
	}
}
