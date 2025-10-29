<template>
  <transition name="slide-right">
    <div class="chatNotifications" v-show="isOpen">
      <div class="notification" v-for="notification in notifications" :key="notification.id">
        <div class="user" @click="$emit('openUserProfile', $event, notification.user)">
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
import {formatMessage, socket, unreadNotificationsCount} from "./socket";
import {currentUser} from "../../storage";
import {ChatMessage, UserChat} from "../../types";

const props = defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  openUserProfile: [event: MouseEvent, user: UserChat]
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
        unreadNotificationsCount.value = 0
      }
    }
)
</script>
