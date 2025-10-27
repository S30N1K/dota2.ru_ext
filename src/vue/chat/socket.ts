/**
 * Реактивный модуль для общения с чат-сервером через socket.io
 * -------------------------------------------------------------
 * Поддерживает:
 * - Авторизацию по токену
 * - События онлайн/оффлайн
 * - Сообщения, эмодзи, упоминания
 * - Индикацию "печатает..."
 */

import io from "socket.io-client"
import {ref} from "vue"
import {chatSettings, currentUser} from "../../storage"
import {ChatMessage, UserChat} from "../../types"
import {isAuth} from "../../utils/isAuth"
import {findSmileById} from "../../utils/findSmileById"
import {getFileName} from "../../utils/getFileName"
import {saveSignature} from "../../api/saveSignature";
import {extLogger} from "../../logger";

// ================================
// 🔌  ИНИЦИАЛИЗАЦИЯ SOCKET
// ================================

export const socket = io(process.env.CHAT_URL || "ws://localhost:5569", {
    transports: ["websocket"],
    autoConnect: false,
})

const log = new extLogger("vue/chat/socket.ts")


if (process.env.NODE_ENV !== "development") {
    const origOn = socket.on.bind(socket);

    socket.on = function <Ev extends string>(
        event: Ev,
        callback: (...args: any[]) => void
    ) {
        const wrappedCallback = (...args: any[]) => {
            log.info("[RECV]", event, args);
            callback(...args);
        };
        return origOn(event, wrappedCallback);
    };

    const origEmit = socket.emit.bind(socket);
    socket.emit = function <Ev extends string>(event: Ev, ...args: any[]) {
        log.info("[EMIT]", event, args);
        return origEmit(event, ...args);
    };
}


// Возможные статусы соединения
type Status =
    "connecting"
    | "connected"
    | "disconnected"
    | "unauthorized"
    | "error"
    | "authorizationSuccess"
    | "authorization"
    | "registration_check"
    | "registration_error"
    | "banned"
    | "version_check_failed"

// ================================
// ⚙️  РЕАКТИВНЫЕ ПЕРЕМЕННЫЕ
// ================================

export const socketStatus = ref<Status>("connecting")
export const usersTyping = ref<UserChat[]>([])
export const usersOnline = ref<UserChat[]>([])
export const usersOffline = ref<UserChat[]>([])
export const messages = ref<ChatMessage[]>([])
export const unreadMessagesCount = ref<number>(0)
export const quoteMessage = ref<ChatMessage | null>(null)

// ================================
// 🚀  ПОДКЛЮЧЕНИЕ
// ================================

export const connectSocket = () => {

    // if (!chatSettings.agreement){
    //     return
    // }

    if (!isAuth()) {
        socketStatus.value = "unauthorized"
        return
    }

    socket.connect()
    socketStatus.value = "connecting"
}


// ================================
// ✉️  УТИЛИТЫ ОТПРАВКИ
// ================================

/** Отправка статуса "печатает..." */
export function sendTyping() {
    socket.emit("sendTyping", {token: currentUser.token})
}

// ================================
// 🧠  ОБРАБОТЧИКИ СОБЫТИЙ SOCKET
// ================================

socket.on("connect", () => {
    socketStatus.value = "authorization"
    messages.value = []


    // Попытка авторизации
    socket.emit("authorization", {
        user_id: currentUser.id,
        user_token: currentUser.token,
        version_token: process.env.VERSION_TOKEN
    })

    // // Запрос списка оффлайн-пользователей
    // socket.emit("getOfflineUsers")
    //
    // // Авторизация текущего пользователя
    // socket.emit("authorization", {
    // 	user_id: currentUser.id,
    // 	user_login: currentUser.nickname,
    // 	user_token: currentUser.token,
    // 	user_avatar: currentUser.avatar,
    // })
})
socket.on("version_check_failed", () => {
    socketStatus.value = "version_check_failed"
})

socket.on("disconnect", () => {
    socketStatus.value = "disconnected"
})

socket.on("connect_error", () => {
    socketStatus.value = "error"
})

// После успешной авторизации
socket.on("authorized_successful", (token: string) => {
    currentUser.token = token
    socketStatus.value = "authorizationSuccess"
    socket.emit("getMessages")
    socket.emit("getOnline")
    socket.emit("getOffline")
})
socket.on("registration_successful", async () => {
    await saveSignature({signature: ""})
})

// При регистрации нового пользователя
socket.on("registration", async ({prefix, code}: { prefix: string; code: string }) => {

    const USER_IS_BANNED = `USER_IS_BANNED_${currentUser.id}`

    if (sessionStorage.getItem(USER_IS_BANNED) === "true") {
        socketStatus.value = "banned"
        return
    }

    const res = await saveSignature({signature: `${prefix}${code}`})

    switch (res.status) {
        case "success": {
            socketStatus.value = "registration_check"
            socket.emit("registrationCheck", {
                user_id: currentUser.id,
                code: code
            })
            break
        }
        case "accessDenied": {
            socketStatus.value = "banned"
            sessionStorage.setItem(USER_IS_BANNED, "true")
            break
        }
        default: {
            socketStatus.value = "registration_error"
        }
    }
})

