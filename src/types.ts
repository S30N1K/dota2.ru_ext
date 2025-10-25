export type UserRelation = "ignored" | "subscriber" | "neutral" | "me" | "error"

export interface User {
	id: number
	nickname: string
	avatar: string
	token: string
	signature: string
	relationType: UserRelation
}

export interface SearchUser {
	id: string
	avatar_timestamp: string
	name: string
	name_parsed: string
	avatar: string
}

export interface UserChat extends Pick<User, "id" | "nickname" | "avatar"> {}

export interface UserIgnoreList extends Pick<User, "id" | "nickname"> {}

export interface CurrentUser extends Pick<User, "id" | "nickname" | "avatar" | "token"> {}

export interface UserInfo extends Pick<User, "id" | "nickname"> {
	signature: string
	type: UserRelation
}

export interface ChatMessage {
	id: number
	user: Pick<User, "id" | "nickname" | "avatar">
	message: string
	date: string
	pingMe: boolean
}

// Настройки чата
export interface ChatSettings {
    agreement: boolean
    openOnline: boolean
	isOpen: boolean
	isFullscreen: boolean
	x: number
	y: number
	width: number
	height: number
}

// Общие настройки приложения
export interface Settings {
	newSmilesPanel: boolean
	imagePasteByCtrlV: boolean
	saveInputFieldsContent: boolean
	restoreOldDesign: boolean
	themeCreatorFrame: boolean
	ownPostsFrame: boolean
	followersFrame: boolean
	ignoredUsersFrame: boolean
	showForumTopicCaptions: boolean
	newRatingsPanel: boolean
	hideTopicsFromMain: boolean
	hideForumMessages: boolean
	usersWhoIgnoreYouList: string[]
	ignoredUsersList: string[]
	customTopicSections: boolean
	sectionsList: number[]
	showRecentDialogsOnHover: boolean
	showRecentNotificationsOnHover: boolean
	showRatingsInNotifications: boolean
	improvedAvatarUploadMenu: boolean
	chatEnabled: boolean
	hideMatchesFromHeader: boolean
	hideNewsFromMain: boolean
	searchUsersHeader: boolean
}

export interface DatabaseTables {
	currentUser: Pick<User, "id" | "nickname" | "avatar" | "token">
	chatSettings: ChatSettings
	settings: Settings
	users: User[]
}

export interface DomNode {
	tag: string
	attrs?: Record<string, string>
	innerHTML?: string
	children?: Array<DomNode | string>
	click?: EventListener
	[key: string]: any
}

export interface SmileCategory {
	id: string
	name: string
	img_tab_smile: string
	date_created?: string | null
	sort_order?: string
}

export interface Smile {
	id?: string
	category_id?: string
	symbol: string
	title?: string
	filename?: string
}

export interface CachedSmiles {
	categories: SmileCategory[]
	smiles: Smile[]
}

export interface ForumSection {
	name: string
	id: number
}

export interface ForumThread {
	id: string
	title: string
	replies_count: string
	views_count: string
	last_post_timestamp: string
	pages: number
	first_post: any // не помню что тут было
	forum: any // тут тоже
	user: User
}

export interface NotificationItem {
	id: string
	type: string
	data: {
		user_ids: number[]
		title: string
	}
	news_id: number | null
	forum_id: number | null
	topic_id: number | null
	message_id: number | null
	post_id: number | null
	smile_id: string | null
	wall_post_id: number | null
	wall_comment_id: number | null
	description: string
	date_created: number
	user_id: number
	user_id_sender: number
	notify_id: number | null
	is_readed: number
	date_readed: any[]
	"sender.id": string
	"sender.username": string
	"sender.is_online": string
	"sender.avatar_timestamp": number | null
	link: string
	avatar_link: string
	sender_username: string
	created_format: string
}

export interface WallPost {
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

export interface DialogList {
	user_id: string
	avatar_link: string
	date_created: number
	description: string
	title?: string
}

export interface RequestCreateConversationNew {
	status: "success" | "invalidRecipientBanned" | "accessDenied"
	id?: number
	shortName?: string
}

export interface RequestSetRateOnPost {
	status: "success" | "invalidRecipientBanned" | "accessDenied"
}

export interface ResponseSetRateOnPost {
	pid: number
	smileId: number
}
