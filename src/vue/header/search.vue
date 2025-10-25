<template>
	<ul class="searchUserHeader" v-show="isOpen">
		<li v-for="user in userList" @click="openNewTab(`/forum/members/.${user.id}/`)">
			<div class="searchAvatar">
				<img :src="user.avatar" :alt="user.name_parsed" />
			</div>
			<div class="searchUsername">
				{{ user.name }}
			</div>
		</li>
	</ul>
</template>
<script setup lang="ts">
	import { onMounted, ref, watch } from "vue"
	import { SearchUser, User } from "../../types"
	import { searchUser } from "../../api/searchUser"
	import { openNewTab } from "../../utils/openNewTab"

	const userList = ref<SearchUser[]>([])
	const isOpen = ref<boolean>(true)

	onMounted(() => {
		const searchInput = document.querySelector(".header__item-search__field") as HTMLInputElement

		searchInput?.addEventListener("input", async e => {
			const target = e.target as HTMLInputElement
			userList.value = await searchUser({ query: target.value })
		})

		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.type === "attributes" && mutation.attributeName === "class") {
					isOpen.value = !searchInput.classList.contains("hidden")
				}
			})
		})

		observer.observe(searchInput, { attributes: true })
	})
</script>
