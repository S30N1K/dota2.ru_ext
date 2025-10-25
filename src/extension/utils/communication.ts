import browser from "./browser";

// --- Типы сообщений между injected и content ---
export interface InjectedMessage<T = any> {
  type: string;
  payload?: T;
}

export interface InjectedResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Типы сообщений между content и background ---
export interface BackgroundMessage<T = any> {
  type: "RELOAD" | "GET_DATABASE" | "SAVE_DATABASE" | "RESET_SETTINGS";
  payload?: T;
}

export interface BackgroundResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ------------------- INJECTED → CONTENT -------------------
export function sendToContent<TReq = any, TRes = any>(message: InjectedMessage<TReq>): Promise<InjectedResponse<TRes>> {
  return new Promise((resolve) => {
    const responseEventType = `FROM_CONTENT_RESPONSE_${message.type}_${Date.now()}`;

    const handler = (event: any) => {
      if (event.detail?.responseEventType === responseEventType) {
        window.removeEventListener("FROM_CONTENT_SCRIPT", handler);
        resolve(event.detail.response as InjectedResponse<TRes>);
      }
    };
    window.addEventListener("FROM_CONTENT_SCRIPT", handler);

    window.dispatchEvent(new CustomEvent("TO_CONTENT_SCRIPT", {
      detail: { message, responseEventType }
    }));
  });
}

// ------------------- CONTENT → INJECTED -------------------
export function onInjectedMessage(
  handler: (msg: InjectedMessage, sendResponse: (res: InjectedResponse) => void) => void
) {
  window.addEventListener("TO_CONTENT_SCRIPT", (event: any) => {
    const { message, responseEventType } = event.detail as { message: InjectedMessage; responseEventType: string };

    handler(message, (response) => {
      window.dispatchEvent(new CustomEvent("FROM_CONTENT_SCRIPT", {
        detail: { responseEventType, response }
      }));
    });
  });
}

// ------------------- CONTENT → BACKGROUND -------------------
export async function sendToBackground<TReq = any, TRes = any>(message: BackgroundMessage<TReq>): Promise<BackgroundResponse<TRes>> {
  try {
    const response = await browser.runtime.sendMessage<BackgroundResponse<TRes>>(message);
    return response;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ------------------- BACKGROUND → CONTENT -------------------
export function onBackgroundMessage(
  handler: (msg: BackgroundMessage, sender: chrome.runtime.MessageSender) => Promise<BackgroundResponse>
) {
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    handler(msg as BackgroundMessage, sender)
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ success: false, error: (err as Error).message }));
    return true; // Chrome ждёт async ответ
  });
}
