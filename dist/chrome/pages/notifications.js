import {
  getNotifications
} from "./chunks/chunk-ZQJYJ7WX.js";
import {
  getSmiles
} from "./chunks/chunk-UZ4L7MZK.js";
import {
  extLogger,
  settings
} from "./chunks/chunk-6EVUB3DE.js";
import "./chunks/chunk-54KOYG5C.js";

// src/pages/notifications.ts
var log = new extLogger("pages/notifications.ts");
async function members() {
  if (!settings.showRatingsInNotifications) return;
  let parseTimeout = null;
  const smilesList = await getSmiles();
  const smilesMap = new Map(smilesList?.smiles.map((s) => [String(s.id), s.filename]));
  async function parse() {
    const currentPageElement = document.querySelector(
      "#pagination-vue .pagination-vue-item.checked"
    );
    const currentPage = currentPageElement ? parseInt(currentPageElement.textContent || "1") : 1;
    const notifications = await getNotifications({ page: currentPage });
    const items = document.querySelectorAll(".notices-body__items-item");
    items.forEach((item, i) => {
      const n = notifications[i];
      if (n?.type !== "forum_post_liked" || !n.smile_id) return;
      const filename = smilesMap.get(String(n.smile_id));
      if (!filename) return;
      if (item.querySelector("img[data-smile]")) return;
      const img = document.createElement("img");
      img.src = `/img/forum/emoticons/${filename}`;
      img.alt = "smile";
      img.dataset.smile = "true";
      item.appendChild(img);
    });
  }
  const noticesContainer = document.querySelector(".notices-body__items");
  if (noticesContainer) {
    const observer = new MutationObserver((mutations) => {
      let hasNewItems = false;
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.id === "pagination-vue" || node.closest("#pagination-vue") || node.tagName === "IMG") {
            continue;
          }
          if (node.classList.contains("notices-body__items-item")) {
            hasNewItems = true;
          }
        }
      }
      if (hasNewItems) {
        if (parseTimeout) clearTimeout(parseTimeout);
        parseTimeout = window.setTimeout(() => {
          parse();
          parseTimeout = null;
        }, 1e3);
      }
    });
    observer.observe(noticesContainer, { childList: true, subtree: true });
  }
  await parse();
}
export {
  members as default
};
//# sourceMappingURL=notifications.js.map
