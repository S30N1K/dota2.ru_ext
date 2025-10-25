import { sendToBackground} from "./communication";
import { extLogger } from "../../logger";

const log = new extLogger("extension/utils/hotReloadSocket.ts")

const wsPort = process.env.WEBSOCKET_PORT || "5896";
const RECONNECT_STEP = 5000;       // шаг увеличения интервала переподключения
const MAX_RECONNECT_TIME = 60000;  // макс. время ожидания
const INITIAL_RECONNECT_DELAY = 5000;

export function startHotReloadSocket() {
    let retryDelay = INITIAL_RECONNECT_DELAY;
    let totalWaitTime = 0;

    const connect = () => {
        const ws = new WebSocket(`ws://localhost:${wsPort}`);

        ws.onopen = () => {
            log.info("✅ WebSocket-соединение установлено");
            retryDelay = INITIAL_RECONNECT_DELAY;
            totalWaitTime = 0;
        };

        ws.onerror = (error) => log.error("❌ Ошибка WebSocket:", error);

        ws.onmessage = async (msg) => {
            log.debug("📨 Получено сообщение WebSocket:", msg);

            try {
                const data = JSON.parse(msg.data);

                if (data.type === "reload") {
                    log.info("♻️ Команда перезагрузки");

                    const reload = async () => {
                        await sendToBackground({ type: "RELOAD" });
                        log.info("🔄 Сообщение о перезагрузке отправлено, обновляем страницу...");
                        location.reload();
                    };

                    if (document.visibilityState === "visible" && !document.hidden) {
                        await reload();
                    } else {
                        log.info("⏸ Страница неактивна, ждём видимости...");
                        await new Promise<void>((resolve) => {
                            const handleVisibilityChange = () => {
                                if (document.visibilityState === "visible" && !document.hidden) {
                                    document.removeEventListener("visibilitychange", handleVisibilityChange);
                                    resolve();
                                }
                            };
                            document.addEventListener("visibilitychange", handleVisibilityChange);
                        });
                        await reload();
                    }
                }
            } catch (error) {
                log.error("Ошибка при обработке сообщения WebSocket:", error);
            }
        };

        ws.onclose = (event) => {
            log.info(`⚠️ WebSocket закрыт (код: ${event.code}, причина: ${event.reason || "не указана"})`);
            totalWaitTime += retryDelay;

            if (totalWaitTime >= MAX_RECONNECT_TIME) {
                log.error(`⛔ Достигнут лимит ожидания (${MAX_RECONNECT_TIME / 1000} сек), переподключение остановлено.`);
                return;
            }

            log.info(`🔁 Повторное подключение через ${retryDelay / 1000} сек...`);
            setTimeout(() => {
                retryDelay = Math.min(retryDelay + RECONNECT_STEP, MAX_RECONNECT_TIME);
                log.info(`Попытка переподключения (интервал: ${retryDelay / 1000} сек)`);
                connect();
            }, retryDelay);
        };

        return ws;
    };

    // Первичная попытка подключения
    try {
        connect();
    } catch (error) {
        log.error("Не удалось создать начальное WebSocket-соединение:", error);
        log.info("Повторная попытка через 5 секунд...");
        setTimeout(connect, 5000);
    }
}
