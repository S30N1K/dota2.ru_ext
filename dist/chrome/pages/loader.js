import {
  getFileName,
  getSmileUrl,
  newSmilesPanel_default
} from "./chunks/chunk-2E4SLZRR.js";
import {
  forceUpdateTime,
  getIgnoreList
} from "./chunks/chunk-TWHSP6WZ.js";
import {
  loadVue
} from "./chunks/chunk-J4LWYTZF.js";
import {
  getNotifications
} from "./chunks/chunk-ZQJYJ7WX.js";
import {
  getSmiles
} from "./chunks/chunk-UZ4L7MZK.js";
import {
  Fragment,
  Teleport,
  Transition,
  TransitionGroup,
  chatSettings,
  computed,
  createBaseVNode,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  createVNode,
  currentUser,
  defineComponent,
  extLogger,
  extensionUrl,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  openBlock,
  parseJson,
  parseText,
  reactive,
  ref,
  renderList,
  renderSlot,
  settings,
  toDisplayString,
  toRaw,
  vModelCheckbox,
  vShow,
  watch,
  withCtx,
  withDirectives,
  withModifiers
} from "./chunks/chunk-6EVUB3DE.js";
import {
  __export
} from "./chunks/chunk-54KOYG5C.js";

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

// src/extension/utils/communication.ts
function sendToContent(message) {
  return new Promise((resolve) => {
    const responseEventType = `FROM_CONTENT_RESPONSE_${message.type}_${Date.now()}`;
    const handler = (event) => {
      if (event.detail?.responseEventType === responseEventType) {
        window.removeEventListener("FROM_CONTENT_SCRIPT", handler);
        resolve(event.detail.response);
      }
    };
    window.addEventListener("FROM_CONTENT_SCRIPT", handler);
    window.dispatchEvent(new CustomEvent("TO_CONTENT_SCRIPT", {
      detail: { message, responseEventType }
    }));
  });
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\modal.vue?type=script
var modal_default = /* @__PURE__ */ defineComponent({
  __name: "modal",
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, required: false },
    closeOnOverlay: { type: Boolean, required: false, default: true },
    closeOnEscape: { type: Boolean, required: false, default: true }
  },
  emits: ["update:modelValue", "close", "beforeClose"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const visible = computed(() => props.modelValue);
    const close = async () => {
      emit("beforeClose");
      emit("update:modelValue", false);
      emit("close");
      await nextTick();
    };
    const handleOverlayClick = () => {
      if (props.closeOnOverlay) {
        close();
      }
    };
    const handleClose = () => {
      close();
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && props.closeOnEscape) {
        close();
      }
    };
    const enter = () => {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.paddingRight = `${scrollBarWidth}px`;
      if (props.closeOnEscape) {
        document.addEventListener("keydown", handleKeyDown);
      }
    };
    const exit = () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
    const forceClose = () => {
      exit();
      emit("update:modelValue", false);
    };
    watch(visible, (newVal) => {
      if (newVal) {
        enter();
      } else {
        exit();
      }
    });
    onUnmounted(() => {
      forceClose();
    });
    __expose({
      close,
      forceClose,
      handleClose,
      handleOverlayClick
    });
    const __returned__ = { props, emit, visible, close, handleOverlayClick, handleClose, handleKeyDown, enter, exit, forceClose };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\modal.vue?type=template
var _hoisted_1 = { class: "modal-content" };
var _hoisted_2 = {
  key: 0,
  class: "modal-header"
};
var _hoisted_3 = { class: "modal-body" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(Teleport, { to: "body" }, [
    createVNode(Transition, { name: "modal-fade" }, {
      default: withCtx(() => [
        $setup.visible ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "modal-overlay",
          onClick: withModifiers($setup.handleOverlayClick, ["self"])
        }, [
          createBaseVNode("div", _hoisted_1, [
            $props.title ? (openBlock(), createElementBlock("header", _hoisted_2, [
              createBaseVNode(
                "h2",
                null,
                toDisplayString($props.title),
                1
                /* TEXT */
              ),
              createBaseVNode("button", {
                class: "modal-close",
                onClick: $setup.handleClose,
                "aria-label": "Close"
              }, "\u2716")
            ])) : createCommentVNode("v-if", true),
            createBaseVNode("div", _hoisted_3, [
              renderSlot(_ctx.$slots, "default")
            ])
          ])
        ])) : createCommentVNode("v-if", true)
      ]),
      _: 3
      /* FORWARDED */
    })
  ]);
}

// src/vue/modal.vue
modal_default.render = render;
modal_default.__file = "src\\vue\\modal.vue";
var modal_default2 = modal_default;

// src/utils/getExtUrl.ts
var log = new extLogger("utils/getExtUrl.ts");
function getExtUrl(path) {
  return extensionUrl.value + path;
}

// src/api/saveFeedSettings.ts
async function saveFeedSettings({ ids }) {
  return await parseJson("/forum/api/feed/saveSettings", { ids });
}

