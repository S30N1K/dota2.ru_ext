// @ts-ignore
// eslint-disable-next-line
declare const browser: any;
import { ExtensionSettings } from "./types";

const storage = (typeof browser !== "undefined" && browser.storage) ? browser.storage : chrome.storage;

export function saveSettings(settings: ExtensionSettings) {
  if (storage.sync.set.length === 1) {
    // browser.storage: возвращает промис
    return storage.sync.set(settings);
  } else {
    // chrome.storage: использует колбэк
    return new Promise<void>((resolve) => {
      storage.sync.set(settings, () => resolve());
    });
  }
}

export function loadSettings(callback: (settings: ExtensionSettings) => void) {
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
      });
    });
  }
} 