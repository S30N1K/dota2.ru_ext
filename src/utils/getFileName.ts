import {extLogger} from "../logger";

const log = new extLogger("utils/getFileName.ts")
/**
 * Извлечение имени файла из полного пути
 * @param fullPath - Полный путь к файлу
 * @returns Имя файла без пути
 */
export function getFileName(fullPath: string): string {
	return fullPath.split("/").filter(Boolean).pop() || ""
}
