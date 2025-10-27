<template>
  <div class="messages" ref="messagesContainer" @scroll="onScroll">
    <transition-group name="fade-up" tag="div">
      <!-- Группы сообщений по пользователю -->
      <div
          v-for="(group, gIndex) in groupedMessages"
          :key="gIndex"
          class="message-group"
      >
        <img
            class="avatar sticky-avatar"
            :src="group.user.avatar"
            :alt="group.user.nickname"
        />

        <div class="group-content">
          <!-- ник + дата первого сообщения -->
          <span
              class="username"
              @click="$emit('insertUser', group.user)"
          >
            {{ group.user.nickname }}
            <span class="time">{{ group.messages[0].time }}</span>
          </span>

          <div
              v-for="msg in group.messages"
              :key="msg.id"
              class="message"
              :id="'chat_message_'+msg.id"
              :class="{ pingMe: msg.pingMe, removed: msg.removed }"
              v-show="!msg.removed || msg.removed && currentUser.id === msg.user.id"
          >
            <div class="buttons" :class="{indent: chatSettings.openOnline}">
              <button>
                <img :src="getExtUrl('assets/ignored.svg')" alt=""/>
                {{ msg.id }}
              </button>
              <button v-if="currentUser.id !== group.user.id" @click="quote(msg)">
                <img :src="getExtUrl('assets/arrowUturnLeft.svg')" alt="Цитировать"/>
              </button>
              <button v-if="currentUser.id === group.user.id" @click="edit(msg)" style="display: none">
                <img :src="getExtUrl('assets/pencil.svg')" alt="Редактировать"/>
              </button>
              <button v-if="currentUser.id === group.user.id" @click="remove(msg)">
                <img :src="getExtUrl('assets/remove.svg')" alt="Удалить"/>
              </button>
            </div>
            <div class="reply" v-if="msg.reply" @click="scrollToMessage(msg.reply.message.id, 'smooth', 'center')">
              <div class="reply_user"><span>{{ msg.reply?.user.nickname }}</span> сказал(а)</div>
              <div class="reply_message" v-html="msg.reply?.message.message"></div>
            </div>
            <span class="text" v-html="msg.message"></span>
          </div>
        </div>
      </div>
    </transition-group>

    <div class="plug"></div>
  </div>
</template>


<script setup lang="ts">
import {ref, nextTick, computed} from "vue"
import {ChatMessage, UserChat} from "../../types"
import {addMessage, messages, quoteMessage, socket, unreadMessagesCount} from "./socket"
import {getExtUrl} from "../../utils/getExtUrl";
import {chatSettings, currentUser} from "../../storage";

defineEmits<{ insertUser: [user: UserChat] }>()

type scrollDirection = "up" | "down" | null

const messagesContainer = ref<HTMLElement | null>(null)
const scrolledToTop = ref(true)
const scrolledToBottom = ref(true)
const lastScrollTop = ref(0)
const scrollDirection = ref<scrollDirection>(null)

const quote = (message: ChatMessage) => {
  quoteMessage.value = message
}

const edit = (message: ChatMessage) => {

}

const remove = (message: ChatMessage) => {
  socket.emit("removeMessage", {message_id: message.id, user_token: currentUser.token})
}

// 🧩 Группируем сообщения по пользователю
const groupedMessages = computed(() => {
  const groups: {
    user: UserChat;
    messages: ChatMessage[];
  }[] = []
  for (const msg of messages.value) {
    const lastGroup = groups[groups.length - 1]
    if (!lastGroup || lastGroup.user.id !== msg.user.id) {
      groups.push({user: msg.user, messages: [msg]})
    } else {
      lastGroup.messages.push(msg)
    }
  }
  return groups
})

// --- scroll logic ---
const isScrolledToBottom = () => {
  if (!messagesContainer.value) return false
  const {scrollTop, scrollHeight, clientHeight} = messagesContainer.value
  return scrollTop + clientHeight >= scrollHeight - 20
}

const isScrolledToTop = () => {
  if (!messagesContainer.value) return false
  const {scrollTop} = messagesContainer.value
  return scrollTop < 10
}

const onScroll = async (event: any) => {
  const scrollTop = event.target.scrollTop
  if (scrollTop > lastScrollTop.value) scrollDirection.value = "down"
  else if (scrollTop < lastScrollTop.value) scrollDirection.value = "up"
  lastScrollTop.value = Math.max(scrollTop, 0)

  scrolledToBottom.value = isScrolledToBottom()
  if (scrollDirection.value === "down") {
    if (scrolledToBottom.value) unreadMessagesCount.value = 0
  } else if (scrollDirection.value === "up") {
    scrolledToTop.value = isScrolledToTop()
    if (scrolledToTop.value) await loadOldMessages()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (!messagesContainer.value) return
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    scrolledToBottom.value = true
    unreadMessagesCount.value = 0
  })
}

const scrollToBottomSmooth = () => {
  nextTick(() => {
    if (!messagesContainer.value) return
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: "smooth",
    })
    unreadMessagesCount.value = 0
  })
}

const scrollToMessage = (message_id: number, behavior: "smooth" | "auto", block: "start" | "end" | "center") => {
  const message = document.querySelector(`#chat_message_${message_id}`)

  if (!message) {
    return
  }

  message.scrollIntoView({
    behavior, block
  })

  message.classList.add("highlight")

  message.addEventListener('animationend', () => {
    message.classList.remove('highlight');
  }, {once: true});

}

// Пришло новое сообщение
socket.on("newMessage", async (data: ChatMessage) => {
  const shouldScroll = isScrolledToBottom()
  await addMessage(data)
  unreadMessagesCount.value++
  if (shouldScroll) scrollToBottom()
})

const waitOldMessages = ref<boolean>(false)

const loadOldMessages = async () => {
  if (waitOldMessages.value) {
    return
  }

  const [firstMessage] = messages.value || []
  if (!firstMessage) {
    return
  }


  waitOldMessages.value = true
  socket.emit("getOldMessages", {
    before: firstMessage.id
  })
}

// Пришла пачка старых сообщений
socket.on("oldMessages", async (data: ChatMessage[]) => {

  waitOldMessages.value = true

  const [firstMessage] = messages.value || []

  for (const message of data.reverse()) {
    await addMessage(message, false)
  }

  await nextTick()

  if (firstMessage) {
    scrollToMessage(firstMessage.id, "auto", "start")
  }

  await nextTick()

  waitOldMessages.value = false

})


defineExpose({
  scrollToBottom,
  scrollToBottomSmooth,
  isScrolledToBottom,
  messagesContainer,
  scrolledToBottom,
  scrollToMessage,
})
</script>
