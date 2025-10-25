interface Route {
	pattern: string
	scripts: string[]
}

export const routes: Route[] = [
	{
		pattern: "^/$",
		scripts: ["pages/index.js"],
	},
	{
		pattern: "^/forum/threads/*.*/*",
		scripts: ["pages/forum-thread.js"],
	},
	{
		pattern: "^/forum/forums/*.*/create-thread/",
		scripts: ["pages/create-thread.js"],
	},
	{
		pattern: "^/forum/settings/.*",
		scripts: ["pages/settings.js"],
	},
	{
		pattern: "^/forum/notifications/.*",
		scripts: ["pages/notifications.js"],
	},
	{
		pattern: "^/forum/members/.*",
		scripts: ["pages/members.js"],
	},
	{
		pattern: "^/forum/conversation/.*",
		scripts: ["pages/conversation.js"],
	},
]
