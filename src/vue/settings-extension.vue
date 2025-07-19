<template>
  <div class="settings-page__columns">
    <div class="settings-page__column" v-for="(column, columnIndex) of menu.columns" :key="columnIndex">
      <div class="bg-main-block settings-page__block" v-for="(section, sectionIndex) of column.sections" :key="sectionIndex">
        <p class="settings-page__block-title">{{ section.title }}</p>
        <div class="settings-page__block-splitter" v-for="(configurate, configIndex) of section.configuration" :key="configIndex">
          <!-- Checkbox конфигурация -->
          <template v-if="isCheckboxConfig(configurate)">
            <div class="settings-page__block-splitter--item">{{ configurate.title }}</div>
            <div class="settings-page__block-splitter--item">
              <input 
                type="checkbox"
                :id="configurate.key"
                v-model="config[configurate.key].value"
                :disabled="configurate.disabled"
                @change="debouncedSaveSettings"
              >
            </div>
          </template>
          
          <!-- Select конфигурация -->
          <template v-else-if="isSelectConfig(configurate)">
            <div class="settings-page__block-splitter--item">{{ configurate.title }}</div>
            <div class="settings-page__block-splitter--item">
              <select 
                :id="configurate.key"
                v-model="config[configurate.key].value"
                :disabled="configurate.disabled"
                @change="debouncedSaveSettings"
              >
                <option v-for="option in configurate.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
          </template>
          
          <!-- Text конфигурация -->
          <template v-else-if="isTextConfig(configurate)">
            <div class="settings-page__block-splitter--item">
              <span v-html="configurate.value"></span>
            </div>
          </template>
          
          <!-- Value конфигурация -->
          <template v-else-if="hasValue(configurate)">
            <div class="settings-page__block-splitter--item">{{ configurate.value }}</div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Секция настроек тем форума -->
    <div class="settings-page__column">
      <div class="bg-main-block settings-page__block">
        <div id="forum_nodes" class="bg-main-block settings-page__block">
          <p class="settings-page__block-title">
            Настройка выводимых тем
            <input 
              type="checkbox" 
              v-model="config.listTopicSections" 
              @change="debouncedSaveSettings" 
              id="listTopicSections"
            >
          </p>
          <p class="settings-page__description">
            Снимите галочку с тех разделов, темы из которых вы не хотите видеть в отображении
            на главной странице сайта
          </p>
          <hr>
          <label 
            class="settings-page__block-splitter" 
            v-for="section of config.ignoredSections.value" 
            :key="section.id"
          >
            <span class="settings-page__block-splitter--item">{{ section.name }}</span>
            <span class="settings-page__block-splitter--item">
              <input 
                type="checkbox"
                :checked="isSectionIgnored(section.id)"
                @change="toggleIgnoredSection(Number(section.id))"
                :id="`ignoredSection_${section.id}`"
                :disabled="!config.listTopicSections"
              >
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { getCurrentVersion, parasite } from "../utils";
import { parseForumSections } from "../api";
import { saveSettings as saveExtSettings, loadSettings as loadExtSettings } from '../settings';
import type { 
  ExtensionSettings, 
  IForumSections, 
  ReactiveSettings, 
  Menu, 
  ExtensionSettingKey,
  ConfigurationItem,
  CheckboxConfigurationItem,
  SelectConfigurationItem,
  TextConfigurationItem
} from "../types";
import { getIgnoredUsers } from "../storage";

// --- Таймер для отложенного сохранения ---
let saveTimer: NodeJS.Timeout | null = null;
const SAVE_DELAY = 1500;


// --- Реактивные настройки расширения ---
const config: ReactiveSettings = {
  oldDesign: ref(false),
  newSmilePanel: ref(false),
  pasteImage: ref(false),
  imgbbToken: ref(''),
  soundNotifications: ref(false),
  soundType: ref('default'),
  customSound: ref<File | null>(null),
  customSoundName: ref(''),
  hoverLastNotifications: ref(false),
  showNotificationRatings: ref(false),
  betterAvatarExport: ref(false),
  ignoredSections: ref<IForumSections[]>([]),
  listTopicSections: ref(false),
  ignoredSectionIds: ref<number[]>([]),
  saveInputFields: ref(false),
  showSignatures: ref(false),
  simpleMainPage: ref(false),
  threadCreatorFrame: ref(false),
  yourPostsFrame: ref(false),
  followersFrame: ref(false),
  ignoredByFrame: ref(false),
};

// --- Ключи для автоматизации сохранения/загрузки настроек ---
const settingsKeys: ExtensionSettingKey[] = [
  "oldDesign", "newSmilePanel", "pasteImage", "imgbbToken", "soundNotifications",
  "soundType", "customSoundName", "hoverLastNotifications", "showNotificationRatings",
  "betterAvatarExport", "listTopicSections", "ignoredSectionIds", "saveInputFields",
  "showSignatures", "simpleMainPage", "threadCreatorFrame", "yourPostsFrame",
  "followersFrame", "ignoredByFrame"
];

// --- Вычисляемые свойства ---
const isSectionIgnored = computed(() => (sectionId: number) => 
  config.ignoredSectionIds.value.includes(sectionId)
);

// --- Функции проверки типов конфигурации ---
const isCheckboxConfig = (config: ConfigurationItem): config is CheckboxConfigurationItem => 
  'type' in config && config.type === 'checkbox';

const isSelectConfig = (config: ConfigurationItem): config is SelectConfigurationItem => 
  'type' in config && config.type === 'select';

const isTextConfig = (config: ConfigurationItem): config is TextConfigurationItem => 
  'type' in config && config.type === 'text';

