import {isNewVersion} from "./storage";
import {loadCss, parasite} from "./utils";
import {loadSettings} from "./settings";

const getUrl = (path: string) => chrome.runtime.getURL(path);

const script = document.createElement('script');
script.src = getUrl('parasite.js');
(document.head || document.documentElement).appendChild(script);

script.onload = () => {
    script.remove();

    loadCss(getUrl("style/main.css"));

    if (isNewVersion()) {
        loadCss(getUrl("style/newVersion.css"));
    }

    loadSettings(settings => {
        if (settings.oldDesign) {
            loadCss(getUrl("style/old.css"));
        }

        if (settings.newSmilePanel){
            loadCss(getUrl("style/smilesPanel.css"));
        }

        parasite("ExtensionSettings", settings);
    })
}