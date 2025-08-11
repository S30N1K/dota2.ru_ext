<template>
  <a class="header__link" @click="showModal = true">
    <img style="filter: invert(70%); height: 16px;" :src="getExtUrl('/assets/settings.png')" alt="settings" />
  </a>

  <Modal v-model="showModal" title="Настройки расширения">
    <div class="settings-container hiddenScroll">
      <!-- Левое меню -->
      <div class="sidebar">
        <div
            v-for="(section, index) in menuSections"
            :key="section.title"
            :class="['menu-item', { active: selectedSectionIndex === index }]"
            @click="selectedSectionIndex = index"
        >
          {{ section.title }}
        </div>
      </div>

      <!-- Контент секции -->
      <div class="section-content">
        <div v-for="(item, idx) in currentSection.items" :key="`${currentSection.title}-${idx}`" class="setting-item">
          <template v-if="item.type === 'text'">
            <div class="text-setting" v-html="item.text" />
          </template>

          <template v-else-if="item.type === 'checkbox'">
            <label class="checkbox-setting">
              <input
                  type="checkbox"
                  v-model="config[item.key!]"
                  :disabled="item.disabled"
              />
              {{ item.text }}
            </label>
          </template>

          <template v-else-if="item.type === 'forum-sections'">
            <div v-if="config.listTopicSections" class="forum-sections-setting">
              <div v-if="forumSectionsLoading" class="loading">Загрузка разделов форума...</div>
              <div v-else-if="forumSections.length === 0" class="error">Ошибка загрузки разделов</div>
              <div v-else class="sections-list">
                <div v-for="section in forumSections" :key="section.id" class="section-item">
                  <label class="checkbox-setting">
                    <input
                        type="checkbox"
                        :checked="isSectionIgnored(section.id)"
                        @change="toggleSection(section.id)"
                    />
                    {{ section.name }}
                  </label>
                </div>
              </div>
            </div>
            <div v-else class="disabled-message">
              Включите опцию для настройки разделов
            </div>
          </template>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getCurrentVersion, getExtUrl } from '../utils'
import Modal from './modal.vue'
import { loadConfig, saveConfig } from '../config'
import { ExtensionConfig } from "../types"
import { getIgnoredUsers } from "../storage"
import {getIgnoreList, parseForumSections, saveFeedSettings} from "../api"

// Типы
interface ForumSection {
  id: number
  name: string
}

interface IgnoredUser {
  targetUserId: number
  nickname: string
}

