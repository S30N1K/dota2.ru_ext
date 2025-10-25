import { reactive, ref } from "vue"
import type { User, ChatSettings, Settings, CurrentUser } from "./types"
import {
	DEFAULT_CHAT,
	DEFAULT_CURRENTUSER,
	DEFAULT_SETTINGS,
} from "./extension/utils/database_default"
import { extLogger } from "./logger"

const log = new extLogger("storage.ts")

export const extensionUrl = ref<string>("")
export const currentUser = reactive<CurrentUser>({ ...DEFAULT_CURRENTUSER })
export const chatSettings = reactive<ChatSettings>({ ...DEFAULT_CHAT })
export const settings = reactive<Settings>({ ...DEFAULT_SETTINGS })
