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
            <span class="time">{{ group.messages[0].date }}</span>
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
            <div class="reply" v-if="msg.reply">
              <div class="reply_user"><span>{{ msg.reply?.user.nickname }}</span> сказал(а)</div>
              <div class="reply_message">{{ msg.reply.message }}</div>
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
  return scrollTop <= 300
}

const onScroll = async (event: any) => {
  const scrollTop = event.target.scrollTop
  if (scrollTop > lastScrollTop.value) scrollDirection.value = "down"
  else if (scrollTop < lastScrollTop.value) scrollDirection.value = "up"
  lastScrollTop.value = Math.max(scrollTop, 0)

  if (scrollDirection.value === "down") {
    scrolledToBottom.value = isScrolledToBottom()
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

socket.on("newMessage", async (data: {
  user: UserChat; message: string; time: Date; id: number
  removed: boolean;
  reply: null | {
    user: {
      id: number,
      nickname: string,
      avatar: string
    }, message: string
  }
}) => {
  const {user, message, time, id} = data
  const shouldScroll = isScrolledToBottom()
  await addMessage(id, user, message, time, data.removed, data.reply)
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

// При получении пачки старых сообщений


// ---- helpers: якорь до/после рендера ----
const captureAnchor = () => {
  const c = messagesContainer.value
  if (!c) return null

  const containerTop = c.getBoundingClientRect().top
  // Берём первый элемент, который пересекает текущий scrollTop (реально "на экране")
  const items = Array.from(c.querySelectorAll<HTMLDivElement>('.message'))
  const anchorEl = items.find(el => {
    const top = el.offsetTop
    const bottom = top + el.offsetHeight
    return bottom > c.scrollTop // нижняя грань ниже линии прокрутки
  }) || items[0] // fallback — самый верхний

  if (!anchorEl) return null

  const dy = anchorEl.getBoundingClientRect().top - containerTop
  return { id: anchorEl.id, dy }
}

const restoreAnchor = (anchor: { id: string; dy: number } | null) => {
  const c = messagesContainer.value
  if (!c || !anchor) return

  const containerTop = c.getBoundingClientRect().top
  const el = c.querySelector<HTMLElement>(`#${anchor.id}`)
  if (!el) return

  // насколько сместился тот же элемент после рендера
  const newDy = el.getBoundingClientRect().top - containerTop
  const delta = newDy - anchor.dy
  // компенсируем смещение
  c.scrollTop += delta
}

socket.on("oldMessages", async (data: {
  user: UserChat;
  message: string;
  time: Date;
  id: number;
  removed: boolean, reply: null | {
    user: {
      id: number,
      nickname: string,
      avatar: string
    }, message: string
  }
}[]) => {


  const c = messagesContainer.value
  if (!c || !data?.length) return

  // 1) фиксируем якорь ДО изменения списка
  const anchor = captureAnchor()

  waitOldMessages.value = true

  // 2) добавляем старые сообщения (ВАЖНО: в правильном порядке и именно в начало!)
  // если addMessage сам делает unshift при флаге, воспользуйтесь им.
  // Иначе — добавьте вручную:
  for (let i = data.length - 1; i >= 0; i--) {
    const msg = data[i]
    // последний аргумент = prepend. Убедитесь, что addMessage поддерживает это:
    await addMessage(msg.id, msg.user, msg.message, msg.time, msg.removed, msg.reply, /*prepend=*/false)
  }

  // 3) ждём рендер
  await nextTick()

  // 4) восстанавливаем положение
  restoreAnchor(anchor)

  waitOldMessages.value = false


  // waitOldMessages.value = true
  //
  // // Добавляем старые сообщения в начало
  // for (const msg of data) {
  //   await addMessage(msg.id, msg.user, msg.message, msg.time, msg.removed, msg.reply, false)
  // }
  //
  // await nextTick()
  //
  // waitOldMessages.value = false
})


defineExpose({
  scrollToBottom,
  scrollToBottomSmooth,
  isScrolledToBottom,
  messagesContainer,
  scrolledToBottom,
})
</script>
