import {
  createApp,
  extLogger,
  h
} from "./chunk-6EVUB3DE.js";

// src/utils/loadVue.ts
var log = new extLogger("utils/loadVue.ts");
function loadVue(selector, component, props) {
  const container = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!container) return;
  container.innerHTML = "";
  const app = createApp({
    setup() {
      return () => h(component, props);
    }
  });
  app.mount(container);
}

export {
  loadVue
};
//# sourceMappingURL=chunk-J4LWYTZF.js.map
