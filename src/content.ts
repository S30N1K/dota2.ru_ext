declare let __webpack_public_path__: string;
declare const Utils: any;
__webpack_public_path__ = (window as any).chrome.runtime.getURL('/');
console.log('Dota2.ru Helper content script loaded');
(window as any).chrome.storage.local.get(['oldDesign'], (result: { oldDesign?: boolean }) => {
  if (result.oldDesign) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = (window as any).chrome.runtime.getURL('style/main.css');
    document.head.appendChild(link);
    console.log('main.css подключён (oldDesign=true)');
  } else {
    console.log('main.css не подключён (oldDesign=false)');
  }
});