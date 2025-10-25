import {extLogger} from "../logger";

const log = new extLogger("utils/openNewTab.ts")
/**
 * Открытие URL в новой вкладке браузера
 * @param url - URL для открытия
 */
export function openNewTab(url: string) {
	window.open(url, "_blank")
}
