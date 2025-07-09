(window as any).chrome.runtime.onInstalled.addListener(() => {
  (window as any).chrome.storage.sync.get(['oldDesign'], (result: { oldDesign?: boolean }) => {
    if (result.oldDesign !== undefined) {
      (window as any).chrome.storage.local.set({ oldDesign: result.oldDesign });
    }
  });
});

(window as any).chrome.storage.onChanged.addListener((changes: { [key: string]: any }, areaName: string) => {
  if (areaName === 'sync' && changes.oldDesign) {
    (window as any).chrome.storage.local.set({ oldDesign: changes.oldDesign.newValue });
  }
});