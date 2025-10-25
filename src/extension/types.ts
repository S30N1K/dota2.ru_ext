export type MessageType = "FROM_INJECTED" | "FROM_CONTENT" | "FROM_BACKGROUND" | "RELOAD_PAGE"

export interface ExtensionMessage<T = any> {
	type: MessageType
	payload?: T
}
