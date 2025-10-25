import { getSmiles } from "../api/getSmiles"
import { Smile } from "../types"
import {extLogger} from "../logger";

const log = new extLogger("utils/findSmileById.ts")

/**
 * Поиск смайла по его ID
 * @param id - ID смайла для поиска
 * @returns Promise с найденным смайлом или undefined если не найден
 */
export async function findSmileById(id: string): Promise<Smile | undefined> {
	const smiles = await getSmiles()
	return smiles.smiles.find(smile => smile.id === id)
}
