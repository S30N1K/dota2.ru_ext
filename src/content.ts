import {ExtensionSettings} from "./types";
import {initSmilesPanel, loadCss, parasite} from "./utils";

const script = document.createElement('script');
script.src = chrome.runtime.getURL('parasite.js');
script.onload = () => {
  script.remove()


  chrome.storage.sync.get(null, (conf: ExtensionSettings) => {
    if (conf.oldDesign) {
      loadCss(chrome.runtime.getURL('style/main.css'))
    }

    if (conf.newSmilePanel) {
      parasite("newSmilesPanel", {});
      loadCss(chrome.runtime.getURL('style/smilesPanel.css'))
    }

    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      const { type, message } = event.data || {};
      if (type === "TinyMCE.init") {
        const el = document.querySelector(message.selector);
        initSmilesPanel(el);
      }
    });

  });
}
(document.head || document.documentElement).appendChild(script);


