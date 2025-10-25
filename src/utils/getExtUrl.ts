import { extensionUrl } from "../storage"
import {extLogger} from "../logger";

const log = new extLogger("utils/getExtUrl.ts")
/**
 * Получение полного URL для ресурсов расширения
 * @param path - Относительный путь к ресурсу
 * @returns Полный URL ресурса расширения
 */
export function getExtUrl(path: string): string {
	return extensionUrl.value + path
}