// src/api/parseForumSections.ts
async function parseForumSections({}) {
  try {
    const html = await parseText("/forum/");
    const doc = new DOMParser().parseFromString(html, "text/html");
    const sectionElements = doc.querySelectorAll(
      ".forum-page__list .forum-page__item-title-block a"
    );
    return Array.from(sectionElements).map((el) => {
      const href = el.getAttribute("href") || "";
      const match = href.match(/forums\/(.*)\.(\d+)\//);
      const id = match ? parseInt(match[2], 10) : null;
      const name = el.textContent?.trim() ?? null;
      return id && name ? { id, name } : null;
    }).filter((item) => item !== null);
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u0430\u0440\u0441\u0438\u043D\u0433\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432 \u0444\u043E\u0440\u0443\u043C\u0430:", error);
    return [];
  }
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\header\settings.vue?type=script
var settings_default = /* @__PURE__ */ defineComponent({
  __name: "settings",
  setup(__props, { expose: __expose }) {
    __expose();
    const log13 = new extLogger("headerSettings.vue");
    const showModal = ref(false);
    const selectedSectionIndex = ref(0);
    const ignoredByMeList = ref("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...");
    const ignoredMeList = ref("\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...");
    const forumSections = ref([]);
    const forumSectionsLoading = ref(false);
    const openSettings = async () => {
      showModal.value = true;
      await loadSettings();
    };
    const loadSettings = async () => {
      try {
        await loadIgnoredLists();
        await loadForumSections();
      } catch (error) {
        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A:", error);
      }
    };
    const toggleSection = async (id) => {
      const list = [...settings.sectionsList];
      const index = list.indexOf(id);
      if (index === -1) list.push(id);
      else list.splice(index, 1);
      settings.sectionsList = list;
      saveFeedSettings({ ids: settings.sectionsList });
    };
    const createUserLink = (user) => `<a href="https://dota2.ru/forum/members/.${user.id}/">${user.nickname}</a>`;
    const formatUserList = (users, emptyMessage) => {
      if (users.length === 0) return emptyMessage;
      return users.map(createUserLink).join(", ");
    };
    const loadIgnoredLists = async () => {
      try {
        const ignoredUsers = [];
        ignoredMeList.value = formatUserList(ignoredUsers, "\u041D\u0438\u043A\u0442\u043E \u0432\u0430\u0441 \u043D\u0435 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442");
        const ignoredUserList = await getIgnoreList({});
        ignoredByMeList.value = formatUserList(ignoredUserList, "\u0412\u044B \u043D\u0438\u043A\u043E\u0433\u043E \u043D\u0435 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442\u0435");
      } catch (error) {
        log13.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0441\u043F\u0438\u0441\u043A\u043E\u0432 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F:", error);
        ignoredMeList.value = "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438";
        ignoredByMeList.value = "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438";
      }
    };
    const loadForumSections = async () => {
      if (forumSectionsLoading.value) return;
      forumSectionsLoading.value = true;
      try {
        forumSections.value = await parseForumSections({});
      } catch (error) {
        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432 \u0444\u043E\u0440\u0443\u043C\u0430:", error);
        forumSections.value = [];
      } finally {
        forumSectionsLoading.value = false;
      }
    };
    const menuSections = computed(() => [
      {
        title: "\u0418\u043D\u0444\u043E",
        icon: "info.svg",
        items: [
          { type: "text", text: `<b>\u0412\u0435\u0440\u0441\u0438\u044F \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F:</b> ${"3.0.17"}` },
          {
            type: "text",
            text: "<b>\u0410\u0432\u0442\u043E\u0440 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F:</b> <a href='/forum/members/.474212/' target='_blank'>S30N1K</a>"
          },
          {
            type: "text",
            text: "<b>\u0410\u0432\u0442\u043E\u0440 \u0441\u0442\u0430\u0440\u043E\u0433\u043E \u0434\u0438\u0437\u0430\u0439\u043D\u0430:</b> <a href='/forum/members/.818100/' target='_blank'>\u0420\u0443\u043D\u0430 \u0434\u0435\u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438</a>"
          },
          {
            type: "text",
            text: "<b>\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u0438\u0441\u0445\u043E\u0434\u043D\u0438\u043A:</b> <a href='https://github.com/S30N1K/dota2.ru_ext' target='_blank'>GITHUB</a>"
          },
          {
            type: "text",
            text: "<b>\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u0433\u0440\u0443\u043F\u043F\u0443 Discord:</b> <a href='https://discord.gg/ptktuFEKyB' target='_blank'>\u042F\u0434\u0440\u0435\u043D\u043E\u0435 \u0443\u0431\u0435\u0436\u0438\u0449\u0435</a>"
          },
          {
            type: "text",
            text: "<span style='color: #a33f3f'>\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E, \u0435\u0441\u043B\u0438 \u0437\u0430\u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u0442\u044C:</span> <a href='https://boosty.to/s30n1k' target='_blank'>BOOSTY</a>"
          },
          {
            type: "text",
            text: "<span>\u0414\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043D\u043E\u0432\u043E\u0441\u0442\u0435\u0439 \u043F\u043E \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044E, \u043C\u043E\u0436\u043D\u043E \u043F\u043E\u0434\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F</span> <a href='/forum/members/.474212/' target='_blank'>\u043D\u0430 \u043C\u043E\u044E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u043D\u0430 \u0444\u043E\u0440\u0443\u043C\u0435</a>"
          }
        ]
      },
      {
        title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440\u0430",
        icon: "editor.svg",
        items: [
          { type: "checkbox", text: "\u041D\u043E\u0432\u0430\u044F \u043F\u0430\u043D\u0435\u043B\u044C \u0441\u043E \u0441\u043C\u0430\u0439\u043B\u0430\u043C\u0438", key: "newSmilesPanel" },
          { type: "checkbox", text: "\u0412\u0441\u0442\u0430\u0432\u043A\u0430 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u043F\u043E Ctrl+V", key: "imagePasteByCtrlV" },
          {
            type: "checkbox",
            text: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E \u043F\u043E\u043B\u0435\u0439 \u0432\u0432\u043E\u0434\u0430",
            key: "saveInputFieldsContent",
            disabled: true
          }
        ]
      },
      {
        title: "\u0421\u0442\u0438\u043B\u0438",
        icon: "style.svg",
        items: [
          { type: "checkbox", text: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0441\u0442\u0430\u0440\u043E\u0435 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435", key: "restoreOldDesign" },
          {
            type: "checkbox",
            text: "\u0420\u0430\u043C\u043A\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u044F \u0442\u0435\u043C\u044B",
            key: "themeCreatorFrame",
            disabled: true
          },
          {
            type: "checkbox",
            text: "\u0420\u0430\u043C\u043A\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0432\u0430\u0448\u0438\u0445 \u043F\u043E\u0441\u0442\u043E\u0432",
            key: "ownPostsFrame",
            disabled: true
          },
          {
            type: "checkbox",
            text: "\u0420\u0430\u043C\u043A\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0442\u0435\u0445, \u043A\u0442\u043E \u043D\u0430 \u0432\u0430\u0441 \u043F\u043E\u0434\u043F\u0438\u0441\u0430\u043D",
            key: "followersFrame",
            disabled: true
          },
          {
            type: "checkbox",
            text: "\u0420\u0430\u043C\u043A\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0442\u043E\u0433\u043E, \u043A\u0442\u043E \u0432\u0430\u0441 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442",
            key: "ignoredUsersFrame",
            disabled: true
          },
          {
            type: "checkbox",
            text: "\u0421\u043A\u0440\u044B\u0442\u044C \u043C\u0430\u0442\u0447\u0438 \u0438\u0437 \u0448\u0430\u043F\u043A\u0438",
            key: "hideMatchesFromHeader",
            disabled: true
          },
          { type: "checkbox", text: "\u0421\u043A\u0440\u044B\u0442\u044C \u043D\u043E\u0432\u043E\u0441\u0442\u0438 \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439", key: "hideNewsFromMain" }
        ]
      },
      {
        title: "\u0424\u043E\u0440\u0443\u043C",
        icon: "forum.svg",
        items: [
          {
            type: "checkbox",
            text: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u043F\u043E\u0434\u043F\u0438\u0441\u0438 \u0432 \u0442\u0435\u043C\u0430\u0445 \u0444\u043E\u0440\u0443\u043C\u0430",
            key: "showForumTopicCaptions",
            disabled: true
          },
          { type: "checkbox", text: "\u041D\u043E\u0432\u0430\u044F \u043F\u0430\u043D\u0435\u043B\u044C \u043E\u0446\u0435\u043D\u043E\u043A", key: "newRatingsPanel", disabled: true }
        ]
      },
      {
        title: "\u0421\u0443\u043F\u0435\u0440 \u0438\u0433\u043D\u043E\u0440",
        icon: "ignored.svg",
        items: [
          { type: "checkbox", text: "\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0435\u043C\u044B \u0441 \u0433\u043B\u0430\u0432\u043D\u043E\u0439", key: "hideTopicsFromMain" },
          { type: "checkbox", text: "\u0421\u043A\u0440\u044B\u0442\u044C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441 \u0444\u043E\u0440\u0443\u043C\u0430", key: "hideForumMessages" },
          { type: "text", text: `<b>\u0421\u043F\u0438\u0441\u043E\u043A \u0442\u0435\u0445, \u043A\u0442\u043E \u0432\u0430\u0441 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442:</b> ${ignoredMeList.value}` },
          { type: "text", text: `<b>\u0421\u043F\u0438\u0441\u043E\u043A \u0442\u0435\u0445, \u043A\u043E\u0433\u043E \u0432\u044B \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442\u0435:</b> ${ignoredByMeList.value}` }
        ]
      },
      {
        title: "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u0442\u0435\u043C \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439",
        icon: "mainThemes.svg",
        items: [
          { type: "checkbox", text: "\u0421\u0432\u043E\u0438 \u0440\u0430\u0437\u0434\u0435\u043B\u044B \u0442\u0435\u043C \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439", key: "customTopicSections" },
          { type: "text", text: `<b>\u041E\u0442\u043C\u0435\u0442\u044C\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0432\u044B \u0445\u043E\u0442\u0438\u0442\u0435 \u0432\u0438\u0434\u0435\u0442\u044C \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439</b>` },
          { type: "forum-sections", text: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432 \u0444\u043E\u0440\u0443\u043C\u0430" }
        ]
      },
      {
        title: "\u0414\u0440\u0443\u0433\u043E\u0435",
        icon: "other.svg",
        items: [
          {
            type: "checkbox",
            text: "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0434\u0438\u0430\u043B\u043E\u0433\u0438 \u043F\u0440\u0438 \u043D\u0430\u0432\u0435\u0434\u0435\u043D\u0438\u0438",
            key: "showRecentDialogsOnHover"
          },
          {
            type: "checkbox",
            text: "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u0438 \u043D\u0430\u0432\u0435\u0434\u0435\u043D\u0438\u0438",
            key: "showRecentNotificationsOnHover"
          },
          {
            type: "checkbox",
            text: "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C \u043E\u0446\u0435\u043D\u043A\u0438 \u0432 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F\u0445",
            key: "showRatingsInNotifications"
          },
          {
            type: "checkbox",
            text: "\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u043D\u043E\u0435 \u043C\u0435\u043D\u044E \u0432\u044B\u0433\u0440\u0443\u0437\u043A\u0438 \u0430\u0432\u0430\u0442\u0430\u0440\u0430",
            key: "improvedAvatarUploadMenu",
            disabled: true
          },
          {
            type: "checkbox",
            text: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u0447\u0435\u0440\u0435\u0437 \u043F\u043E\u0438\u0441\u043A \u0432 \u0448\u0430\u043F\u043A\u0435",
            key: "searchUsersHeader"
          }
        ]
      },
      {
        title: "\u042D\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u0438",
        icon: "experimental.svg",
        items: [
          { type: "checkbox", text: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0447\u0430\u0442", key: "chatEnabled" },
          {
            type: "button",
            text: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
            cb: async () => {
              if (confirm("\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0441\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438?")) {
                await sendToContent({
                  type: "RESET_SETTINGS"
                });
                window.location.reload();
              }
            }
          }
        ]
      }
    ]);
    const currentSection = computed(() => menuSections.value[selectedSectionIndex.value]);
    onMounted(async () => {
      showModal.value = true;
      await loadSettings();
    });
    const __returned__ = { log: log13, showModal, selectedSectionIndex, ignoredByMeList, ignoredMeList, forumSections, forumSectionsLoading, openSettings, loadSettings, toggleSection, createUserLink, formatUserList, loadIgnoredLists, loadForumSections, menuSections, currentSection, Modal: modal_default2, get settings() {
      return settings;
    }, get getExtUrl() {
      return getExtUrl;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\header\settings.vue?type=template
var _hoisted_12 = ["src"];
var _hoisted_22 = { class: "settings-container hiddenScroll" };
var _hoisted_32 = { class: "sidebar" };
var _hoisted_4 = ["onClick"];
var _hoisted_5 = ["src"];
var _hoisted_6 = { class: "section-content" };
var _hoisted_7 = ["disabled", "onUpdate:modelValue"];
var _hoisted_8 = ["innerHTML"];
var _hoisted_9 = { key: 0 };
var _hoisted_10 = { key: 1 };
var _hoisted_11 = ["checked", "onChange"];
var _hoisted_122 = ["onClick"];
function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(
    Fragment,
    null,
    [
      createBaseVNode("a", {
        class: "header__link",
        onClick: _cache[0] || (_cache[0] = ($event) => $setup.showModal = true)
      }, [
        createBaseVNode("img", {
          src: $setup.getExtUrl("assets/settings.svg")
        }, null, 8, _hoisted_12)
      ]),
      createVNode($setup["Modal"], {
        modelValue: $setup.showModal,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.showModal = $event),
        title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F"
      }, {
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_22, [
            createCommentVNode(" \u041B\u0435\u0432\u043E\u0435 \u043C\u0435\u043D\u044E "),
            createBaseVNode("div", _hoisted_32, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList($setup.menuSections, (section, index) => {
                  return openBlock(), createElementBlock("div", {
                    key: section.title,
                    class: normalizeClass(["menu-item", { active: $setup.selectedSectionIndex === index }]),
                    onClick: ($event) => $setup.selectedSectionIndex = index
                  }, [
                    createBaseVNode("img", {
                      src: $setup.getExtUrl("assets/" + section.icon),
                      class: "icon"
                    }, null, 8, _hoisted_5),
                    createBaseVNode(
                      "span",
                      null,
                      toDisplayString(section.title),
                      1
                      /* TEXT */
                    )
                  ], 10, _hoisted_4);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            createCommentVNode(" \u041A\u043E\u043D\u0442\u0435\u043D\u0442 \u0441\u0435\u043A\u0446\u0438\u0438 "),
            createBaseVNode("div", _hoisted_6, [
              (openBlock(true), createElementBlock(
                Fragment,
                null,
                renderList($setup.currentSection.items, (item, idx) => {
                  return openBlock(), createElementBlock("div", {
                    key: `${$setup.currentSection.title}-${idx}`,
                    class: "setting-item"
                  }, [
                    createCommentVNode(" \u0427\u0435\u043A\u0431\u043E\u043A\u0441\u044B "),
                    item.type === "checkbox" ? (openBlock(), createElementBlock(
                      "label",
                      {
                        key: 0,
                        style: normalizeStyle({ opacity: item.disabled ? 0.5 : 1 })
                      },
                      [
                        withDirectives(createBaseVNode("input", {
                          type: "checkbox",
                          disabled: item.disabled,
                          "onUpdate:modelValue": ($event) => $setup.settings[item.key] = $event
                        }, null, 8, _hoisted_7), [
                          [vModelCheckbox, $setup.settings[item.key]]
                        ]),
                        createTextVNode(
                          " " + toDisplayString(item.text),
                          1
                          /* TEXT */
                        )
                      ],
                      4
                      /* STYLE */
                    )) : item.type === "text" ? (openBlock(), createElementBlock(
                      Fragment,
                      { key: 1 },
                      [
                        createCommentVNode(" \u0422\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B "),
                        createBaseVNode("div", {
                          innerHTML: item.text
                        }, null, 8, _hoisted_8)
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : item.type === "forum-sections" ? (openBlock(), createElementBlock(
                      Fragment,
                      { key: 2 },
                      [
                        createCommentVNode(" \u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432 \u0444\u043E\u0440\u0443\u043C\u0430 (\u043F\u0440\u0438\u043C\u0435\u0440) "),
                        $setup.forumSectionsLoading ? (openBlock(), createElementBlock("div", _hoisted_9, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...")) : (openBlock(), createElementBlock("div", _hoisted_10, [
                          (openBlock(true), createElementBlock(
                            Fragment,
                            null,
                            renderList($setup.forumSections, (section) => {
                              return openBlock(), createElementBlock("div", {
                                key: section.id,
                                class: "forum-section-item"
                              }, [
                                createBaseVNode("label", null, [
                                  createBaseVNode("input", {
                                    type: "checkbox",
                                    checked: $setup.settings.sectionsList.includes(section.id),
                                    onChange: ($event) => $setup.toggleSection(section.id)
                                  }, null, 40, _hoisted_11),
                                  createTextVNode(
                                    " " + toDisplayString(section.name),
                                    1
                                    /* TEXT */
                                  )
                                ])
                              ]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ]))
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : item.type === "button" ? (openBlock(), createElementBlock(
                      Fragment,
                      { key: 3 },
                      [
                        createCommentVNode(" \u041A\u043D\u043E\u043F\u043A\u0438 "),
                        createBaseVNode("button", {
                          class: "settings-button",
                          onClick: ($event) => item.cb?.()
                        }, toDisplayString(item.text), 9, _hoisted_122)
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["modelValue"])
    ],
    64
    /* STABLE_FRAGMENT */
  );
}

// src/vue/header/settings.vue
settings_default.render = render2;
settings_default.__file = "src\\vue\\header\\settings.vue";
var settings_default2 = settings_default;

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\DraggingModal.vue?type=script
var DraggingModal_default = /* @__PURE__ */ defineComponent({
  __name: "DraggingModal",
  props: {
    draggable: { type: Boolean, required: false, default: true },
    resizable: { type: Boolean, required: false, default: true },
    minWidth: { type: Number, required: false, default: 250 },
    minHeight: { type: Number, required: false, default: 150 },
    defaultOpen: { type: Boolean, required: false, default: false },
    x: { type: Number, required: false, default: 100 },
    y: { type: Number, required: false, default: 100 },
    width: { type: Number, required: false, default: 400 },
    height: { type: Number, required: false, default: 300 },
    fullscreen: { type: Boolean, required: false, default: false },
    open: { type: Boolean, required: false, default: false }
  },
  emits: [
    "update:x",
    "update:y",
    "update:width",
    "update:height",
    "update:fullscreen",
    "update:open"
  ],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const state = reactive({
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      isDragging: false,
      isResizing: false,
      isFullscreen: props.fullscreen,
      isOpen: props.open !== void 0 ? props.open : props.defaultOpen
    });
    const prevSize = ref({ width: 0, height: 0 });
    const prevPos = ref({ x: 0, y: 0 });
    const dragOffset = ref({ x: 0, y: 0 });
    let dragFrame = 0;
    let resizeFrame = 0;
    let resizeDir = null;
    function emitState() {
      emit("update:x", state.x);
      emit("update:y", state.y);
      emit("update:width", state.width);
      emit("update:height", state.height);
      emit("update:fullscreen", state.isFullscreen);
      emit("update:open", state.isOpen);
    }
    function open() {
      state.isOpen = true;
      emit("update:open", true);
    }
    function close() {
      state.isOpen = false;
      emit("update:open", false);
    }
    function toggle() {
      setOpen(!state.isOpen);
    }
    function setOpen(val) {
      state.isOpen = val;
      emit("update:open", val);
    }
    function setSize(width, height) {
      state.width = Math.max(props.minWidth, width);
      state.height = Math.max(props.minHeight, height);
      ensureInViewport();
      emit("update:width", state.width);
      emit("update:height", state.height);
    }
    function setPosition(x, y) {
      state.x = x;
      state.y = y;
      ensureInViewport();
      emit("update:x", state.x);
      emit("update:y", state.y);
    }
    function isFullscreen() {
      return state.isFullscreen;
    }
    function toggleFullscreen() {
      setFullscreen(!state.isFullscreen);
    }
    function setFullscreen(val) {
      if (val === state.isFullscreen) return;
      if (val) {
        prevSize.value = { width: state.width, height: state.height };
        prevPos.value = { x: state.x, y: state.y };
        state.x = 0;
        state.y = 0;
        state.width = window.innerWidth;
        state.height = window.innerHeight;
      } else {
        state.x = prevPos.value.x;
        state.y = prevPos.value.y;
        state.width = prevSize.value.width;
        state.height = prevSize.value.height;
        ensureInViewport();
      }
      state.isFullscreen = val;
      emit("update:fullscreen", val);
    }
    function onDragStart(e) {
      if (!props.draggable || state.isFullscreen) return;
      if (e.target.closest(".fw-buttons")) return;
      startDrag(e);
    }
    function onTouchStart(e) {
      if (!props.draggable || state.isFullscreen) return;
      if (e.target.closest(".fw-buttons")) return;
      startTouchDrag(e);
    }
    function startDrag(e) {
      state.isDragging = true;
      dragOffset.value = { x: e.clientX - state.x, y: e.clientY - state.y };
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", stopDrag);
    }
    function onDrag(e) {
      if (!state.isDragging) return;
      if (dragFrame) return;
      dragFrame = requestAnimationFrame(() => {
        state.x = e.clientX - dragOffset.value.x;
        state.y = e.clientY - dragOffset.value.y;
        ensureInViewport();
        emit("update:x", state.x);
        emit("update:y", state.y);
        dragFrame = 0;
      });
    }
    function stopDrag() {
      state.isDragging = false;
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    }
    function startTouchDrag(e) {
      state.isDragging = true;
      const touch = e.touches[0];
      dragOffset.value = { x: touch.clientX - state.x, y: touch.clientY - state.y };
      window.addEventListener("touchmove", onTouchDrag);
      window.addEventListener("touchend", stopTouchDrag);
    }
    function onTouchDrag(e) {
      if (!state.isDragging) return;
      if (dragFrame) return;
      dragFrame = requestAnimationFrame(() => {
        const touch = e.touches[0];
        state.x = touch.clientX - dragOffset.value.x;
        state.y = touch.clientY - dragOffset.value.y;
        ensureInViewport();
        emit("update:x", state.x);
        emit("update:y", state.y);
        dragFrame = 0;
      });
    }
    function stopTouchDrag() {
      state.isDragging = false;
      window.removeEventListener("touchmove", onTouchDrag);
      window.removeEventListener("touchend", stopTouchDrag);
    }
    function startResize(e, dir) {
      if (!props.resizable || state.isFullscreen) return;
      state.isResizing = true;
      resizeDir = dir;
      window.addEventListener("mousemove", onResize);
      window.addEventListener("mouseup", stopResize);
    }
    function startTouchResize(e, dir) {
      if (!props.resizable || state.isFullscreen) return;
      state.isResizing = true;
      resizeDir = dir;
      window.addEventListener("touchmove", onTouchResize);
      window.addEventListener("touchend", stopTouchResize);
    }
    function onResize(e) {
      if (!state.isResizing || !resizeDir) return;
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (resizeDir === "right" || resizeDir === "corner") {
          state.width = Math.min(vw - state.x, Math.max(props.minWidth, e.clientX - state.x));
          emit("update:width", state.width);
        }
        if (resizeDir === "bottom" || resizeDir === "corner") {
          state.height = Math.min(vh - state.y, Math.max(props.minHeight, e.clientY - state.y));
          emit("update:height", state.height);
        }
        resizeFrame = 0;
      });
    }
    function onTouchResize(e) {
      if (!state.isResizing || !resizeDir) return;
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const touch = e.touches[0];
        if (resizeDir === "right" || resizeDir === "corner") {
          state.width = Math.min(vw - state.x, Math.max(props.minWidth, touch.clientX - state.x));
          emit("update:width", state.width);
        }
        if (resizeDir === "bottom" || resizeDir === "corner") {
          state.height = Math.min(vh - state.y, Math.max(props.minHeight, touch.clientY - state.y));
          emit("update:height", state.height);
        }
        resizeFrame = 0;
      });
    }
    function stopResize() {
      state.isResizing = false;
      resizeDir = null;
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", stopResize);
    }
    function stopTouchResize() {
      state.isResizing = false;
      resizeDir = null;
      window.removeEventListener("touchmove", onTouchResize);
      window.removeEventListener("touchend", stopTouchResize);
    }
    function ensureInViewport() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      state.width = Math.max(props.minWidth, state.width);
      state.height = Math.max(props.minHeight, state.height);
      if (state.x + state.width > vw) state.x = vw - state.width;
      if (state.y + state.height > vh) state.y = vh - state.height;
      if (state.x < 0) state.x = 0;
      if (state.y < 0) state.y = 0;
    }
    onMounted(() => {
      ensureInViewport();
      window.addEventListener("resize", ensureInViewport);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", ensureInViewport);
    });
    __expose({
      open,
      close,
      toggle,
      setSize,
      setPosition,
      toggleFullscreen,
      setFullscreen,
      setOpen,
      isFullscreen
    });
    const __returned__ = { props, emit, state, prevSize, prevPos, dragOffset, get dragFrame() {
      return dragFrame;
    }, set dragFrame(v) {
      dragFrame = v;
    }, get resizeFrame() {
      return resizeFrame;
    }, set resizeFrame(v) {
      resizeFrame = v;
    }, get resizeDir() {
      return resizeDir;
    }, set resizeDir(v) {
      resizeDir = v;
    }, emitState, open, close, toggle, setOpen, setSize, setPosition, isFullscreen, toggleFullscreen, setFullscreen, onDragStart, onTouchStart, startDrag, onDrag, stopDrag, startTouchDrag, onTouchDrag, stopTouchDrag, startResize, startTouchResize, onResize, onTouchResize, stopResize, stopTouchResize, ensureInViewport };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\DraggingModal.vue?type=template
var _hoisted_13 = { class: "fw-header" };
var _hoisted_23 = { class: "fw-buttons" };
var _hoisted_33 = { class: "fw-body" };
function render3(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(Teleport, { to: "body" }, [
    createVNode(Transition, {
      name: "fw-fade",
      persisted: ""
    }, {
      default: withCtx(() => [
        withDirectives(createBaseVNode(
          "div",
          {
            class: normalizeClass(["fw-window", {
              fullscreen: $setup.state.isFullscreen,
              "fw-dragging": $setup.state.isDragging,
              "fw-resizing": $setup.state.isResizing
            }]),
            style: normalizeStyle({
              top: $setup.state.y + "px",
              left: $setup.state.x + "px",
              width: $setup.state.width + "px",
              height: $setup.state.height + "px"
            })
          },
          [
            createBaseVNode("header", _hoisted_13, [
              createBaseVNode(
                "div",
                {
                  class: "fw-title",
                  onMousedown: $setup.onDragStart,
                  onTouchstart: withModifiers($setup.onTouchStart, ["prevent"])
                },
                [
                  renderSlot(_ctx.$slots, "title", {}, () => [
                    _cache[6] || (_cache[6] = createTextVNode(
                      "\u041E\u043A\u043D\u043E",
                      -1
                      /* CACHED */
                    ))
                  ])
                ],
                32
                /* NEED_HYDRATION */
              ),
              createBaseVNode("div", _hoisted_23, [
                renderSlot(_ctx.$slots, "buttons")
              ])
            ]),
            createBaseVNode("div", _hoisted_33, [
              renderSlot(_ctx.$slots, "default")
            ]),
            createCommentVNode(" Resize zones "),
            $setup.props.resizable ? (openBlock(), createElementBlock(
              "div",
              {
                key: 0,
                class: "fw-resizer-corner",
                onMousedown: _cache[0] || (_cache[0] = withModifiers(($event) => $setup.startResize($event, "corner"), ["prevent"])),
                onTouchstart: _cache[1] || (_cache[1] = withModifiers(($event) => $setup.startTouchResize($event, "corner"), ["prevent"]))
              },
              null,
              32
              /* NEED_HYDRATION */
            )) : createCommentVNode("v-if", true),
            $setup.props.resizable ? (openBlock(), createElementBlock(
              "div",
              {
                key: 1,
                class: "fw-resizer-right",
                onMousedown: _cache[2] || (_cache[2] = withModifiers(($event) => $setup.startResize($event, "right"), ["prevent"])),
                onTouchstart: _cache[3] || (_cache[3] = withModifiers(($event) => $setup.startTouchResize($event, "right"), ["prevent"]))
              },
              null,
              32
              /* NEED_HYDRATION */
            )) : createCommentVNode("v-if", true),
            $setup.props.resizable ? (openBlock(), createElementBlock(
              "div",
              {
                key: 2,
                class: "fw-resizer-bottom",
                onMousedown: _cache[4] || (_cache[4] = withModifiers(($event) => $setup.startResize($event, "bottom"), ["prevent"])),
                onTouchstart: _cache[5] || (_cache[5] = withModifiers(($event) => $setup.startTouchResize($event, "bottom"), ["prevent"]))
              },
              null,
              32
              /* NEED_HYDRATION */
            )) : createCommentVNode("v-if", true)
          ],
          6
          /* CLASS, STYLE */
        ), [
          [vShow, $setup.state.isOpen]
        ])
      ]),
      _: 3
      /* FORWARDED */
    })
  ]);
}

// src/vue/DraggingModal.vue
DraggingModal_default.render = render3;
DraggingModal_default.__file = "src\\vue\\DraggingModal.vue";
var DraggingModal_default2 = DraggingModal_default;

// node_modules/engine.io-parser/build/esm/commons.js
var PACKET_TYPES = /* @__PURE__ */ Object.create(null);
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
var PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
Object.keys(PACKET_TYPES).forEach((key) => {
  PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
var ERROR_PACKET = { type: "error", data: "parser error" };

// node_modules/engine.io-parser/build/esm/encodePacket.browser.js
var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
var withNativeArrayBuffer = typeof ArrayBuffer === "function";
var isView = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
};
var encodePacket = ({ type, data }, supportsBinary, callback) => {
  if (withNativeBlob && data instanceof Blob) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(data, callback);
    }
  } else if (withNativeArrayBuffer && (data instanceof ArrayBuffer || isView(data))) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(new Blob([data]), callback);
    }
  }
  return callback(PACKET_TYPES[type] + (data || ""));
};
var encodeBlobAsBase64 = (data, callback) => {
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const content = fileReader.result.split(",")[1];
    callback("b" + (content || ""));
  };
  return fileReader.readAsDataURL(data);
};
function toArray(data) {
  if (data instanceof Uint8Array) {
    return data;
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  } else {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
}
var TEXT_ENCODER;
function encodePacketToBinary(packet, callback) {
  if (withNativeBlob && packet.data instanceof Blob) {
    return packet.data.arrayBuffer().then(toArray).then(callback);
  } else if (withNativeArrayBuffer && (packet.data instanceof ArrayBuffer || isView(packet.data))) {
    return callback(toArray(packet.data));
  }
  encodePacket(packet, false, (encoded) => {
    if (!TEXT_ENCODER) {
      TEXT_ENCODER = new TextEncoder();
    }
    callback(TEXT_ENCODER.encode(encoded));
  });
}

// node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}
var decode = (base64) => {
  let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};

// node_modules/engine.io-parser/build/esm/decodePacket.browser.js
var withNativeArrayBuffer2 = typeof ArrayBuffer === "function";
var decodePacket = (encodedPacket, binaryType) => {
  if (typeof encodedPacket !== "string") {
    return {
      type: "message",
      data: mapBinary(encodedPacket, binaryType)
    };
  }
  const type = encodedPacket.charAt(0);
  if (type === "b") {
    return {
      type: "message",
      data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
    };
  }
  const packetType = PACKET_TYPES_REVERSE[type];
  if (!packetType) {
    return ERROR_PACKET;
  }
  return encodedPacket.length > 1 ? {
    type: PACKET_TYPES_REVERSE[type],
    data: encodedPacket.substring(1)
  } : {
    type: PACKET_TYPES_REVERSE[type]
  };
};
var decodeBase64Packet = (data, binaryType) => {
  if (withNativeArrayBuffer2) {
    const decoded = decode(data);
    return mapBinary(decoded, binaryType);
  } else {
    return { base64: true, data };
  }
};
var mapBinary = (data, binaryType) => {
  switch (binaryType) {
    case "blob":
      if (data instanceof Blob) {
        return data;
      } else {
        return new Blob([data]);
      }
    case "arraybuffer":
    default:
      if (data instanceof ArrayBuffer) {
        return data;
      } else {
        return data.buffer;
      }
  }
};

// node_modules/engine.io-parser/build/esm/index.js
var SEPARATOR = String.fromCharCode(30);
var encodePayload = (packets, callback) => {
  const length = packets.length;
  const encodedPackets = new Array(length);
  let count = 0;
  packets.forEach((packet, i) => {
    encodePacket(packet, false, (encodedPacket) => {
      encodedPackets[i] = encodedPacket;
      if (++count === length) {
        callback(encodedPackets.join(SEPARATOR));
      }
    });
  });
};
var decodePayload = (encodedPayload, binaryType) => {
  const encodedPackets = encodedPayload.split(SEPARATOR);
  const packets = [];
  for (let i = 0; i < encodedPackets.length; i++) {
    const decodedPacket = decodePacket(encodedPackets[i], binaryType);
    packets.push(decodedPacket);
    if (decodedPacket.type === "error") {
      break;
    }
  }
  return packets;
};
function createPacketEncoderStream() {
  return new TransformStream({
    transform(packet, controller) {
      encodePacketToBinary(packet, (encodedPacket) => {
        const payloadLength = encodedPacket.length;
        let header;
        if (payloadLength < 126) {
          header = new Uint8Array(1);
          new DataView(header.buffer).setUint8(0, payloadLength);
        } else if (payloadLength < 65536) {
          header = new Uint8Array(3);
          const view = new DataView(header.buffer);
          view.setUint8(0, 126);
          view.setUint16(1, payloadLength);
        } else {
          header = new Uint8Array(9);
          const view = new DataView(header.buffer);
          view.setUint8(0, 127);
          view.setBigUint64(1, BigInt(payloadLength));
        }
        if (packet.data && typeof packet.data !== "string") {
          header[0] |= 128;
        }
        controller.enqueue(header);
        controller.enqueue(encodedPacket);
      });
    }
  });
}
var TEXT_DECODER;
function totalLength(chunks) {
  return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
}
function concatChunks(chunks, size) {
  if (chunks[0].length === size) {
    return chunks.shift();
  }
  const buffer = new Uint8Array(size);
  let j = 0;
  for (let i = 0; i < size; i++) {
    buffer[i] = chunks[0][j++];
    if (j === chunks[0].length) {
      chunks.shift();
      j = 0;
    }
  }
  if (chunks.length && j < chunks[0].length) {
    chunks[0] = chunks[0].slice(j);
  }
  return buffer;
}
function createPacketDecoderStream(maxPayload, binaryType) {
  if (!TEXT_DECODER) {
    TEXT_DECODER = new TextDecoder();
  }
  const chunks = [];
  let state = 0;
  let expectedLength = -1;
  let isBinary2 = false;
  return new TransformStream({
    transform(chunk, controller) {
      chunks.push(chunk);
      while (true) {
        if (state === 0) {
          if (totalLength(chunks) < 1) {
            break;
          }
          const header = concatChunks(chunks, 1);
          isBinary2 = (header[0] & 128) === 128;
          expectedLength = header[0] & 127;
          if (expectedLength < 126) {
            state = 3;
          } else if (expectedLength === 126) {
            state = 1;
          } else {
            state = 2;
          }
        } else if (state === 1) {
          if (totalLength(chunks) < 2) {
            break;
          }
          const headerArray = concatChunks(chunks, 2);
          expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
          state = 3;
        } else if (state === 2) {
          if (totalLength(chunks) < 8) {
            break;
          }
          const headerArray = concatChunks(chunks, 8);
          const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
          const n = view.getUint32(0);
          if (n > Math.pow(2, 53 - 32) - 1) {
            controller.enqueue(ERROR_PACKET);
            break;
          }
          expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
          state = 3;
        } else {
          if (totalLength(chunks) < expectedLength) {
            break;
          }
          const data = concatChunks(chunks, expectedLength);
          controller.enqueue(decodePacket(isBinary2 ? data : TEXT_DECODER.decode(data), binaryType));
          state = 0;
        }
        if (expectedLength === 0 || expectedLength > maxPayload) {
          controller.enqueue(ERROR_PACKET);
          break;
        }
      }
    }
  });
}
var protocol = 4;

// node_modules/@socket.io/component-emitter/lib/esm/index.js
function Emitter(obj) {
  if (obj) return mixin(obj);
}
function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}
Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
  return this;
};
Emitter.prototype.once = function(event, fn) {
  function on2() {
    this.off(event, on2);
    fn.apply(this, arguments);
  }
  on2.fn = fn;
  this.on(event, on2);
  return this;
};
Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
  this._callbacks = this._callbacks || {};
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }
  var callbacks = this._callbacks["$" + event];
  if (!callbacks) return this;
  if (1 == arguments.length) {
    delete this._callbacks["$" + event];
    return this;
  }
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  if (callbacks.length === 0) {
    delete this._callbacks["$" + event];
  }
  return this;
};
Emitter.prototype.emit = function(event) {
  this._callbacks = this._callbacks || {};
  var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }
  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }
  return this;
};
Emitter.prototype.emitReserved = Emitter.prototype.emit;
Emitter.prototype.listeners = function(event) {
  this._callbacks = this._callbacks || {};
  return this._callbacks["$" + event] || [];
};
Emitter.prototype.hasListeners = function(event) {
  return !!this.listeners(event).length;
};

// node_modules/engine.io-client/build/esm/globals.js
var nextTick2 = (() => {
  const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
  if (isPromiseAvailable) {
    return (cb) => Promise.resolve().then(cb);
  } else {
    return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
  }
})();
var globalThisShim = (() => {
  if (typeof self !== "undefined") {
    return self;
  } else if (typeof window !== "undefined") {
    return window;
  } else {
    return Function("return this")();
  }
})();
var defaultBinaryType = "arraybuffer";
function createCookieJar() {
}

// node_modules/engine.io-client/build/esm/util.js
function pick(obj, ...attr) {
  return attr.reduce((acc, k) => {
    if (obj.hasOwnProperty(k)) {
      acc[k] = obj[k];
    }
    return acc;
  }, {});
}
var NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
var NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
function installTimerFunctions(obj, opts) {
  if (opts.useNativeTimers) {
    obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
    obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
  } else {
    obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
    obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
  }
}
var BASE64_OVERHEAD = 1.33;
function byteLength(obj) {
  if (typeof obj === "string") {
    return utf8Length(obj);
  }
  return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
  let c = 0, length = 0;
  for (let i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      length += 1;
    } else if (c < 2048) {
      length += 2;
    } else if (c < 55296 || c >= 57344) {
      length += 3;
    } else {
      i++;
      length += 4;
    }
  }
  return length;
}
function randomString() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}

// node_modules/engine.io-client/build/esm/contrib/parseqs.js
function encode(obj) {
  let str = "";
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length)
        str += "&";
      str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
    }
  }
  return str;
}
function decode2(qs) {
  let qry = {};
  let pairs = qs.split("&");
  for (let i = 0, l = pairs.length; i < l; i++) {
    let pair = pairs[i].split("=");
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
}

// node_modules/engine.io-client/build/esm/transport.js
var TransportError = class extends Error {
  constructor(reason, description, context) {
    super(reason);
    this.description = description;
    this.context = context;
    this.type = "TransportError";
  }
};
var Transport = class extends Emitter {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(opts) {
    super();
    this.writable = false;
    installTimerFunctions(this, opts);
    this.opts = opts;
    this.query = opts.query;
    this.socket = opts.socket;
    this.supportsBinary = !opts.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(reason, description, context) {
    super.emitReserved("error", new TransportError(reason, description, context));
    return this;
  }
  /**
   * Opens the transport.
   */
  open() {
    this.readyState = "opening";
    this.doOpen();
    return this;
  }
  /**
   * Closes the transport.
   */
  close() {
    if (this.readyState === "opening" || this.readyState === "open") {
      this.doClose();
      this.onClose();
    }
    return this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(packets) {
    if (this.readyState === "open") {
      this.write(packets);
    } else {
    }
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open";
    this.writable = true;
    super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(data) {
    const packet = decodePacket(data, this.socket.binaryType);
    this.onPacket(packet);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(packet) {
    super.emitReserved("packet", packet);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(details) {
    this.readyState = "closed";
    super.emitReserved("close", details);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(onPause) {
  }
  createUri(schema, query = {}) {
    return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
  }
  _hostname() {
    const hostname = this.opts.hostname;
    return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
  }
  _port() {
    if (this.opts.port && (this.opts.secure && Number(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80)) {
      return ":" + this.opts.port;
    } else {
      return "";
    }
  }
  _query(query) {
    const encodedQuery = encode(query);
    return encodedQuery.length ? "?" + encodedQuery : "";
  }
};

// node_modules/engine.io-client/build/esm/transports/polling.js
var Polling = class extends Transport {
  constructor() {
    super(...arguments);
    this._polling = false;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(onPause) {
    this.readyState = "pausing";
    const pause = () => {
      this.readyState = "paused";
      onPause();
    };
    if (this._polling || !this.writable) {
      let total = 0;
      if (this._polling) {
        total++;
        this.once("pollComplete", function() {
          --total || pause();
        });
      }
      if (!this.writable) {
        total++;
        this.once("drain", function() {
          --total || pause();
        });
      }
    } else {
      pause();
    }
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = true;
    this.doPoll();
    this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(data) {
    const callback = (packet) => {
      if ("opening" === this.readyState && packet.type === "open") {
        this.onOpen();
      }
      if ("close" === packet.type) {
        this.onClose({ description: "transport closed by the server" });
        return false;
      }
      this.onPacket(packet);
    };
    decodePayload(data, this.socket.binaryType).forEach(callback);
    if ("closed" !== this.readyState) {
      this._polling = false;
      this.emitReserved("pollComplete");
      if ("open" === this.readyState) {
        this._poll();
      } else {
      }
    }
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const close = () => {
      this.write([{ type: "close" }]);
    };
    if ("open" === this.readyState) {
      close();
    } else {
      this.once("open", close);
    }
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(packets) {
    this.writable = false;
    encodePayload(packets, (data) => {
      this.doWrite(data, () => {
        this.writable = true;
        this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "https" : "http";
    const query = this.query || {};
    if (false !== this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary && !query.sid) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};

// node_modules/engine.io-client/build/esm/contrib/has-cors.js
var value = false;
try {
  value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
} catch (err) {
}
var hasCORS = value;

// node_modules/engine.io-client/build/esm/transports/polling-xhr.js
function empty() {
}
var BaseXHR = class extends Polling {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(opts) {
    super(opts);
    if (typeof location !== "undefined") {
      const isSSL = "https:" === location.protocol;
      let port = location.port;
      if (!port) {
        port = isSSL ? "443" : "80";
      }
      this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(data, fn) {
    const req = this.request({
      method: "POST",
      data
    });
    req.on("success", fn);
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr post error", xhrStatus, context);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const req = this.request();
    req.on("data", this.onData.bind(this));
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr poll error", xhrStatus, context);
    });
    this.pollXhr = req;
  }
};
var Request = class _Request extends Emitter {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(createRequest, uri, opts) {
    super();
    this.createRequest = createRequest;
    installTimerFunctions(this, opts);
    this._opts = opts;
    this._method = opts.method || "GET";
    this._uri = uri;
    this._data = void 0 !== opts.data ? opts.data : null;
    this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var _a;
    const opts = pick(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    opts.xdomain = !!this._opts.xd;
    const xhr = this._xhr = this.createRequest(opts);
    try {
      xhr.open(this._method, this._uri, true);
      try {
        if (this._opts.extraHeaders) {
          xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
          for (let i in this._opts.extraHeaders) {
            if (this._opts.extraHeaders.hasOwnProperty(i)) {
              xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
            }
          }
        }
      } catch (e) {
      }
      if ("POST" === this._method) {
        try {
          xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch (e) {
        }
      }
      try {
        xhr.setRequestHeader("Accept", "*/*");
      } catch (e) {
      }
      (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
      if ("withCredentials" in xhr) {
        xhr.withCredentials = this._opts.withCredentials;
      }
      if (this._opts.requestTimeout) {
        xhr.timeout = this._opts.requestTimeout;
      }
      xhr.onreadystatechange = () => {
        var _a2;
        if (xhr.readyState === 3) {
          (_a2 = this._opts.cookieJar) === null || _a2 === void 0 ? void 0 : _a2.parseCookies(
            // @ts-ignore
            xhr.getResponseHeader("set-cookie")
          );
        }
        if (4 !== xhr.readyState)
          return;
        if (200 === xhr.status || 1223 === xhr.status) {
          this._onLoad();
        } else {
          this.setTimeoutFn(() => {
            this._onError(typeof xhr.status === "number" ? xhr.status : 0);
          }, 0);
        }
      };
      xhr.send(this._data);
    } catch (e) {
      this.setTimeoutFn(() => {
        this._onError(e);
      }, 0);
      return;
    }
    if (typeof document !== "undefined") {
      this._index = _Request.requestsCount++;
      _Request.requests[this._index] = this;
    }
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(err) {
    this.emitReserved("error", err, this._xhr);
    this._cleanup(true);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(fromError) {
    if ("undefined" === typeof this._xhr || null === this._xhr) {
      return;
    }
    this._xhr.onreadystatechange = empty;
    if (fromError) {
      try {
        this._xhr.abort();
      } catch (e) {
      }
    }
    if (typeof document !== "undefined") {
      delete _Request.requests[this._index];
    }
    this._xhr = null;
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const data = this._xhr.responseText;
    if (data !== null) {
      this.emitReserved("data", data);
      this.emitReserved("success");
      this._cleanup();
    }
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
};
Request.requestsCount = 0;
Request.requests = {};
if (typeof document !== "undefined") {
  if (typeof attachEvent === "function") {
    attachEvent("onunload", unloadHandler);
  } else if (typeof addEventListener === "function") {
    const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
    addEventListener(terminationEvent, unloadHandler, false);
  }
}
function unloadHandler() {
  for (let i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}
var hasXHR2 = (function() {
  const xhr = newRequest({
    xdomain: false
  });
  return xhr && xhr.responseType !== null;
})();
var XHR = class extends BaseXHR {
  constructor(opts) {
    super(opts);
    const forceBase64 = opts && opts.forceBase64;
    this.supportsBinary = hasXHR2 && !forceBase64;
  }
  request(opts = {}) {
    Object.assign(opts, { xd: this.xd }, this.opts);
    return new Request(newRequest, this.uri(), opts);
  }
};
function newRequest(opts) {
  const xdomain = opts.xdomain;
  try {
    if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) {
  }
  if (!xdomain) {
    try {
      return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch (e) {
    }
  }
}

// node_modules/engine.io-client/build/esm/transports/websocket.js
var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
var BaseWS = class extends Transport {
  get name() {
    return "websocket";
  }
  doOpen() {
    const uri = this.uri();
    const protocols = this.opts.protocols;
    const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    if (this.opts.extraHeaders) {
      opts.headers = this.opts.extraHeaders;
    }
    try {
      this.ws = this.createSocket(uri, protocols, opts);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this.ws.binaryType = this.socket.binaryType;
    this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      if (this.opts.autoUnref) {
        this.ws._socket.unref();
      }
      this.onOpen();
    };
    this.ws.onclose = (closeEvent) => this.onClose({
      description: "websocket connection closed",
      context: closeEvent
    });
    this.ws.onmessage = (ev) => this.onData(ev.data);
    this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(packets) {
    this.writable = false;
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const lastPacket = i === packets.length - 1;
      encodePacket(packet, this.supportsBinary, (data) => {
        try {
          this.doWrite(packet, data);
        } catch (e) {
        }
        if (lastPacket) {
          nextTick2(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    if (typeof this.ws !== "undefined") {
      this.ws.onerror = () => {
      };
      this.ws.close();
      this.ws = null;
    }
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "wss" : "ws";
    const query = this.query || {};
    if (this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};
var WebSocketCtor = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
var WS = class extends BaseWS {
  createSocket(uri, protocols, opts) {
    return !isReactNative ? protocols ? new WebSocketCtor(uri, protocols) : new WebSocketCtor(uri) : new WebSocketCtor(uri, protocols, opts);
  }
  doWrite(_packet, data) {
    this.ws.send(data);
  }
};

// node_modules/engine.io-client/build/esm/transports/webtransport.js
var WT = class extends Transport {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((err) => {
      this.onError("webtransport error", err);
    });
    this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((stream) => {
        const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
        const reader = stream.readable.pipeThrough(decoderStream).getReader();
        const encoderStream = createPacketEncoderStream();
        encoderStream.readable.pipeTo(stream.writable);
        this._writer = encoderStream.writable.getWriter();
        const read = () => {
          reader.read().then(({ done, value: value2 }) => {
            if (done) {
              return;
            }
            this.onPacket(value2);
            read();
          }).catch((err) => {
          });
        };
        read();
        const packet = { type: "open" };
        if (this.query.sid) {
          packet.data = `{"sid":"${this.query.sid}"}`;
        }
        this._writer.write(packet).then(() => this.onOpen());
      });
    });
  }
  write(packets) {
    this.writable = false;
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const lastPacket = i === packets.length - 1;
      this._writer.write(packet).then(() => {
        if (lastPacket) {
          nextTick2(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    var _a;
    (_a = this._transport) === null || _a === void 0 ? void 0 : _a.close();
  }
};

// node_modules/engine.io-client/build/esm/transports/index.js
var transports = {
  websocket: WS,
  webtransport: WT,
  polling: XHR
};

// node_modules/engine.io-client/build/esm/contrib/parseuri.js
var re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
var parts = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function parse(str) {
  if (str.length > 8e3) {
    throw "URI too long";
  }
  const src = str, b = str.indexOf("["), e = str.indexOf("]");
  if (b != -1 && e != -1) {
    str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
  }
  let m = re.exec(str || ""), uri = {}, i = 14;
  while (i--) {
    uri[parts[i]] = m[i] || "";
  }
  if (b != -1 && e != -1) {
    uri.source = src;
    uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
    uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
    uri.ipv6uri = true;
  }
  uri.pathNames = pathNames(uri, uri["path"]);
  uri.queryKey = queryKey(uri, uri["query"]);
  return uri;
}
function pathNames(obj, path) {
  const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
  if (path.slice(0, 1) == "/" || path.length === 0) {
    names.splice(0, 1);
  }
  if (path.slice(-1) == "/") {
    names.splice(names.length - 1, 1);
  }
  return names;
}
function queryKey(uri, query) {
  const data = {};
  query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
    if ($1) {
      data[$1] = $2;
    }
  });
  return data;
}

// node_modules/engine.io-client/build/esm/socket.js
var withEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
var OFFLINE_EVENT_LISTENERS = [];
if (withEventListeners) {
  addEventListener("offline", () => {
    OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
  }, false);
}
var SocketWithoutUpgrade = class _SocketWithoutUpgrade extends Emitter {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(uri, opts) {
    super();
    this.binaryType = defaultBinaryType;
    this.writeBuffer = [];
    this._prevBufferLen = 0;
    this._pingInterval = -1;
    this._pingTimeout = -1;
    this._maxPayload = -1;
    this._pingTimeoutTime = Infinity;
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = null;
    }
    if (uri) {
      const parsedUri = parse(uri);
      opts.hostname = parsedUri.host;
      opts.secure = parsedUri.protocol === "https" || parsedUri.protocol === "wss";
      opts.port = parsedUri.port;
      if (parsedUri.query)
        opts.query = parsedUri.query;
    } else if (opts.host) {
      opts.hostname = parse(opts.host).host;
    }
    installTimerFunctions(this, opts);
    this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
    if (opts.hostname && !opts.port) {
      opts.port = this.secure ? "443" : "80";
    }
    this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
    this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
    this.transports = [];
    this._transportsByName = {};
    opts.transports.forEach((t) => {
      const transportName = t.prototype.name;
      this.transports.push(transportName);
      this._transportsByName[transportName] = t;
    });
    this.opts = Object.assign({
      path: "/engine.io",
      agent: false,
      withCredentials: false,
      upgrade: true,
      timestampParam: "t",
      rememberUpgrade: false,
      addTrailingSlash: true,
      rejectUnauthorized: true,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: false
    }, opts);
    this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
    if (typeof this.opts.query === "string") {
      this.opts.query = decode2(this.opts.query);
    }
    if (withEventListeners) {
      if (this.opts.closeOnBeforeunload) {
        this._beforeunloadEventListener = () => {
          if (this.transport) {
            this.transport.removeAllListeners();
            this.transport.close();
          }
        };
        addEventListener("beforeunload", this._beforeunloadEventListener, false);
      }
      if (this.hostname !== "localhost") {
        this._offlineEventListener = () => {
          this._onClose("transport close", {
            description: "network connection lost"
          });
        };
        OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
      }
    }
    if (this.opts.withCredentials) {
      this._cookieJar = createCookieJar();
    }
    this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(name) {
    const query = Object.assign({}, this.opts.query);
    query.EIO = protocol;
    query.transport = name;
    if (this.id)
      query.sid = this.id;
    const opts = Object.assign({}, this.opts, {
      query,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[name]);
    return new this._transportsByName[name](opts);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const transportName = this.opts.rememberUpgrade && _SocketWithoutUpgrade.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const transport = this.createTransport(transportName);
    transport.open();
    this.setTransport(transport);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(transport) {
    if (this.transport) {
      this.transport.removeAllListeners();
    }
    this.transport = transport;
    transport.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (reason) => this._onClose("transport close", reason));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open";
    _SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === this.transport.name;
    this.emitReserved("open");
    this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(packet) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.emitReserved("packet", packet);
      this.emitReserved("heartbeat");
      switch (packet.type) {
        case "open":
          this.onHandshake(JSON.parse(packet.data));
          break;
        case "ping":
          this._sendPacket("pong");
          this.emitReserved("ping");
          this.emitReserved("pong");
          this._resetPingTimeout();
          break;
        case "error":
          const err = new Error("server error");
          err.code = packet.data;
          this._onError(err);
          break;
        case "message":
          this.emitReserved("data", packet.data);
          this.emitReserved("message", packet.data);
          break;
      }
    } else {
    }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(data) {
    this.emitReserved("handshake", data);
    this.id = data.sid;
    this.transport.query.sid = data.sid;
    this._pingInterval = data.pingInterval;
    this._pingTimeout = data.pingTimeout;
    this._maxPayload = data.maxPayload;
    this.onOpen();
    if ("closed" === this.readyState)
      return;
    this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const delay = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + delay;
    this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, delay);
    if (this.opts.autoUnref) {
      this._pingTimeoutTimer.unref();
    }
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen);
    this._prevBufferLen = 0;
    if (0 === this.writeBuffer.length) {
      this.emitReserved("drain");
    } else {
      this.flush();
    }
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const packets = this._getWritablePackets();
      this.transport.send(packets);
      this._prevBufferLen = packets.length;
      this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    const shouldCheckPayloadSize = this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
    if (!shouldCheckPayloadSize) {
      return this.writeBuffer;
    }
    let payloadSize = 1;
    for (let i = 0; i < this.writeBuffer.length; i++) {
      const data = this.writeBuffer[i].data;
      if (data) {
        payloadSize += byteLength(data);
      }
      if (i > 0 && payloadSize > this._maxPayload) {
        return this.writeBuffer.slice(0, i);
      }
      payloadSize += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return true;
    const hasExpired = Date.now() > this._pingTimeoutTime;
    if (hasExpired) {
      this._pingTimeoutTime = 0;
      nextTick2(() => {
        this._onClose("ping timeout");
      }, this.setTimeoutFn);
    }
    return hasExpired;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(msg, options, fn) {
    this._sendPacket("message", msg, options, fn);
    return this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(msg, options, fn) {
    this._sendPacket("message", msg, options, fn);
    return this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(type, data, options, fn) {
    if ("function" === typeof data) {
      fn = data;
      data = void 0;
    }
    if ("function" === typeof options) {
      fn = options;
      options = null;
    }
    if ("closing" === this.readyState || "closed" === this.readyState) {
      return;
    }
    options = options || {};
    options.compress = false !== options.compress;
    const packet = {
      type,
      data,
      options
    };
    this.emitReserved("packetCreate", packet);
    this.writeBuffer.push(packet);
    if (fn)
      this.once("flush", fn);
    this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const close = () => {
      this._onClose("forced close");
      this.transport.close();
    };
    const cleanupAndClose = () => {
      this.off("upgrade", cleanupAndClose);
      this.off("upgradeError", cleanupAndClose);
      close();
    };
    const waitForUpgrade = () => {
      this.once("upgrade", cleanupAndClose);
      this.once("upgradeError", cleanupAndClose);
    };
    if ("opening" === this.readyState || "open" === this.readyState) {
      this.readyState = "closing";
      if (this.writeBuffer.length) {
        this.once("drain", () => {
          if (this.upgrading) {
            waitForUpgrade();
          } else {
            close();
          }
        });
      } else if (this.upgrading) {
        waitForUpgrade();
      } else {
        close();
      }
    }
    return this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(err) {
    _SocketWithoutUpgrade.priorWebsocketSuccess = false;
    if (this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") {
      this.transports.shift();
      return this._open();
    }
    this.emitReserved("error", err);
    this._onClose("transport error", err);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(reason, description) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.clearTimeoutFn(this._pingTimeoutTimer);
      this.transport.removeAllListeners("close");
      this.transport.close();
      this.transport.removeAllListeners();
      if (withEventListeners) {
        if (this._beforeunloadEventListener) {
          removeEventListener("beforeunload", this._beforeunloadEventListener, false);
        }
        if (this._offlineEventListener) {
          const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
          if (i !== -1) {
            OFFLINE_EVENT_LISTENERS.splice(i, 1);
          }
        }
      }
      this.readyState = "closed";
      this.id = null;
      this.emitReserved("close", reason, description);
      this.writeBuffer = [];
      this._prevBufferLen = 0;
    }
  }
};
SocketWithoutUpgrade.protocol = protocol;
var SocketWithUpgrade = class extends SocketWithoutUpgrade {
  constructor() {
    super(...arguments);
    this._upgrades = [];
  }
  onOpen() {
    super.onOpen();
    if ("open" === this.readyState && this.opts.upgrade) {
      for (let i = 0; i < this._upgrades.length; i++) {
        this._probe(this._upgrades[i]);
      }
    }
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(name) {
    let transport = this.createTransport(name);
    let failed = false;
    SocketWithoutUpgrade.priorWebsocketSuccess = false;
    const onTransportOpen = () => {
      if (failed)
        return;
      transport.send([{ type: "ping", data: "probe" }]);
      transport.once("packet", (msg) => {
        if (failed)
          return;
        if ("pong" === msg.type && "probe" === msg.data) {
          this.upgrading = true;
          this.emitReserved("upgrading", transport);
          if (!transport)
            return;
          SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === transport.name;
          this.transport.pause(() => {
            if (failed)
              return;
            if ("closed" === this.readyState)
              return;
            cleanup();
            this.setTransport(transport);
            transport.send([{ type: "upgrade" }]);
            this.emitReserved("upgrade", transport);
            transport = null;
            this.upgrading = false;
            this.flush();
          });
        } else {
          const err = new Error("probe error");
          err.transport = transport.name;
          this.emitReserved("upgradeError", err);
        }
      });
    };
    function freezeTransport() {
      if (failed)
        return;
      failed = true;
      cleanup();
      transport.close();
      transport = null;
    }
    const onerror = (err) => {
      const error = new Error("probe error: " + err);
      error.transport = transport.name;
      freezeTransport();
      this.emitReserved("upgradeError", error);
    };
    function onTransportClose() {
      onerror("transport closed");
    }
    function onclose() {
      onerror("socket closed");
    }
    function onupgrade(to) {
      if (transport && to.name !== transport.name) {
        freezeTransport();
      }
    }
    const cleanup = () => {
      transport.removeListener("open", onTransportOpen);
      transport.removeListener("error", onerror);
      transport.removeListener("close", onTransportClose);
      this.off("close", onclose);
      this.off("upgrading", onupgrade);
    };
    transport.once("open", onTransportOpen);
    transport.once("error", onerror);
    transport.once("close", onTransportClose);
    this.once("close", onclose);
    this.once("upgrading", onupgrade);
    if (this._upgrades.indexOf("webtransport") !== -1 && name !== "webtransport") {
      this.setTimeoutFn(() => {
        if (!failed) {
          transport.open();
        }
      }, 200);
    } else {
      transport.open();
    }
  }
  onHandshake(data) {
    this._upgrades = this._filterUpgrades(data.upgrades);
    super.onHandshake(data);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(upgrades) {
    const filteredUpgrades = [];
    for (let i = 0; i < upgrades.length; i++) {
      if (~this.transports.indexOf(upgrades[i]))
        filteredUpgrades.push(upgrades[i]);
    }
    return filteredUpgrades;
  }
};
var Socket = class extends SocketWithUpgrade {
  constructor(uri, opts = {}) {
    const o = typeof uri === "object" ? uri : opts;
    if (!o.transports || o.transports && typeof o.transports[0] === "string") {
      o.transports = (o.transports || ["polling", "websocket", "webtransport"]).map((transportName) => transports[transportName]).filter((t) => !!t);
    }
    super(uri, o);
  }
};

// node_modules/engine.io-client/build/esm/index.js
var protocol2 = Socket.protocol;

// node_modules/socket.io-client/build/esm/url.js
function url(uri, path = "", loc) {
  let obj = uri;
  loc = loc || typeof location !== "undefined" && location;
  if (null == uri)
    uri = loc.protocol + "//" + loc.host;
  if (typeof uri === "string") {
    if ("/" === uri.charAt(0)) {
      if ("/" === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }
    if (!/^(https?|wss?):\/\//.test(uri)) {
      if ("undefined" !== typeof loc) {
        uri = loc.protocol + "//" + uri;
      } else {
        uri = "https://" + uri;
      }
    }
    obj = parse(uri);
  }
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = "80";
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = "443";
    }
  }
  obj.path = obj.path || "/";
  const ipv6 = obj.host.indexOf(":") !== -1;
  const host = ipv6 ? "[" + obj.host + "]" : obj.host;
  obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
  obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
  return obj;
}

// node_modules/socket.io-parser/build/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  Decoder: () => Decoder,
  Encoder: () => Encoder,
  PacketType: () => PacketType,
  protocol: () => protocol3
});

// node_modules/socket.io-parser/build/esm/is-binary.js
var withNativeArrayBuffer3 = typeof ArrayBuffer === "function";
var isView2 = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
};
var toString = Object.prototype.toString;
var withNativeBlob2 = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
function isBinary(obj) {
  return withNativeArrayBuffer3 && (obj instanceof ArrayBuffer || isView2(obj)) || withNativeBlob2 && obj instanceof Blob || withNativeFile && obj instanceof File;
}
function hasBinary(obj, toJSON) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      if (hasBinary(obj[i])) {
        return true;
      }
    }
    return false;
  }
  if (isBinary(obj)) {
    return true;
  }
  if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }
  return false;
}

// node_modules/socket.io-parser/build/esm/binary.js
function deconstructPacket(packet) {
  const buffers = [];
  const packetData = packet.data;
  const pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length;
  return { packet: pack, buffers };
}
function _deconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (isBinary(data)) {
    const placeholder = { _placeholder: true, num: buffers.length };
    buffers.push(data);
    return placeholder;
  } else if (Array.isArray(data)) {
    const newData = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      newData[i] = _deconstructPacket(data[i], buffers);
    }
    return newData;
  } else if (typeof data === "object" && !(data instanceof Date)) {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = _deconstructPacket(data[key], buffers);
      }
    }
    return newData;
  }
  return data;
}
function reconstructPacket(packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  delete packet.attachments;
  return packet;
}
function _reconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (data && data._placeholder === true) {
    const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
    if (isIndexValid) {
      return buffers[data.num];
    } else {
      throw new Error("illegal attachments");
    }
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = _reconstructPacket(data[i], buffers);
    }
  } else if (typeof data === "object") {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = _reconstructPacket(data[key], buffers);
      }
    }
  }
  return data;
}

// node_modules/socket.io-parser/build/esm/index.js
var RESERVED_EVENTS = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
];
var protocol3 = 5;
var PacketType;
(function(PacketType2) {
  PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
  PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
  PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
  PacketType2[PacketType2["ACK"] = 3] = "ACK";
  PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
  PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
  PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
var Encoder = class {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(replacer) {
    this.replacer = replacer;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(obj) {
    if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
      if (hasBinary(obj)) {
        return this.encodeAsBinary({
          type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
          nsp: obj.nsp,
          data: obj.data,
          id: obj.id
        });
      }
    }
    return [this.encodeAsString(obj)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(obj) {
    let str = "" + obj.type;
    if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
      str += obj.attachments + "-";
    }
    if (obj.nsp && "/" !== obj.nsp) {
      str += obj.nsp + ",";
    }
    if (null != obj.id) {
      str += obj.id;
    }
    if (null != obj.data) {
      str += JSON.stringify(obj.data, this.replacer);
    }
    return str;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(obj) {
    const deconstruction = deconstructPacket(obj);
    const pack = this.encodeAsString(deconstruction.packet);
    const buffers = deconstruction.buffers;
    buffers.unshift(pack);
    return buffers;
  }
};
function isObject(value2) {
  return Object.prototype.toString.call(value2) === "[object Object]";
}
var Decoder = class _Decoder extends Emitter {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(reviver) {
    super();
    this.reviver = reviver;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(obj) {
    let packet;
    if (typeof obj === "string") {
      if (this.reconstructor) {
        throw new Error("got plaintext data when reconstructing a packet");
      }
      packet = this.decodeString(obj);
      const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
      if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
        packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
        this.reconstructor = new BinaryReconstructor(packet);
        if (packet.attachments === 0) {
          super.emitReserved("decoded", packet);
        }
      } else {
        super.emitReserved("decoded", packet);
      }
    } else if (isBinary(obj) || obj.base64) {
      if (!this.reconstructor) {
        throw new Error("got binary data when not reconstructing a packet");
      } else {
        packet = this.reconstructor.takeBinaryData(obj);
        if (packet) {
          this.reconstructor = null;
          super.emitReserved("decoded", packet);
        }
      }
    } else {
      throw new Error("Unknown type: " + obj);
    }
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(str) {
    let i = 0;
    const p = {
      type: Number(str.charAt(0))
    };
    if (PacketType[p.type] === void 0) {
      throw new Error("unknown packet type " + p.type);
    }
    if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
      const start = i + 1;
      while (str.charAt(++i) !== "-" && i != str.length) {
      }
      const buf = str.substring(start, i);
      if (buf != Number(buf) || str.charAt(i) !== "-") {
        throw new Error("Illegal attachments");
      }
      p.attachments = Number(buf);
    }
    if ("/" === str.charAt(i + 1)) {
      const start = i + 1;
      while (++i) {
        const c = str.charAt(i);
        if ("," === c)
          break;
        if (i === str.length)
          break;
      }
      p.nsp = str.substring(start, i);
    } else {
      p.nsp = "/";
    }
    const next = str.charAt(i + 1);
    if ("" !== next && Number(next) == next) {
      const start = i + 1;
      while (++i) {
        const c = str.charAt(i);
        if (null == c || Number(c) != c) {
          --i;
          break;
        }
        if (i === str.length)
          break;
      }
      p.id = Number(str.substring(start, i + 1));
    }
    if (str.charAt(++i)) {
      const payload = this.tryParse(str.substr(i));
      if (_Decoder.isPayloadValid(p.type, payload)) {
        p.data = payload;
      } else {
        throw new Error("invalid payload");
      }
    }
    return p;
  }
  tryParse(str) {
    try {
      return JSON.parse(str, this.reviver);
    } catch (e) {
      return false;
    }
  }
  static isPayloadValid(type, payload) {
    switch (type) {
      case PacketType.CONNECT:
        return isObject(payload);
      case PacketType.DISCONNECT:
        return payload === void 0;
      case PacketType.CONNECT_ERROR:
        return typeof payload === "string" || isObject(payload);
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        return Array.isArray(payload);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
      this.reconstructor = null;
    }
  }
};
var BinaryReconstructor = class {
  constructor(packet) {
    this.packet = packet;
    this.buffers = [];
    this.reconPack = packet;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(binData) {
    this.buffers.push(binData);
    if (this.buffers.length === this.reconPack.attachments) {
      const packet = reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null;
    this.buffers = [];
  }
};

// node_modules/socket.io-client/build/esm/on.js
function on(obj, ev, fn) {
  obj.on(ev, fn);
  return function subDestroy() {
    obj.off(ev, fn);
  };
}

// node_modules/socket.io-client/build/esm/socket.js
var RESERVED_EVENTS2 = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
var Socket2 = class extends Emitter {
  /**
   * `Socket` constructor.
   */
  constructor(io, nsp, opts) {
    super();
    this.connected = false;
    this.recovered = false;
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this._queue = [];
    this._queueSeq = 0;
    this.ids = 0;
    this.acks = {};
    this.flags = {};
    this.io = io;
    this.nsp = nsp;
    if (opts && opts.auth) {
      this.auth = opts.auth;
    }
    this._opts = Object.assign({}, opts);
    if (this.io._autoConnect)
      this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const io = this.io;
    this.subs = [
      on(io, "open", this.onopen.bind(this)),
      on(io, "packet", this.onpacket.bind(this)),
      on(io, "error", this.onerror.bind(this)),
      on(io, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    if (this.connected)
      return this;
    this.subEvents();
    if (!this.io["_reconnecting"])
      this.io.open();
    if ("open" === this.io._readyState)
      this.onopen();
    return this;
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...args) {
    args.unshift("message");
    this.emit.apply(this, args);
    return this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(ev, ...args) {
    var _a, _b, _c;
    if (RESERVED_EVENTS2.hasOwnProperty(ev)) {
      throw new Error('"' + ev.toString() + '" is a reserved event name');
    }
    args.unshift(ev);
    if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
      this._addToQueue(args);
      return this;
    }
    const packet = {
      type: PacketType.EVENT,
      data: args
    };
    packet.options = {};
    packet.options.compress = this.flags.compress !== false;
    if ("function" === typeof args[args.length - 1]) {
      const id = this.ids++;
      const ack = args.pop();
      this._registerAckCallback(id, ack);
      packet.id = id;
    }
    const isTransportWritable = (_b = (_a = this.io.engine) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.writable;
    const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
    const discardPacket = this.flags.volatile && !isTransportWritable;
    if (discardPacket) {
    } else if (isConnected) {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }
    this.flags = {};
    return this;
  }
  /**
   * @private
   */
  _registerAckCallback(id, ack) {
    var _a;
    const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
    if (timeout === void 0) {
      this.acks[id] = ack;
      return;
    }
    const timer = this.io.setTimeoutFn(() => {
      delete this.acks[id];
      for (let i = 0; i < this.sendBuffer.length; i++) {
        if (this.sendBuffer[i].id === id) {
          this.sendBuffer.splice(i, 1);
        }
      }
      ack.call(this, new Error("operation has timed out"));
    }, timeout);
    const fn = (...args) => {
      this.io.clearTimeoutFn(timer);
      ack.apply(this, args);
    };
    fn.withError = true;
    this.acks[id] = fn;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(ev, ...args) {
    return new Promise((resolve, reject) => {
      const fn = (arg1, arg2) => {
        return arg1 ? reject(arg1) : resolve(arg2);
      };
      fn.withError = true;
      args.push(fn);
      this.emit(ev, ...args);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(args) {
    let ack;
    if (typeof args[args.length - 1] === "function") {
      ack = args.pop();
    }
    const packet = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: false,
      args,
      flags: Object.assign({ fromQueue: true }, this.flags)
    };
    args.push((err, ...responseArgs) => {
      if (packet !== this._queue[0]) {
        return;
      }
      const hasError = err !== null;
      if (hasError) {
        if (packet.tryCount > this._opts.retries) {
          this._queue.shift();
          if (ack) {
            ack(err);
          }
        }
      } else {
        this._queue.shift();
        if (ack) {
          ack(null, ...responseArgs);
        }
      }
      packet.pending = false;
      return this._drainQueue();
    });
    this._queue.push(packet);
    this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(force = false) {
    if (!this.connected || this._queue.length === 0) {
      return;
    }
    const packet = this._queue[0];
    if (packet.pending && !force) {
      return;
    }
    packet.pending = true;
    packet.tryCount++;
    this.flags = packet.flags;
    this.emit.apply(this, packet.args);
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(packet) {
    packet.nsp = this.nsp;
    this.io._packet(packet);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    if (typeof this.auth == "function") {
      this.auth((data) => {
        this._sendConnectPacket(data);
      });
    } else {
      this._sendConnectPacket(this.auth);
    }
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(data) {
    this.packet({
      type: PacketType.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data) : data
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(err) {
    if (!this.connected) {
      this.emitReserved("connect_error", err);
    }
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(reason, description) {
    this.connected = false;
    delete this.id;
    this.emitReserved("disconnect", reason, description);
    this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((id) => {
      const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
      if (!isBuffered) {
        const ack = this.acks[id];
        delete this.acks[id];
        if (ack.withError) {
          ack.call(this, new Error("socket has been disconnected"));
        }
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(packet) {
    const sameNamespace = packet.nsp === this.nsp;
    if (!sameNamespace)
      return;
    switch (packet.type) {
      case PacketType.CONNECT:
        if (packet.data && packet.data.sid) {
          this.onconnect(packet.data.sid, packet.data.pid);
        } else {
          this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
        }
        break;
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        this.onevent(packet);
        break;
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        this.onack(packet);
        break;
      case PacketType.DISCONNECT:
        this.ondisconnect();
        break;
      case PacketType.CONNECT_ERROR:
        this.destroy();
        const err = new Error(packet.data.message);
        err.data = packet.data.data;
        this.emitReserved("connect_error", err);
        break;
    }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(packet) {
    const args = packet.data || [];
    if (null != packet.id) {
      args.push(this.ack(packet.id));
    }
    if (this.connected) {
      this.emitEvent(args);
    } else {
      this.receiveBuffer.push(Object.freeze(args));
    }
  }
  emitEvent(args) {
    if (this._anyListeners && this._anyListeners.length) {
      const listeners = this._anyListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
    super.emit.apply(this, args);
    if (this._pid && args.length && typeof args[args.length - 1] === "string") {
      this._lastOffset = args[args.length - 1];
    }
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(id) {
    const self2 = this;
    let sent = false;
    return function(...args) {
      if (sent)
        return;
      sent = true;
      self2.packet({
        type: PacketType.ACK,
        id,
        data: args
      });
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(packet) {
    const ack = this.acks[packet.id];
    if (typeof ack !== "function") {
      return;
    }
    delete this.acks[packet.id];
    if (ack.withError) {
      packet.data.unshift(null);
    }
    ack.apply(this, packet.data);
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(id, pid) {
    this.id = id;
    this.recovered = pid && this._pid === pid;
    this._pid = pid;
    this.connected = true;
    this.emitBuffered();
    this.emitReserved("connect");
    this._drainQueue(true);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((args) => this.emitEvent(args));
    this.receiveBuffer = [];
    this.sendBuffer.forEach((packet) => {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    });
    this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy();
    this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    if (this.subs) {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs = void 0;
    }
    this.io["_destroy"](this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    if (this.connected) {
      this.packet({ type: PacketType.DISCONNECT });
    }
    this.destroy();
    if (this.connected) {
      this.onclose("io client disconnect");
    }
    return this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(compress) {
    this.flags.compress = compress;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    this.flags.volatile = true;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(timeout) {
    this.flags.timeout = timeout;
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(listener) {
    if (!this._anyListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyListeners;
      for (let i = 0; i < listeners.length; i++) {
        if (listener === listeners[i]) {
          listeners.splice(i, 1);
          return this;
        }
      }
    } else {
      this._anyListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(listener) {
    if (!this._anyOutgoingListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyOutgoingListeners;
      for (let i = 0; i < listeners.length; i++) {
        if (listener === listeners[i]) {
          listeners.splice(i, 1);
          return this;
        }
      }
    } else {
      this._anyOutgoingListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(packet) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const listeners = this._anyOutgoingListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, packet.data);
      }
    }
  }
};

// node_modules/socket.io-client/build/esm/contrib/backo2.js
function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 1e4;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}
Backoff.prototype.duration = function() {
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand = Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};
Backoff.prototype.reset = function() {
  this.attempts = 0;
};
Backoff.prototype.setMin = function(min) {
  this.ms = min;
};
Backoff.prototype.setMax = function(max) {
  this.max = max;
};
Backoff.prototype.setJitter = function(jitter) {
  this.jitter = jitter;
};

// node_modules/socket.io-client/build/esm/manager.js
var Manager = class extends Emitter {
  constructor(uri, opts) {
    var _a;
    super();
    this.nsps = {};
    this.subs = [];
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    opts.path = opts.path || "/socket.io";
    this.opts = opts;
    installTimerFunctions(this, opts);
    this.reconnection(opts.reconnection !== false);
    this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
    this.reconnectionDelay(opts.reconnectionDelay || 1e3);
    this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
    this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
    this.backoff = new Backoff({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    });
    this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
    this._readyState = "closed";
    this.uri = uri;
    const _parser = opts.parser || esm_exports;
    this.encoder = new _parser.Encoder();
    this.decoder = new _parser.Decoder();
    this._autoConnect = opts.autoConnect !== false;
    if (this._autoConnect)
      this.open();
  }
  reconnection(v) {
    if (!arguments.length)
      return this._reconnection;
    this._reconnection = !!v;
    if (!v) {
      this.skipReconnect = true;
    }
    return this;
  }
  reconnectionAttempts(v) {
    if (v === void 0)
      return this._reconnectionAttempts;
    this._reconnectionAttempts = v;
    return this;
  }
  reconnectionDelay(v) {
    var _a;
    if (v === void 0)
      return this._reconnectionDelay;
    this._reconnectionDelay = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
    return this;
  }
  randomizationFactor(v) {
    var _a;
    if (v === void 0)
      return this._randomizationFactor;
    this._randomizationFactor = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
    return this;
  }
  reconnectionDelayMax(v) {
    var _a;
    if (v === void 0)
      return this._reconnectionDelayMax;
    this._reconnectionDelayMax = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
    return this;
  }
  timeout(v) {
    if (!arguments.length)
      return this._timeout;
    this._timeout = v;
    return this;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
      this.reconnect();
    }
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(fn) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new Socket(this.uri, this.opts);
    const socket2 = this.engine;
    const self2 = this;
    this._readyState = "opening";
    this.skipReconnect = false;
    const openSubDestroy = on(socket2, "open", function() {
      self2.onopen();
      fn && fn();
    });
    const onError = (err) => {
      this.cleanup();
      this._readyState = "closed";
      this.emitReserved("error", err);
      if (fn) {
        fn(err);
      } else {
        this.maybeReconnectOnOpen();
      }
    };
    const errorSub = on(socket2, "error", onError);
    if (false !== this._timeout) {
      const timeout = this._timeout;
      const timer = this.setTimeoutFn(() => {
        openSubDestroy();
        onError(new Error("timeout"));
        socket2.close();
      }, timeout);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
    this.subs.push(openSubDestroy);
    this.subs.push(errorSub);
    return this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(fn) {
    return this.open(fn);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup();
    this._readyState = "open";
    this.emitReserved("open");
    const socket2 = this.engine;
    this.subs.push(
      on(socket2, "ping", this.onping.bind(this)),
      on(socket2, "data", this.ondata.bind(this)),
      on(socket2, "error", this.onerror.bind(this)),
      on(socket2, "close", this.onclose.bind(this)),
      // @ts-ignore
      on(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(data) {
    try {
      this.decoder.add(data);
    } catch (e) {
      this.onclose("parse error", e);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(packet) {
    nextTick2(() => {
      this.emitReserved("packet", packet);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(err) {
    this.emitReserved("error", err);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(nsp, opts) {
    let socket2 = this.nsps[nsp];
    if (!socket2) {
      socket2 = new Socket2(this, nsp, opts);
      this.nsps[nsp] = socket2;
    } else if (this._autoConnect && !socket2.active) {
      socket2.connect();
    }
    return socket2;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(socket2) {
    const nsps = Object.keys(this.nsps);
    for (const nsp of nsps) {
      const socket3 = this.nsps[nsp];
      if (socket3.active) {
        return;
      }
    }
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(packet) {
    const encodedPackets = this.encoder.encode(packet);
    for (let i = 0; i < encodedPackets.length; i++) {
      this.engine.write(encodedPackets[i], packet.options);
    }
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((subDestroy) => subDestroy());
    this.subs.length = 0;
    this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = true;
    this._reconnecting = false;
    this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(reason, description) {
    var _a;
    this.cleanup();
    (_a = this.engine) === null || _a === void 0 ? void 0 : _a.close();
    this.backoff.reset();
    this._readyState = "closed";
    this.emitReserved("close", reason, description);
    if (this._reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const self2 = this;
    if (this.backoff.attempts >= this._reconnectionAttempts) {
      this.backoff.reset();
      this.emitReserved("reconnect_failed");
      this._reconnecting = false;
    } else {
      const delay = this.backoff.duration();
      this._reconnecting = true;
      const timer = this.setTimeoutFn(() => {
        if (self2.skipReconnect)
          return;
        this.emitReserved("reconnect_attempt", self2.backoff.attempts);
        if (self2.skipReconnect)
          return;
        self2.open((err) => {
          if (err) {
            self2._reconnecting = false;
            self2.reconnect();
            this.emitReserved("reconnect_error", err);
          } else {
            self2.onreconnect();
          }
        });
      }, delay);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const attempt = this.backoff.attempts;
    this._reconnecting = false;
    this.backoff.reset();
    this.emitReserved("reconnect", attempt);
  }
};

// node_modules/socket.io-client/build/esm/index.js
var cache = {};
function lookup2(uri, opts) {
  if (typeof uri === "object") {
    opts = uri;
    uri = void 0;
  }
  opts = opts || {};
  const parsed = url(uri, opts.path || "/socket.io");
  const source = parsed.source;
  const id = parsed.id;
  const path = parsed.path;
  const sameNamespace = cache[id] && path in cache[id]["nsps"];
  const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
  let io;
  if (newConnection) {
    io = new Manager(source, opts);
  } else {
    if (!cache[id]) {
      cache[id] = new Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.queryKey;
  }
  return io.socket(parsed.path, opts);
}
Object.assign(lookup2, {
  Manager,
  Socket: Socket2,
  io: lookup2,
  connect: lookup2
});

// src/utils/getCurrentUser.ts
var log2 = new extLogger("utils/getCurrentUser.ts");
function getCurrentUser() {
  const headerUser = document.querySelector(".header__subitem-head");
  const avatar = headerUser?.querySelector("img")?.getAttribute("src") || "";
  const id = parseInt(
    headerUser?.querySelector("a")?.getAttribute("href")?.match(/\.([0-9]+)\//)?.[1] || "0"
  );
  const nickname = headerUser?.querySelector(".header__subitem-text--name")?.textContent?.trim() || "";
  return {
    avatar,
    id,
    nickname,
    token: ""
  };
}

// src/utils/isAuth.ts
var log3 = new extLogger("utils/isAuth.ts");
function isAuth() {
  const user = getCurrentUser();
  return user.id > 0 && user.nickname !== "";
}

// src/utils/findSmileById.ts
var log4 = new extLogger("utils/findSmileById.ts");
async function findSmileById(id) {
  const smiles = await getSmiles();
  return smiles.smiles.find((smile) => smile.id === id);
}

// src/api/saveSignature.ts
async function saveSignature({ signature }) {
  return await parseJson("https://dota2.ru/forum/api/user/changeSettings", { signature });
}

// src/vue/chat/socket.ts
var socket = lookup2("ws://localhost:5569", {
  transports: ["websocket"],
  autoConnect: false
});
var log5 = new extLogger("vue/chat/socket.ts");
if (true) {
  const origOn = socket.on.bind(socket);
  socket.on = function(event, callback) {
    const wrappedCallback = (...args) => {
      log5.info("[RECV]", event, args);
      callback(...args);
    };
    return origOn(event, wrappedCallback);
  };
  const origEmit = socket.emit.bind(socket);
  socket.emit = function(event, ...args) {
    log5.info("[EMIT]", event, args);
    return origEmit(event, ...args);
  };
}
var socketStatus = ref("connecting");
var usersTyping = ref([]);
var usersOnline = ref([]);
var usersOffline = ref([]);
var messages = ref([]);
var unreadMessagesCount = ref(0);
var connectSocket = () => {
  if (!isAuth()) {
    socketStatus.value = "unauthorized";
    return;
  }
  socket.connect();
  socketStatus.value = "connecting";
};
socket.on("connect", () => {
  socketStatus.value = "authorization";
  messages.value = [];
  socket.emit("authorization", {
    user_id: currentUser.id,
    user_token: currentUser.token,
    version_token: "llutNoShhOFnwlZASEDztQs"
  });
});
socket.on("version_check_failed", () => {
  socketStatus.value = "version_check_failed";
});
socket.on("disconnect", () => {
  socketStatus.value = "disconnected";
});
socket.on("connect_error", () => {
  socketStatus.value = "error";
});
socket.on("authorized_successful", (token) => {
  currentUser.token = token;
  socketStatus.value = "authorizationSuccess";
  socket.emit("getMessages");
  socket.emit("getOnline");
  socket.emit("getOffline");
});
socket.on("registration_successful", async () => {
  await saveSignature({ signature: "" });
});
socket.on("registration", async ({ prefix, code }) => {
  const USER_IS_BANNED = `USER_IS_BANNED_${currentUser.id}`;
  if (sessionStorage.getItem(USER_IS_BANNED) === "true") {
    socketStatus.value = "banned";
    return;
  }
  const res = await saveSignature({ signature: `${prefix}${code}` });
  switch (res.status) {
    case "success": {
      socketStatus.value = "registration_check";
      socket.emit("registrationCheck", {
        user_id: currentUser.id,
        code
      });
      break;
    }
    case "accessDenied": {
      socketStatus.value = "banned";
      sessionStorage.setItem(USER_IS_BANNED, "true");
      break;
    }
    default: {
      socketStatus.value = "registration_error";
    }
  }
});
socket.on("onlineUsers", (data) => {
  usersOnline.value = data;
});
socket.on("offlineUsers", (data) => {
  usersOffline.value = data;
});
socket.on("typing", (data) => handleUserTyping(data));
socket.on(
  "messages",
  async (data) => {
    for (const msg of data) {
      await addMessage(msg.id, msg.user, msg.message, msg.time);
    }
  }
);
var waitOldMessages = ref(false);
var loadOldMessages = async () => {
  if (waitOldMessages.value) {
    return;
  }
  const [firstMessage] = messages.value || [];
  if (!firstMessage) {
    return;
  }
  waitOldMessages.value = true;
  socket.emit("getOldMessages", {
    before: firstMessage.id
  });
};
socket.on(
  "oldMessages",
  async (data) => {
    for (const msg of data) {
      await addMessage(msg.id, msg.user, msg.message, msg.time, false);
    }
    waitOldMessages.value = false;
  }
);
var formatTime = (date) => {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};
var hasPingMe = (text) => {
  const regex = new RegExp(`\\[user\\|${currentUser.id}\\|[^\\]]+\\]`, "g");
  return regex.test(text);
};
var addMessage = async (id, user, msg, time, start = true) => {
  removeUserTyping(user.id);
  const original = msg;
  const parser = new DOMParser();
  const doc = parser.parseFromString(msg, "text/html");
  msg = doc.body.textContent || "";
  msg = msg.replace(/(\[br\]){3,}/g, "[br][br]").replace(/\[br\]/g, "<br>");
  const smileMatches = [...msg.matchAll(/\[smile\|(\d+)\]/g)];
  for (const match of smileMatches) {
    const id2 = match[1];
    const smile = await findSmileById(id2);
    if (smile?.filename) {
      const path = `/img/forum/emoticons/${getFileName(smile.filename)}`;
      const tag = `<img class="emoji" data-id="${id2}" src="${path}" alt="${smile.symbol}">`;
      msg = msg.replace(match[0], tag);
    }
  }
  msg = msg.replace(
    /\[user\|(\d+)\|([^\]]+)\]/g,
    (_, id2, nickname) => `<a class='user-tag' target='_blank' href='/forum/members/${nickname}.${id2}'>${nickname}</a>`
  );
  const arr = {
    id,
    user,
    message: msg,
    date: formatTime(time),
    pingMe: hasPingMe(original)
  };
  if (start) {
    messages.value.push(arr);
  } else {
    messages.value.unshift(arr);
  }
};
var typingTimers = /* @__PURE__ */ new Map();
function handleUserTyping(user) {
  const exists = usersTyping.value.some((u) => u.id === user.id);
  if (!exists) usersTyping.value.push(user);
  if (typingTimers.has(user.id)) clearTimeout(typingTimers.get(user.id));
  const timer = setTimeout(() => removeUserTyping(user.id), 3e3);
  typingTimers.set(user.id, timer);
}
function removeUserTyping(userId) {
  usersTyping.value = usersTyping.value.filter((u) => u.id !== userId);
  if (typingTimers.has(userId)) {
    clearTimeout(typingTimers.get(userId));
    typingTimers.delete(userId);
  }
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\ChatHeader.vue?type=script
var ChatHeader_default = /* @__PURE__ */ defineComponent({
  __name: "ChatHeader",
  props: {
    isValidConnected: { type: Boolean, required: true }
  },
  emits: ["toggleOnlineList", "toggleFullscreen", "close"],
  setup(__props, { expose: __expose }) {
    __expose();
    const onlineCount = computed(() => usersOnline.value.length);
    const __returned__ = { onlineCount, get chatSettings() {
      return chatSettings;
    }, get getExtUrl() {
      return getExtUrl;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\ChatHeader.vue?type=template
var _hoisted_14 = ["src"];
var _hoisted_24 = ["src"];
var _hoisted_34 = ["src"];
function render4(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(
    Fragment,
    null,
    [
      $props.isValidConnected ? (openBlock(), createElementBlock("button", {
        key: 0,
        class: "users-btn",
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("toggleOnlineList"))
      }, [
        createBaseVNode("img", {
          src: $setup.getExtUrl("assets/users.svg")
        }, null, 8, _hoisted_14),
        createBaseVNode(
          "span",
          null,
          toDisplayString($setup.onlineCount),
          1
          /* TEXT */
        )
      ])) : createCommentVNode("v-if", true),
      $props.isValidConnected ? (openBlock(), createElementBlock("button", {
        key: 1,
        onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("toggleFullscreen"))
      }, [
        createBaseVNode("img", {
          src: $setup.chatSettings.isFullscreen ? $setup.getExtUrl("assets/arrowsIn.svg") : $setup.getExtUrl("assets/arrowsOut.svg")
        }, null, 8, _hoisted_24)
      ])) : createCommentVNode("v-if", true),
      createBaseVNode("button", {
        onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("close"))
      }, [
        createBaseVNode("img", {
          src: $setup.getExtUrl("assets/close.svg")
        }, null, 8, _hoisted_34)
      ])
    ],
    64
    /* STABLE_FRAGMENT */
  );
}

// src/vue/chat/ChatHeader.vue
ChatHeader_default.render = render4;
ChatHeader_default.__file = "src\\vue\\chat\\ChatHeader.vue";
var ChatHeader_default2 = ChatHeader_default;

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\ChatMessageList.vue?type=script
var ChatMessageList_default = /* @__PURE__ */ defineComponent({
  __name: "ChatMessageList",
  emits: ["insertUser"],
  setup(__props, { expose: __expose }) {
    const messagesContainer = ref(null);
    const scrolledToTop = ref(true);
    const scrolledToBottom = ref(true);
    const lastScrollTop = ref(0);
    const scrollDirection = ref(null);
    const isScrolledToBottom = () => {
      if (!messagesContainer.value) return false;
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
      return scrollTop + clientHeight >= scrollHeight - 20;
    };
    const isScrolledToTop = () => {
      if (!messagesContainer.value) return false;
      const { scrollTop } = messagesContainer.value;
      return scrollTop <= 100;
    };
    const onScroll = async (event) => {
      const scrollTop = event.target.scrollTop;
      if (scrollTop > lastScrollTop.value) {
        scrollDirection.value = "down";
      } else if (scrollTop < lastScrollTop.value) {
        scrollDirection.value = "up";
      }
      lastScrollTop.value = scrollTop <= 0 ? 0 : scrollTop;
      switch (scrollDirection.value) {
        case "down": {
          scrolledToBottom.value = isScrolledToBottom();
          if (scrolledToBottom.value) {
            unreadMessagesCount.value = 0;
            console.log("down");
          }
          break;
        }
        case "up": {
          scrolledToTop.value = isScrolledToTop();
          if (scrolledToTop.value) {
            await loadOldMessages();
          }
          break;
        }
      }
    };
    const scrollToBottom = () => {
      nextTick(() => {
        if (!messagesContainer.value || !messagesContainer.value?.offsetHeight) return;
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        scrolledToBottom.value = true;
        unreadMessagesCount.value = 0;
      });
    };
    const scrollToBottomSmooth = () => {
      nextTick(() => {
        if (!messagesContainer.value || !messagesContainer.value?.offsetHeight) return;
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: "smooth"
        });
        unreadMessagesCount.value = 0;
      });
    };
    socket.on(
      "newMessage",
      async (data) => {
        const { user, message, time, id } = data;
        const shouldScroll = isScrolledToBottom();
        await addMessage(id, user, message, time);
        unreadMessagesCount.value++;
        if (shouldScroll) scrollToBottom();
      }
    );
    __expose({
      scrollToBottom,
      scrollToBottomSmooth,
      isScrolledToBottom,
      messagesContainer,
      scrolledToBottom
    });
    const __returned__ = { messagesContainer, scrolledToTop, scrolledToBottom, lastScrollTop, scrollDirection, isScrolledToBottom, isScrolledToTop, onScroll, scrollToBottom, scrollToBottomSmooth, get messages() {
      return messages;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\ChatMessageList.vue?type=template
var _hoisted_15 = ["src"];
var _hoisted_25 = ["id"];
var _hoisted_35 = ["onClick"];
var _hoisted_42 = { class: "time" };
var _hoisted_52 = ["innerHTML"];
function render5(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(
    "div",
    {
      class: "messages",
      ref: "messagesContainer",
      onScroll: $setup.onScroll
    },
    [
      createVNode(TransitionGroup, {
        name: "fade-up",
        tag: "div"
      }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList($setup.messages, (msg, index) => {
              return openBlock(), createElementBlock(
                "div",
                {
                  key: msg.id,
                  class: normalizeClass(["message", { pingMe: msg.pingMe }])
                },
                [
                  createBaseVNode("img", {
                    class: "avatar",
                    src: msg.user.avatar
                  }, null, 8, _hoisted_15),
                  createBaseVNode("div", {
                    class: "content",
                    id: "chat_message_" + msg.id
                  }, [
                    createBaseVNode("span", {
                      class: "username",
                      onClick: ($event) => _ctx.$emit("insertUser", msg.user)
                    }, [
                      createTextVNode(
                        toDisplayString(msg.user.nickname) + " ",
                        1
                        /* TEXT */
                      ),
                      createBaseVNode(
                        "span",
                        _hoisted_42,
                        toDisplayString(msg.date) + " " + toDisplayString(msg.id),
                        1
                        /* TEXT */
                      )
                    ], 8, _hoisted_35),
                    createBaseVNode("span", {
                      class: "text",
                      innerHTML: msg.message
                    }, null, 8, _hoisted_52)
                  ], 8, _hoisted_25)
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        _: 1
        /* STABLE */
      }),
      _cache[0] || (_cache[0] = createBaseVNode(
        "div",
        { class: "plug" },
        null,
        -1
        /* CACHED */
      ))
    ],
    544
    /* NEED_HYDRATION, NEED_PATCH */
  );
}

// src/vue/chat/ChatMessageList.vue
ChatMessageList_default.render = render5;
ChatMessageList_default.__file = "src\\vue\\chat\\ChatMessageList.vue";
var ChatMessageList_default2 = ChatMessageList_default;

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\UsersList.vue?type=script
var UsersList_default = /* @__PURE__ */ defineComponent({
  __name: "UsersList",
  emits: ["insertUser"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const onlineContainer = ref(null);
    __expose({
      onlineContainer
    });
    const __returned__ = { emit, onlineContainer, get usersOffline() {
      return usersOffline;
    }, get usersOnline() {
      return usersOnline;
    }, get chatSettings() {
      return chatSettings;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\UsersList.vue?type=template
var _hoisted_16 = {
  class: "onlineUsers",
  ref: "onlineContainer"
};
var _hoisted_26 = { class: "title" };
var _hoisted_36 = ["onClick"];
var _hoisted_43 = ["src"];
var _hoisted_53 = { class: "title" };
var _hoisted_62 = ["onClick"];
var _hoisted_72 = ["src"];
function render6(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(Transition, {
    name: "slide-right",
    persisted: ""
  }, {
    default: withCtx(() => [
      withDirectives(createBaseVNode(
        "div",
        _hoisted_16,
        [
          createBaseVNode(
            "div",
            _hoisted_26,
            "\u0421\u0435\u0439\u0447\u0430\u0441 \u043E\u043D\u043B\u0430\u0439\u043D " + toDisplayString($setup.usersOnline.length),
            1
            /* TEXT */
          ),
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList($setup.usersOnline, (user) => {
              return openBlock(), createElementBlock("div", {
                key: user.id,
                class: "onlineUser",
                onClick: ($event) => _ctx.$emit("insertUser", user)
              }, [
                createBaseVNode("img", {
                  class: "avatar",
                  src: user.avatar
                }, null, 8, _hoisted_43),
                createBaseVNode(
                  "span",
                  null,
                  toDisplayString(user.nickname),
                  1
                  /* TEXT */
                )
              ], 8, _hoisted_36);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          createBaseVNode(
            "div",
            _hoisted_53,
            "\u041D\u0435 \u0432 \u0441\u0435\u0442\u0438 " + toDisplayString($setup.usersOffline.length),
            1
            /* TEXT */
          ),
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList($setup.usersOffline, (user) => {
              return openBlock(), createElementBlock("div", {
                key: user.id,
                class: "onlineUser",
                onClick: ($event) => _ctx.$emit("insertUser", user)
              }, [
                createBaseVNode("img", {
                  class: "avatar",
                  src: user.avatar
                }, null, 8, _hoisted_72),
                createBaseVNode(
                  "span",
                  null,
                  toDisplayString(user.nickname),
                  1
                  /* TEXT */
                )
              ], 8, _hoisted_62);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        512
        /* NEED_PATCH */
      ), [
        [vShow, $setup.chatSettings.openOnline]
      ])
    ]),
    _: 1
    /* STABLE */
  });
}

// src/vue/chat/UsersList.vue
UsersList_default.render = render6;
UsersList_default.__file = "src\\vue\\chat\\UsersList.vue";
var UsersList_default2 = UsersList_default;

// src/api/searchUser.ts
async function searchUser({ query }) {
  return query.length > 2 ? await parseJson("/forum/api/forum/getUsers", { query }) : [];
}

// src/utils/throttle.ts
var log6 = new extLogger("utils/throttle.ts");
function throttle(fn, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\chatInput.vue?type=script
var chatInput_default = /* @__PURE__ */ defineComponent({
  __name: "chatInput",
  emits: ["input"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const editor = ref(null);
    const trigger = ref(null);
    const suggestions = ref([]);
    const selectedIndex = ref(0);
    const savedRange = ref(null);
    const inputHeight = ref(0);
    const adjustHeight = () => {
      if (!editor.value) return;
      editor.value.style.height = "auto";
      const max = 80;
      editor.value.style.height = Math.min(editor.value.scrollHeight, max) + "px";
      inputHeight.value = editor.value.offsetHeight;
    };
    const saveCaret = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        savedRange.value = sel.getRangeAt(0).cloneRange();
      }
    };
    function restoreCaret() {
      if (!savedRange.value) return;
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(savedRange.value);
    }
    function getCaretOffset(el) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return 0;
      const range = sel.getRangeAt(0).cloneRange();
      range.selectNodeContents(el);
      range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
      return range.toString().length;
    }
    const insertNodeAtCaret = (node) => {
      if (!editor.value) return;
      editor.value.focus();
      let sel = window.getSelection();
      if (!sel) {
        return;
      }
      if (!sel.rangeCount && savedRange.value) {
        restoreCaret();
        sel = window.getSelection();
        if (!sel) return;
      }
      const range = sel.rangeCount ? sel.getRangeAt(0) : savedRange.value;
      if (!range) return;
      range.deleteContents();
      range.insertNode(node);
      const after = document.createRange();
      after.setStartAfter(node);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      saveCaret();
      adjustHeight();
    };
    async function searchEmojis(query) {
      const smiles = await getSmiles();
      return smiles.smiles.filter((smile) => smile.title.toLowerCase().includes(query)).slice(0, 10);
    }
    async function searchUsers(query) {
      const results = await searchUser({ query });
      return results.map(
        (e) => ({
          id: Number(e.id),
          nickname: e.name,
          avatar: e.avatar
        })
      );
    }
    const insertUser = (user) => {
      const span = document.createElement("span");
      span.className = "user-tag";
      span.contentEditable = "false";
      span.dataset.userId = String(user.id);
      span.dataset.nickname = user.nickname;
      span.textContent = user.nickname;
      insertNodeAtCaret(span);
      if (!editor.value) return;
      emit("input", editor.value.innerText);
    };
    const insertSmile = (emoji) => {
      console.log(emoji);
      const img = document.createElement("img");
      img.className = "emoji";
      img.contentEditable = "false";
      img.dataset.code = emoji.symbol;
      img.dataset.id = emoji.id;
      img.src = emoji.filename || "";
      img.alt = emoji.symbol;
      insertNodeAtCaret(img);
      if (!editor.value) return;
      emit("input", editor.value.innerText);
    };
    __expose({
      insertUser,
      insertSmile
    });
    function typing() {
      socket.emit("sendTyping", {
        token: currentUser.token
      });
    }
    const throttledTyping = throttle(typing, 2500);
    const handleInput = async () => {
      if (!editor.value) return;
      saveCaret();
      const text = editor.value.innerText;
      throttledTyping();
      const textBefore = text.slice(0, getCaretOffset(editor.value));
      const atMatch = /@([\wа-яё]*)$/.exec(textBefore);
      const colonMatch = /:([\wа-яё]*)$/.exec(textBefore);
      if (atMatch) {
        trigger.value = "@";
        const query = atMatch[1].toLowerCase();
        const users = await Promise.resolve(searchUsers(query));
        suggestions.value = users.map((u) => ({
          label: u.nickname,
          id: u.id,
          avatar: u.avatar,
          value: u.nickname
        }));
        selectedIndex.value = 0;
      } else if (colonMatch) {
        trigger.value = ":";
        const query = colonMatch[1].toLowerCase();
        const emojis = await Promise.resolve(searchEmojis(query));
        suggestions.value = emojis.map((e) => ({
          id: e.id,
          label: e.symbol,
          value: e.symbol,
          image: getSmileUrl(e)
        }));
        selectedIndex.value = 0;
      } else {
        trigger.value = null;
        suggestions.value = [];
      }
      adjustHeight();
    };
    const insertLineBreak = () => {
      if (!editor.value) return;
      editor.value.focus();
      let sel = window.getSelection();
      if (!sel) return;
      if (!sel.rangeCount && savedRange.value) {
        restoreCaret();
        sel = window.getSelection();
        if (!sel) return;
      }
      const range = sel.rangeCount ? sel.getRangeAt(0) : savedRange.value;
      if (!range) return;
      range.deleteContents();
      const br = document.createElement("br");
      range.insertNode(br);
      const zwsp = document.createTextNode("\u200B");
      br.parentNode?.insertBefore(zwsp, br.nextSibling);
      const newRange = document.createRange();
      newRange.setStartAfter(zwsp);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      saveCaret();
      adjustHeight();
    };
    const onKeyDown = (e) => {
      if (suggestions.value.length) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          selectedIndex.value = (selectedIndex.value + 1) % suggestions.value.length;
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          selectedIndex.value = (selectedIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
          return;
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          selectSuggestion(suggestions.value[selectedIndex.value]);
          return;
        }
        if (e.key === "Escape") {
          suggestions.value = [];
          trigger.value = null;
          return;
        }
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        return;
      }
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        insertLineBreak();
        return;
      }
    };
    const removeTriggerText = () => {
      if (!editor.value || !savedRange.value || !trigger.value) return;
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(savedRange.value);
      const range = sel.getRangeAt(0);
      const container = range.startContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        const node = container;
        const text = node.textContent ?? "";
        const caretPos = range.startOffset;
        const trigIndex = text.lastIndexOf(trigger.value, caretPos - 1);
        if (trigIndex >= 0) {
          node.textContent = text.slice(0, trigIndex) + text.slice(caretPos);
          const newRange = document.createRange();
          newRange.setStart(node, trigIndex);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          saveCaret();
        }
        return;
      }
      let cur = container;
      while (cur && cur.nodeType !== Node.TEXT_NODE) {
        cur = cur.childNodes[range.startOffset - 1] || cur.previousSibling;
      }
      if (cur && cur.nodeType === Node.TEXT_NODE) {
        const node = cur;
        const text = node.textContent ?? "";
        const caretPos = (node.textContent || "").length;
        const trigIndex = text.lastIndexOf(trigger.value, caretPos - 1);
        if (trigIndex >= 0) {
          node.textContent = text.slice(0, trigIndex) + text.slice(caretPos);
          const newRange = document.createRange();
          newRange.setStart(node, trigIndex);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          saveCaret();
        }
      }
    };
    const selectSuggestion = (item) => {
      removeTriggerText();
      if (trigger.value === "@") {
        insertUser({
          id: item.id,
          nickname: item.label,
          avatar: item.avatar || ""
        });
      } else if (trigger.value === ":") {
        insertSmile({
          id: item.id,
          symbol: item.value,
          filename: item.image || ""
        });
      }
      trigger.value = null;
      suggestions.value = [];
    };
    const sendMessage = () => {
      if (!editor.value) return;
      const clone = editor.value.cloneNode(true);
      clone.querySelectorAll("span.user-tag").forEach((span) => {
        const id = span.dataset.userId;
        const nick = span.dataset.nickname;
        if (id && nick) span.replaceWith(document.createTextNode(`[user|${id}|${nick}]`));
      });
      clone.querySelectorAll("img.emoji").forEach((img) => {
        const id = img.dataset.id;
        if (id) img.replaceWith(document.createTextNode(`[smile|${id}]`));
      });
      clone.querySelectorAll("br").forEach((br) => {
        br.replaceWith(document.createTextNode("[br]"));
      });
      const text = clone.innerText.replace(/\u200B/g, "").trim();
      if (!text) return;
      socket.emit("sendMessage", {
        user_token: currentUser.token,
        message: text
      });
      editor.value.innerHTML = "";
      trigger.value = null;
      suggestions.value = [];
      adjustHeight();
    };
    const onPaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") || "";
      document.execCommand("insertText", false, text);
    };
    const __returned__ = { emit, editor, trigger, suggestions, selectedIndex, savedRange, inputHeight, adjustHeight, saveCaret, restoreCaret, getCaretOffset, insertNodeAtCaret, searchEmojis, searchUsers, insertUser, insertSmile, typing, throttledTyping, handleInput, insertLineBreak, onKeyDown, removeTriggerText, selectSuggestion, sendMessage, onPaste };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\chatInput.vue?type=template
var _hoisted_17 = { class: "chat-input-wrapper" };
var _hoisted_27 = ["onMousedown"];
var _hoisted_37 = ["src"];
var _hoisted_44 = ["src"];
function render7(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_17, [
    createBaseVNode(
      "div",
      {
        class: "chat-input",
        ref: "editor",
        contenteditable: "true",
        onInput: $setup.handleInput,
        onKeydown: $setup.onKeyDown,
        onClick: $setup.saveCaret,
        onBlur: $setup.saveCaret,
        onPaste: $setup.onPaste,
        placeholder: "\u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435..."
      },
      null,
      544
      /* NEED_HYDRATION, NEED_PATCH */
    ),
    $setup.suggestions.length ? (openBlock(), createElementBlock(
      "ul",
      {
        key: 0,
        class: "suggestions",
        style: normalizeStyle({ bottom: $setup.inputHeight + "px" })
      },
      [
        (openBlock(true), createElementBlock(
          Fragment,
          null,
          renderList($setup.suggestions, (item, i) => {
            return openBlock(), createElementBlock("li", {
              key: i,
              class: normalizeClass({ active: i === $setup.selectedIndex }),
              onMousedown: withModifiers(($event) => $setup.selectSuggestion(item), ["prevent"])
            }, [
              $setup.trigger === "@" ? (openBlock(), createElementBlock(
                Fragment,
                { key: 0 },
                [
                  createBaseVNode("img", {
                    class: "avatar",
                    src: item.avatar
                  }, null, 8, _hoisted_37),
                  createTextVNode(
                    " " + toDisplayString(item.label),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : (openBlock(), createElementBlock(
                Fragment,
                { key: 1 },
                [
                  createBaseVNode("img", {
                    class: "emoji",
                    src: item.image
                  }, null, 8, _hoisted_44),
                  createTextVNode(
                    " " + toDisplayString(item.label),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              ))
            ], 42, _hoisted_27);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ],
      4
      /* STYLE */
    )) : createCommentVNode("v-if", true)
  ]);
}

// src/vue/chat/chatInput.vue
chatInput_default.render = render7;
chatInput_default.__file = "src\\vue\\chat\\chatInput.vue";
var chatInput_default2 = chatInput_default;

// src/utils/declineWord.ts
var log7 = new extLogger("utils/declineWords.ts");
function declineWord(n, forms, full = false) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word;
  if (mod10 === 1 && mod100 !== 11) {
    word = forms[0];
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    word = forms[1];
  } else {
    word = forms[2];
  }
  if (full) {
    return `${n} ${word}`;
  } else {
    return word;
  }
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\ChatFooter.vue?type=script
var ChatFooter_default = /* @__PURE__ */ defineComponent({
  __name: "ChatFooter",
  props: {
    scrolledToBottom: { type: Boolean, required: true }
  },
  emits: ["insertSmile", "scrollToBottom"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const chatInput = ref(null);
    const isOpenSmiles = ref(false);
    const onSmile = (smile) => {
      smile.filename = `/img/forum/emoticons/${smile.filename}`;
      emit("insertSmile", smile);
      chatInput.value?.insertSmile(smile);
    };
    const toggleSmilesPanel = () => {
      isOpenSmiles.value = !isOpenSmiles.value;
    };
    const insertUser = (user) => {
      chatInput.value?.insertUser(user);
    };
    const insertSmile = (smile) => {
      chatInput.value?.insertSmile(smile);
    };
    const clearInput = () => {
      if (chatInput.value?.$refs.editor) {
        const el = chatInput.value.$refs.editor;
        el.innerText = "";
        el.focus();
      }
    };
    const typingText = computed(() => {
      const users = usersTyping.value;
      const count = users.length;
      if (!count) return "";
      const names = users.map((u) => u.nickname);
      switch (count) {
        case 1:
          return `${names[0]} \u043F\u0435\u0447\u0430\u0442\u0430\u0435\u0442`;
        case 2:
          return `${names[0]} \u0438 ${names[1]} \u043F\u0435\u0447\u0430\u0442\u0430\u044E\u0442`;
        case 3:
          return `${names.slice(0, 2).join(", ")} \u0438 ${names[2]} \u043F\u0435\u0447\u0430\u0442\u0430\u044E\u0442`;
        default:
          return `${names[0]} \u0438 \u0435\u0449\u0451 ${count - 1} ${declineWord(count - 1, ["\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C", "\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F", "\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"])} \u043F\u0435\u0447\u0430\u0442\u0430\u044E\u0442`;
      }
    });
    const unreadMessages = computed(() => {
      const count = unreadMessagesCount.value;
      if (count === 0) {
        return "";
      }
      return `${count} ${declineWord(count, ["\u043D\u043E\u0432\u043E\u0435", "\u043D\u043E\u0432\u044B\u0445", "\u043D\u043E\u0432\u044B\u0445"])} ${declineWord(count, ["\u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435", "\u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F", "\u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439"])}`;
    });
    __expose({ insertUser, insertSmile, clearInput });
    const __returned__ = { props, emit, chatInput, isOpenSmiles, onSmile, toggleSmilesPanel, insertUser, insertSmile, clearInput, typingText, unreadMessages, ChatInput: chatInput_default2, NewSmilesPanel: newSmilesPanel_default, get unreadMessagesCount() {
      return unreadMessagesCount;
    }, get usersTyping() {
      return usersTyping;
    }, get getExtUrl() {
      return getExtUrl;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\ChatFooter.vue?type=template
var _hoisted_18 = { class: "interaction-footer" };
var _hoisted_28 = { class: "scroll-bottom-btn" };
var _hoisted_38 = ["src"];
var _hoisted_45 = { class: "typingUsers" };
var _hoisted_54 = { key: 0 };
var _hoisted_63 = { class: "editor" };
var _hoisted_73 = ["src"];
function render8(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_18, [
    $setup.isOpenSmiles ? (openBlock(), createBlock($setup["NewSmilesPanel"], {
      key: 0,
      onSmile: $setup.onSmile
    })) : createCommentVNode("v-if", true),
    createBaseVNode("div", _hoisted_28, [
      withDirectives(createBaseVNode(
        "button",
        {
          class: "",
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("scrollToBottom"))
        },
        [
          createBaseVNode("img", {
            src: $setup.getExtUrl("assets/arrowCircleBottom.svg")
          }, null, 8, _hoisted_38),
          withDirectives(createBaseVNode(
            "span",
            null,
            toDisplayString($setup.unreadMessages),
            513
            /* TEXT, NEED_PATCH */
          ), [
            [vShow, $setup.unreadMessages]
          ])
        ],
        512
        /* NEED_PATCH */
      ), [
        [vShow, !$props.scrolledToBottom || $setup.unreadMessagesCount]
      ])
    ]),
    createBaseVNode("div", _hoisted_45, [
      $setup.usersTyping.length ? (openBlock(), createElementBlock("span", _hoisted_54, [
        createBaseVNode(
          "span",
          null,
          toDisplayString($setup.typingText),
          1
          /* TEXT */
        ),
        _cache[1] || (_cache[1] = createBaseVNode(
          "span",
          { class: "dots" },
          [
            createBaseVNode("span"),
            createBaseVNode("span"),
            createBaseVNode("span")
          ],
          -1
          /* CACHED */
        ))
      ])) : createCommentVNode("v-if", true)
    ]),
    createBaseVNode("div", _hoisted_63, [
      createVNode(
        $setup["ChatInput"],
        { ref: "chatInput" },
        null,
        512
        /* NEED_PATCH */
      ),
      createBaseVNode("button", {
        class: "smile-btn",
        onClick: $setup.toggleSmilesPanel
      }, [
        createBaseVNode("img", {
          src: $setup.getExtUrl("assets/smile.svg")
        }, null, 8, _hoisted_73)
      ])
    ])
  ]);
}

// src/vue/chat/ChatFooter.vue
ChatFooter_default.render = render8;
ChatFooter_default.__file = "src\\vue\\chat\\ChatFooter.vue";
var ChatFooter_default2 = ChatFooter_default;

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\Chat.vue?type=script
var Chat_default = /* @__PURE__ */ defineComponent({
  __name: "Chat",
  setup(__props, { expose: __expose }) {
    const log13 = new extLogger("vue/Chat.vue");
    const isValidConnected = computed(() => socketStatus.value !== "authorizationSuccess");
    const errorMessage = computed(() => {
      switch (socketStatus.value) {
        case "unauthorized": {
          return "\u0412\u044B \u043D\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u043D\u044B \u043D\u0430 \u0441\u0430\u0439\u0442\u0435";
        }
        case "connecting": {
          return "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435...";
        }
        case "authorization":
          return "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F";
        case "disconnected": {
          return "\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043E";
        }
        case "error": {
          return "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F";
        }
        case "registration_error": {
          return "\u041E\u0448\u0438\u0431\u043A\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438";
        }
        case "registration_check": {
          return "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438";
        }
        case "banned": {
          return "\u0412\u0445\u043E\u0434 \u0432 \u0447\u0430\u0442 \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u0435\u043D. \u0412\u044B \u043B\u0438\u0431\u043E \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u044B \u043D\u0430 \u0441\u0430\u0439\u0442\u0435, \u043B\u0438\u0431\u043E \u0443 \u0432\u0430\u0441 \u043D\u0435\u0442 50 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u043D\u0430 \u0444\u043E\u0440\u0443\u043C\u0435. \u0414\u043B\u044F \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 - \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440.";
        }
        case "version_check_failed": {
          return "\u0412\u0445\u043E\u0434 \u0432 \u0447\u0430\u0442 \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u0435\u043D. \u0423 \u0432\u0430\u0441 \u0443\u0441\u0442\u0430\u0440\u0435\u0432\u0448\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F.";
        }
        default: {
          return `\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430: ${socketStatus.value}`;
        }
      }
    });
    const modal = ref(null);
    const messageList = ref(null);
    const onlineList = ref(null);
    const chatFooter = ref(null);
    const scrolledToBottom = computed(() => messageList.value?.scrolledToBottom ?? true);
    const acceptAgreement = () => {
      chatSettings.agreement = true;
      connectSocket();
    };
    const scrollToBottomSmooth = () => {
      messageList.value?.scrollToBottomSmooth();
    };
    const toggle = () => {
      modal.value?.toggle();
    };
    function onChatOpenedOnce() {
      messageList.value?.scrollToBottomSmooth();
    }
    if (chatSettings.isOpen) {
      onChatOpenedOnce();
    } else {
      const stopWatch = watch(
        () => chatSettings.isOpen,
        (isOpen) => {
          if (isOpen) {
            onChatOpenedOnce();
            stopWatch();
          }
        }
      );
    }
    __expose({
      toggle
    });
    onMounted(() => {
      connectSocket();
    });
    const __returned__ = { log: log13, isValidConnected, errorMessage, modal, messageList, onlineList, chatFooter, scrolledToBottom, acceptAgreement, scrollToBottomSmooth, toggle, onChatOpenedOnce, DraggingModal: DraggingModal_default2, ChatHeader: ChatHeader_default2, ChatMessageList: ChatMessageList_default2, UsersList: UsersList_default2, ChatFooter: ChatFooter_default2, get chatSettings() {
      return chatSettings;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\chat\Chat.vue?type=template
var _hoisted_19 = { class: "chatBody" };
var _hoisted_29 = {
  key: 0,
  class: "chatStatus"
};
var _hoisted_39 = { key: 0 };
var _hoisted_46 = { key: 1 };
var _hoisted_55 = { class: "chatContainer" };
function render9(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock($setup["DraggingModal"], {
    ref: "modal",
    x: $setup.chatSettings.x,
    "onUpdate:x": _cache[3] || (_cache[3] = ($event) => $setup.chatSettings.x = $event),
    y: $setup.chatSettings.y,
    "onUpdate:y": _cache[4] || (_cache[4] = ($event) => $setup.chatSettings.y = $event),
    width: $setup.chatSettings.width,
    "onUpdate:width": _cache[5] || (_cache[5] = ($event) => $setup.chatSettings.width = $event),
    height: $setup.chatSettings.height,
    "onUpdate:height": _cache[6] || (_cache[6] = ($event) => $setup.chatSettings.height = $event),
    fullscreen: $setup.chatSettings.isFullscreen,
    "onUpdate:fullscreen": _cache[7] || (_cache[7] = ($event) => $setup.chatSettings.isFullscreen = $event),
    open: $setup.chatSettings.isOpen,
    "onUpdate:open": _cache[8] || (_cache[8] = ($event) => $setup.chatSettings.isOpen = $event)
  }, {
    title: withCtx(() => [..._cache[9] || (_cache[9] = [
      createTextVNode(
        "\u0427\u0430\u0442",
        -1
        /* CACHED */
      )
    ])]),
    buttons: withCtx(() => [
      createVNode($setup["ChatHeader"], {
        "is-valid-connected": !$setup.isValidConnected,
        onToggleOnlineList: _cache[0] || (_cache[0] = ($event) => $setup.chatSettings.openOnline = !$setup.chatSettings.openOnline),
        onToggleFullscreen: _cache[1] || (_cache[1] = ($event) => $setup.modal?.toggleFullscreen()),
        onClose: _cache[2] || (_cache[2] = ($event) => $setup.modal?.close())
      }, null, 8, ["is-valid-connected"])
    ]),
    default: withCtx(() => [
      createBaseVNode("div", _hoisted_19, [
        createCommentVNode(" \u0421\u0442\u0430\u0442\u0443\u0441 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F "),
        $setup.isValidConnected || !$setup.chatSettings.agreement ? (openBlock(), createElementBlock("div", _hoisted_29, [
          !$setup.chatSettings.agreement ? (openBlock(), createElementBlock("span", _hoisted_39, [
            _cache[10] || (_cache[10] = createTextVNode(
              " \u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u0432 \u0447\u0430\u0442\u0435 \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u0443\u0441\u043B\u043E\u0436\u043D\u0435\u043D\u0430. \u0422\u0435\u043F\u0435\u0440\u044C \u0435\u0441\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0446\u0435\u043D\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430. \u0414\u043B\u044F \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438, \u043E\u0442 \u0432\u0430\u0448\u0435\u0433\u043E \u0438\u043C\u0435\u043D\u0438 \u0443 \u0432\u0430\u0441 \u0431\u0443\u0434\u0435\u0442 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0430 \u043F\u043E\u0434\u043F\u0438\u0441\u044C \u043D\u0430 \u0444\u043E\u0440\u0443\u043C\u0435 (\u043E\u043D\u0430 \u0441\u0435\u0439\u0447\u0430\u0441 \u0432\u0441\u0435 \u0440\u0430\u0432\u043D\u043E \u043D\u0438\u0433\u0434\u0435 \u043D\u0435 \u0432\u0438\u0434\u043D\u0430, \u043A\u0440\u043E\u043C\u0435 \u043B\u0438\u0447\u043D\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B). \u042D\u0442\u043E \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F, \u0447\u0442\u043E-\u0431\u044B \u0442\u043E\u0447\u043D\u043E \u0437\u043D\u0430\u0442\u044C \u0447\u0442\u043E \u0432\u0445\u043E\u0434\u0438\u0442\u0435 \u0432\u044B. \u0420\u0430\u043D\u044C\u0448\u0435 \u044D\u0442\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043D\u0435\u0431\u044B\u043B\u043E, \u0438 \u043C\u043E\u0436\u043D\u043E \u0431\u044B\u043B\u043E \u043F\u0438\u0441\u0430\u0442\u044C \u0432 \u0447\u0430\u0442\u0435 \u043E\u0442 \u0438\u043C\u0435\u043D\u0438 \u043B\u044E\u0431\u043E\u0433\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F. ",
              -1
              /* CACHED */
            )),
            createBaseVNode("span", { class: "accept" }, [
              createBaseVNode("button", { onClick: $setup.acceptAgreement }, "\u0425\u043E\u0440\u043E\u0448\u043E, \u0434\u0430\u044E \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u043D\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043C\u043E\u0435\u0439 \u043F\u043E\u0434\u043F\u0438\u0441\u0438")
            ])
          ])) : (openBlock(), createElementBlock(
            "span",
            _hoisted_46,
            toDisplayString($setup.errorMessage),
            1
            /* TEXT */
          ))
        ])) : createCommentVNode("v-if", true),
        createCommentVNode(" \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0447\u0430\u0442 "),
        withDirectives(createBaseVNode(
          "div",
          _hoisted_55,
          [
            createVNode($setup["ChatMessageList"], {
              onInsertUser: $setup.chatFooter?.insertUser,
              ref: "messageList"
            }, null, 8, ["onInsertUser"]),
            createVNode($setup["UsersList"], {
              onInsertUser: $setup.chatFooter?.insertUser,
              ref: "onlineList"
            }, null, 8, ["onInsertUser"])
          ],
          512
          /* NEED_PATCH */
        ), [
          [vShow, !$setup.isValidConnected]
        ]),
        createCommentVNode(" \u0424\u0443\u0442\u0435\u0440 \u0447\u0430\u0442\u0430 "),
        !$setup.isValidConnected ? (openBlock(), createBlock($setup["ChatFooter"], {
          key: 1,
          "scrolled-to-bottom": $setup.scrolledToBottom,
          onScrollToBottom: $setup.scrollToBottomSmooth,
          ref: "chatFooter"
        }, null, 8, ["scrolled-to-bottom"])) : createCommentVNode("v-if", true)
      ])
    ]),
    _: 1
    /* STABLE */
  }, 8, ["x", "y", "width", "height", "fullscreen", "open"]);
}

// src/vue/chat/Chat.vue
Chat_default.render = render9;
Chat_default.__file = "src\\vue\\chat\\Chat.vue";
var Chat_default2 = Chat_default;

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\header\chat.vue?type=script
var chat_default = /* @__PURE__ */ defineComponent({
  __name: "chat",
  setup(__props, { expose: __expose }) {
    __expose();
    const chat = ref(null);
    const __returned__ = { chat, Chat: Chat_default2, get unreadMessagesCount() {
      return unreadMessagesCount;
    }, get getExtUrl() {
      return getExtUrl;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\header\chat.vue?type=template
var _hoisted_110 = ["src"];
function render10(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(
    Fragment,
    null,
    [
      createBaseVNode("a", {
        class: "header__link",
        onClick: _cache[0] || (_cache[0] = ($event) => $setup.chat?.toggle())
      }, [
        createBaseVNode("img", {
          src: $setup.getExtUrl("assets/chat.svg")
        }, null, 8, _hoisted_110),
        withDirectives(createBaseVNode(
          "span",
          null,
          toDisplayString($setup.unreadMessagesCount),
          513
          /* TEXT, NEED_PATCH */
        ), [
          [vShow, $setup.unreadMessagesCount > 0]
        ])
      ]),
      createVNode(
        $setup["Chat"],
        { ref: "chat" },
        null,
        512
        /* NEED_PATCH */
      )
    ],
    64
    /* STABLE_FRAGMENT */
  );
}

// src/vue/header/chat.vue
chat_default.render = render10;
chat_default.__file = "src\\vue\\header\\chat.vue";
var chat_default2 = chat_default;

// src/utils/openNewTab.ts
var log8 = new extLogger("utils/openNewTab.ts");
function openNewTab(url2) {
  window.open(url2, "_blank");
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\header\search.vue?type=script
var search_default = /* @__PURE__ */ defineComponent({
  __name: "search",
  setup(__props, { expose: __expose }) {
    __expose();
    const userList = ref([]);
    const isOpen = ref(true);
    onMounted(() => {
      const searchInput = document.querySelector(".header__item-search__field");
      searchInput?.addEventListener("input", async (e) => {
        const target = e.target;
        userList.value = await searchUser({ query: target.value });
      });
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && mutation.attributeName === "class") {
            isOpen.value = !searchInput.classList.contains("hidden");
          }
        });
      });
      observer.observe(searchInput, { attributes: true });
    });
    const __returned__ = { userList, isOpen, get openNewTab() {
      return openNewTab;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\header\search.vue?type=template
var _hoisted_111 = { class: "searchUserHeader" };
var _hoisted_210 = ["onClick"];
var _hoisted_310 = { class: "searchAvatar" };
var _hoisted_47 = ["src", "alt"];
var _hoisted_56 = { class: "searchUsername" };
function render11(_ctx, _cache, $props, $setup, $data, $options) {
  return withDirectives((openBlock(), createElementBlock(
    "ul",
    _hoisted_111,
    [
      (openBlock(true), createElementBlock(
        Fragment,
        null,
        renderList($setup.userList, (user) => {
          return openBlock(), createElementBlock("li", {
            onClick: ($event) => $setup.openNewTab(`/forum/members/.${user.id}/`)
          }, [
            createBaseVNode("div", _hoisted_310, [
              createBaseVNode("img", {
                src: user.avatar,
                alt: user.name_parsed
              }, null, 8, _hoisted_47)
            ]),
            createBaseVNode(
              "div",
              _hoisted_56,
              toDisplayString(user.name),
              1
              /* TEXT */
            )
          ], 8, _hoisted_210);
        }),
        256
        /* UNKEYED_FRAGMENT */
      ))
    ],
    512
    /* NEED_PATCH */
  )), [
    [vShow, $setup.isOpen]
  ]);
}

// src/vue/header/search.vue
search_default.render = render11;
search_default.__file = "src\\vue\\header\\search.vue";
var search_default2 = search_default;

// src/routes.ts
var routes = [
  {
    pattern: "^/$",
    scripts: ["pages/index.js"]
  },
  {
    pattern: "^/forum/threads/*.*/*",
    scripts: ["pages/forum-thread.js"]
  },
  {
    pattern: "^/forum/forums/*.*/create-thread/",
    scripts: ["pages/create-thread.js"]
  },
  {
    pattern: "^/forum/settings/.*",
    scripts: ["pages/settings.js"]
  },
  {
    pattern: "^/forum/notifications/.*",
    scripts: ["pages/notifications.js"]
  },
  {
    pattern: "^/forum/members/.*",
    scripts: ["pages/members.js"]
  },
  {
    pattern: "^/forum/conversation/.*",
    scripts: ["pages/conversation.js"]
  }
];

// src/utils/debounce.ts
var log9 = new extLogger("utils/debounce.ts");
function debounce(fn, delay = 500) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

// src/api/getDialogs.ts
async function getDialogs({}) {
  try {
    const html = await parseText("https://dota2.ru/forum/conversations/");
    const doc = new DOMParser().parseFromString(html, "text/html");
    const items = [];
    const dialogElements = doc?.querySelectorAll(
      ".forum-section__item:not(.forum-section__item--first)"
    );
    for (const item of Array.from(dialogElements)) {
      const link = item.querySelector(".forum-section__title-middled");
      const userIdMatch = item.querySelector(".forum-section__col-1 a")?.getAttribute("href")?.match(/\.(\d+)\//);
      const dateTimeElement = item.querySelector(".dateTime");
      items.push({
        user_id: userIdMatch?.[1] ?? "",
        avatar_link: item.querySelector("img")?.getAttribute("src") ?? "",
        date_created: parseInt(dateTimeElement?.getAttribute("data-time") || "0", 10),
        description: `<a href="${link?.getAttribute("href")}">${link?.textContent?.trim() || ""}</a>`
      });
    }
    return items;
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u0434\u0438\u0430\u043B\u043E\u0433\u043E\u0432:", error);
    return [];
  }
}

// src/utils/createDomTree.ts
var log10 = new extLogger("utils/createDomTree.ts");
function createDomTree(node) {
  const element = document.createElement(node.tag);
  if (node.attrs) {
    for (const [key, value2] of Object.entries(node.attrs)) {
      element.setAttribute(key, value2);
    }
  }
  for (const key of Object.keys(node)) {
    if (key === "click" && typeof node.click === "function") {
      element.addEventListener("click", node.click);
    }
  }
  if (node.innerHTML !== void 0) {
    element.innerHTML = node.innerHTML;
  } else if (node.children) {
    for (const child of node.children) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(createDomTree(child));
      }
    }
  }
  return element;
}

// src/utils/initHeaderLast.ts
var log11 = new extLogger("utils/initHeaderLast.ts");
function createWrapper(parent) {
  if (!parent) return null;
  const wrapper = document.createElement("ul");
  wrapper.classList.add(
    "ext-last-items",
    "header__sublist",
    "header__sublist--active",
    "hiddenScroll"
  );
  parent.appendChild(wrapper);
  return wrapper;
}
function createItemElement(data) {
  const children = [
    {
      tag: "div",
      attrs: { class: "avatar" },
      children: [
        {
          tag: "a",
          attrs: { href: `/forum/members/.${data.user_id}/` },
          children: [
            {
              tag: "img",
              attrs: { src: data.avatar_link }
            }
          ]
        }
      ]
    },
    {
      tag: "div",
      attrs: { class: "content-wrapper" },
      children: [
        {
          tag: "div",
          attrs: { class: "content" },
          innerHTML: data.description
        },
        {
          tag: "time",
          attrs: { class: "time", "data-time": data.date_created.toString() }
        }
      ]
    },
    ...data.extraChildren ?? []
  ];
  return createDomTree({
    tag: "div",
    attrs: { class: "item" },
    children
  });
}
async function initLastItems(parentSelector, fetchData) {
  const el = document.querySelector(parentSelector)?.parentElement;
  const wrapper = createWrapper(el);
  if (!wrapper || !el) return;
  let isInitialized = false;
  el.addEventListener("mouseenter", async () => {
    wrapper.style.opacity = "100";
    wrapper.style.visibility = "visible";
    if (isInitialized) return;
    const items = await fetchData();
    let smilesMap;
    if (settings?.showRatingsInNotifications) {
      const smilesList = await getSmiles();
      smilesMap = new Map(smilesList?.smiles.map((s) => [String(s.id), s.filename]));
    }
    for (const item of items) {
      const extraChildren = [];
      if (settings?.showRatingsInNotifications && item.type === "forum_post_liked" && smilesMap) {
        const imgFilename = smilesMap.get(String(item.smile_id));
        if (imgFilename) {
          extraChildren.push({
            tag: "div",
            attrs: { class: "emoticon" },
            children: [
              {
                tag: "img",
                attrs: { src: `/img/forum/emoticons/${imgFilename}` }
              }
            ]
          });
        }
      }
      wrapper.appendChild(
        createItemElement({
          user_id: item.user_id,
          avatar_link: item.avatar_link,
          description: item.description,
          date_created: item.date_created,
          extraChildren
        })
      );
      forceUpdateTime();
    }
    isInitialized = true;
  });
  el.addEventListener("mouseleave", () => {
    wrapper.style.opacity = "0";
    wrapper.style.visibility = "collapse";
  });
}
async function initLastDialogs() {
  await initLastItems('.header__link[href="/forum/conversations/"]', () => getDialogs({}));
}
async function initLastNotifications() {
  await initLastItems(
    '.header__link[href="/forum/notifications/"]',
    () => getNotifications({ page: 1 })
  );
}

// src/extension/loader.ts
var log12 = new extLogger("extension/loader.ts");
function watchStorageChanges(table, obj) {
  const sendUpdate = debounce(async (data) => {
    log12.info("Store update", table, data);
    await sendToContent({
      type: "SAVE_DATABASE",
      payload: { table, data: toRaw(data) }
    });
  }, 500);
  watch(obj, sendUpdate, { deep: true });
}
function initButtonSettings() {
  const li = createHeaderItem(getExtUrl("assets/settings.svg"), "settings");
  const loadComponent = () => {
    li.removeEventListener("click", loadComponent);
    loadVue(li, settings_default2);
  };
  li.addEventListener("click", loadComponent);
  insertHeaderItem(li);
}
function initChat() {
  const li = createHeaderItem();
  loadVue(li, chat_default2);
  insertHeaderItem(li);
}
function initSearchUsersHeader() {
  const searchButton = document.querySelector(".header__link-search__button");
  const loadComponent = () => {
    searchButton?.removeEventListener("click", loadComponent);
    const searchContainer = document.querySelector(".header__item-search");
    if (!searchContainer) return;
    const searchComponent = document.createElement("div");
    searchComponent.classList.add("searchHeaderElement");
    searchContainer.appendChild(searchComponent);
    loadVue(searchComponent, search_default2);
  };
  searchButton?.addEventListener("click", loadComponent);
}
async function loadScripts(baseUrl) {
  for (const route of routes) {
    if (new RegExp(route.pattern).test(location.pathname)) {
      for (const script of route.scripts) {
        const module = await import(`${baseUrl}${script}`);
        if (module.default) await module.default(settings);
      }
    }
  }
}
function createHeaderItem(iconUrl, altText) {
  const li = document.createElement("li");
  li.classList.add("header__item");
  li.style.cursor = "pointer";
  if (iconUrl) {
    const a = document.createElement("a");
    a.classList.add("header__link");
    const img = document.createElement("img");
    img.src = iconUrl;
    img.alt = altText || "";
    a.appendChild(img);
    li.appendChild(a);
  }
  return li;
}
function insertHeaderItem(li) {
  const headerList = document.querySelector(".header__list");
  const searchItem = headerList?.querySelector(".header__item-search");
  if (headerList && searchItem) headerList.insertBefore(li, searchItem);
}
function initExtension(data) {
  extensionUrl.value = data.extensionUrl;
  Object.assign(currentUser, data.database.currentUser);
  Object.assign(chatSettings, data.database.chatSettings);
  Object.assign(settings, data.database.settings);
  const user = getCurrentUser();
  Object.assign(currentUser, {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar
  });
  watchStorageChanges("currentUser", currentUser);
  watchStorageChanges("chatSettings", chatSettings);
  watchStorageChanges("settings", settings);
  initButtonSettings();
  if (settings.chatEnabled) initChat();
  loadScripts(data.extensionUrl);
  if (settings.showRecentDialogsOnHover) initLastDialogs();
  if (settings.showRecentNotificationsOnHover) initLastNotifications();
  if (settings.searchUsersHeader) initSearchUsersHeader();
}
export {
  initExtension as default,
  initSearchUsersHeader
};
//# sourceMappingURL=loader.js.map
