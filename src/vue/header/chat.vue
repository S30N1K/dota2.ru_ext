<template>
	<a class="header__link" @click="chat?.toggle()">
		<img :src="getExtUrl('assets/chat.svg')" />
		<span v-show="unreadMessagesCount > 0">{{ unreadMessagesCount }}</span>
	</a>

	<Chat ref="chat" />
</template>
<script setup lang="ts">
	import { ref } from "vue"
	import Chat from "../chat/Chat.vue"
	import { unreadMessagesCount } from "../chat/socket"
	import { getExtUrl } from "../../utils/getExtUrl"

	const chat = ref<InstanceType<typeof Chat> | null>(null)
</script>
