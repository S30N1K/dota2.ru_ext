import { extLogger } from "../logger"

const log = new extLogger("utils/api.ts")

interface ApiRequestOptions {
	headers?: Record<string, string>
	timeout?: number
}

/**
 * Парсинг JSON-ответов (POST или GET)
 * @param url - URL для запроса
 * @param data - Данные для отправки (опционально)
 * @param options - Дополнительные опции запроса
 * @returns Promise с результатом парсинга JSON
 */
export async function parseJson<T>(
	url: string,
	data?: unknown,
	options: ApiRequestOptions = {}
): Promise<T> {
	const controller = new AbortController()
	const timeoutId = options.timeout ? setTimeout(() => controller.abort(), options.timeout) : null

	try {
		const response = await fetch(url, {
			method: data ? "POST" : "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Requested-With": "XMLHttpRequest",
				...options.headers,
			},
			body: data ? JSON.stringify(data) : null,
			signal: controller.signal,
		})

		if (!response.ok) {
			log.error(`HTTP error! status: ${response.status}`)
		}

		return await response.json()
	} finally {
		if (timeoutId) clearTimeout(timeoutId)
	}
}

/**
 * Парсинг HTML-ответа (GET)
 * @param url - URL для запроса
 * @param options - Дополнительные опции запроса
 * @returns Promise с HTML-строкой
 */
export async function parseText(url: string, options: ApiRequestOptions = {}): Promise<string> {
	const controller = new AbortController()
	const timeoutId = options.timeout ? setTimeout(() => controller.abort(), options.timeout) : null

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"X-Requested-With": "XMLHttpRequest",
				...options.headers,
			},
			signal: controller.signal,
		})

		if (!response.ok) {
			log.error(`HTTP error! status: ${response.status}`)
		}

		return await response.text()
	} finally {
		if (timeoutId) clearTimeout(timeoutId)
	}
}
