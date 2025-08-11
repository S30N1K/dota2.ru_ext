import {ExtensionConfig} from "./types";
import browser from "webextension-polyfill";

const CONFIG_KEYS: (keyof ExtensionConfig)[] = [
    'oldDesign',
    'newSmilePanel',
    'pasteImage',
    'imgbbToken',
    'soundNotifications',
    'soundType',
    'customSoundName',
    'hoverLastNotifications',
    'hoverLastDialogs',
    'showNotificationRatings',
    'betterAvatarExport',
    'listTopicSections',
    'ignoredSectionIds',
    'saveInputFields',
    'simpleMainPage',
    'threadCreatorFrame',
    'yourPostsFrame',
    'followersFrame',
    'showSignatures',
    'ignoredByFrame',
    'ignoreIndexThemes',
    'ignoreForumPost',
    'newRatePanel'
];

export async function saveConfig(settings: ExtensionConfig): Promise<void> {
    console.log('Сохранение настроек через webextension-polyfill');
    // Создаем обычный объект из Vue reactive объекта для совместимости с Firefox
    const plainObject = JSON.parse(JSON.stringify(settings));
    await browser.storage.sync.set(plainObject);
    console.log('Настройки сохранены');
}

export async function loadConfig(): Promise<ExtensionConfig> {
    console.log('Загрузка настроек через webextension-polyfill');
    const result: any = await browser.storage.sync.get(CONFIG_KEYS);

    return {
        oldDesign: result.oldDesign ?? false,
        newSmilePanel: result.newSmilePanel ?? false,
        pasteImage: result.pasteImage ?? false,
        imgbbToken: result.imgbbToken ?? '',
        soundNotifications: result.soundNotifications ?? false,
        soundType: result.soundType ?? 'default',
        customSoundName: result.customSoundName ?? '',
        hoverLastNotifications: result.hoverLastNotifications ?? false,
        hoverLastDialogs: result.hoverLastDialogs ?? false,
        showNotificationRatings: result.showNotificationRatings ?? false,
        betterAvatarExport: result.betterAvatarExport ?? false,
        listTopicSections: result.listTopicSections ?? false,
        ignoredSectionIds: Array.isArray(result.ignoredSectionIds) ? result.ignoredSectionIds.map(Number) : [],
        saveInputFields: result.saveInputFields ?? false,
        showSignatures: result.showSignatures ?? false,
        simpleMainPage: result.simpleMainPage ?? false,
        threadCreatorFrame: result.threadCreatorFrame ?? false,
        yourPostsFrame: result.yourPostsFrame ?? false,
        followersFrame: result.followersFrame ?? false,
        ignoredByFrame: result.ignoredByFrame ?? false,
        ignoreIndexThemes: result.ignoreIndexThemes ?? false,
        ignoreForumPost: result.ignoreForumPost ?? false,
        newRatePanel: result.newRatePanel ?? false,
    };
}
