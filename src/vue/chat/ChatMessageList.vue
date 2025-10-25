<template>
	<div class="messages" ref="messagesContainer" @scroll="onScroll">
		<transition-group name="fade-up" tag="div">
			<div
				v-for="(msg, index) in messages"
				:key="msg.id"
				class="message"
				:class="{ pingMe: msg.pingMe }"
			>
				<img class="avatar" :src="msg.user.avatar" />
				<div class="content">
					<span class="username" @click="$emit('insertUser', msg.user)">
						{{ msg.user.nickname }}
						<span class="time">{{ msg.date }}</span>
					</span>
					<span class="text" v-html="msg.message"></span>
				</div>
			</div>
		</transition-group>
		<div class="plug"></div>
	</div>
</template>

<script setup lang="ts">
	import { ref, nextTick, computed } from "vue"
	import { UserChat } from "../../types"
	import { addMessage, messages, socket, unreadMessagesCount } from "./socket"

	defineEmits<{ insertUser: [user: UserChat] }>()

	const messagesContainer = ref<HTMLElement | null>(null)
	const scrolledToBottom = ref(true)

	const isScrolledToBottom = () => {
		if (!messagesContainer.value) return false
		const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
		return scrollTop + clientHeight >= scrollHeight - 20
	}

	const onScroll = () => {
		scrolledToBottom.value = isScrolledToBottom()
		if (scrolledToBottom.value) {
			unreadMessagesCount.value = 0
		}
	}

	const scrollToBottom = () => {
		nextTick(() => {
			if (!messagesContainer.value || !messagesContainer.value?.offsetHeight) return
			messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
			scrolledToBottom.value = true
			unreadMessagesCount.value = 0
		})
	}

	const scrollToBottomSmooth = () => {
		nextTick(() => {
			if (!messagesContainer.value || !messagesContainer.value?.offsetHeight) return
			messagesContainer.value.scrollTo({
				top: messagesContainer.value.scrollHeight,
				behavior: "smooth",
			})
			unreadMessagesCount.value = 0
		})
	}

	socket.on(
		"newMessage",
		async (data: { user: UserChat; message: string; time: Date; id: number }) => {
			const { user, message, time, id } = data
			const shouldScroll = isScrolledToBottom()
			await addMessage(id, user, message, time)
			unreadMessagesCount.value++
			if (shouldScroll) scrollToBottom()
		}
	)

	defineExpose({
		scrollToBottom,
		scrollToBottomSmooth,
		isScrolledToBottom,
		messagesContainer,
		scrolledToBottom,
	})
</script>
