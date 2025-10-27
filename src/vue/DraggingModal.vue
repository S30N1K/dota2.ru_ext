<template>
  <Teleport to="body">
    <transition name="fw-fade">
      <div
          v-show="state.isOpen"
          class="fw-window"
          :class="{
          fullscreen: state.isFullscreen,
          'fw-dragging': state.isDragging,
          'fw-resizing': state.isResizing,
        }"
          :style="{
          top: state.y + 'px',
          left: state.x + 'px',
          width: state.width + 'px',
          height: state.height + 'px',
        }"
      >
        <header class="fw-header">
          <div class="fw-title" @mousedown="onDragStart" @touchstart.prevent="onTouchStart">
            <slot name="title">Окно</slot>
          </div>
          <div class="fw-buttons">
            <slot name="buttons"></slot>
          </div>
        </header>

        <div class="fw-body">
          <slot />
        </div>

        <!-- Resize zones -->
        <div
            v-if="props.resizable"
            class="fw-resizer-corner"
            @mousedown.prevent="startResize($event, 'corner')"
            @touchstart.prevent="startTouchResize($event, 'corner')"
        ></div>
        <div
            v-if="props.resizable"
            class="fw-resizer-right"
            @mousedown.prevent="startResize($event, 'right')"
            @touchstart.prevent="startTouchResize($event, 'right')"
        ></div>
        <div
            v-if="props.resizable"
            class="fw-resizer-bottom"
            @mousedown.prevent="startResize($event, 'bottom')"
            @touchstart.prevent="startTouchResize($event, 'bottom')"
        ></div>
      </div>
    </transition>

    <!-- Overlay при ресайзе -->
    <div v-if="state.isResizing" class="fw-resize-overlay"></div>
  </Teleport>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue"

interface Props {
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  minHeight?: number
  defaultOpen?: boolean

  x?: number
  y?: number
  width?: number
  height?: number
  fullscreen?: boolean
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  draggable: true,
  resizable: true,
  minWidth: 250,
  minHeight: 150,
  defaultOpen: false,
  x: 100,
  y: 100,
  width: 400,
  height: 300,
  fullscreen: false,
  open: false,
})

const emit = defineEmits([
  "update:x",
  "update:y",
  "update:width",
  "update:height",
  "update:fullscreen",
  "update:open",
])

const state = reactive({
  x: props.x,
  y: props.y,
  width: props.width,
  height: props.height,
  isDragging: false,
  isResizing: false,
  isFullscreen: props.fullscreen,
  isOpen: props.open !== undefined ? props.open : props.defaultOpen,
})

const prevSize = ref({ width: 0, height: 0 })
const prevPos = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })
let dragFrame = 0
let resizeFrame = 0
let resizeDir: "right" | "bottom" | "corner" | null = null

// emit helpers
function emitState() {
  emit("update:x", state.x)
  emit("update:y", state.y)
  emit("update:width", state.width)
  emit("update:height", state.height)
  emit("update:fullscreen", state.isFullscreen)
  emit("update:open", state.isOpen)
}

// --- Open/Close ---
function open() {
  state.isOpen = true
  emit("update:open", true)
}
function close() {
  state.isOpen = false
  emit("update:open", false)
}
function toggle() {
  setOpen(!state.isOpen)
}
function setOpen(val: boolean) {
  state.isOpen = val
  emit("update:open", val)
}

// --- Size/Position ---
function setSize(width: number, height: number) {
  state.width = Math.max(props.minWidth!, width)
  state.height = Math.max(props.minHeight!, height)
  ensureInViewport()
  emit("update:width", state.width)
  emit("update:height", state.height)
}

function setPosition(x: number, y: number) {
  state.x = x
  state.y = y
  ensureInViewport()
  emit("update:x", state.x)
  emit("update:y", state.y)
}

// --- Fullscreen ---
function isFullscreen(): boolean {
  return state.isFullscreen
}

function toggleFullscreen() {
  setFullscreen(!state.isFullscreen)
}

function setFullscreen(val: boolean) {
  if (val === state.isFullscreen) return
  if (val) {
    prevSize.value = { width: state.width, height: state.height }
    prevPos.value = { x: state.x, y: state.y }
    state.x = 0
    state.y = 0
    state.width = window.innerWidth
    state.height = window.innerHeight
  } else {
    state.x = prevPos.value.x
    state.y = prevPos.value.y
    state.width = prevSize.value.width
    state.height = prevSize.value.height
    ensureInViewport()
  }
  state.isFullscreen = val
  emit("update:fullscreen", val)
}

// --- Drag logic ---
function onDragStart(e: MouseEvent) {
  if (!props.draggable || state.isFullscreen) return
  if ((e.target as HTMLElement).closest(".fw-buttons")) return
  startDrag(e)
}

function onTouchStart(e: TouchEvent) {
  if (!props.draggable || state.isFullscreen) return
  if ((e.target as HTMLElement).closest(".fw-buttons")) return
  startTouchDrag(e)
}

