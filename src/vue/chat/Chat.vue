<template>
	<DraggingModal
		ref="modal"
		v-model:x="chatSettings.x"
		v-model:y="chatSettings.y"
		v-model:width="chatSettings.width"
		v-model:height="chatSettings.height"
		v-model:fullscreen="chatSettings.isFullscreen"
		v-model:open="chatSettings.isOpen"
	>
		<template #title>Чат</template>

		<template #buttons>
			<ChatHeader
				:is-valid-connected="!isValidConnected"
				@toggleOnlineList="chatSettings.openOnline = !chatSettings.openOnline"
				@toggleFullscreen="modal?.toggleFullscreen()"
        @toggleEnvelopeList="envelopeIsOpen = !envelopeIsOpen"
				@close="modal?.close()"
			/>
		</template>

		<template #default>
			<div class="chatBody">
				<!-- Статус подключения -->
        <div v-if="isValidConnected || !chatSettings.agreement" class="chatStatus">
          <span v-if="!chatSettings.agreement">
            Авторизация в чате немного усложнена. Теперь есть полноценная проверка.
            Для авторизации, от вашего имени у вас будет изменена подпись на форуме (она сейчас все равно нигде не видна, кроме личной страницы).
            Это требуется, что-бы точно знать что входите вы. Раньше этой проверки небыло, и можно было писать в чате от имени любого пользователя.

            <span class="accept">
              <button @click="acceptAgreement">Хорошо, даю согласие на изменение моей подписи</button>
            </span>
          </span>
          <span v-else>{{ errorMessage }}</span>
        </div>

				<!-- Основной чат -->
				<div v-show="!isValidConnected" class="chatContainer">
					<ChatMessageList @insert-user="chatFooter?.insertUser" ref="messageList" />

          <ChatNotifications :isOpen="envelopeIsOpen"/>

					<UsersList
						@insert-user="chatFooter?.insertUser"
						ref="onlineList"
					/>
				</div>

				<!-- Футер чата -->
				<ChatFooter
					v-if="!isValidConnected"
					:scrolled-to-bottom="scrolledToBottom"
					@scrollToBottom="scrollToBottomSmooth"
          @scrollToMessage="scrollToMessage"
					ref="chatFooter"
				/>
			</div>
		</template>
	</DraggingModal>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, watch } from "vue"
	import DraggingModal from "../DraggingModal.vue"
	import ChatHeader from "./ChatHeader.vue"
	import ChatMessageList from "./ChatMessageList.vue"
	import UsersList from "./UsersList.vue"
	import ChatFooter from "./ChatFooter.vue"
	import { chatSettings } from "../../storage"
	import { extLogger } from "../../logger"
  import {connectSocket, socketStatus} from "./socket"
  import ChatNotifications from "./ChatNotifications.vue";

	const log = new extLogger("vue/Chat.vue")

	const isValidConnected = computed(() => socketStatus.value !== "authorizationSuccess")
	const errorMessage = computed(() => {
		switch (socketStatus.value) {
			case "unauthorized": {
				return "Вы не авторизованы на сайте"
			}
			case "connecting": {
				return "Подключение..."
			}
      case "authorization":
        return "Авторизация"
			case "disconnected": {
				return "Соединение потеряно"
			}
      case "error": {
				return "Ошибка соединения"
			}
      case "registration_error": {
        return "Ошибка регистрации"
      }
      case "registration_check": {
        return "Проверка регистрации"
      }
      case "banned": {
        return "Вход в чат невозможен. Вы либо заблокированы на сайте, либо у вас нет 50 сообщений на форуме. Для повторной проверки - перезапустите браузер."
      }
      case "version_check_failed": {
        return "Вход в чат невозможен. У вас устаревшая версия расширения."
      }
			default: {
				return `Неизвестная ошибка: ${socketStatus.value}`
			}
		}
	})

	// === refs ===
	const modal = ref<InstanceType<typeof DraggingModal> | null>(null)
	const messageList = ref<InstanceType<typeof ChatMessageList> | null>(null)
	const onlineList = ref<InstanceType<typeof UsersList> | null>(null)
	const chatFooter = ref<InstanceType<typeof ChatFooter> | null>(null)
  const envelopeIsOpen = ref<boolean>(false)


	// === вычисления ===
	const scrolledToBottom = computed(() => messageList.value?.scrolledToBottom ?? true)

	// === функции ===

  const acceptAgreement = () => {
    chatSettings.agreement = true;
    connectSocket()
  }

	const scrollToBottomSmooth = () => {
		messageList.value?.scrollToBottomSmooth()
	}

	const scrollToMessage = (message_id: number) => {
		messageList.value?.scrollToMessage(message_id, "smooth", "center")
	}


	const toggle = () => {
		modal.value?.toggle()
	}

	// === Управление подключением ===
	function onChatOpenedOnce() {
		messageList.value?.scrollToBottomSmooth()
	}

	if (chatSettings.isOpen) {
		onChatOpenedOnce()
	} else {
		const stopWatch = watch(
			() => chatSettings.isOpen,
			isOpen => {
				if (isOpen) {
					onChatOpenedOnce()
					stopWatch()
				}
			}
		)
	}

	defineExpose({
		toggle,
	})

	onMounted(() => {
    connectSocket()
  })
</script>
