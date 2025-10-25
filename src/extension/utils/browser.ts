/**
 * Лёгкий, полностью типизированный полифилл для Chrome и Firefox расширений
 * Работает в background, popup, content scripts
 * Безопасен для injected scripts
 *
 * ✅ Полностью типизированный
 * ✅ Generics для sendMessage и storage
 * ✅ Без внешних зависимостей
 */

declare const chrome: any;

type Message = any;
type Sender = chrome.runtime.MessageSender;
type SendResponse = (response?: any) => void;

interface ExecuteScriptResult<T = any> {
  frameId: number;
  result: T;
}

// --- Runtime API ---
interface BrowserRuntime {
  reload(): void;
  sendMessage<T = any>(message: Message): Promise<T>;
  onMessage: {
    addListener(
      callback: (message: Message, sender: Sender, sendResponse: SendResponse) => boolean | void
    ): void;
    removeListener(
      callback: (message: Message, sender: Sender, sendResponse: SendResponse) => boolean | void
    ): void;
  };
  getURL(path: string): string;
}

// --- Tabs API ---
interface BrowserTabs {
  sendMessage<T = any>(tabId: number, message: Message): Promise<T>;
  query(queryInfo?: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]>;
}

// --- Storage API ---
interface BrowserStorageArea {
  get<T = any>(keys?: string | string[] | object | null): Promise<T>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

interface BrowserStorage {
  local: BrowserStorageArea;
  sync: BrowserStorageArea;
}

// --- Полный интерфейс браузера ---
interface BrowserPolyfill {
  runtime: BrowserRuntime;
  tabs: BrowserTabs;
  storage: BrowserStorage;
}

// --- Проверка окружения ---
const isExtensionEnv = typeof chrome !== "undefined" && !!chrome.runtime;

// --- Универсальный wrapper для async chrome API ---
function wrapChromeCallback<T>(
  fn: (...args: any[]) => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    try {
      fn((result: T) => {
        const err = chrome?.runtime?.lastError;
        if (err) reject(err);
        else resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// --- Storage wrapper ---
function createStorageArea(area?: any): BrowserStorageArea {
  return {
    get<T = any>(keys?: string | string[] | object | null) {
      if (!area?.get) return Promise.resolve({} as T);
      return wrapChromeCallback<T>((cb: any) => area.get(keys ?? null, cb));
    },
    set(items: Record<string, any>) {
      if (!area?.set) return Promise.resolve();
      return wrapChromeCallback<void>((cb: any) => area.set(items, cb));
    },
    remove(keys: string | string[]) {
      if (!area?.remove) return Promise.resolve();
      return wrapChromeCallback<void>((cb: any) => area.remove(keys, cb));
    },
    clear() {
      if (!area?.clear) return Promise.resolve();
      return wrapChromeCallback<void>((cb: any) => area.clear(cb));
    },
  };
}

const browser: BrowserPolyfill = (() => {
  const runtime = isExtensionEnv ? chrome.runtime : undefined;
  const tabs = isExtensionEnv ? chrome.tabs : undefined;
  const storage = isExtensionEnv ? chrome.storage : undefined;

  const runtimeWrapper: BrowserRuntime = {
    reload: () => runtime?.reload?.(),
    sendMessage: <T = any>(msg: Message) =>
      runtime?.sendMessage
        ? wrapChromeCallback<T>((cb: any) => runtime.sendMessage(msg, cb))
        : Promise.reject("runtime.sendMessage недоступен"),
    getURL: (path: string) => runtime?.getURL?.(path) ?? path,
    onMessage: {
      addListener: (callback) => {
        runtime?.onMessage?.addListener?.(
          (msg: Message, sender: Sender, sendResponse: SendResponse) => {
            try {
              const result = callback(msg, sender, sendResponse);
              if (result && typeof (result as any).then === "function") {
                (result as unknown as Promise<any>)
                  .then((res) => sendResponse(res))
                  .catch((err) => sendResponse({ error: err?.message ?? String(err) }));
                return true;
              }
              return result;
            } catch (e) {
              sendResponse({ error: (e as Error)?.message ?? String(e) });
              return false;
            }
          }
        );
      },
      removeListener: (callback) => runtime?.onMessage?.removeListener?.(callback as any),
    },
  };

  const tabsWrapper: BrowserTabs = {
    sendMessage: (tabId, message) =>
      tabs?.sendMessage
        ? wrapChromeCallback((cb: any) => tabs.sendMessage(tabId, message, cb))
        : Promise.reject("tabs.sendMessage недоступен"),
    query: (queryInfo = {}) =>
      tabs?.query
        ? wrapChromeCallback<chrome.tabs.Tab[]>((cb: any) => tabs.query(queryInfo, cb))
        : Promise.resolve([]),
  };

  const storageWrapper: BrowserStorage = {
    local: createStorageArea(storage?.local),
    sync: createStorageArea(storage?.sync),
  };

  return { runtime: runtimeWrapper, tabs: tabsWrapper, storage: storageWrapper };
})();

export default browser;