interface MenuItem {
  type: 'text' | 'checkbox' | 'forum-sections'
  text: string
  key?: keyof ExtensionConfig
  disabled?: boolean
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

// Состояние
const showModal = ref(false)
const selectedSectionIndex = ref(0)
const config = ref<Partial<ExtensionConfig>>({})

// Данные для загрузки
const ignoredByMeList = ref('Загрузка...')
const ignoredMeList = ref('Загрузка...')
const forumSections = ref<ForumSection[]>([])
const forumSectionsLoading = ref(false)

// Константы
const SECTIONS = {
  SUPER_IGNORE: 4,
  TOPIC_SECTIONS: 5
} as const

// Утилиты
const createUserLink = (user: IgnoredUser): string => 
  `<a href="https://dota2.ru/forum/members/.${user.targetUserId}/">${user.nickname}</a>`

const formatUserList = (users: IgnoredUser[], emptyMessage: string): string => {
  if (users.length === 0) return emptyMessage
  return users.map(createUserLink).join(', ')
}


// Функции загрузки данных
const loadIgnoredUsersData = async (): Promise<void> => {
  try {
    const ignoredUsers = await getIgnoredUsers()

    ignoredMeList.value = formatUserList(ignoredUsers, 'Никто вас не игнорирует')

    const ignoredUserList = await getIgnoreList()

    ignoredByMeList.value = formatUserList(ignoredUserList, 'Вы никого не игнорируете')
  } catch (error) {
    console.error('Ошибка при загрузке списков игнорирования:', error)
    ignoredMeList.value = 'Ошибка загрузки'
    ignoredByMeList.value = 'Ошибка загрузки'
  }
}

const loadForumSections = async (): Promise<void> => {
  if (forumSectionsLoading.value) return // Предотвращаем повторные запросы
  
  forumSectionsLoading.value = true
  try {
    const sections = await parseForumSections()
    forumSections.value = sections
  } catch (error) {
    console.error('Ошибка при загрузке разделов форума:', error)
    forumSections.value = []
  } finally {
    forumSectionsLoading.value = false
  }
}

// Функции управления
const isSectionIgnored = (sectionId: number): boolean => {
  return config.value.ignoredSectionIds?.includes(sectionId) ?? false
}

const toggleSection = (sectionId: number): void => {
  if (!config.value.ignoredSectionIds) {
    config.value.ignoredSectionIds = []
  }
  
  const index = config.value.ignoredSectionIds.indexOf(sectionId)
  if (index === -1) {
    config.value.ignoredSectionIds.push(sectionId)
  } else {
    config.value.ignoredSectionIds.splice(index, 1)
  }

  saveFeedSettings(config.value.ignoredSectionIds)
}

// Computed свойства
const currentSection = computed(() => menuSections.value[selectedSectionIndex.value])

const menuSections = computed<MenuSection[]>(() => [
  {
    title: 'Инфо',
    items: [
      { type: 'text', text: `<b>Версия расширения:</b> ${getCurrentVersion()}` },
      { type: 'text', text: "<b>Автор расширения:</b> <a href='/forum/members/.474212/' target='_blank'>S30N1K</a>" },
      { type: 'text', text: "<b>Автор старого дизайна:</b> <a href='/forum/members/.818100/' target='_blank'>Руна дегенерации</a>" },
      { type: 'text', text: "<b>Ссылка на исходник:</b> <a href='https://github.com/S30N1K/dota2.ru_ext' target='_blank'>GITHUB</a>" },
      { type: 'text', text: "<b>Ссылка на группу Discord:</b> <a href='https://discord.gg/ptktuFEKyB' target='_blank'>Ядреное убежище</a>" },
    ]
  },
  {
    title: 'Настройки редактора',
    items: [
      { type: 'checkbox', text: 'Новая панель со смайлами', key: 'newSmilePanel' },
      { type: 'checkbox', text: 'Вставка изображений по Ctrl+V', key: 'pasteImage' },
      { type: 'checkbox', text: 'Сохранение содержимого полей ввода', key: 'saveInputFields', disabled: true },
    ]
  },
  {
    title: 'Стили',
    items: [
      { type: 'checkbox', text: 'Вернуть старое оформление', key: 'oldDesign' },
      { type: 'checkbox', text: 'Рамка вокруг создателя темы', key: 'threadCreatorFrame', disabled: true },
      { type: 'checkbox', text: 'Рамка вокруг ваших постов', key: 'yourPostsFrame', disabled: true },
      { type: 'checkbox', text: 'Рамка вокруг тех, кто на вас подписан', key: 'followersFrame', disabled: true },
      { type: 'checkbox', text: 'Рамка вокруг того, кто вас игнорирует', key: 'ignoredByFrame' },
    ]
  },
  {
    title: 'Форум',
    items: [
      { type: 'checkbox', text: 'Показывать подписи в темах форума', key: 'showSignatures' },
      { type: 'checkbox', text: 'Новая панель оценок', key: 'newRatePanel', disabled: true },
    ]
  },
  {
    title: 'Супер игнор',
    items: [
      { type: 'checkbox', text: 'Скрыть темы с главной', key: 'ignoreIndexThemes' },
      { type: 'checkbox', text: 'Скрыть сообщения с форума', key: 'ignoreForumPost'},
      { type: 'text', text: `<b>Список тех, кто вас игнорирует:</b> ${ignoredMeList.value}` },
      { type: 'text', text: `<b>Список тех, кого вы игнорируете:</b> ${ignoredByMeList.value}` },
    ]
  },
  {
    title: 'Разделы тем на главной',
    items: [
      { type: 'checkbox', text: 'Свои разделы тем на главной', key: 'listTopicSections'},
      { type: 'text', text: `<b>Снимите галочку с тех разделов, темы из которых вы не хотите видеть в отображении на главной странице сайта</b>` },
      { type: 'forum-sections', text: 'Список разделов форума' },
    ]
  },
  {
    title: 'Другое',
    items: [
      {type: "checkbox", text: "Отображать последние диалоги при наведении курсора в шапке", key: "hoverLastDialogs"},
      {type: "checkbox", text: "Отображать последние уведомления при наведении курсора в шапке", key: "hoverLastNotifications"},
      {type: "checkbox", text: "Отображать оценки в списке уведомлений", key: "showNotificationRatings"},
      {type: "checkbox", text: "Улучшеное меню выгрузки аватара", key: "betterAvatarExport", disabled: true},
    ]
  }
])

// Watchers
watch(showModal, async (isOpen) => {
  if (isOpen) {
    config.value = await loadConfig()
    if (!config.value.ignoredSectionIds) {
      config.value.ignoredSectionIds = []
    }
  }
})

watch(selectedSectionIndex, async (newIndex) => {
  if (newIndex === SECTIONS.SUPER_IGNORE) {
    await loadIgnoredUsersData()
  }
  if (newIndex === SECTIONS.TOPIC_SECTIONS && config.value.listTopicSections) {
    await loadForumSections()
  }
})

watch(() => config.value.listTopicSections, async (newValue) => {
  if (newValue && selectedSectionIndex.value === SECTIONS.TOPIC_SECTIONS) {
    await loadForumSections()
  }
})

// Автосохранение с debounce
let saveTimeout: NodeJS.Timeout | null = null
watch(config, () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveConfig(config.value as ExtensionConfig)
  }, 300)
}, { deep: true })

// Очистка при размонтировании
onMounted(() => {
  return () => {
    if (saveTimeout) clearTimeout(saveTimeout)
  }
})
</script>
