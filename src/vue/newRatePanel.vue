<template>
  <Modal v-model="showModal" :title="'Оценка поста #' + props.messageId">
    <NewSmilesPanel :onSmile="onSmile"/>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "./modal.vue";
import {ref} from "vue";
import NewSmilesPanel from "./newSmilesPanel.vue";
import {ISmile} from "../types";
import {setRateOnPost} from "../api";

const showModal = ref(true)
interface Props {
  messageId: number
}

const props = defineProps<Props>()

function onSmile(smile: ISmile) {
  showModal.value = false
  setRateOnPost(props.messageId, parseInt(smile.id))
}
</script>