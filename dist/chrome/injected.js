"use strict";
(() => {
  // src/extension/injected.ts
  window.addEventListener("FROM_CONTENT_SCRIPT", async (event) => {
    const message = event.detail;
    switch (message.type) {
      case "LOADED": {
        const data = message.payload;
        const loader = await import(data.extensionUrl + "pages/loader.js");
        loader?.default(data);
      }
    }
  });
})();
//# sourceMappingURL=injected.js.map
