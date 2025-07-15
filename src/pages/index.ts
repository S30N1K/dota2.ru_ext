import {initSmilesPanel, loadCss, loadVue, parasite} from '../utils';
import indexForums from "../vue/index-forums.vue";
import {ExtensionSettings} from "../types";

chrome.storage.sync.get(null, (conf: ExtensionSettings) => {
    if (conf.listTopicSections) {
        loadVue('.forum__list', indexForums);
    }
});