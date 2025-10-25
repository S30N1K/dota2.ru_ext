import {
  parseJson
} from "./chunk-6EVUB3DE.js";

// src/api/getNotifications.ts
async function getNotifications({ page }) {
  const response = await parseJson("/forum/api/notices/preload", {
    name: "\u0412\u0441\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
    page
  });
  return response.notices;
}

export {
  getNotifications
};
//# sourceMappingURL=chunk-ZQJYJ7WX.js.map
