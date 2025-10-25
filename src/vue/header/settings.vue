<template>
	<a class="header__link" @click="showModal = true">
		<img :src="getExtUrl('assets/settings.svg')" />
	</a>
	<Modal v-model="showModal" title="Настройки расширения">
		<div class="settings-container hiddenScroll">
			<!-- Левое меню -->
			<div class="sidebar">
				<div
					v-for="(section, index) in menuSections"
					:key="section.title"
					:class="['menu-item', { active: selectedSectionIndex === index }]"
					@click="selectedSectionIndex = index"
				>
					<img :src="getExtUrl('assets/' + section.icon)" class="icon" />
					<span>{{ section.title }}</span>
				</div>
			</div>

			<!-- Контент секции -->
			<div class="section-content">
				<div
					v-for="(item, idx) in currentSection.items"
					:key="`${currentSection.title}-${idx}`"
					class="setting-item"
				>
					<!-- Чекбоксы -->
					<template v-if="item.type === 'checkbox'" class="checkbox-setting">
						<label :style="{ opacity: item.disabled ? 0.5 : 1 }">
							<input type="checkbox" :disabled="item.disabled" v-model="settings[item.key!]" />
							{{ item.text }}
						</label>
					</template>

					<!-- Текстовые элементы -->
					<template v-else-if="item.type === 'text'">
						<div v-html="item.text"></div>
					</template>

					<!-- Список разделов форума (пример) -->
					<template v-else-if="item.type === 'forum-sections'">
						<div v-if="forumSectionsLoading">Загрузка...</div>
						<div v-else>
							<div v-for="section in forumSections" :key="section.id" class="forum-section-item">
								<label>
									<input
										type="checkbox"
										:checked="settings.sectionsList.includes(section.id)"
										@change="toggleSection(section.id)"
									/>
									{{ section.name }}
								</label>
							</div>
						</div>
					</template>

					<!-- Кнопки -->
					<template v-else-if="item.type === 'button'">
						<button class="settings-button" @click="item.cb?.()">
							{{ item.text }}
						</button>
					</template>
				</div>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from "vue"
	import Modal from "../modal.vue"
	import { settings } from "../../storage"
	import { ForumSection, Settings, UserIgnoreList } from "../../types"
	import { extLogger } from "../../logger"
	import { sendToContent } from "../../extension/utils/communication"
	import { getExtUrl } from "../../utils/getExtUrl"
	import { saveFeedSettings } from "../../api/saveFeedSettings"
	import { getIgnoreList } from "../../api/getIgnoreList"
	import { parseForumSections } from "../../api/parseForumSections"

	const log = new extLogger("headerSettings.vue")

	// -----------------------------------
	// Типы
	// -----------------------------------
	interface MenuItem {
		type: "checkbox" | "text" | "forum-sections" | "button"
		text: string
		key?: keyof Settings
		disabled?: boolean
		cb?: () => void
	}

	interface MenuSection {
		title: string
		icon: string
		items: MenuItem[]
	}

	// -----------------------------------
	// Состояния
	// -----------------------------------
	const showModal = ref(false)
	const selectedSectionIndex = ref(0)

	const ignoredByMeList = ref("Загрузка...")
	const ignoredMeList = ref("Загрузка...")
	const forumSections = ref<ForumSection[]>([])
	const forumSectionsLoading = ref(false)

	// -----------------------------------
	// Методы
	// -----------------------------------
	const openSettings = async () => {
		showModal.value = true
		await loadSettings()
	}

	const loadSettings = async () => {
		try {
			// Загружаем списки игнорируемых пользователей
			await loadIgnoredLists()
			// Загружаем разделы форума
			await loadForumSections()
		} catch (error) {
			console.error("Ошибка загрузки настроек:", error)
		}
	}

	const toggleSection = async (id: number) => {
		const list = [...settings.sectionsList]
		const index = list.indexOf(id)
		if (index === -1) list.push(id)
		else list.splice(index, 1)
		settings.sectionsList = list

		saveFeedSettings({ ids: settings.sectionsList })
	}

	const createUserLink = (user: UserIgnoreList): string =>
		`<a href="https://dota2.ru/forum/members/.${user.id}/">${user.nickname}</a>`

	const formatUserList = (users: UserIgnoreList[], emptyMessage: string): string => {
		if (users.length === 0) return emptyMessage
		return users.map(createUserLink).join(", ")
	}

	// -----------------------------------
	// Загрузка данных
	// -----------------------------------
	const loadIgnoredLists = async () => {
		try {
			const ignoredUsers: any = [] //await getIgnoredUsers()
			ignoredMeList.value = formatUserList(ignoredUsers, "Никто вас не игнорирует")
			const ignoredUserList = await getIgnoreList({})
			ignoredByMeList.value = formatUserList(ignoredUserList, "Вы никого не игнорируете")
		} catch (error) {
			log.error("Ошибка при загрузке списков игнорирования:", error)
			ignoredMeList.value = "Ошибка загрузки"
			ignoredByMeList.value = "Ошибка загрузки"
		}
	}

	const loadForumSections = async () => {
		if (forumSectionsLoading.value) return // Предотвращаем повторные запросы

		forumSectionsLoading.value = true
		try {
			forumSections.value = await parseForumSections({})
		} catch (error) {
			console.error("Ошибка при загрузке разделов форума:", error)
			forumSections.value = []
		} finally {
			forumSectionsLoading.value = false
		}
	}

	// -----------------------------------
	// Меню
	// -----------------------------------
	const menuSections = computed<MenuSection[]>(() => [
		{
			title: "Инфо",
			icon: "info.svg",
			items: [
				{ type: "text", text: `<b>Версия расширения:</b> ${process.env.EXT_VERSION}` },
				{
					type: "text",
					text: "<b>Автор расширения:</b> <a href='/forum/members/.474212/' target='_blank'>S30N1K</a>",
				},
				{
					type: "text",
					text: "<b>Автор старого дизайна:</b> <a href='/forum/members/.818100/' target='_blank'>Руна дегенерации</a>",
				},
				{
					type: "text",
					text: "<b>Ссылка на исходник:</b> <a href='https://github.com/S30N1K/dota2.ru_ext' target='_blank'>GITHUB</a>",
				},
				{
					type: "text",
					text: "<b>Ссылка на группу Discord:</b> <a href='https://discord.gg/ptktuFEKyB' target='_blank'>Ядреное убежище</a>",
				},
				{
					type: "text",
					text: "<span style='color: #a33f3f'>Расширение распространяется бесплатно, если захотите поддержать:</span> <a href='https://boosty.to/s30n1k' target='_blank'>BOOSTY</a>",
				},
				{
					type: "text",
					text: "<span>Для получения новостей по расширению, можно подписаться</span> <a href='/forum/members/.474212/' target='_blank'>на мою страницу на форуме</a>",
				},
			],
		},
		{
			title: "Настройки редактора",
			icon: "editor.svg",
			items: [
				{ type: "checkbox", text: "Новая панель со смайлами", key: "newSmilesPanel" },
				{ type: "checkbox", text: "Вставка изображений по Ctrl+V", key: "imagePasteByCtrlV" },
				{
					type: "checkbox",
					text: "Сохранение содержимого полей ввода",
					key: "saveInputFieldsContent",
					disabled: true,
				},
			],
		},
		{
			title: "Стили",
			icon: "style.svg",
			items: [
				{ type: "checkbox", text: "Вернуть старое оформление", key: "restoreOldDesign" },
				{
					type: "checkbox",
					text: "Рамка вокруг создателя темы",
					key: "themeCreatorFrame",
					disabled: true,
				},
				{
					type: "checkbox",
					text: "Рамка вокруг ваших постов",
					key: "ownPostsFrame",
					disabled: true,
				},
				{
					type: "checkbox",
					text: "Рамка вокруг тех, кто на вас подписан",
					key: "followersFrame",
					disabled: true,
				},
				{
					type: "checkbox",
					text: "Рамка вокруг того, кто вас игнорирует",
					key: "ignoredUsersFrame",
					disabled: true,
				},
				{
					type: "checkbox",
					text: "Скрыть матчи из шапки",
					key: "hideMatchesFromHeader",
					disabled: true,
				},
				{ type: "checkbox", text: "Скрыть новости на главной", key: "hideNewsFromMain" },
			],
		},
		{
			title: "Форум",
			icon: "forum.svg",
			items: [
				{
					type: "checkbox",
					text: "Показывать подписи в темах форума",
					key: "showForumTopicCaptions",
					disabled: true,
				},
				{ type: "checkbox", text: "Новая панель оценок", key: "newRatingsPanel", disabled: true },
			],
		},
		{
			title: "Супер игнор",
			icon: "ignored.svg",
			items: [
				{ type: "checkbox", text: "Скрыть темы с главной", key: "hideTopicsFromMain" },
				{ type: "checkbox", text: "Скрыть сообщения с форума", key: "hideForumMessages" },
				{ type: "text", text: `<b>Список тех, кто вас игнорирует:</b> ${ignoredMeList.value}` },
				{ type: "text", text: `<b>Список тех, кого вы игнорируете:</b> ${ignoredByMeList.value}` },
			],
		},
		{
			title: "Разделы тем на главной",
			icon: "mainThemes.svg",
			items: [
				{ type: "checkbox", text: "Свои разделы тем на главной", key: "customTopicSections" },
				{ type: "text", text: `<b>Отметьте разделы, которые вы хотите видеть на главной</b>` },
				{ type: "forum-sections", text: "Список разделов форума" },
			],
		},
		{
			title: "Другое",
			icon: "other.svg",
			items: [
				{
					type: "checkbox",
					text: "Отображать последние диалоги при наведении",
					key: "showRecentDialogsOnHover",
				},
				{
					type: "checkbox",
					text: "Отображать последние уведомления при наведении",
					key: "showRecentNotificationsOnHover",
				},
				{
					type: "checkbox",
					text: "Отображать оценки в уведомлениях",
					key: "showRatingsInNotifications",
				},
				{
					type: "checkbox",
					text: "Улучшенное меню выгрузки аватара",
					key: "improvedAvatarUploadMenu",
					disabled: true,
				},
				{
					type: "checkbox",
					text: "Поиск пользователей через поиск в шапке",
					key: "searchUsersHeader",
				},
			],
		},
		{
			title: "Экспериментальные функции",
			icon: "experimental.svg",
			items: [
				{ type: "checkbox", text: "Включить чат", key: "chatEnabled" },
				{
					type: "button",
					text: "Сбросить все настройки",
					cb: async () => {
						if (confirm("Вы уверены, что хотите сбросить все настройки?")) {
							await sendToContent({
								type: "RESET_SETTINGS",
							})
							window.location.reload()
						}
					},
				},
			],
		},
	])

	const currentSection = computed(() => menuSections.value[selectedSectionIndex.value])

	onMounted(async () => {
		showModal.value = true
		await loadSettings()
	})
</script>