const hasValue = (config: ConfigurationItem): config is ConfigurationItem & { value: string } => 
  'value' in config;

// --- Структура меню настроек ---
const menu = ref<Menu>({
  columns: [
    {
      sections: [
        {
          title: "Оформление",
          configuration: [
            { title: "Использовать старое оформление", type: "checkbox", key: "oldDesign" },
            { title: "Показывать подписи в темах форума", type: "checkbox", key: "showSignatures" },
            { title: "Упрощенная главная страница", type: "checkbox", key: "simpleMainPage", disabled: true },
            { title: "Рамка вокруг создателя темы", type: "checkbox", key: "threadCreatorFrame", disabled: true },
            { title: "Рамка вокруг ваших постов", type: "checkbox", key: "yourPostsFrame", disabled: true },
            { title: "Рамка вокруг тех, кто на вас подписан", type: "checkbox", key: "followersFrame" },
            { title: "Рамка вокруг того, кто вас игнорирует", type: "checkbox", key: "ignoredByFrame" }
          ]
        },
        {
          title: "Редактор",
          configuration: [
            { title: "Новая панель со смайлами", type: "checkbox", key: "newSmilePanel" },
            { title: "Вставка изображений по Ctrl+V", type: "checkbox", key: "pasteImage" },
            { title: "Сохранение содержимого полей ввода", type: "checkbox", key: "saveInputFields", disabled: true }
          ]
        },
        {
          title: "Список тех, кто вас игнорирует",
          configuration: []
        },
        {
          title: "Инфо",
          configuration: [
            { type: "text", value: `<b>Версия расширения:</b> ${getCurrentVersion()}` },
            { type: "text", value: "<b>Автор расширения:</b> <a href='/forum/members/.474212/' target='_blank'>S30N1K</a>" },
            { type: "text", value: "<b>Автор старого дизайна:</b> <a href='/forum/members/.818100/' target='_blank'>Руна дегенерации</a>" },
            { type: "text", value: "<b>Ссылка на исходник:</b> <a href='https://github.com/S30N1K/dota2.ru_ext' target='_blank'>GITHUB</a>" },
            { type: "text", value: "<b>Ссылка на группу Discord:</b> <a href='https://discord.gg/ptktuFEKyB' target='_blank'>Ядреное убежище</a>" }
          ]
        }
      ]
    }
  ]
});

// --- Функции ---
async function getIgnoredUserLinks(): Promise<string> {
  const ignoredUsers = await getIgnoredUsers();
  console.log(ignoredUsers);
  return ignoredUsers
    .map(user => `<a href="https://dota2.ru/forum/members/.${user.targetUserId}/">${user.nickname}</a>`)
    .join(', ');
}

async function saveSettings(): Promise<void> {
  const settings: ExtensionSettings = {} as ExtensionSettings;
  
  for (const key of settingsKeys) {
    if (key === "ignoredSectionIds") {
      (settings as any)[key] = (config[key].value as number[]).map(Number);
    } else {
      (settings as any)[key] = config[key].value;
    }
  }
  
  try {
    await saveExtSettings(settings);
    parasite("NOTIFY", "Настройки расширения сохранены");
  } catch (error: unknown) {
    console.error('Ошибка при сохранении настроек:', error);
    parasite("NOTIFY", "Ошибка при сохранении настроек");
  }
}

function debouncedSaveSettings(): void {
  // Очищаем предыдущий таймер
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  
  // Устанавливаем новый таймер
  saveTimer = setTimeout(async () => {
    await saveSettings();
    saveTimer = null;
  }, SAVE_DELAY);
}

function loadSettings(): void {
  console.log('Загрузка настроек...');
  loadExtSettings((result: ExtensionSettings) => {
    console.log('Загруженные настройки:', result);
    for (const key of settingsKeys) {
      if (key in result && key in config) {
        config[key].value = result[key as keyof ExtensionSettings];
      }
    }
    console.log('Настройки применены к конфигу:', config);
  });
}

async function toggleIgnoredSection(id: number): Promise<void> {
  console.log('Переключение раздела:', id);
  const currentIds = config.ignoredSectionIds.value;
  const isIgnored = currentIds.includes(id);
  
  console.log('Текущие игнорируемые разделы:', currentIds);
  console.log('Раздел игнорируется:', isIgnored);
  
  config.ignoredSectionIds.value = isIgnored 
    ? currentIds.filter(x => x !== id)
    : [...currentIds, id];
    
  console.log('Новые игнорируемые разделы:', config.ignoredSectionIds.value);
  debouncedSaveSettings();
}

async function initializeSettings(): Promise<void> {
  console.log('Инициализация настроек...');
  
  loadSettings();
  console.log('Настройки загружены');
  
  config.ignoredSections.value = await parseForumSections();
  console.log('Разделы форума загружены:', config.ignoredSections.value.length);
  
  const ignoredUsersLinks = await getIgnoredUserLinks();
  console.log('Ссылки игнорируемых пользователей получены');
  
  const ignoredUsersSection = menu.value.columns[0].sections[2];
  
  if (ignoredUsersSection) {
    ignoredUsersSection.configuration.push({ type: "text", value: ignoredUsersLinks });
    console.log('Секция игнорируемых пользователей обновлена');
  }
  
  console.log('Инициализация завершена');
}

// --- Инициализация при монтировании компонента ---
onMounted(initializeSettings);

// --- Автоматическое сохранение при изменении токена imgbb ---
watch(config.imgbbToken, () => {
  debouncedSaveSettings();
});
</script>

<style scoped>
.settings-page__description {
  font-size: 13px;
}
</style>