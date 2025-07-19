import {getCurrentVersion} from "./utils";
import Dexie, { Table } from 'dexie';
import {Relation, StoredUserInfo} from "./types";
import {getUserInfo} from "./api";

const KEY_VERSION = "dota2.ru_extVersio"

// Время, через которое обновлять инфу о пользователя (друг, враг, нейтрален)
const UPDATED_RELATION_TIME = 24 * 60 * 60 * 1000; // Раз в сутки


// Проверка версии расширения
export function isNewVersion(): boolean {
    const savedVersion = localStorage.getItem(KEY_VERSION) || "";
    return savedVersion !== getCurrentVersion();
}

// Сохранение текущей версии расширения
export function saveVersion(): void {
    localStorage.setItem(KEY_VERSION, getCurrentVersion());
}

class ExtensionDB extends Dexie {
    relations!: Table<Relation>;

    constructor() {
        super('ExtensionDB');

        this.version(1).stores({
            relations: '++id, targetUserId, type',
        });
    }
}

export const db = new ExtensionDB();

export async function getOrUpdateUserInfo(userId: number): Promise<StoredUserInfo> {
    const existing = await db.relations.where('targetUserId').equals(userId).first();
    const now = Date.now();

    const isExpired = !existing || now - existing.updatedAt > UPDATED_RELATION_TIME;

    if (!isExpired && existing) {
        return {
            id: userId,
            nickname: existing.nickname,
            signature: existing.signature,
            relationType: existing.type,
        };
    }

    const userInfo = await getUserInfo(userId);

    if (userInfo.type === 'error') {
        return {
            id: userId,
            nickname: '',
            signature: '',
            relationType: 'error',
        };
    }

    const { nickname, signature, type } = userInfo;

    if (existing) {
        await db.relations.update(existing.id!, {
            type,
            updatedAt: now,
            nickname,
            signature,
        });
    } else {
        await db.relations.add({
            targetUserId: userId,
            type,
            updatedAt: now,
            nickname,
            signature,
        });
    }

    return {
        id: userId,
        nickname,
        signature,
        relationType: type,
    };
}

export async function getIgnoredUsers(): Promise<Relation[]> {
    return await db.relations
        .where('type')
        .equals('ignored')
        .toArray();
}