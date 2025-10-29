<template>
  <transition name="fade">
    <div
        v-if="visible"
        ref="card"
        class="hover-card"
        :class="{ 'hover-above': position === 'above', 'hover-below': position === 'below' }"
        :style="{ top: `${coords.y}px`, left: `${coords.x}px` }"
        @mouseenter="cancelHide"
        @mouseleave="close"
    >
      <div class="avatar">
        <img :src="user?.avatar" alt="avatar"/>
      </div>
      <div class="nickname">{{ user?.nickname }}</div>
      <div class="info">
        <div>В чате с {{ formatDateTime(user?.registration as Date) }}</div>
      </div>
      <div class="actions">
        <button @click="$emit('openProfile', user!)">Профиль</button>
        <button @click="$emit('mention', user!)">Упомянуть</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from 'vue'
import {UserChat} from '../../types'

const visible = ref(false)
const position = ref<'above' | 'below'>('below')
const user = ref<UserChat | null>(null)
const card = ref<HTMLElement | null>(null)
const coords = ref({ x: 0, y: 0 })
let hideTimer: ReturnType<typeof setTimeout> | null = null

function formatDateTime(date: Date): string {
  console.log(date)
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

defineEmits<{
  openProfile: [user: UserChat]
  mention: [user: UserChat]
}>()

/**
 * Открывает карточку
 * @param x координата клика X (в окне)
 * @param y координата клика Y (в окне)
 * @param u пользователь
 * @param container HTMLElement — родительский контейнер, в рамках которого нельзя выходить
 */
async function open(x: number, y: number, u: UserChat, container: HTMLElement) {
  user.value = u
  visible.value = true
  await nextTick()

  computePosition(x, y, container)
}

function close() {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (visible.value = false), 150)
}

function cancelHide() {
  if (hideTimer) clearTimeout(hideTimer)
}

function computePosition(clickX: number, clickY: number, container: HTMLElement) {
  if (!card.value) return

  const cardRect = card.value.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  let x = clickX - containerRect.left - cardRect.width / 2
  let y = clickY - containerRect.top - cardRect.height / 2

  // --- Ограничиваем положение внутри контейнера ---
  if (x < 0) x = 0
  if (y < 0) y = 0

  const maxX = containerRect.width - cardRect.width
  const maxY = containerRect.height - cardRect.height

  if (x > maxX) x = maxX
  if (y > maxY) y = maxY

  coords.value = { x, y }

  // Определяем, выше или ниже центра контейнера показывать
  position.value = clickY - containerRect.top > containerRect.height / 2 ? 'above' : 'below'
}

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
})

defineExpose({
  open,
  close,
})
</script>