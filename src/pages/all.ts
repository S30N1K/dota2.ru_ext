import {isNewVersion, saveVersion} from "../utils";

if (isNewVersion()) {
    const pulseClass = "pulse";

    const selectors: string[] = [
        ".header__link--user",
        ".header__sublist li:nth-child(7)",
    ];

    const forumSelector = ".forum-profile__topblock.profile-setting li:nth-child(6)";
    const isForumSettingsPage = /^\/forum\/settings\/[^/]+\/?$/.test(window.location.pathname)

    if (isForumSettingsPage) {
        selectors.push(forumSelector);
    }

    const addPulseIfExists = (selector: string) => {
        const el = document.querySelector(selector);
        if (el && !el.classList.contains(pulseClass)) {
            el.classList.add(pulseClass);
        }
    };

    const removePulse = () => {
        document.querySelectorAll(`.${pulseClass}`).forEach(el => {
            el.classList.remove(pulseClass);
        });
        saveVersion()
    };

    const observeDOM = () => {
        const observer = new MutationObserver(() => {
            selectors.forEach(addPulseIfExists);

            if (isForumSettingsPage) {
                const settingItem = document.querySelector(forumSelector);
                if (settingItem && !settingItem.hasAttribute("data-pulse-listener")) {
                    settingItem.setAttribute("data-pulse-listener", "true");
                    settingItem.addEventListener("click", removePulse);
                }
            }

            const allFound = selectors.every(sel => document.querySelector(sel));
            if (allFound) {
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Вдруг уже загружено
        selectors.forEach(addPulseIfExists);
    };

    observeDOM();
}
