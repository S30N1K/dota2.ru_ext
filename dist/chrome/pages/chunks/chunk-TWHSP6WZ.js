import {
  extLogger,
  parseText
} from "./chunk-6EVUB3DE.js";

// src/api/getIgnoreList.ts
async function getIgnoreList({}) {
  const result = [];
  async function loadPage(url) {
    const html = await parseText(url);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const userBlocks = doc.querySelectorAll(
      ".settings-page__block-splitter[id^='user-']"
    );
    userBlocks.forEach((block) => {
      const id = parseInt(block.id.replace("user-", ""), 10);
      const nicknameEl = block.querySelector(".settings-page__ignored-user-info--row.mb4");
      const nickname = nicknameEl?.textContent?.trim() ?? "";
      if (!isNaN(id) && nickname) {
        result.push({ id, nickname });
      }
    });
    return doc;
  }
  const firstDoc = await loadPage("/forum/settings/ignorelist/");
  const paginationLinks = firstDoc.querySelectorAll(
    ".pagination__link[data-page]"
  );
  const pages = Array.from(paginationLinks).map((a) => parseInt(a.dataset.page || "0", 10)).filter((p) => !isNaN(p));
  const maxPage = pages.length ? Math.max(...pages) : 1;
  for (let page = 2; page <= maxPage; page++) {
    await loadPage(`/forum/settings/ignorelist/page-${page}`);
  }
  localStorage.setItem("ignorelist", JSON.stringify(result));
  return result;
}

// src/utils/forceUpdateTime.ts
var log = new extLogger("utils/forceUpdateTime.ts");
function forceUpdateTime() {
  const timeElements = document.querySelectorAll("time[data-time]");
  timeElements.forEach((timeElement) => {
    const timestamp = timeElement.getAttribute("data-time");
    if (timestamp) {
      const date = new Date(parseInt(timestamp) * 1e3);
      const now = /* @__PURE__ */ new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1e3);
      let timeString = "";
      if (diff < 60) {
        timeString = "\u0442\u043E\u043B\u044C\u043A\u043E \u0447\u0442\u043E";
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        timeString = `${minutes} \u043C\u0438\u043D. \u043D\u0430\u0437\u0430\u0434`;
      } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        timeString = `${hours} \u0447. \u043D\u0430\u0437\u0430\u0434`;
      } else if (diff < 2592e3) {
        const days = Math.floor(diff / 86400);
        timeString = `${days} \u0434\u043D. \u043D\u0430\u0437\u0430\u0434`;
      } else if (diff < 31536e3) {
        const months = Math.floor(diff / 2592e3);
        timeString = `${months} \u043C\u0435\u0441. \u043D\u0430\u0437\u0430\u0434`;
      } else {
        const years = Math.floor(diff / 31536e3);
        timeString = `${years} \u043B\u0435\u0442 \u043D\u0430\u0437\u0430\u0434`;
      }
      timeElement.textContent = timeString;
    }
  });
}

export {
  getIgnoreList,
  forceUpdateTime
};
//# sourceMappingURL=chunk-TWHSP6WZ.js.map
