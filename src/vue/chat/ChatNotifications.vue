<template>
  <transition name="slide-right">
    <div class="chatNotifications" v-show="isOpen">
      <div class="notification" v-for="notification in notifications" :key="notification.id">
        <div class="user">
          <img :src="notification.user.avatar" alt=""/>
          <span class="nickname">{{ notification.user.nickname }}</span>
        </div>
        <div class="notificationMessage" v-html="notification.message">
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import {watch, ref} from 'vue'
import {formatMessage, socket} from "./socket";
import {currentUser} from "../../storage";
import {ChatMessage} from "../../types";

const props = defineProps<{
  isOpen: boolean
}>()

const notifications = ref<ChatMessage[]>([])


socket.on("chatNotifications", async (data: ChatMessage[]) => {
  console.log("chatNotifications", data)
  for (const notification of data) {
    notification.message = (await formatMessage(notification)).message
    notifications.value.push(notification)
    console.log(notification)
  }
})

const load = async () => {
  socket.emit("getChatNotifications", {user_token: currentUser.token})
}

watch(
    () => props.isOpen,
    async (newVal) => {
      if (newVal) {
        await load()
      }
    }
)
</script>
