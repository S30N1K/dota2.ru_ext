<template>
  <button v-if="isValidConnected" class="users-btn" @click="$emit('toggleOnlineList')">
    <img :src="getExtUrl('assets/users.svg')" alt=""/>
    <span>{{ onlineCount }}</span>
  </button>
  <button v-if="isValidConnected" class="users-btn" @click="$emit('toggleEnvelopeList')">
    <img :src="getExtUrl('assets/envelope.svg')" alt=""/>
  </button>
  <button v-if="isValidConnected" @click="$emit('toggleFullscreen')">
    <img
        :src="
          chatSettings.isFullscreen
            ? getExtUrl('assets/arrowsIn.svg')
            : getExtUrl('assets/arrowsOut.svg')
			  "
        alt=""/>
  </button>
  <button @click="$emit('close')">
    <img :src="getExtUrl('assets/close.svg')" alt=""/>
  </button>
</template>

<script setup lang="ts">
import {computed} from "vue"
import {usersOnline} from "./socket"
import {chatSettings} from "../../storage"
import {getExtUrl} from "../../utils/getExtUrl"

const onlineCount = computed(() => usersOnline.value.length)

defineEmits<{
  toggleOnlineList: []
  toggleFullscreen: []
  toggleEnvelopeList: []
  close: []
}>()

defineProps<{
  isValidConnected: boolean
}>()
</script>