// Список пользователей онлайн
socket.on("onlineUsers", (data: UserChat[]) => {
    usersOnline.value = data
})

// Список пользователей оффлайн
socket.on("offlineUsers", (data: UserChat[]) => {
    usersOffline.value = data
})

// Пользователь печатает
socket.on("typing", (data: UserChat) => handleUserTyping(data))

// При получении пачки сообщений
socket.on(
    "messages",
    async (data: {
        user: UserChat;
        message: string;
        time: Date;
        id: number;
        removed: boolean;
        reply: null | {
            user: {
                id: number,
                nickname: string,
                avatar: string
            }, message: string
        }
    }[]) => {
        for (const msg of data) {
            await addMessage(msg.id, msg.user, msg.message, msg.time, msg.removed, msg.reply)
        }
    }
)

socket.on(
    "updateRemovedMessage",
    async (data: { message_id: number, removed: boolean }) => {
        const message = messages.value.find(e => e.id === data.message_id)

        if (!message) return

        message.removed = data.removed
    }
)



// ================================
// 🕒  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/** Форматирование времени сообщений */
const formatTime = (date: Date) => {
    const d = new Date(date)
    const h = String(d.getHours()).padStart(2, "0")
    const m = String(d.getMinutes()).padStart(2, "0")
    return `${h}:${m}`
}

/** Проверка, есть ли в тексте упоминание текущего пользователя */
const hasPingMe = (text: string): boolean => {
    const regex = new RegExp(`\\[user\\|${currentUser.id}\\|[^\\]]+\\]`, "g")
    return regex.test(text)
}

// ================================
// 💬  ДОБАВЛЕНИЕ СООБЩЕНИЙ
// ================================

export const addMessage = async (id: number, user: UserChat, msg: string, time: Date, removed: boolean, reply: null | {
    user: {
        id: number,
        nickname: string,
        avatar: string
    }, message: string
}, start: boolean = true) => {
    removeUserTyping(user.id)

    const original = msg

    // Убираем HTML и парсим
    const parser = new DOMParser()
    const doc = parser.parseFromString(msg, "text/html")
    msg = doc.body.textContent || ""

    // Убираем лишние переносы строк
    msg = msg.replace(/(\[br\]){3,}/g, "[br][br]").replace(/\[br\]/g, "<br>")

    // Эмодзи [smile|ID]
    const smileMatches = [...msg.matchAll(/\[smile\|(\d+)\]/g)]
    for (const match of smileMatches) {
        const id = match[1]
        const smile = await findSmileById(id)
        if (smile?.filename) {
            const path = `/img/forum/emoticons/${getFileName(smile.filename)}`
            const tag = `<img class="emoji" data-id="${id}" src="${path}" alt="${smile.symbol}">`
            msg = msg.replace(match[0], tag)
        }
    }

    // Упоминания [user|id|nickname]
    msg = msg.replace(
        /\[user\|(\d+)\|([^\]]+)\]/g,
        (_, id, nickname) =>
            `<a class='user-tag' target='_blank' href='/forum/members/${nickname}.${id}'>${nickname}</a>`
    )

    // Если предыдущее сообщение от того же пользователя — объединяем
    // const lastMsg = messages.value.at(-1)
    // if (lastMsg?.user?.id === user.id) {
    //     lastMsg.message += "<br>" + msg
    //     if (hasPingMe(original)) lastMsg.pingMe = true
    // } else {
    //     messages.value.push({
    //         id,
    //         user,
    //         message: msg,
    //         date: formatTime(time),
    //         pingMe: hasPingMe(original),
    //     })
    // }

    const arr: ChatMessage = {
        id,
        user,
        message: msg,
        date: formatTime(time),
        pingMe: hasPingMe(original),
        removed: removed,
        reply: reply
    }
    if (start) {
        messages.value.push(arr)
    } else {
        messages.value.unshift(arr)
    }
}

// ================================
// ⌨️  ОБРАБОТКА СОСТОЯНИЯ "ПЕЧАТАЕТ"
// ================================

// Таймеры "печатает" для каждого пользователя
const typingTimers = new Map<number, ReturnType<typeof setTimeout>>()

/** Добавить/обновить статус "печатает..." */
function handleUserTyping(user: UserChat) {
    const exists = usersTyping.value.some(u => u.id === user.id)
    if (!exists) usersTyping.value.push(user)

    // Сбросить старый таймер
    if (typingTimers.has(user.id)) clearTimeout(typingTimers.get(user.id))

    // Удалить статус через 3 секунды без активности
    const timer = setTimeout(() => removeUserTyping(user.id), 3000)
    typingTimers.set(user.id, timer)
}

/** Удалить пользователя из списка typing */
export function removeUserTyping(userId: number) {
    usersTyping.value = usersTyping.value.filter(u => u.id !== userId)
    if (typingTimers.has(userId)) {
        clearTimeout(typingTimers.get(userId))
        typingTimers.delete(userId)
    }
}
