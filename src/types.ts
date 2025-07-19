import type { Ref } from 'vue';
/**
 * Раздел форума
 */
export interface IForumSections {
    name: string; // Название раздела
    id: number;   // Идентификатор раздела
}

/**
 * Основные настройки расширения
 */
export interface ExtensionSettings  {
    oldDesign: boolean; // Старый дизайн форума
    newSmilePanel: boolean; // Новая панель смайлов
    pasteImage: boolean; // Вставка изображений
    imgbbToken: string; // Токен imgbb
    soundNotifications: boolean; // Звуковые уведомления
    soundType: string; // Тип звука
    customSoundName: string; // Имя пользовательского звука
    hoverLastNotifications: boolean; // Наведение на последние уведомления
    showNotificationRatings: boolean; // Показывать рейтинги в уведомлениях
    betterAvatarExport: boolean; // Улучшенный экспорт аватара
    listTopicSections: boolean; // Список разделов тем
    ignoredSectionIds: number[]; // Игнорируемые разделы
    saveInputFields: boolean; // Сохранять содержимое полей ввода
    showSignatures: boolean; // Показывать подписи в темах форума
    simpleMainPage: boolean; // Упрощённая главная страница
    threadCreatorFrame: boolean; // Рамка вокруг создателя темы
    yourPostsFrame: boolean; // Рамка вокруг ваших постов
    followersFrame: boolean; // Рамка вокруг подписчиков
    ignoredByFrame: boolean; // Рамка вокруг игнорирующих вас
}

/**
 * Ключи настроек расширения
 */
export type ExtensionSettingKey = keyof ExtensionSettings;

/**
 * Дополнительные реактивные настройки
 */
export interface ExtraSettings {
    customSound: Ref<File | null>; // Пользовательский звук
    ignoredSections: Ref<IForumSections[]>; // Игнорируемые разделы (объекты)
}

/**
 * Реактивные настройки для работы с Vue
 */
export type ReactiveSettings = {
    [K in keyof ExtensionSettings]: Ref<ExtensionSettings[K]>;
} & ExtraSettings & { customSoundName: Ref<string>; };

// --- Конфигурация меню настроек ---

/**
 * Элемент чекбокса в настройках
 */
export interface CheckboxConfigurationItem {
    key: ExtensionSettingKey;
    title: string;
    type: 'checkbox';
    disabled?: boolean;
    isActiveConfigurations?: ConfigurationItem[];
}

/**
 * Элемент выпадающего списка в настройках
 */
export interface SelectConfigurationItem {
    key: ExtensionSettingKey;
    title: string;
    type: 'select';
    disabled?: boolean;
    options: string[];
    selected?: string;
    isActiveConfigurations?: ConfigurationItem[];
}

/**
 * Элемент произвольного типа в настройках
 */
export interface GenericConfigurationItem {
    key: ExtensionSettingKey;
    title: string;
    type: Exclude<string, 'checkbox' | 'select'>;
    disabled?: boolean;
    info?: string;
    isActiveConfigurations?: ConfigurationItem[];
}

/**
 * Элемент текстового поля в настройках
 */
export interface TextConfigurationItem {
    type: 'text';
    value: string;
}

/**
 * Универсальный тип элемента конфигурации
 */
export type ConfigurationItem =
    | CheckboxConfigurationItem
    | SelectConfigurationItem
    | TextConfigurationItem
    | GenericConfigurationItem;

/**
 * Секция меню настроек
 */
export interface MenuSection {
    title: string;
    configuration: ConfigurationItem[];
}

/**
 * Колонки меню настроек
 */
export interface MenuColumns {
    sections: MenuSection[];
}

/**
 * Главное меню настроек
 */
export interface Menu {
    columns: MenuColumns[];
}

// --- Форум, темы, пользователи ---

/**
 * Тема форума
 */
export interface Thread {
    id: string;
    title: string;
    replies_count: string;
    views_count: string;
    last_post_timestamp: string;
    pages: number;
    first_post: FirstPost;
    forum: Forum;
    user: User;
}

/**
 * Первый пост в теме
 */
export interface FirstPost {
    id: number;
    forum_id: number;
    topic_id: number;
    user_id: number;
    date_created: any[];
    message_state: string;
    content_html_stored: string;
    username: string;
    avatar_timestamp: string;
    user_nick_color: string;
    rated: any[];
    like_smiles_count: number;
    dislike_smiles_count: number;
    user_rated: any[];
    user_rewards: any[];
    is_ignored_user: boolean;
    link: string;
    timestamp: number;
    string: string;
}

/**
 * Раздел форума (детально)
 */
export interface Forum {
    id: number;
    title: string;
    description: string;
    node_id: number;
    last_post_id: number;
    last_topic_id: number;
    last_post_username: string;
    restrict_groups: any;
    node_type_id: string;
    prefix: string;
    link: string;
    icon: string;
}

/**
 * Пользователь форума
 */
export interface User {
    username: string;
    id: string;
    user_group_id: number;
    nick_color: string;
    group_nick_color: string;
    avatar_timestamp: number;
    link: string;
    avatar: string;
}

// --- Смайлы ---

/**
 * Смайл
 */
export interface ISmile {
    id: string;
    category_id: string;
    symbol: string;
    title: string;
    filename: string;
}

/**
 * Категория смайлов
 */
export interface ISmileCategory {
    id: string;
    name: string;
    img_tab_smile: string;
    date_created?: string | null;
    sort_order?: string;
}

// --- Глобальные объявления ---

declare global {
    interface Window {
        tinymce: any;
        Utils: {
            notify: (msg: string) => void;
        };
    }
}

// --- Уведомления ---

/**
 * Элемент уведомления
 */
export interface INotificationItem {
    id: string;
    type: string;
    data: {
        user_ids: number[];
        title: string;
    };
    news_id: number | null;
    forum_id: number | null;
    topic_id: number | null;
    message_id: number | null;
    post_id: number | null;
    smile_id: number | null;
    wall_post_id: number | null;
    wall_comment_id: number | null;
    description: string;
    date_created: number;
    user_id: number;
    user_id_sender: number;
    notify_id: number | null;
    is_readed: number;
    date_readed: any[];
    "sender.id": string;
    "sender.username": string;
    "sender.is_online": string;
    "sender.avatar_timestamp": number | null;
    link: string;
    avatar_link: string;
    sender_username: string;
    created_format: string;
}

export interface ICurrentUser {
    id: number;
    nickname: string;
}

export interface IWallPost {
    status: "ignoredByUser" | "success"
    data?: {
        comments_count: number
        content: string
        date_parsed: string
        date_unix: number
        id: number
        is_user_likes: boolean
        likes: any[]
        likes_count: number
        user_avatar: string
        user_id: number
        user_is_site_team: boolean
        user_nick_color: string
        username_c: string
        username_link: string
    }
}

export interface IFollowings {
    id: number;
    nickname: string;
}

export interface ParsedPageResult {
    users: IFollowings[];
    maxPage: number;
}


export type UserRelation = 'ignored' | 'subscriber' | 'neutral' | 'me' | 'error';

export interface Relation {
    id?: number;
    targetUserId: number;
    updatedAt: number;
    type: UserRelation
    nickname: string;
    signature: string;
}

export interface UserInfo {
    id: number;
    nickname: string;
    signature: string;
    type: UserRelation;
}

export interface StoredUserInfo {
    id: number;
    nickname: string;
    signature: string;
    relationType: UserRelation;
}