import type { User, ChatSettings, Settings, CurrentUser } from "../../types"

export const DEFAULT_CURRENTUSER: CurrentUser = {
	id: 0,
	nickname: "",
	avatar: "",
	token: "",
}
export const DEFAULT_CHAT: ChatSettings = {
    agreement: false,
    openOnline: false,
	isOpen: false,
	isFullscreen: false,
	x: 0,
	y: 0,
	width: 300,
	height: 400,
}
export const DEFAULT_SETTINGS: Settings = {
	newSmilesPanel: false,
	imagePasteByCtrlV: false,
	saveInputFieldsContent: false,
	restoreOldDesign: false,
	themeCreatorFrame: false,
	ownPostsFrame: false,
	followersFrame: false,
	ignoredUsersFrame: false,
	showForumTopicCaptions: false,
	newRatingsPanel: false,
	hideTopicsFromMain: false,
	hideForumMessages: false,
	usersWhoIgnoreYouList: [],
	ignoredUsersList: [],
	customTopicSections: false,
	sectionsList: [],
	showRecentDialogsOnHover: false,
	showRecentNotificationsOnHover: false,
	showRatingsInNotifications: false,
	improvedAvatarUploadMenu: false,
	chatEnabled: true,
	hideMatchesFromHeader: false,
	hideNewsFromMain: false,
	searchUsersHeader: false,
}
