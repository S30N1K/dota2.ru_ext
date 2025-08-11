import {getExtUrl, initTinyMceNewSmilesPanel} from "../utils";
import {loadConfig} from "../config";
import {
    initLastDialogs, initLastNotifications,
    initSettingsButton,
    loadCss,
    loadPageModules,
    loadScript,
    processRoutes,
    routes,
    waitForDOMReady
} from "./utils";

async function main() {
    const config = await loadConfig();
    await waitForDOMReady();

    // Загрузка базовых стилей расширения
    loadCss(getExtUrl("style/style.css"));

    // Загрузка старого оформления
    if (config.oldDesign) {
        loadCss(getExtUrl("style/old.css"));
    }

    // Добавляем иконку настроек в шапку
    initSettingsButton();

    if (config.hoverLastDialogs){
        await initLastDialogs(config)
    }

    if (config.hoverLastNotifications) {
        await initLastNotifications(config)
    }

    loadScript(getExtUrl("injected.js"), async () => {
        // Грузим другие скрипты для текущей страницы
        const moduleMap = loadPageModules();
        await processRoutes(location.pathname, config, moduleMap, routes);
    })
}

window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    switch (event.data.type) {
        case "tinyMCE": {
            const selector = event.data.payload
            initTinyMceNewSmilesPanel(document.querySelector(selector));
            break
        }
    }
});

main().catch(console.error);