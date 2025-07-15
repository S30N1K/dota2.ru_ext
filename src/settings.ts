import { ExtensionSettings } from "./types";

export function saveSettings(settings: ExtensionSettings) {
  chrome.storage.sync.set(settings, () => {});
}

export function loadSettings(callback: (settings: ExtensionSettings) => void) {
  chrome.storage.sync.get([
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
  ], (result: any) => {
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