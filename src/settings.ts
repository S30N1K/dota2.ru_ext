// @ts-ignore
// eslint-disable-next-line
declare const browser: any;
import { ExtensionSettings } from "./types";

const storage = (typeof browser !== "undefined" && browser.storage) ? browser.storage : chrome.storage;

export function saveSettings(settings: ExtensionSettings): Promise<void> {
  console.log('saveSettings вызвана с:', settings);
  
  if (storage.sync.set.length === 1) {
    // browser.storage: возвращает промис
    console.log('Используется browser.storage');
    return storage.sync.set(settings);
  } else {
    // chrome.storage: использует колбэк
    console.log('Используется chrome.storage');
    return new Promise<void>((resolve, reject) => {
      storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
          console.error('Ошибка chrome.storage:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log('Настройки сохранены в chrome.storage');
          resolve();
        }
      });
    });
  }
}

export function loadSettings(callback: (settings: ExtensionSettings) => void) {
  console.log('loadSettings вызвана');
  const keys = [
    'oldDesign',
    'newSmilePanel',
    'pasteImage',
    'imgbbToken',
    'soundNotifications',
    'soundType',
    'customSoundName',
    'hoverLastNotifications',
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
  ];
  if (storage.sync.get.length === 1) {
    // browser.storage: возвращает промис
    storage.sync.get(keys).then((result: any) => {
      callback({
        oldDesign: result.oldDesign ?? false,
        newSmilePanel: result.newSmilePanel ?? false,
        pasteImage: result.pasteImage ?? false,
        imgbbToken: result.imgbbToken ?? '',
        soundNotifications: result.soundNotifications ?? false,
        soundType: result.soundType ?? 'default',
        customSoundName: result.customSoundName ?? '',
        hoverLastNotifications: result.hoverLastNotifications ?? false,
        showNotificationRatings: result.showNotificationRatings ?? false,
        betterAvatarExport: result.betterAvatarExport ?? false,
        listTopicSections: result.listTopicSections ?? false,
        ignoredSectionIds: Array.isArray(result.ignoredSectionIds) ? result.ignoredSectionIds.map(Number) : [],
        // Новые настройки
        saveInputFields: result.saveInputFields ?? false,
        showSignatures: result.showSignatures ?? false,
        simpleMainPage: result.simpleMainPage ?? false,
        threadCreatorFrame: result.threadCreatorFrame ?? false,
        yourPostsFrame: result.yourPostsFrame ?? false,
        followersFrame: result.followersFrame ?? false,
        ignoredByFrame: result.ignoredByFrame ?? false,
      });
    });
  } else {
    // chrome.storage: использует колбэк
    storage.sync.get(keys, (result: any) => {
      callback({
        oldDesign: result.oldDesign ?? false,
        newSmilePanel: result.newSmilePanel ?? false,
        pasteImage: result.pasteImage ?? false,
        imgbbToken: result.imgbbToken ?? '',
        soundNotifications: result.soundNotifications ?? false,
        soundType: result.soundType ?? 'default',
        customSoundName: result.customSoundName ?? '',
        hoverLastNotifications: result.hoverLastNotifications ?? false,
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
      });
    });
  }
} 