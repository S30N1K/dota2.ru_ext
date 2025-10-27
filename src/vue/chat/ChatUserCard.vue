<template>
  <transition name="fade">
    <div
        v-if="visible"
        ref="card"
        class="hover-card"
        :class="{ 'hover-above': position === 'above', 'hover-below': position === 'below' }"
        :style="{ top: `${coords.y}px`, left: `${coords.x}px` }"
        @mouseenter="cancelHide"
        @mouseleave="hide"
    >
      <div class="avatar">
        <img :src="user?.avatar" alt="avatar" />
      </div>
      <div class="nickname">{{ user?.nickname }}</div>
      <div class="info">
<!--        <div>Дата регистрации: {{ user?.registeredAt }}</div>-->
<!--        <div>В расширении с: {{ user?.extensionSince }}</div>-->
      </div>
      <div class="actions">
<!--        <button @click="$emit('profile', user)">Профиль</button>-->
<!--        <button @click="$emit('quote', user)">Цитировать</button>-->
<!--        <button @click="$emit('mention', user)">Упомянуть</button>-->
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import {UserChat} from "../../types";

const visible = ref(false)
const position = ref<'above' | 'below'>('below')
const user = ref<UserChat | null>(null)
const card = ref<HTMLElement | null>(null)
const coords = ref({ x: 0, y: 0 })

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Показать карточку над ником
 * @param x координата по горизонтали (обычно event.clientX)
 * @param y координата по вертикали (обычно event.clientY)
 * @param u данные пользователя
 */
function showAt(x: number, y: number, u: UserChat) {
  if (showTimer) clearTimeout(showTimer)
  showTimer = setTimeout(async () => {

    user.value = u
    coords.value = { x, y }
    visible.value = true
    await nextTick()
    computePosition()
  }, 1000) // задержка 2 секунды
}

/**
 * Скрыть карточку
 */
function hide() {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 150)
}

/**
 * Отменить скрытие (если курсор заходит на карточку)
 */
function cancelHide() {
  if (hideTimer) clearTimeout(hideTimer)
}

/**
 * Вычисляет, где больше места — сверху или снизу
 */
function computePosition() {
  if (!card.value) return
  const rect = card.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  position.value = rect.bottom > viewportHeight ? 'above' : 'below'

  // Коррекция по вертикали
  if (position.value === 'above') {
    coords.value.y -= rect.height + 10
  } else {
    coords.value.y += 10
  }
}

onBeforeUnmount(() => {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
})

defineExpose({
  showAt,
  hide,
})
</script>
