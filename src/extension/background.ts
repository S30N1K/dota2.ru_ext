import { onBackgroundMessage, BackgroundResponse, BackgroundMessage } from './utils/communication'; 
import browser from './utils/browser'
import { database } from './utils/database';

// Обработка сообщений от content
onBackgroundMessage(async (msg: BackgroundMessage): Promise<BackgroundResponse> => {
  switch (msg.type) {

    // Запрос на обновление расширения
    case "RELOAD": {
        browser.runtime.reload()
        return { success: true };
    }

    // Сохранение настроек
    case "SAVE_DATABASE": {
      const data = msg.payload as {
        table: string
        data: object
      }
      
      // @ts-ignore todo:
      await database.update(data.table, data.data)
      return { success: true };
    }

    // Сброс всех настроек
    case "RESET_SETTINGS": {
      await Promise.all([
        database.clear("currentUser"),
        database.clear("chatSettings"),
        database.clear("settings")
      ])
      return { success: true };
    }

    // Запрос настроек расширения
    case "GET_DATABASE": {
      return {success: true, data: { 
        currentUser: await database.getAll("currentUser"),
        chatSettings: await database.getAll("chatSettings"), 
        settings: await database.getAll("settings")
      }}
    }
    default:
      return { success: false, error: "Неизвестный тип сообщения" };
  }
});