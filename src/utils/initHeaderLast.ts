import { getDialogs } from "../api/getDialogs"
import { getNotifications } from "../api/getNotifications"
import { getSmiles } from "../api/getSmiles"
import { settings } from "../storage"
import { DomNode } from "../types"
import { createDomTree } from "./createDomTree"
import { forceUpdateTime } from "./forceUpdateTime"
import {extLogger} from "../logger";

const log = new extLogger("utils/initHeaderLast.ts")

// Общая функция для создания и добавления wrapper с нужными классами
function createWrapper(parent: Element | null): HTMLUListElement | null {
	if (!parent) return null

	const wrapper = document.createElement("ul")
	wrapper.classList.add(
		"ext-last-items",
		"header__sublist",
		"header__sublist--active",
		"hiddenScroll"
	)
	parent.appendChild(wrapper)

	return wrapper
}

// Общая функция для создания элемента уведомления/диалога
function createItemElement(data: {
	user_id: string | number
	avatar_link: string
	description: string
	date_created: string | number
	extraChildren?: DomNode[]
}) {
	const children: DomNode[] = [
		{
			tag: "div",
			attrs: { class: "avatar" },
			children: [
				{
					tag: "a",
					attrs: { href: `/forum/members/.${data.user_id}/` },
					children: [
						{
							tag: "img",
							attrs: { src: data.avatar_link },
						},
					],
				},
			],
		},
		{
			tag: "div",
			attrs: { class: "content-wrapper" },
			children: [
				{
					tag: "div",
					attrs: { class: "content" },
					innerHTML: data.description,
				},
				{
					tag: "time",
					attrs: { class: "time", "data-time": data.date_created.toString() },
				},
			],
		},
		...(data.extraChildren ?? []),
	]

	return createDomTree({
		tag: "div",
		attrs: { class: "item" },
		children,
	})
}

// Общая функция для инициализации всплывающего списка
async function initLastItems(parentSelector: string, fetchData: () => Promise<any[]>) {
	const el = document.querySelector(parentSelector)?.parentElement
	const wrapper = createWrapper(el as HTMLElement)
	if (!wrapper || !el) return

	let isInitialized = false

	el.addEventListener("mouseenter", async () => {
		wrapper.style.opacity = "100"
		wrapper.style.visibility = "visible"

		if (isInitialized) return

		const items = await fetchData()

		// Если нужны смайлы, загружаем их заранее (для уведомлений)
		let smilesMap: Map<string, string> | undefined
		if (settings?.showRatingsInNotifications) {
			const smilesList = await getSmiles()
			smilesMap = new Map(smilesList?.smiles.map((s: any) => [String(s.id), s.filename]))
		}

		for (const item of items) {
			const extraChildren = []

			// Для уведомлений с типом forum_post_liked добавляем эмотикон
			if (settings?.showRatingsInNotifications && item.type === "forum_post_liked" && smilesMap) {
				const imgFilename = smilesMap.get(String(item.smile_id))
				if (imgFilename) {
					extraChildren.push({
						tag: "div",
						attrs: { class: "emoticon" },
						children: [
							{
								tag: "img",
								attrs: { src: `/img/forum/emoticons/${imgFilename}` },
							},
						],
					})
				}
			}

			wrapper.appendChild(
				createItemElement({
					user_id: item.user_id,
					avatar_link: item.avatar_link,
					description: item.description,
					date_created: item.date_created,
					extraChildren,
				})
			)

			forceUpdateTime()
		}

		isInitialized = true
	})

	el.addEventListener("mouseleave", () => {
		wrapper.style.opacity = "0"
		wrapper.style.visibility = "collapse"
	})
}

export async function initLastDialogs() {
	await initLastItems('.header__link[href="/forum/conversations/"]', () => getDialogs({}))
}

export async function initLastNotifications() {
	await initLastItems('.header__link[href="/forum/notifications/"]', () =>
		getNotifications({ page: 1 })
	)
}
