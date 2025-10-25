<template>
	<div
		v-if="visible && smile"
		class="context-menu"
		:style="{
			position: 'fixed',
			left: x + 'px',
			top: y + 'px',
			zIndex: 1000,
		}"
		@click.stop
	>
		<div class="context-menu-item" @click="handleAction(smile!)">
			{{ isFavorite(smile.id) ? "Убрать из избранного" : "Добавить в избранное" }}
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { watch } from "vue"
	import { Smile } from "../types"

	// ===== ПРОПСЫ =====
	interface Props {
		visible: boolean
		x: number
		y: number
		smile: Smile | null
		isFavorite: (smileId: string) => boolean
	}

	const props = defineProps<Props>()

	// ===== ЭМИТТЕРЫ =====
	const emit = defineEmits<{
		action: [smile: Smile]
		close: []
	}>()

	// ===== МЕТОДЫ =====
	/**
	 * Обрабатывает действие контекстного меню
	 * @param smile - Смайл для которого выполняется действие
	 */
	function handleAction(smile: Smile): void {
		emit("action", smile)
		emit("close")
	}

	// ===== ВАТЧЕРЫ =====
	// Автоматически закрываем меню при клике вне его
	watch(
		() => props.visible,
		newVisible => {
			if (newVisible) {
				// Закрываем контекстное меню при клике в любом месте
				document.addEventListener("click", handleOutsideClick, { once: true })
			}
		}
	)

	/**
	 * Обрабатывает клик вне контекстного меню
	 */
	function handleOutsideClick(): void {
		emit("close")
	}
</script>

<style scoped>
	.context-menu {
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		min-width: 180px;
		padding: 4px 0;
	}

	.context-menu-item {
		padding: 8px 16px;
		cursor: pointer;
		font-size: 14px;
		color: #333;
		transition: background-color 0.2s;
	}

	.context-menu-item:hover {
		background-color: #f5f5f5;
	}
</style>