// --- Mouse Drag ---
function startDrag(e: MouseEvent) {
  state.isDragging = true
  dragOffset.value = { x: e.clientX - state.x, y: e.clientY - state.y }
  window.addEventListener("mousemove", onDrag)
  window.addEventListener("mouseup", stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!state.isDragging) return
  if (dragFrame) return
  dragFrame = requestAnimationFrame(() => {
    state.x = e.clientX - dragOffset.value.x
    state.y = e.clientY - dragOffset.value.y
    ensureInViewport()
    emit("update:x", state.x)
    emit("update:y", state.y)
    dragFrame = 0
  })
}

function stopDrag() {
  state.isDragging = false
  window.removeEventListener("mousemove", onDrag)
  window.removeEventListener("mouseup", stopDrag)
}

// --- Touch Drag ---
function startTouchDrag(e: TouchEvent) {
  state.isDragging = true
  const touch = e.touches[0]
  dragOffset.value = { x: touch.clientX - state.x, y: touch.clientY - state.y }
  window.addEventListener("touchmove", onTouchDrag)
  window.addEventListener("touchend", stopTouchDrag)
}

function onTouchDrag(e: TouchEvent) {
  if (!state.isDragging) return
  if (dragFrame) return
  dragFrame = requestAnimationFrame(() => {
    const touch = e.touches[0]
    state.x = touch.clientX - dragOffset.value.x
    state.y = touch.clientY - dragOffset.value.y
    ensureInViewport()
    emit("update:x", state.x)
    emit("update:y", state.y)
    dragFrame = 0
  })
}

function stopTouchDrag() {
  state.isDragging = false
  window.removeEventListener("touchmove", onTouchDrag)
  window.removeEventListener("touchend", stopTouchDrag)
}

// --- Resize ---
function startResize(e: MouseEvent, dir: "right" | "bottom" | "corner") {
  if (!props.resizable || state.isFullscreen) return
  state.isResizing = true
  resizeDir = dir
  window.addEventListener("mousemove", onResize)
  window.addEventListener("mouseup", stopResize)
}

function startTouchResize(e: TouchEvent, dir: "right" | "bottom" | "corner") {
  if (!props.resizable || state.isFullscreen) return
  state.isResizing = true
  resizeDir = dir
  window.addEventListener("touchmove", onTouchResize)
  window.addEventListener("touchend", stopTouchResize)
}

function onResize(e: MouseEvent) {
  if (!state.isResizing || !resizeDir) return
  if (resizeFrame) return
  resizeFrame = requestAnimationFrame(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (resizeDir === "right" || resizeDir === "corner") {
      state.width = Math.min(vw - state.x, Math.max(props.minWidth!, e.clientX - state.x))
      emit("update:width", state.width)
    }
    if (resizeDir === "bottom" || resizeDir === "corner") {
      state.height = Math.min(vh - state.y, Math.max(props.minHeight!, e.clientY - state.y))
      emit("update:height", state.height)
    }
    resizeFrame = 0
  })
}

function onTouchResize(e: TouchEvent) {
  if (!state.isResizing || !resizeDir) return
  if (resizeFrame) return
  resizeFrame = requestAnimationFrame(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const touch = e.touches[0]
    if (resizeDir === "right" || resizeDir === "corner") {
      state.width = Math.min(vw - state.x, Math.max(props.minWidth!, touch.clientX - state.x))
      emit("update:width", state.width)
    }
    if (resizeDir === "bottom" || resizeDir === "corner") {
      state.height = Math.min(vh - state.y, Math.max(props.minHeight!, touch.clientY - state.y))
      emit("update:height", state.height)
    }
    resizeFrame = 0
  })
}

function stopResize() {
  state.isResizing = false
  resizeDir = null
  window.removeEventListener("mousemove", onResize)
  window.removeEventListener("mouseup", stopResize)
}

function stopTouchResize() {
  state.isResizing = false
  resizeDir = null
  window.removeEventListener("touchmove", onTouchResize)
  window.removeEventListener("touchend", stopTouchResize)
}

// --- Keep inside viewport ---
function ensureInViewport() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  state.width = Math.max(props.minWidth!, state.width)
  state.height = Math.max(props.minHeight!, state.height)
  if (state.x + state.width > vw) state.x = vw - state.width
  if (state.y + state.height > vh) state.y = vh - state.height
  if (state.x < 0) state.x = 0
  if (state.y < 0) state.y = 0
}

// --- Lifecycle ---
onMounted(() => {
  ensureInViewport()
  window.addEventListener("resize", ensureInViewport)
})
onBeforeUnmount(() => {
  window.removeEventListener("resize", ensureInViewport)
})

// --- Expose API ---
defineExpose({
  open,
  close,
  toggle,
  setSize,
  setPosition,
  toggleFullscreen,
  setFullscreen,
  setOpen,
  isFullscreen,
})
</script>
