import "./types";
import {ExtensionSettings} from "./types";
import {setupTinyMCEHook} from "./tinymce/editorHooks";

window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    const { source, type, payload } = event.data;
    if (source !== "parasite") return;

    switch (type) {
        case "NOTIFY":
            console.log('Получено уведомление:', payload);
            
            // Всегда показываем наше уведомление
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                border: 2px solid #45a049;
                animation: slideIn 0.3s ease-out;
                max-width: 300px;
                word-wrap: break-word;
            `;
            notification.textContent = payload;
            document.body.appendChild(notification);
            
            // Добавляем CSS анимацию
            if (!document.getElementById('notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Удаляем через 3 секунды
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideIn 0.3s ease-out reverse';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }
            }, 3000);
            

            // if (window.Utils && window.Utils.notify) {
            //     try {
            //         window.Utils.notify(payload);
            //     } catch (error) {
            //         console.log('Встроенная система уведомлений недоступна:', error);
            //     }
            // }
            break;

        case "SMILE": {
            const { title, url } = payload;
            window.tinymce.activeEditor?.smileys?.insert(title, url);
            break;
        }

        case "ExtensionSettings": { 
            setupTinyMCEHook(payload as ExtensionSettings);
            break;
        }
    }
});

export {};
