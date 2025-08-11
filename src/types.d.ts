// Основные настройки расширения
import {UserRelation} from "./storage";

interface ExtensionConfig  {
    oldDesign: boolean; // Старый дизайн форума
    newSmilePanel: boolean; // Новая панель смайлов
    pasteImage: boolean; // Вставка изображений
    imgbbToken: string; // Токен imgbb
    soundNotifications: boolean; // Звуковые уведомления
    soundType: string; // Тип звука
    customSoundName: string; // Имя пользовательского звука
    hoverLastNotifications: boolean; // Наведение на последние уведомления
    hoverLastDialogs: boolean; // Наведение на последние уведомления
    showNotificationRatings: boolean; // Показывать рейтинги в уведомлениях
    betterAvatarExport: boolean; // Улучшенный экспорт аватара
    listTopicSections: boolean; // Свой список разделов тем на главной
    ignoredSectionIds: number[]; // Игнорируемые разделы
    saveInputFields: boolean; // Сохранять содержимое полей ввода
    showSignatures: boolean; // Показывать подписи в темах форума
    simpleMainPage: boolean; // Упрощённая главная страница
    threadCreatorFrame: boolean; // Рамка вокруг создателя темы
    yourPostsFrame: boolean; // Рамка вокруг ваших постов
    followersFrame: boolean; // Рамка вокруг подписчиков
    ignoredByFrame: boolean; // Рамка вокруг игнорирующих вас
    ignoreIndexThemes: boolean; // Игнорировать темы на главной
    ignoreForumPost: boolean; // Игнорировать посты на форуме
    newRatePanel: boolean; // Новая панель оценок
}

// Объявления для JSON модулей
declare module "*.json" {
    const value: any;
    export default value;
}

// Объявления для routes.json
export interface RouteDefinition {
    pattern: string;          // Регулярное выражение в виде строки
    scripts: string[];        // Пути к скриптам, которые надо загрузить
}

export interface ICurrentUser {
    id: number;
    nickname: string;
}

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



export interface IForumSections {
    name: string; // Название раздела
    id: number;   // Идентификатор раздела
}
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
export interface ISmileCategory {
    id: string;
    name: string;
    img_tab_smile: string;
    date_created?: string | null;
    sort_order?: string;
}
export interface ISmile {
    id: string;
    category_id: string;
    symbol: string;
    title: string;
    filename: string;
}

export type DomNode = {
    tag: string;
    attrs?: { [key: string]: string };
    innerHTML?: string;
    children?: Array<DomNode | string>;
};

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
    smile_id: string | null;
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
export interface IUserIgnoreList {
    targetUserId: number
    nickname: string
}


export interface ParsedPageResult {
    users: IFollowings[];
    maxPage: number;
}
export interface IFollowings {
    id: number;
    nickname: string;
}

export type UserRelation = 'ignored' | 'subscriber' | 'neutral' | 'me' | 'error';


export interface IinitTinyMcePlugins {
    pasteImage: boolean,
    newSmilesPanel: boolean
}

export interface  DialogList {
    user_id: string
    avatar_link: string
    date_created: number;
    description: string;
    title?: string;
}