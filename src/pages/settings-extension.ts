import SettingsExtension from '../vue/settings-extension.vue';
import {loadVue} from "../utils";
function isSettingsExtensionPage() {
    const {pathname, hash} = window.location;
    const pathMatch = /^\/forum\/settings\/[^/]+\/?$/.test(pathname);
    return pathMatch && hash === '#extension';
}
function runExtensionSettings() {
    loadVue('.settings-tab-content', SettingsExtension);
}
function checkAndRun() {
    if (isSettingsExtensionPage()) {
        runExtensionSettings();
    }
}
checkAndRun();
window.addEventListener('hashchange', checkAndRun);