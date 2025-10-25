import { CachedSmiles, Smile, SmileCategory } from "../types"
import { parseJson } from "../utils/api"

/**
 * Получение списка смайлов с кешированием
 * @returns Promise с кешированными смайлами
 */
export const getSmiles = (() => {
	let cachedSmiles: CachedSmiles | null = null
	let isLoading = false
	let loadPromise: Promise<CachedSmiles> | null = null

	return async (): Promise<CachedSmiles> => {
		// Возвращаем кешированный результат
		if (cachedSmiles) return cachedSmiles

		// Если уже загружается, ждем завершения
		if (isLoading && loadPromise) return loadPromise

		// Начинаем загрузку
		isLoading = true
		loadPromise = (async () => {
			try {
				const response = await parseJson<{
					smiles: {
						categories: SmileCategory[]
						smiles: Record<string, Smile[]>
					}
				}>("/replies/get_smiles", {})

				cachedSmiles = {
					categories: response.smiles.categories ?? [],
					smiles: Object.values(response.smiles.smiles).flat(),
				}

				return cachedSmiles
			} finally {
				isLoading = false
				loadPromise = null
			}
		})()

		return loadPromise
	}
})()
