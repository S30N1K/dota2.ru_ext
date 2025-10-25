<template>
	<div class="chat-input-wrapper">
		<div
			class="chat-input"
			ref="editor"
			contenteditable="true"
			@input="handleInput"
			@keydown="onKeyDown"
			@click="saveCaret"
			@blur="saveCaret"
			@paste="onPaste"
			placeholder="Написать сообщение..."
		></div>

		<ul v-if="suggestions.length" class="suggestions" :style="{ bottom: inputHeight + 'px' }">
			<li
				v-for="(item, i) in suggestions"
				:key="i"
				:class="{ active: i === selectedIndex }"
				@mousedown.prevent="selectSuggestion(item)"
			>
				<template v-if="trigger === '@'">
					<img class="avatar" :src="item.avatar" />
					{{ item.label }}
				</template>
				<template v-else>
					<img class="emoji" :src="item.image" />
					{{ item.label }}
				</template>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue"
	import { UserChat, Smile, SearchUser } from "../../types"
	import { socket } from "./socket"
	import { currentUser } from "../../storage"
	import { getSmiles } from "../../api/getSmiles"
	import { searchUser } from "../../api/searchUser"
	import { throttle } from "../../utils/throttle"
	import { getSmileUrl } from "../../utils/getSmileUrl"

	/* -------------------- Типы -------------------- */

	type Suggestion = {
		label: string
		value: string
		id?: number
		avatar?: string
		image?: string
	}

	type TriggerType = "@" | ":" | null

	/* -------------------- Пропсы -------------------- */

	/* -------------------- Эмиты -------------------- */

	const emit = defineEmits<{
		(e: "input", value: string): void
	}>()

	/* -------------------- Рефы -------------------- */

	const editor = ref<HTMLDivElement | null>(null)
	const trigger = ref<TriggerType>(null)
	const suggestions = ref<Suggestion[]>([])
	const selectedIndex = ref<number>(0)
	const savedRange = ref<Range | null>(null)
	const inputHeight = ref<number>(0)

	/* -------------------- Утилиты -------------------- */

	const adjustHeight = () => {
		if (!editor.value) return
		editor.value.style.height = "auto"
		const max = 80
		editor.value.style.height = Math.min(editor.value.scrollHeight, max) + "px"
		inputHeight.value = editor.value.offsetHeight
	}

	const saveCaret = () => {
		const sel = window.getSelection()
		if (sel && sel.rangeCount) {
			savedRange.value = sel.getRangeAt(0).cloneRange()
		}
	}

	function restoreCaret() {
		if (!savedRange.value) return
		const sel = window.getSelection()
		if (!sel) return
		sel.removeAllRanges()
		sel.addRange(savedRange.value)
	}

	function getCaretOffset(el: HTMLElement): number {
		const sel = window.getSelection()
		if (!sel || !sel.rangeCount) return 0
		const range = sel.getRangeAt(0).cloneRange()
		range.selectNodeContents(el)
		range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset)
		return range.toString().length
	}

	/**
	 * Вставляет node в текущую позицию курсора (или в сохранённую savedRange).
	 * После вставки ставит каретку после вставленного узла.
	 */
	const insertNodeAtCaret = (node: Node) => {
		if (!editor.value) return
		editor.value.focus()

		let sel = window.getSelection()
		if (!sel) {
			return
		}
		// если нет активного диапазона — восстановим последний сохранённый
		if (!sel.rangeCount && savedRange.value) {
			restoreCaret()
			sel = window.getSelection()
			if (!sel) return
		}

		const range = sel.rangeCount ? sel.getRangeAt(0) : savedRange.value
		if (!range) return

		// удалим выделение (если что-то выделено)
		range.deleteContents()

		// вставим узел
		range.insertNode(node)

		// поставим каретку после вставленного узла
		const after = document.createRange()
		after.setStartAfter(node)
		after.collapse(true)
		sel.removeAllRanges()
		sel.addRange(after)

		saveCaret()
		adjustHeight()
	}

	async function searchEmojis(query: string) {
		const smiles = await getSmiles()
		return smiles.smiles.filter(smile => smile.title!.toLowerCase().includes(query)).slice(0, 10)
	}

	async function searchUsers(query: string): Promise<UserChat[]> {
		const results: SearchUser[] = await searchUser({ query })
		return results.map(
			(e): UserChat => ({
				id: Number(e.id),
				nickname: e.name,
				avatar: e.avatar,
			})
		)
	}

	/* -------------------- Методы вставки -------------------- */

	const insertUser = (user: UserChat) => {
		const span = document.createElement("span")
		span.className = "user-tag"
		span.contentEditable = "false"
		span.dataset.userId = String(user.id)
		span.dataset.nickname = user.nickname
		span.textContent = user.nickname
		insertNodeAtCaret(span)
		if (!editor.value) return
		emit("input", editor.value.innerText)
	}

	const insertSmile = (emoji: Smile) => {
		console.log(emoji)
		const img = document.createElement("img")
		img.className = "emoji"
		img.contentEditable = "false"
		img.dataset.code = emoji.symbol
		img.dataset.id = emoji.id
		img.src = emoji.filename || ""
		img.alt = emoji.symbol
		insertNodeAtCaret(img)
		if (!editor.value) return
		emit("input", editor.value.innerText)
	}

	defineExpose({
		insertUser,
		insertSmile,
	})

	/* -------------------- Обработка ввода -------------------- */

	function typing() {
		socket.emit("sendTyping", {
			token: currentUser.token,
		})
	}

	const throttledTyping = throttle(typing, 2500)

	const handleInput = async () => {
		if (!editor.value) return
		saveCaret()

		const text = editor.value.innerText
		throttledTyping()

		const textBefore = text.slice(0, getCaretOffset(editor.value))
		const atMatch = /@([\wа-яё]*)$/.exec(textBefore)
		const colonMatch = /:([\wа-яё]*)$/.exec(textBefore)

		if (atMatch) {
			trigger.value = "@"
			const query = atMatch[1].toLowerCase()
			const users = await Promise.resolve(searchUsers(query))
			suggestions.value = users.map(u => ({
				label: u.nickname,
				id: u.id,
				avatar: u.avatar,
				value: u.nickname,
			}))
			selectedIndex.value = 0
		} else if (colonMatch) {
			trigger.value = ":"
			const query = colonMatch[1].toLowerCase()
			const emojis = await Promise.resolve(searchEmojis(query))
			suggestions.value = emojis.map(e => ({
				id: e.id as unknown as number,
				label: e.symbol,
				value: e.symbol,
				image: getSmileUrl(e),
			}))
			selectedIndex.value = 0
		} else {
			trigger.value = null
			suggestions.value = []
		}

		adjustHeight()
	}

	/* -------------------- Перенос строки (Shift+Enter) -------------------- */

	/**
	 * Корректно вставляет <br> + невидимый нулевой символ, чтобы
	 * курсор оказался после переноса и дальнейший набор не ломал структуру.
	 */
	const insertLineBreak = () => {
		if (!editor.value) return
		editor.value.focus()

		let sel = window.getSelection()
		if (!sel) return

		// если нет активного диапазона — восстановим последний сохранённый
		if (!sel.rangeCount && savedRange.value) {
			restoreCaret()
			sel = window.getSelection()
			if (!sel) return
		}
		const range = sel.rangeCount ? sel.getRangeAt(0) : savedRange.value
		if (!range) return

		// удаляем выделенный фрагмент (если есть)
		range.deleteContents()

		// создаём br и невидимый символ после него
		const br = document.createElement("br")
		range.insertNode(br)

		const zwsp = document.createTextNode("\u200B")
		br.parentNode?.insertBefore(zwsp, br.nextSibling)

		// ставим каретку после zwsp
		const newRange = document.createRange()
		newRange.setStartAfter(zwsp)
		newRange.collapse(true)

		sel.removeAllRanges()
		sel.addRange(newRange)

		saveCaret()
		adjustHeight()
	}

	/* -------------------- Клавиатура -------------------- */

	const onKeyDown = (e: KeyboardEvent) => {
		if (suggestions.value.length) {
			if (e.key === "ArrowDown") {
				e.preventDefault()
				selectedIndex.value = (selectedIndex.value + 1) % suggestions.value.length
				return
			}
			if (e.key === "ArrowUp") {
				e.preventDefault()
				selectedIndex.value =
					(selectedIndex.value - 1 + suggestions.value.length) % suggestions.value.length
				return
			}
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault()
				selectSuggestion(suggestions.value[selectedIndex.value])
				return
			}
			if (e.key === "Escape") {
				suggestions.value = []
				trigger.value = null
				return
			}
		}

		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			sendMessage()
			return
		}

		if (e.key === "Enter" && e.shiftKey) {
			e.preventDefault()
			insertLineBreak()
			return
		}
	}

	/* -------------------- Выбор подсказки -------------------- */

	const removeTriggerText = () => {
		if (!editor.value || !savedRange.value || !trigger.value) return

		const sel = window.getSelection()
		if (!sel) return
		sel.removeAllRanges()
		sel.addRange(savedRange.value)

		const range = sel.getRangeAt(0)
		const container = range.startContainer
		if (container.nodeType === Node.TEXT_NODE) {
			const node = container as Text
			const text = node.textContent ?? ""
			const caretPos = range.startOffset
			const trigIndex = text.lastIndexOf(trigger.value, caretPos - 1)
			if (trigIndex >= 0) {
				// удаляем триггер и текст между ним и курсором
				node.textContent = text.slice(0, trigIndex) + text.slice(caretPos)
				const newRange = document.createRange()
				newRange.setStart(node, trigIndex)
				newRange.collapse(true)
				sel.removeAllRanges()
				sel.addRange(newRange)
				saveCaret()
			}
			return
		}

		// Если контейнер — не текстовый узел, попытаемся найти текстовый узел слева
		// и удалить триггер там — простая эвристика
		let cur: Node | null = container
		while (cur && cur.nodeType !== Node.TEXT_NODE) {
			cur = cur.childNodes[range.startOffset - 1] || cur.previousSibling
		}
		if (cur && cur.nodeType === Node.TEXT_NODE) {
			const node = cur as Text
			const text = node.textContent ?? ""
			const caretPos = (node.textContent || "").length
			const trigIndex = text.lastIndexOf(trigger.value, caretPos - 1)
			if (trigIndex >= 0) {
				node.textContent = text.slice(0, trigIndex) + text.slice(caretPos)
				const newRange = document.createRange()
				newRange.setStart(node, trigIndex)
				newRange.collapse(true)
				sel.removeAllRanges()
				sel.addRange(newRange)
				saveCaret()
			}
		}
	}

	const selectSuggestion = (item: Suggestion) => {
		// удаляем триггер и текст после него
		removeTriggerText()

		// вставляем объект
		if (trigger.value === "@") {
			insertUser({
				id: item.id!,
				nickname: item.label,
				avatar: item.avatar || "",
			})
		} else if (trigger.value === ":") {
			insertSmile({
				id: item.id as unknown as string,
				symbol: item.value,
				filename: item.image || "",
			})
		}

		trigger.value = null
		suggestions.value = []
	}

	/* -------------------- Отправка -------------------- */

	const sendMessage = () => {
		if (!editor.value) return
		const clone = editor.value.cloneNode(true) as HTMLElement

		clone.querySelectorAll<HTMLSpanElement>("span.user-tag").forEach(span => {
			const id = span.dataset.userId
			const nick = span.dataset.nickname
			if (id && nick) span.replaceWith(document.createTextNode(`[user|${id}|${nick}]`))
		})

		clone.querySelectorAll<HTMLImageElement>("img.emoji").forEach(img => {
			const id = img.dataset.id
			if (id) img.replaceWith(document.createTextNode(`[smile|${id}]`))
		})

		// заменим <br> на маркер, при этом соседний \u200B останется, но innerText будет корректен
		clone.querySelectorAll("br").forEach(br => {
			br.replaceWith(document.createTextNode("[br]"))
		})

		// Уберём возможные нулевые символы в начале/конце и лишние пробелы
		const text = clone.innerText.replace(/\u200B/g, "").trim()
		if (!text) return

		socket.emit("sendMessage", {
			user_token: currentUser.token,
			message: text,
		})

		editor.value.innerHTML = ""
		trigger.value = null
		suggestions.value = []
		adjustHeight()
	}

	/* -------------------- Вставка без форматирования -------------------- */

	const onPaste = (e: ClipboardEvent) => {
		e.preventDefault()
		const text = e.clipboardData?.getData("text/plain") || ""
		document.execCommand("insertText", false, text)
	}
</script>
