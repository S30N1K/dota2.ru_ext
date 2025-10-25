// src/extension/utils/browser.ts
var isExtensionEnv = typeof chrome !== "undefined" && !!chrome.runtime;
function wrapChromeCallback(fn) {
  return new Promise((resolve, reject) => {
    try {
      fn((result) => {
        const err = chrome?.runtime?.lastError;
        if (err) reject(err);
        else resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}
function createStorageArea(area) {
  return {
    get(keys) {
      if (!area?.get) return Promise.resolve({});
      return wrapChromeCallback((cb) => area.get(keys ?? null, cb));
    },
    set(items) {
      if (!area?.set) return Promise.resolve();
      return wrapChromeCallback((cb) => area.set(items, cb));
    },
    remove(keys) {
      if (!area?.remove) return Promise.resolve();
      return wrapChromeCallback((cb) => area.remove(keys, cb));
    },
    clear() {
      if (!area?.clear) return Promise.resolve();
      return wrapChromeCallback((cb) => area.clear(cb));
    }
  };
}
var browser = (() => {
  const runtime = isExtensionEnv ? chrome.runtime : void 0;
  const tabs = isExtensionEnv ? chrome.tabs : void 0;
  const storage = isExtensionEnv ? chrome.storage : void 0;
  const runtimeWrapper = {
    reload: () => runtime?.reload?.(),
    sendMessage: (msg) => runtime?.sendMessage ? wrapChromeCallback((cb) => runtime.sendMessage(msg, cb)) : Promise.reject("runtime.sendMessage \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),
    getURL: (path) => runtime?.getURL?.(path) ?? path,
    onMessage: {
      addListener: (callback) => {
        runtime?.onMessage?.addListener?.(
          (msg, sender, sendResponse) => {
            try {
              const result = callback(msg, sender, sendResponse);
              if (result && typeof result.then === "function") {
                result.then((res) => sendResponse(res)).catch((err) => sendResponse({ error: err?.message ?? String(err) }));
                return true;
              }
              return result;
            } catch (e) {
              sendResponse({ error: e?.message ?? String(e) });
              return false;
            }
          }
        );
      },
      removeListener: (callback) => runtime?.onMessage?.removeListener?.(callback)
    }
  };
  const tabsWrapper = {
    sendMessage: (tabId, message) => tabs?.sendMessage ? wrapChromeCallback((cb) => tabs.sendMessage(tabId, message, cb)) : Promise.reject("tabs.sendMessage \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),
    query: (queryInfo = {}) => tabs?.query ? wrapChromeCallback((cb) => tabs.query(queryInfo, cb)) : Promise.resolve([])
  };
  const storageWrapper = {
    local: createStorageArea(storage?.local),
    sync: createStorageArea(storage?.sync)
  };
  return { runtime: runtimeWrapper, tabs: tabsWrapper, storage: storageWrapper };
})();
var browser_default = browser;

// src/extension/utils/communication.ts
function onInjectedMessage(handler) {
  window.addEventListener("TO_CONTENT_SCRIPT", (event) => {
    const { message, responseEventType } = event.detail;
    handler(message, (response) => {
      window.dispatchEvent(new CustomEvent("FROM_CONTENT_SCRIPT", {
        detail: { responseEventType, response }
      }));
    });
  });
}
async function sendToBackground(message) {
  try {
    const response = await browser_default.runtime.sendMessage(message);
    return response;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// src/logger.ts
var extLogger = class {
  prefix;
  level;
  constructor(context = "unknown") {
    this.prefix = context;
    const envLevel = "debug";
    this.level = envLevel;
    this.info("\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D");
  }
  format(level, args) {
    const time = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    return [`[${"dota2.ru_ext"}][${this.prefix}][${time}][${level.toUpperCase()}]`, ...args];
  }
  shouldLog(level) {
    const order = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return order[level] >= order[this.level];
  }
  debug(...args) {
    if (!this.shouldLog("debug")) return;
    console.debug(...this.format("debug", args));
  }
  info(...args) {
    if (!this.shouldLog("info")) return;
    console.info(...this.format("info", args));
  }
  warn(...args) {
    if (!this.shouldLog("warn")) return;
    console.warn(...this.format("warn", args));
  }
  error(...args) {
    if (!this.shouldLog("error")) return;
    console.error(...this.format("error", args));
  }
};

// src/extension/utils/hotReloadSocket.ts
var log = new extLogger("extension/utils/hotReloadSocket.ts");
var wsPort = 5899;
var RECONNECT_STEP = 5e3;
var MAX_RECONNECT_TIME = 6e4;
var INITIAL_RECONNECT_DELAY = 5e3;
function startHotReloadSocket() {
  let retryDelay = INITIAL_RECONNECT_DELAY;
  let totalWaitTime = 0;
  const connect = () => {
    const ws = new WebSocket(`ws://localhost:${wsPort}`);
    ws.onopen = () => {
      log.info("\u2705 WebSocket-\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E");
      retryDelay = INITIAL_RECONNECT_DELAY;
      totalWaitTime = 0;
    };
    ws.onerror = (error) => log.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 WebSocket:", error);
    ws.onmessage = async (msg) => {
      log.debug("\u{1F4E8} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 WebSocket:", msg);
      try {
        const data = JSON.parse(msg.data);
        if (data.type === "reload") {
          log.info("\u267B\uFE0F \u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438");
          const reload = async () => {
            await sendToBackground({ type: "RELOAD" });
            log.info("\u{1F504} \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E, \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u043C \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443...");
            location.reload();
          };
          if (document.visibilityState === "visible" && !document.hidden) {
            await reload();
          } else {
            log.info("\u23F8 \u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043D\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u0430, \u0436\u0434\u0451\u043C \u0432\u0438\u0434\u0438\u043C\u043E\u0441\u0442\u0438...");
            await new Promise((resolve) => {
              const handleVisibilityChange = () => {
                if (document.visibilityState === "visible" && !document.hidden) {
                  document.removeEventListener("visibilitychange", handleVisibilityChange);
                  resolve();
                }
              };
              document.addEventListener("visibilitychange", handleVisibilityChange);
            });
            await reload();
          }
        }
      } catch (error) {
        log.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F WebSocket:", error);
      }
    };
    ws.onclose = (event) => {
      log.info(`\u26A0\uFE0F WebSocket \u0437\u0430\u043A\u0440\u044B\u0442 (\u043A\u043E\u0434: ${event.code}, \u043F\u0440\u0438\u0447\u0438\u043D\u0430: ${event.reason || "\u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u0430"})`);
      totalWaitTime += retryDelay;
      if (totalWaitTime >= MAX_RECONNECT_TIME) {
        log.error(`\u26D4 \u0414\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u043B\u0438\u043C\u0438\u0442 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F (${MAX_RECONNECT_TIME / 1e3} \u0441\u0435\u043A), \u043F\u0435\u0440\u0435\u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E.`);
        return;
      }
      log.info(`\u{1F501} \u041F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 ${retryDelay / 1e3} \u0441\u0435\u043A...`);
      setTimeout(() => {
        retryDelay = Math.min(retryDelay + RECONNECT_STEP, MAX_RECONNECT_TIME);
        log.info(`\u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u043F\u0435\u0440\u0435\u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F (\u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B: ${retryDelay / 1e3} \u0441\u0435\u043A)`);
        connect();
      }, retryDelay);
    };
    return ws;
  };
  try {
    connect();
  } catch (error) {
    log.error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u043E\u0435 WebSocket-\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435:", error);
    log.info("\u041F\u043E\u0432\u0442\u043E\u0440\u043D\u0430\u044F \u043F\u043E\u043F\u044B\u0442\u043A\u0430 \u0447\u0435\u0440\u0435\u0437 5 \u0441\u0435\u043A\u0443\u043D\u0434...");
    setTimeout(connect, 5e3);
  }
}

// src/extension/content.ts
var log2 = new extLogger("extension/content.ts");
function sendMessageToInjected(message) {
  window.dispatchEvent(new CustomEvent("FROM_CONTENT_SCRIPT", { detail: message }));
}
function waitForDOMReady() {
  return new Promise((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => resolve());
    } else {
      resolve();
    }
  });
}
onInjectedMessage(async (msg, sendResponse) => {
  log2.info("\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 injected", msg);
  switch (msg.type) {
    case "RESET_SETTINGS": {
      await sendToBackground({ type: "RESET_SETTINGS" });
      break;
    }
    case "SAVE_DATABASE": {
      const data = msg.payload;
      await sendToBackground({
        type: "SAVE_DATABASE",
        payload: { table: data.table, data: data.data }
      });
      break;
    }
    default:
      sendResponse({ success: false, error: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F" });
  }
});
function loadScript(path, cb) {
  const script = document.createElement("script");
  script.src = browser_default.runtime.getURL(path);
  (document.head || document.documentElement).appendChild(script);
  script.addEventListener("load", () => {
    log2.info(`\u0421\u043A\u0440\u0438\u043F\u0442 ${path} \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D`);
    cb && cb();
    script.remove();
  });
}
function loadCss(path, cb) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = browser_default.runtime.getURL(path);
  link.addEventListener("load", () => {
    log2.info(`\u0421\u0442\u0438\u043B\u044C ${path} \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D`);
    cb && cb();
  });
  document.head.appendChild(link);
}
async function main() {
  const response = await sendToBackground({ type: "GET_DATABASE" });
  const { currentUser, chatSettings, settings } = response.data;
  await waitForDOMReady();
  loadScript("injected.js", () => {
    sendMessageToInjected({
      type: "LOADED",
      payload: {
        extensionUrl: browser_default.runtime.getURL(""),
        database: {
          currentUser,
          chatSettings,
          settings
        }
      }
    });
  });
  if (settings.restoreOldDesign) {
    loadCss("style/old.css");
  }
  if (settings.chatEnabled) {
    loadCss("style/chat.css");
    loadCss("style/chatInput.css");
  }
  if (settings.newSmilesPanel || settings.chatEnabled) {
    loadCss("style/newSmilesPanel.css");
  }
  if (settings.searchUsersHeader) {
    loadCss("style/searchUserHeader.css");
  }
}
main().catch((error) => log2.error(error));
if (true) {
  startHotReloadSocket();
}
//# sourceMappingURL=content.js.map
