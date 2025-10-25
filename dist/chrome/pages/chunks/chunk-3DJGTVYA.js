import {
  getSmileUrl,
  newSmilesPanel_default
} from "./chunk-2E4SLZRR.js";
import {
  loadVue
} from "./chunk-J4LWYTZF.js";
import {
  extLogger,
  settings
} from "./chunk-6EVUB3DE.js";

// src/utils/getTinyMCEEditor.ts
var log = new extLogger("utils/getTinyMCEEditor.ts");
function getTinyMCEEditor(callback) {
  const editors = [];
  const processEditor = (editor) => {
    if (editor && !editors.includes(editor)) {
      editors.push(editor);
      if (editor.initialized) {
        callback(editor);
      } else {
        editor.on("init", () => {
          callback(editor);
        });
      }
    }
  };
  if (typeof window.tinymce !== "undefined" && window.tinymce.editors) {
    ;
    window.tinymce.editors.forEach(processEditor);
  }
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
          const iframes = element.querySelectorAll("iframe");
          iframes.forEach((iframe) => {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc && iframeDoc.body) {
                const editorElement = iframeDoc.body.querySelector("[data-mce-object]");
                if (editorElement) {
                  const editorId = editorElement.getAttribute("data-mce-object");
                  if (editorId && typeof window.tinymce !== "undefined") {
                    const editor = window.tinymce.get(editorId);
                    if (editor) {
                      processEditor(editor);
                    }
                  }
                }
              }
            } catch (e) {
            }
          });
        }
      });
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  if (typeof window.tinymce !== "undefined") {
    ;
    window.tinymce.on("AddEditor", (e) => {
      if (e.editor) {
        processEditor(e.editor);
      }
    });
    window.tinymce.on("init", (e) => {
      if (e.target) {
        processEditor(e.target);
      }
    });
  }
}

// src/utils/uploadToImgbb.ts
var log2 = new extLogger("utils/uploadToImgbb.ts");
async function uploadToImgbb(base64Image) {
  const formData = new FormData();
  formData.append("image", base64Image.split(",")[1]);
  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=05b36feae2ca1f1f63701c921f55e6f0`,
      {
        method: "POST",
        body: formData
      }
    );
    const result = await response.json();
    if (result.success) {
      return result.data.url;
    } else {
      log2.error("Imgbb upload failed", result);
      return null;
    }
  } catch (error) {
    log2.error("Upload to imgbb failed:", error);
    return null;
  }
}

// src/utils/initTinyMcePlugins.ts
var log3 = new extLogger("utils/initTinyMcePlugins.ts");
function initTinyMcePlugins() {
  getTinyMCEEditor((editor) => {
    if (settings.imagePasteByCtrlV) {
      editor.on("paste", (event) => {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
          if (item.type.includes("image")) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = async (e) => {
                const base64 = e.target?.result;
                const url = await uploadToImgbb(base64);
                if (url) {
                  editor.insertContent(`<img src="${url}" alt="Image"/>`);
                } else {
                  log3.error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u043D\u0430 imgbb");
                }
              };
              reader.readAsDataURL(file);
              event.preventDefault();
              break;
            }
          }
        }
      });
    }
    if (settings.newSmilesPanel) {
      let isOpen = false;
      const button = editor.container.querySelector('button[aria-label="\u0421\u043C\u0430\u0439\u043B\u044B"]');
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        isOpen = !isOpen;
        let smilesPanel = editor.container?.parentElement?.querySelector("#smilesPanel");
        if (!smilesPanel) {
          smilesPanel = document.createElement("div");
          smilesPanel.setAttribute("id", "smilesPanel");
          editor.container?.parentElement?.appendChild(smilesPanel);
          loadVue(smilesPanel, newSmilesPanel_default, {
            onSmile(smile) {
              tinymce.activeEditor.plugins.smileys.insert(smile.title, getSmileUrl(smile));
            }
          });
        }
        if (isOpen) {
          smilesPanel.classList.add("opened");
        } else {
          smilesPanel.classList.remove("opened");
        }
      });
    }
  });
}

export {
  initTinyMcePlugins
};
//# sourceMappingURL=chunk-3DJGTVYA.js.map
