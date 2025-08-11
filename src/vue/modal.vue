<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-content">
          <header v-if="title" class="modal-header">
            <h2>{{ title }}</h2>
            <button class="modal-close" @click="handleClose" aria-label="Close">✖</button>
          </header>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { watch, onUnmounted, computed, nextTick } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true,
  closeOnEscape: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'beforeClose'): void
}>()

const visible = computed(() => props.modelValue)

/**
 * Основной метод закрытия модального окна
 */
const close = async () => {
  emit('beforeClose')
  emit('update:modelValue', false)
  emit('close')
  
  // Ждем завершения анимации перед полной очисткой
  await nextTick()
}

/**
 * Обработчик клика по оверлею
 */
const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

/**
 * Обработчик клика по кнопке закрытия
 */
const handleClose = () => {
  close()
}

/**
 * Обработчик нажатия клавиш
 */
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnEscape) {
    close()
  }
}

/**
 * Метод для входа в модальное окно (блокировка скролла, добавление слушателей)
 */
const enter = () => {
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.paddingRight = `${scrollBarWidth}px`
  
  if (props.closeOnEscape) {
    document.addEventListener('keydown', handleKeyDown)
  }
}

/**
 * Метод для выхода из модального окна (восстановление скролла, удаление слушателей)
 */
const exit = () => {
  document.documentElement.style.overflow = ''
  document.documentElement.style.paddingRight = ''
  document.removeEventListener('keydown', handleKeyDown)
}

/**
 * Метод для принудительного закрытия (используется при размонтировке)
 */
const forceClose = () => {
  exit()
  emit('update:modelValue', false)
}

// Следим за изменением видимости
watch(visible, (newVal) => {
  if (newVal) {
    enter()
  } else {
    exit()
  }
})

// Очистка при размонтировке компонента
onUnmounted(() => {
  forceClose()
})

// Экспортируем методы для внешнего использования
defineExpose({
  close,
  forceClose,
  handleClose,
  handleOverlayClick
})
</script>
