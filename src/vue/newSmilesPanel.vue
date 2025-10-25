<template>
	<!-- Основной контейнер панели смайлов -->
	<div class="smilesPanel">
		<!-- Панель категорий смайлов -->
		<div class="categories hiddenScroll">
			<div
				class="category"
				v-for="category of categories"
				:key="category.id"
				@click="openCategory(category.id)"
				:class="{ active: activeCategory === category.id }"
			>
				<img
					:src="
						getSmileUrl(
							findSmileById(category.img_tab_smile) || {
								id: category.img_tab_smile,
								category_id: '',
								symbol: '',
								title: category.name,
								filename: category.img_tab_smile,
							}
						)
					"
					:title="category.name"
					:alt="category.name"
				/>
			</div>
		</div>

		<!-- Основная область смайлов -->
		<div class="smiles">
			<!-- Поисковая строка -->
			<div class="search">
				<input
					type="text"
					v-model="search"
					placeholder="Поиск"
					class="content-inline search_smile_input"
					@input="handleSearch"
				/>
			</div>

			<!-- Список смайлов -->
			<div class="list hiddenScroll">
				<!-- Сообщение для пустых избранных -->
				<template v-if="activeCategory === FAVORITES_CATEGORY_ID && currentSmiles.length === 0">
					<div class="empty-favorites">
						Тут пока ничего нет.<br />
						Для добавления смайла в этот список нажмите по нему — ПКМ.
					</div>
				</template>

				<!-- Список смайлов -->
				<template v-else>
					<div
						class="smile"
						v-for="smile of currentSmiles"
						:key="smile.id"
						@click="props.onSmile(smile)"
						@mouseenter="hoveredSmile = smile.id as string"
						@mouseleave="hoveredSmile = null"
						@contextmenu.prevent="showContextMenu($event, smile)"
						style="position: relative"
					>
						<img :src="getSmileUrl(smile)" :alt="smile.title" :title="smile.title" />
					</div>
				</template>
			</div>
		</div>
	</div>

	<!-- Контекстное меню -->
	<ContextMenu
		:visible="contextMenu.visible"
		:x="contextMenu.x"
		:y="contextMenu.y"
		:smile="contextMenu.smile"
		:is-favorite="isFavorite"
		@action="handleContextMenuAction"
		@close="hideContextMenu"
	/>
</template>

<script lang="ts" setup>
	import { onMounted, ref, computed, watch } from "vue"
	import { Smile, SmileCategory } from "../types"
	import ContextMenu from "./contextMenu.vue"
	import { getSmileUrl } from "../utils/getSmileUrl"
	import { getSmiles } from "../api/getSmiles"

	// ===== ПРОПСЫ =====
	const props = defineProps<{
		onSmile: (smile: Smile) => void
	}>()

	// ===== РЕАКТИВНЫЕ ДАННЫЕ =====
	const search = ref<string>("")
	const categories = ref<SmileCategory[]>([])
	const smiles = ref<Smile[]>([])
	const activeCategory = ref<string>("")
	const hoveredSmile = ref<string | null>(null)
	const favorites = ref<string[]>([])
	const contextMenu = ref<{
		visible: boolean
		x: number
		y: number
		smile: Smile | null
	}>({
		visible: false,
		x: 0,
		y: 0,
		smile: null,
	})

	// ===== КОНСТАНТЫ =====
	const FAVORITES_KEY = "smilesPanel_favorites"
	const LAST_CATEGORY_KEY = "smilesPanel_lastCategory"
	const FAVORITES_CATEGORY_ID = "-1"
	const DEFAULT_CATEGORY_ID = "14"

	// ===== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА =====
	const currentSmiles = computed<Smile[]>(() => {
		const searchQuery = search.value.trim().toLowerCase()

		if (searchQuery) {
			return smiles.value.filter(smile =>
				(smile.title as string).toLowerCase().includes(searchQuery)
			)
		}

		if (activeCategory.value === FAVORITES_CATEGORY_ID) {
			return smiles.value.filter(smile => favorites.value.includes(smile.id as string))
		}

		if (activeCategory.value) {
			return smiles.value.filter(smile => smile.category_id === activeCategory.value)
		}

		return []
	})

	// ===== МЕТОДЫ =====
	function openCategory(categoryId: string): void {
		activeCategory.value = categoryId
		localStorage.setItem(LAST_CATEGORY_KEY, categoryId)
	}

	function findSmileById(id: string): Smile | undefined {
		return smiles.value.find(smile => smile.id === id)
	}

	function isFavorite(smileId: string): boolean {
		return favorites.value.includes(smileId)
	}

	function toggleFavorite(smileId: string): void {
		const index = favorites.value.indexOf(smileId)
		if (index === -1) {
			favorites.value.push(smileId)
		} else {
			favorites.value.splice(index, 1)
		}
		saveFavorites()
	}

	function showContextMenu(event: MouseEvent, smile: Smile): void {
		contextMenu.value = {
			visible: true,
			x: event.clientX,
			y: event.clientY,
			smile,
		}
	}

	function hideContextMenu(): void {
		contextMenu.value.visible = false
		contextMenu.value.smile = null
	}

	function handleContextMenuAction(smile: Smile): void {
		toggleFavorite(smile.id as string)
	}

	function handleSearch(): void {
		// можно добавить debounce при необходимости
	}

	function saveFavorites(): void {
		try {
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
		} catch (error) {
			console.error("Ошибка сохранения избранных смайлов:", error)
		}
	}

	function loadFavorites(): void {
		try {
			const saved = localStorage.getItem(FAVORITES_KEY)
			if (saved) {
				const parsed = JSON.parse(saved)
				if (Array.isArray(parsed)) favorites.value = parsed
			}
		} catch (error) {
			console.error("Ошибка загрузки избранных смайлов:", error)
			favorites.value = []
		}
	}

	function loadLastCategory(): void {
		const last = localStorage.getItem(LAST_CATEGORY_KEY) || DEFAULT_CATEGORY_ID
		openCategory(last)
	}

	async function initializeSmiles(): Promise<void> {
		try {
			const smilesData = await getSmiles()

			if (smilesData) {
				categories.value = smilesData.categories
				smiles.value = smilesData.smiles

				const hasFavorites = categories.value.some(cat => cat.id === FAVORITES_CATEGORY_ID)

				if (!hasFavorites) {
					categories.value.unshift({
						id: FAVORITES_CATEGORY_ID,
						name: "Избранное",
						img_tab_smile: "729",
					})
				}
			}
		} catch (error) {
			console.error("Ошибка загрузки смайлов:", error)
		}
	}

	// ===== ЖИЗНЕННЫЙ ЦИКЛ =====
	onMounted(async () => {
		await initializeSmiles()
		loadFavorites()
		loadLastCategory()
	})

	// ===== ВАТЧЕРЫ =====
	watch(favorites, saveFavorites, { deep: true })
</script>
