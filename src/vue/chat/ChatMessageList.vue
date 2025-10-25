<template>
  <div class="messages" ref="messagesContainer" @scroll="onScroll">
    <transition-group name="fade-up" tag="div">
      <div
          v-for="(msg, index) in messages"
          :key="msg.id"
          class="message"
          :class="{ pingMe: msg.pingMe }"
      >
        <img class="avatar" :src="msg.user.avatar"/>
        <div class="content" :id="'chat_message_'+msg.id">
					<span class="username" @click="$emit('insertUser', msg.user)">
						{{ msg.user.nickname }}
						<span class="time">{{ msg.date }} {{ msg.id }}</span>
					</span>
          <span class="text" v-html="msg.message"></span>
        </div>
      </div>
    </transition-group>
    <div class="plug"></div>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, computed} from "vue"
import {UserChat} from "../../types"
import {addMessage, loadOldMessages, messages, socket, unreadMessagesCount} from "./socket"

defineEmits<{ insertUser: [user: UserChat] }>()

type scrollDirection = "up" | "down" | null

const messagesContainer = ref<HTMLElement | null>(null)
const scrolledToTop = ref(true)
const scrolledToBottom = ref(true)
const lastScrollTop = ref(0)
const scrollDirection = ref<scrollDirection>(null)

const isScrolledToBottom = () => {
  if (!messagesContainer.value) return false
  const {scrollTop, scrollHeight, clientHeight} = messagesContainer.value
  return scrollTop + clientHeight >= scrollHeight - 20
}
const isScrolledToTop = () => {
  if (!messagesContainer.value) return false
  const {scrollTop} = messagesContainer.value
  return scrollTop <= 100
}

const onScroll = async (event: any) => {
  const scrollTop = event.target.scrollTop

  if (scrollTop > lastScrollTop.value) {
    scrollDirection.value = 'down'
  } else if (scrollTop < lastScrollTop.value) {
    scrollDirection.value = 'up'
  }

  lastScrollTop.value = scrollTop <= 0 ? 0 : scrollTop


  switch (scrollDirection.value) {
    case "down": {
      scrolledToBottom.value = isScrolledToBottom()
      if (scrolledToBottom.value) {
        unreadMessagesCount.value = 0
        console.log("down")
      }
      break
    }
    case "up": {
      scrolledToTop.value = isScrolledToTop()
      if (scrolledToTop.value) {
        await loadOldMessages()
      }
      break
    }
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
      const {user, message, time, id} = data
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
