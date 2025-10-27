<template>
	<div class="interaction-footer">
		<NewSmilesPanel :onSmile="onSmile" v-if="isOpenSmiles" />

		<div class="scroll-bottom-btn">
			<button
				v-show="!scrolledToBottom || unreadMessagesCount"
				class=""
				@click="$emit('scrollToBottom')"
			>
				<img :src="getExtUrl('assets/arrowCircleBottom.svg')" />
				<span v-show="unreadMessages">{{ unreadMessages }}</span>
			</button>
		</div>

		<div class="typingUsers">
			<span v-if="usersTyping.length">
				<span>{{ typingText }}</span>
				<span class="dots"><span></span><span></span><span></span></span>
			</span>
		</div>

    <div class="quote" v-if="quoteMessage">
      <div>
        Ответ на сообщение пользователя <span>{{ quoteMessage.user.nickname }}</span>
      </div>
      <button @click="quoteMessage = null">
        <img :src="getExtUrl('assets/close.svg')" alt="отмена"/>
      </button>
    </div>

		<div class="editor">
			<ChatInput ref="chatInput" />
			<button class="smile-btn" @click="toggleSmilesPanel">
				<img :src="getExtUrl('assets/smile.svg')" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, toRaw } from "vue"
	import ChatInput from "./chatInput.vue"
	import { Smile } from "../../types"
	import NewSmilesPanel from "../newSmilesPanel.vue"
  import {quoteMessage, unreadMessagesCount, usersTyping} from "./socket"
	import { getExtUrl } from "../../utils/getExtUrl"
	import { declineWord } from "../../utils/declineWord"

	const props = defineProps<{
		scrolledToBottom: boolean
	}>()

	const emit = defineEmits<{
		insertSmile: [smile: Smile]
		scrollToBottom: []
	}>()

	const chatInput = ref<InstanceType<typeof ChatInput> | null>(null)
	const isOpenSmiles = ref<boolean>(false)

	const onSmile = (smile: Smile) => {
		smile.filename = `/img/forum/emoticons/${smile.filename}`
		emit("insertSmile", smile)
		chatInput.value?.insertSmile(smile)
	}

	const toggleSmilesPanel = () => {
		isOpenSmiles.value = !isOpenSmiles.value
	}

	const insertUser = (user: any) => {
		chatInput.value?.insertUser(user)
	}

	const insertSmile = (smile: any) => {
		chatInput.value?.insertSmile(smile)
	}

	const clearInput = () => {
		if (chatInput.value?.$refs.editor) {
			const el = chatInput.value.$refs.editor as HTMLDivElement
			el.innerText = ""
			el.focus()
		}
	}

	const typingText = computed(() => {
		const users = usersTyping.value
		const count = users.length
		if (!count) return ""

		const names = users.map(u => u.nickname)

		switch (count) {
			case 1:
				return `${names[0]} печатает`
			case 2:
				return `${names[0]} и ${names[1]} печатают`
			case 3:
				return `${names.slice(0, 2).join(", ")} и ${names[2]} печатают`
			default:
				return `${names[0]} и ещё ${count - 1} ${declineWord(count - 1, ["пользователь", "пользователя", "пользователей"])} печатают`
		}
	})

	const unreadMessages = computed(() => {
		const count = unreadMessagesCount.value

		if (count === 0) {
			return ""
		}

		return `${count} ${declineWord(count, ["новое", "новых", "новых"])} ${declineWord(count, ["сообщение", "сообщения", "сообщений"])}`
	})

	defineExpose({ insertUser, insertSmile, clearInput })
</script>
