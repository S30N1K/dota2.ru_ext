import {
  forceUpdateTime,
  getIgnoreList
} from "./chunks/chunk-TWHSP6WZ.js";
import {
  loadVue
} from "./chunks/chunk-J4LWYTZF.js";
import {
  Fragment,
  createBaseVNode,
  createElementBlock,
  createTextVNode,
  defineComponent,
  extLogger,
  onMounted,
  openBlock,
  parseJson,
  renderList,
  settings,
  toDisplayString
} from "./chunks/chunk-6EVUB3DE.js";
import "./chunks/chunk-54KOYG5C.js";

// src/api/parseFeed.ts
async function parseFeed({ offset }) {
  try {
    const response = await parseJson("/forum/api/feed/get", {
      offset,
      order: "new"
    });
    return response.items;
  } catch (error) {
    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u043B\u0435\u043D\u0442\u044B:", error);
    return [];
  }
}

// src/utils/stripAllHtmlContent.ts
var log = new extLogger("utils/stripAllHtmlContent.ts");
function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}
function stripAllHtmlContent(html, options = {}) {
  const {
    maxLength = 300,
    preserveLineBreaks = true,
    removeComments = true,
    decodeEntities = true
  } = options;
  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const tagsToRemove = [
      "script",
      "style",
      "template",
      "noscript",
      "iframe",
      "object",
      "embed",
      "applet",
      "form",
      "input",
      "button",
      "select",
      "textarea",
      "label",
      "fieldset",
      "legend"
    ];
    tagsToRemove.forEach((tag) => {
      const elements = tempDiv.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });
    if (removeComments) {
      const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_COMMENT, null);
      const commentsToRemove = [];
      let node;
      while (node = walker.nextNode()) {
        commentsToRemove.push(node);
      }
      commentsToRemove.forEach((comment) => comment.remove());
    }
    let text = tempDiv.textContent || tempDiv.innerText || "";
    if (decodeEntities) {
      text = decodeHtmlEntities(text);
    }
    if (preserveLineBreaks) {
      text = text.replace(/\s*\n\s*/g, "\n");
    } else {
      text = text.replace(/\s+/g, " ");
    }
    text = text.trim();
    if (maxLength > 0 && text.length > maxLength) {
      text = text.slice(0, maxLength);
      if (text.length === maxLength) {
        text = text + "...";
      }
    }
    return text;
  } catch (error) {
    console.warn("Error in stripAllHtmlContent:", error);
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }
}

// sfc-script:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\indexForums.vue?type=script
var indexForums_default = /* @__PURE__ */ defineComponent({
  __name: "indexForums",
  props: {
    forumList: { type: Array, required: true }
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    onMounted(() => {
      forceUpdateTime();
    });
    const __returned__ = { props, get stripAllHtmlContent() {
      return stripAllHtmlContent;
    } };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});

// sfc-template:C:\Users\ffff\Desktop\dota2.ru_ext\src\vue\indexForums.vue?type=template
var _hoisted_1 = { class: "forum__item component-block__link-wrapper" };
var _hoisted_2 = ["href"];
var _hoisted_3 = ["src"];
var _hoisted_4 = { class: "component-block__block forum__block" };
var _hoisted_5 = { class: "component-text-grey-13 text-clip" };
var _hoisted_6 = { class: "component-text-grey-11" };
var _hoisted_7 = { class: "short" };
var _hoisted_8 = { class: "topic-header" };
var _hoisted_9 = { class: "short-author" };
var _hoisted_10 = { class: "author" };
var _hoisted_11 = { class: "node" };
var _hoisted_12 = { class: "message" };
var _hoisted_13 = { class: "bottom-block" };
var _hoisted_14 = ["data-time"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(true), createElementBlock(
    Fragment,
    null,
    renderList($setup.props.forumList, (e) => {
      return openBlock(), createElementBlock("li", _hoisted_1, [
        createBaseVNode("a", {
          class: "component-block__link",
          href: e.first_post.link
        }, [
          createBaseVNode("img", {
            class: "component-block__img component-block__img--width-36 component-block__img--radius",
            src: e.forum.icon,
            alt: "img"
          }, null, 8, _hoisted_3),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode(
              "p",
              _hoisted_5,
              toDisplayString(e.title),
              1
              /* TEXT */
            ),
            createBaseVNode("span", _hoisted_6, [
              createTextVNode(
                toDisplayString(e.user.nickname) + " ",
                1
                /* TEXT */
              ),
              _cache[0] || (_cache[0] = createBaseVNode(
                "img",
                {
                  src: "/img/forum/icon-2.svg",
                  alt: "img"
                },
                null,
                -1
                /* CACHED */
              )),
              createTextVNode(
                " " + toDisplayString(e.replies_count),
                1
                /* TEXT */
              )
            ])
          ])
        ], 8, _hoisted_2),
        createBaseVNode("div", _hoisted_7, [
          createBaseVNode(
            "div",
            _hoisted_8,
            toDisplayString(e.title),
            1
            /* TEXT */
          ),
          createBaseVNode("div", _hoisted_9, [
            createBaseVNode(
              "div",
              _hoisted_10,
              "\u0410\u0432\u0442\u043E\u0440: " + toDisplayString(e.first_post.username),
              1
              /* TEXT */
            ),
            createBaseVNode(
              "div",
              _hoisted_11,
              toDisplayString(e.forum.title),
              1
              /* TEXT */
            )
          ]),
          createBaseVNode(
            "div",
            _hoisted_12,
            toDisplayString($setup.stripAllHtmlContent(e.first_post.content_html_stored)),
            1
            /* TEXT */
          ),
          createBaseVNode("div", _hoisted_13, [
            createBaseVNode("time", {
              class: "node",
              "data-time": e.first_post.timestamp
            }, null, 8, _hoisted_14)
          ])
        ])
      ]);
    }),
    256
    /* UNKEYED_FRAGMENT */
  );
}

// src/vue/indexForums.vue
indexForums_default.render = render;
indexForums_default.__file = "src\\vue\\indexForums.vue";
var indexForums_default2 = indexForums_default;

// src/pages/index.ts
var log2 = new extLogger("pages/index.ts");
async function pages_default() {
  if (settings.hideNewsFromMain) {
    document.querySelector(".index__main")?.remove();
  }
  const user_ignored = await getIgnoreList({});
  if (settings.customTopicSections) {
    const mainFeed = await parseFeed({ offset: 0 });
    const nextOffset = mainFeed.length;
    const additionalFeed = nextOffset > 0 ? await parseFeed({ offset: nextOffset }) : [];
    let list = [...mainFeed, ...additionalFeed];
    const seenIds = /* @__PURE__ */ new Set();
    list = list.filter((item) => {
      if (seenIds.has(Number(item.id))) return false;
      seenIds.add(Number(item.id));
      return true;
    });
    if (settings.hideTopicsFromMain && user_ignored.length > 0) {
      const ignoredUserIds = new Set(user_ignored.map((user) => user.id));
      list = list.filter((item) => !ignoredUserIds.has(item.first_post.user_id));
    }
    loadVue(".forum__list", indexForums_default2, { forumList: list });
  }
}
export {
  pages_default as default
};
//# sourceMappingURL=index.js.map
