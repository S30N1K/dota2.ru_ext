import Dexie, { Table } from "dexie"
import type { DatabaseTables, ChatSettings, Settings, User } from "../../types"
import { DEFAULT_CHAT, DEFAULT_CURRENTUSER, DEFAULT_SETTINGS } from "./database_default"

/**
 * Значения по умолчанию
 * Используются при первом обращении к таблице или при очистке
 */
const defaultValues: { [K in keyof DatabaseTables]: DatabaseTables[K] } = {
	currentUser: DEFAULT_CURRENTUSER,
	chatSettings: DEFAULT_CHAT,
	settings: DEFAULT_SETTINGS,
	users: [],
}

/**
 * Основной класс-обёртка над Dexie
 */
export class Database extends Dexie {
	chatSettings!: Table<ChatSettings, string>
	settings!: Table<Settings, string>
	currentUser!: Table<User, string>
	users!: Table<User, string>

	constructor() {
		super("dota2.ru_ext")
		this.version(2).stores({
			chatSettings: "&key",
			settings: "&key",
			currentUser: "&key",
			users: "&key",
		})
	}

	/**
	 * Получить значение конкретного поля записи
	 * @param table - имя таблицы
	 * @param field - поле, значение которого нужно получить
	 * @param key - ключ записи (по умолчанию 'default')
	 */
	async getOne<K extends keyof DatabaseTables, F extends keyof DatabaseTables[K]>(
		table: K,
		field: F,
		key: string = "default"
	): Promise<DatabaseTables[K][F]> {
		const row = await this.table(table).get(key)
		const value = row ?? { ...defaultValues[table] }
		return value[field]
	}

	/**
	 * Обновление одного поля записи
	 */
	async setOne<K extends keyof DatabaseTables, F extends keyof DatabaseTables[K]>(
		table: K,
		field: F,
		value: DatabaseTables[K][F],
		key: string = "default"
	): Promise<void> {
		const row = (await this.table(table).get(key)) ?? { ...defaultValues[table] }
		await this.update(table, { ...row, [field]: value } as DatabaseTables[K], key)
	}

	/**
	 * Полностью обновляет запись
	 */
	async update<K extends keyof DatabaseTables>(
		table: K,
		value: DatabaseTables[K],
		key: string = "default"
	): Promise<void> {
		await this.table(table).put({ ...value, key } as any)
	}

	async getAll<K extends keyof DatabaseTables>(table: K): Promise<DatabaseTables[K]> {
		const rows = await this.table(table).toArray()
		if (rows.length === 0) {
			await this.update(table, defaultValues[table])
			return defaultValues[table]
		}
		return rows[0]
	}

	async setMany<K extends keyof DatabaseTables>(
		table: K,
		values: DatabaseTables[K][],
		keys: string[]
	): Promise<void> {
		const items = values.map((v, i) => ({ ...v, key: keys[i] }) as any)
		await this.table(table).bulkPut(items)
	}

	async clear<K extends keyof DatabaseTables>(table: K): Promise<void> {
		await this.table(table).clear()
		await this.update(table, defaultValues[table])
	}
}

export const database = new Database()
