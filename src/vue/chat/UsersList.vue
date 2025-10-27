<template>
  <transition name="slide-right">
    <div class="onlineUsers" v-show="chatSettings.openOnline" ref="onlineContainer">

      <div class="title">Сейчас онлайн {{ usersOnline.length }}</div>

      <div
          v-for="user in usersOnline"
          :key="user.id"
          class="onlineUser"
          @click="$emit('insertUser', user)"
      >
        <img class="avatar" :src="user.avatar"/>
        <span>{{ user.nickname }}</span>
      </div>

      <div class="title">Не в сети {{ usersOffline.length }}</div>

      <div
          v-for="user in usersOffline"
          :key="user.id"
          class="onlineUser"
          @click="$emit('insertUser', user)"
      >
        <img class="avatar" :src="user.avatar" alt=""/>
        <span>{{ user.nickname }}</span>
      </div>

    </div>
  </transition>
</template>

<script setup lang="ts">
import {ref} from "vue"
import {usersOffline, usersOnline} from "./socket"
import {UserChat} from "../../types"
import {chatSettings} from "../../storage";


const emit = defineEmits<{ insertUser: [user: UserChat] }>()

const onlineContainer = ref<HTMLElement | null>(null)

defineExpose({
  onlineContainer,
})
</script>
