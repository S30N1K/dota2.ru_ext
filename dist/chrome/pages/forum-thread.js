import {
  initTinyMcePlugins
} from "./chunks/chunk-3DJGTVYA.js";
import "./chunks/chunk-2E4SLZRR.js";
import "./chunks/chunk-J4LWYTZF.js";
import "./chunks/chunk-UZ4L7MZK.js";
import {
  extLogger,
  settings
} from "./chunks/chunk-6EVUB3DE.js";
import "./chunks/chunk-54KOYG5C.js";

// src/pages/forum-thread.ts
var log = new extLogger("pages/forum-thread.ts");
async function forum_thread_default() {
  if (settings.hideForumMessages) {
    document.querySelectorAll(".ignored").forEach((el) => {
      el.remove();
    });
  }
  initTinyMcePlugins();
  for (const tab of Array.from(document.querySelectorAll(".message-tab"))) {
  }
}
export {
  forum_thread_default as default
};
//# sourceMappingURL=forum-thread.js.map
