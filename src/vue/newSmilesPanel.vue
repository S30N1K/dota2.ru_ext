<template>
  <!-- Основной контейнер панели смайлов -->
  <div class="smilesPanel">
    <!-- Панель категорий смайлов -->
    <div class="categories hiddenScroll">
      <div 
        class="category" 
        @click="openCategory(category.id)" 
        v-for="category of categories"
        :key="category.id"
        :class="{ active: activeCategory === category.id }"
      >
        <img 
          :src="getSmileUrl(findSmileById(category.img_tab_smile) || { id: category.img_tab_smile, category_id: '', symbol: '', title: category.name, filename: category.img_tab_smile })" 
          :title="category.name"
          :alt="category.name"
        />
      </div>
    </div>

    <!-- Основная область смайлов -->
    <div class="smiles">
      <!-- Поисковая строка -->
      <div class="search">
        <input 
          type="text" 
          v-model="search" 
          placeholder="Поиск" 
          class="content-inline search_smile_input"
          @input="handleSearch"
        />
      </div>

      <!-- Список смайлов -->
      <div class="list hiddenScroll">
        <!-- Сообщение для пустых избранных -->
        <template v-if="activeCategory === '-1' && currentSmiles.length === 0">
          <div class="empty-favorites">Тут пока ничего нет</div>
        </template>
        
        <!-- Список смайлов -->
        <template v-else>
          <div 
            class="smile" 
            v-for="smile of currentSmiles" 
            :key="smile.id"
            @click="onSmile(smile)"
            @mouseenter="hoveredSmile = smile.id" 
            @mouseleave="hoveredSmile = null"
            style="position: relative;"
          >
            <img 
              :src="getSmileUrl(smile)" 
              :alt="smile.title"
              :title="smile.title"
            />
            
            <!-- Кнопка избранного (звездочка) -->
            <span 
              v-if="hoveredSmile === smile.id"
              class="favorite-star"
              :class="{ active: isFavorite(smile.id) }"
              @click.stop="toggleFavorite(smile.id)"
              style="position: absolute; top: 2px; right: 2px; cursor: pointer; font-size: 18px;"
              :title="isFavorite(smile.id) ? 'Убрать из избранного' : 'Добавить в избранное'"
            >
              {{ isFavorite(smile.id) ? '★' : '☆' }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue'
import { getSmiles } from "../api"
import { getSmileUrl } from "../utils"
import { ISmile, ISmileCategory } from "../types"

// ===== ПРОПСЫ =====
interface Props {
  onSmile: (smile: ISmile) => void
}
const props = defineProps<Props>()

// ===== РЕАКТИВНЫЕ ДАННЫЕ =====
const search = ref('')
const categories = ref<ISmileCategory[]>([])
const smiles = ref<ISmile[]>([])
const activeCategory = ref<string>("")
const hoveredSmile = ref<string | null>(null)
const favorites = ref<string[]>([])

// ===== КОНСТАНТЫ =====
const FAVORITES_KEY = 'smilesPanel_favorites'
const LAST_CATEGORY_KEY = 'smilesPanel_lastCategory'
const FAVORITES_CATEGORY_ID = '-1'
const DEFAULT_CATEGORY_ID = '14'

// ===== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА =====
/**
 * Фильтрует смайлы на основе поискового запроса и активной категории
 */
const currentSmiles = computed(() => {
  const searchQuery = search.value.trim().toLowerCase()
  
  // Если есть поисковый запрос - фильтруем по нему
  if (searchQuery) {
    return smiles.value.filter(smile =>
      smile.title.toLowerCase().includes(searchQuery)
    )
  }
  
  // Если выбрана категория избранного - показываем только избранные
  if (activeCategory.value === FAVORITES_CATEGORY_ID) {
    return smiles.value.filter(smile => favorites.value.includes(smile.id))
  }
  
  // Если выбрана конкретная категория - фильтруем по ней
  if (activeCategory.value) {
    return smiles.value.filter(smile => smile.category_id === activeCategory.value)
  }
  
  return []
})

// ===== МЕТОДЫ =====
/**
 * Открывает категорию смайлов
 * @param categoryId - ID категории для открытия
 */
function openCategory(categoryId: string): void {
  activeCategory.value = categoryId
  localStorage.setItem(LAST_CATEGORY_KEY, categoryId)
}

/**
 * Находит смайл по ID
 * @param id - ID смайла
 * @returns Найденный смайл или undefined
 */
function findSmileById(id: string): ISmile | undefined {
  return smiles.value.find(smile => smile.id === id)
}

/**
 * Проверяет, находится ли смайл в избранном
 * @param smileId - ID смайла
 * @returns true если смайл в избранном
 */
function isFavorite(smileId: string): boolean {
  return favorites.value.includes(smileId)
}

/**
 * Переключает состояние избранного для смайла
 * @param smileId - ID смайла
 */
function toggleFavorite(smileId: string): void {
  const index = favorites.value.indexOf(smileId)
  
  if (index === -1) {
    // Добавляем в избранное
    favorites.value.push(smileId)
  } else {
    // Убираем из избранного
    favorites.value.splice(index, 1)
  }
  
  // Сохраняем в localStorage
  saveFavorites()
}

/**
 * Обработчик поиска с дебаунсом
 */
function handleSearch(): void {
  // Здесь можно добавить дебаунс если нужно
  // Пока оставляем простую обработку
}

/**
 * Сохраняет избранные смайлы в localStorage
 */
function saveFavorites(): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
  } catch (error) {
    console.error('Ошибка сохранения избранных смайлов:', error)
  }
}

/**
 * Загружает избранные смайлы из localStorage
 */
function loadFavorites(): void {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    }
  } catch (error) {
    console.error('Ошибка загрузки избранных смайлов:', error)
    favorites.value = []
  }
}

/**
 * Загружает последнюю активную категорию
 */
function loadLastCategory(): void {
  const lastCategory = localStorage.getItem(LAST_CATEGORY_KEY) || DEFAULT_CATEGORY_ID
  openCategory(lastCategory)
}

/**
 * Инициализирует данные смайлов
 */
async function initializeSmiles(): Promise<void> {
  try {
    const smilesData = await getSmiles()
    
    if (smilesData) {
      categories.value = smilesData.categories
      smiles.value = smilesData.smiles
      
      // Добавляем категорию "Избранное" только если её ещё нет
      const favoritesCategoryExists = categories.value.some(cat => cat.id === FAVORITES_CATEGORY_ID)
      
      if (!favoritesCategoryExists) {
        categories.value.unshift({
          id: FAVORITES_CATEGORY_ID, 
          name: 'Избранное', 
          img_tab_smile: '729'
        })
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки смайлов:', error)
  }
}

// ===== ЖИЗНЕННЫЙ ЦИКЛ =====
onMounted(async () => {
  // Загружаем данные смайлов
  await initializeSmiles()
  
  // Загружаем избранное
  loadFavorites()
  
  // Загружаем последнюю активную категорию
  loadLastCategory()
})

// ===== ВАТЧЕРЫ =====
// Автоматически сохраняем избранное при изменении
watch(favorites, () => {
  saveFavorites()
}, { deep: true })
</script>