import {
  getSmiles
} from "./chunk-UZ4L7MZK.js";
import {
  Fragment,
  computed,
  createBaseVNode,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  createVNode,
  defineComponent,
  extLogger,
  normalizeClass,
  normalizeStyle,
  onMounted,
  openBlock,
  ref,
  renderList,
  toDisplayString,
  vModelText,
  watch,
  withDirectives,
  withModifiers
} from "./chunk-6EVUB3DE.js";

// src/utils/getFileName.ts
var log = new extLogger("utils/getFileName.ts");
function getFileName(fullPath) {
  return fullPath.split("/").filter(Boolean).pop() || "";
}

// src/utils/getSmileUrl.ts
var log2 = new extLogger("utils/getSmileUrl.ts");
function getSmileUrl(smile) {
  return `/img/forum/emoticons/${getFileName(smile.filename)}`;
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\contextMenu.vue?type=script
var contextMenu_default = /* @__PURE__ */ defineComponent({
  __name: "contextMenu",
  props: {
    visible: { type: Boolean, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    smile: { type: [Object, null], required: true },
    isFavorite: { type: Function, required: true }
  },
  emits: ["action", "close"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    function handleAction(smile) {
      emit("action", smile);
      emit("close");
    }
    watch(
      () => props.visible,
      (newVisible) => {
        if (newVisible) {
          document.addEventListener("click", handleOutsideClick, { once: true });
        }
      }
    );
    function handleOutsideClick() {
      emit("close");
    }
    const __returned__ = { props, emit, handleAction, handleOutsideClick };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\contextMenu.vue?type=template
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return $props.visible && $props.smile ? (openBlock(), createElementBlock(
    "div",
    {
      key: 0,
      class: "context-menu",
      style: normalizeStyle({
        position: "fixed",
        left: $props.x + "px",
        top: $props.y + "px",
        zIndex: 1e3
      }),
      onClick: _cache[1] || (_cache[1] = withModifiers(() => {
      }, ["stop"]))
    },
    [
      createBaseVNode(
        "div",
        {
          class: "context-menu-item",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.handleAction($props.smile))
        },
        toDisplayString($props.isFavorite($props.smile.id) ? "\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E" : "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435"),
        1
        /* TEXT */
      )
    ],
    4
    /* STYLE */
  )) : createCommentVNode("v-if", true);
}

// src/vue/contextMenu.vue
contextMenu_default.render = render;
contextMenu_default.__file = "src\\vue\\contextMenu.vue";
contextMenu_default.__scopeId = "data-v-e323ae67";
var contextMenu_default2 = contextMenu_default;

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\newSmilesPanel.vue?type=script
var FAVORITES_KEY = "smilesPanel_favorites";
var LAST_CATEGORY_KEY = "smilesPanel_lastCategory";
var FAVORITES_CATEGORY_ID = "-1";
var DEFAULT_CATEGORY_ID = "14";
var newSmilesPanel_default = /* @__PURE__ */ defineComponent({
  __name: "newSmilesPanel",
  props: {
    onSmile: { type: Function, required: true }
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const search = ref("");
    const categories = ref([]);
    const smiles = ref([]);
    const activeCategory = ref("");
    const hoveredSmile = ref(null);
    const favorites = ref([]);
    const contextMenu = ref({
      visible: false,
      x: 0,
      y: 0,
      smile: null
    });
    const currentSmiles = computed(() => {
      const searchQuery = search.value.trim().toLowerCase();
      if (searchQuery) {
        return smiles.value.filter(
          (smile) => smile.title.toLowerCase().includes(searchQuery)
        );
      }
      if (activeCategory.value === FAVORITES_CATEGORY_ID) {
        return smiles.value.filter((smile) => favorites.value.includes(smile.id));
      }
      if (activeCategory.value) {
        return smiles.value.filter((smile) => smile.category_id === activeCategory.value);
      }
      return [];
    });
    function openCategory(categoryId) {
      activeCategory.value = categoryId;
      localStorage.setItem(LAST_CATEGORY_KEY, categoryId);
    }
    function findSmileById(id) {
      return smiles.value.find((smile) => smile.id === id);
    }
    function isFavorite(smileId) {
      return favorites.value.includes(smileId);
    }
    function toggleFavorite(smileId) {
      const index = favorites.value.indexOf(smileId);
      if (index === -1) {
        favorites.value.push(smileId);
      } else {
        favorites.value.splice(index, 1);
      }
      saveFavorites();
    }
    function showContextMenu(event, smile) {
      contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        smile
      };
    }
    function hideContextMenu() {
      contextMenu.value.visible = false;
      contextMenu.value.smile = null;
    }
    function handleContextMenuAction(smile) {
      toggleFavorite(smile.id);
    }
    function handleSearch() {
    }
    function saveFavorites() {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value));
      } catch (error) {
        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u0441\u043C\u0430\u0439\u043B\u043E\u0432:", error);
      }
    }
    function loadFavorites() {
      try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) favorites.value = parsed;
        }
      } catch (error) {
        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u0441\u043C\u0430\u0439\u043B\u043E\u0432:", error);
        favorites.value = [];
      }
    }
    function loadLastCategory() {
      const last = localStorage.getItem(LAST_CATEGORY_KEY) || DEFAULT_CATEGORY_ID;
      openCategory(last);
    }
    async function initializeSmiles() {
      try {
        const smilesData = await getSmiles();
        if (smilesData) {
          categories.value = smilesData.categories;
          smiles.value = smilesData.smiles;
          const hasFavorites = categories.value.some((cat) => cat.id === FAVORITES_CATEGORY_ID);
          if (!hasFavorites) {
            categories.value.unshift({
              id: FAVORITES_CATEGORY_ID,
              name: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435",
              img_tab_smile: "729"
            });
          }
        }
      } catch (error) {
        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0441\u043C\u0430\u0439\u043B\u043E\u0432:", error);
      }
    }
    onMounted(async () => {
      await initializeSmiles();
      loadFavorites();
      loadLastCategory();
    });
    watch(favorites, saveFavorites, { deep: true });
    const __returned__ = { props, search, categories, smiles, activeCategory, hoveredSmile, favorites, contextMenu, FAVORITES_KEY, LAST_CATEGORY_KEY, FAVORITES_CATEGORY_ID, DEFAULT_CATEGORY_ID, currentSmiles, openCategory, findSmileById, isFavorite, toggleFavorite, showContextMenu, hideContextMenu, handleContextMenuAction, handleSearch, saveFavorites, loadFavorites, loadLastCategory, initializeSmiles, ContextMenu: contextMenu_default2, get getSmileUrl() {
      return getSmileUrl;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\newSmilesPanel.vue?type=template
var _hoisted_1 = { class: "smilesPanel" };
var _hoisted_2 = { class: "categories hiddenScroll" };
var _hoisted_3 = ["onClick"];
var _hoisted_4 = ["src", "title", "alt"];
var _hoisted_5 = { class: "smiles" };
var _hoisted_6 = { class: "search" };
var _hoisted_7 = { class: "list hiddenScroll" };
var _hoisted_8 = {
  key: 0,
  class: "empty-favorites"
};
var _hoisted_9 = ["onClick", "onMouseenter", "onContextmenu"];
var _hoisted_10 = ["src", "alt", "title"];
function render2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock(
    Fragment,
    null,
    [
      createCommentVNode(" \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043F\u0430\u043D\u0435\u043B\u0438 \u0441\u043C\u0430\u0439\u043B\u043E\u0432 "),
      createBaseVNode("div", _hoisted_1, [
        createCommentVNode(" \u041F\u0430\u043D\u0435\u043B\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u0441\u043C\u0430\u0439\u043B\u043E\u0432 "),
        createBaseVNode("div", _hoisted_2, [
          (openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList($setup.categories, (category) => {
              return openBlock(), createElementBlock("div", {
                class: normalizeClass(["category", { active: $setup.activeCategory === category.id }]),
                key: category.id,
                onClick: ($event) => $setup.openCategory(category.id)
              }, [
                createBaseVNode("img", {
                  src: $setup.getSmileUrl(
                    $setup.findSmileById(category.img_tab_smile) || {
                      id: category.img_tab_smile,
                      category_id: "",
                      symbol: "",
                      title: category.name,
                      filename: category.img_tab_smile
                    }
                  ),
                  title: category.name,
                  alt: category.name
                }, null, 8, _hoisted_4)
              ], 10, _hoisted_3);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        createCommentVNode(" \u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0441\u043C\u0430\u0439\u043B\u043E\u0432 "),
        createBaseVNode("div", _hoisted_5, [
          createCommentVNode(" \u041F\u043E\u0438\u0441\u043A\u043E\u0432\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430 "),
          createBaseVNode("div", _hoisted_6, [
            withDirectives(createBaseVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.search = $event),
                placeholder: "\u041F\u043E\u0438\u0441\u043A",
                class: "content-inline search_smile_input",
                onInput: $setup.handleSearch
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vModelText, $setup.search]
            ])
          ]),
          createCommentVNode(" \u0421\u043F\u0438\u0441\u043E\u043A \u0441\u043C\u0430\u0439\u043B\u043E\u0432 "),
          createBaseVNode("div", _hoisted_7, [
            createCommentVNode(" \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u043F\u0443\u0441\u0442\u044B\u0445 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0445 "),
            $setup.activeCategory === $setup.FAVORITES_CATEGORY_ID && $setup.currentSmiles.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_8, [..._cache[2] || (_cache[2] = [
              createTextVNode(
                " \u0422\u0443\u0442 \u043F\u043E\u043A\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435\u0442.",
                -1
                /* CACHED */
              ),
              createBaseVNode(
                "br",
                null,
                null,
                -1
                /* CACHED */
              ),
              createTextVNode(
                " \u0414\u043B\u044F \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u043C\u0430\u0439\u043B\u0430 \u0432 \u044D\u0442\u043E\u0442 \u0441\u043F\u0438\u0441\u043E\u043A \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u043F\u043E \u043D\u0435\u043C\u0443 \u2014 \u041F\u041A\u041C. ",
                -1
                /* CACHED */
              )
            ])])) : (openBlock(), createElementBlock(
              Fragment,
              { key: 1 },
              [
                createCommentVNode(" \u0421\u043F\u0438\u0441\u043E\u043A \u0441\u043C\u0430\u0439\u043B\u043E\u0432 "),
                (openBlock(true), createElementBlock(
                  Fragment,
                  null,
                  renderList($setup.currentSmiles, (smile) => {
                    return openBlock(), createElementBlock("div", {
                      class: "smile",
                      key: smile.id,
                      onClick: ($event) => $setup.props.onSmile(smile),
                      onMouseenter: ($event) => $setup.hoveredSmile = smile.id,
                      onMouseleave: _cache[1] || (_cache[1] = ($event) => $setup.hoveredSmile = null),
                      onContextmenu: withModifiers(($event) => $setup.showContextMenu($event, smile), ["prevent"]),
                      style: { "position": "relative" }
                    }, [
                      createBaseVNode("img", {
                        src: $setup.getSmileUrl(smile),
                        alt: smile.title,
                        title: smile.title
                      }, null, 8, _hoisted_10)
                    ], 40, _hoisted_9);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ]),
      createCommentVNode(" \u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u043D\u043E\u0435 \u043C\u0435\u043D\u044E "),
      createVNode($setup["ContextMenu"], {
        visible: $setup.contextMenu.visible,
        x: $setup.contextMenu.x,
        y: $setup.contextMenu.y,
        smile: $setup.contextMenu.smile,
        "is-favorite": $setup.isFavorite,
        onAction: $setup.handleContextMenuAction,
        onClose: $setup.hideContextMenu
      }, null, 8, ["visible", "x", "y", "smile"])
    ],
    64
    /* STABLE_FRAGMENT */
  );
}

// src/vue/newSmilesPanel.vue
newSmilesPanel_default.render = render2;
newSmilesPanel_default.__file = "src\\vue\\newSmilesPanel.vue";
var newSmilesPanel_default2 = newSmilesPanel_default;

export {
  getFileName,
  getSmileUrl,
  newSmilesPanel_default2 as newSmilesPanel_default
};
//# sourceMappingURL=chunk-2E4SLZRR.js.map
