export interface IForumSections {
    name: string;
    id: number;
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

export interface ISmile {
    id: string;
    category_id: string;
    symbol: string;
    title: string;
    filename: string;
}

export interface ISmileCategory {
    id: string;
    name: string;
    img_tab_smile: string;
    date_created?: string | null;
    sort_order?: string;
}

export interface ExtensionSettings {
    oldDesign: boolean;
    newSmilePanel: boolean;
    pasteImage: boolean;
    imgbbToken: string;
    soundNotifications: boolean;
    soundType: string;
    customSoundName: string;
    hoverLastNotifications: boolean;
    showNotificationRatings: boolean;
    betterAvatarExport: boolean;
    listTopicSections: boolean;
    ignoredSectionIds: number[];
}


declare global {
    interface Window {
        tinymce: any;
        Utils: {
            notify: (msg: string) => void;
        };
    }
}

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