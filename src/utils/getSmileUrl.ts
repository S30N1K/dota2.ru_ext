import { Smile } from "../types"
import { getFileName } from "./getFileName"
import {extLogger} from "../logger";

const log = new extLogger("utils/getSmileUrl.ts")

/**
 * Получение URL для отображения смайла
 * @param smile - Объект смайла
 * @returns URL для отображения смайла
 */
export function getSmileUrl(smile: Smile) {
	return `/img/forum/emoticons/${getFileName(smile.filename!)}`
}
