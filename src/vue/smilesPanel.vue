<template>
  <div class="smilesPanel">
    <div class="categories hiddenScroll">
      <div class="category" @click="openCategory(category.id)" v-for="category of categories"
           :class="{active: activeCategory === category.id}">
        <img :src="getSmileUrl(findSmileById(category.img_tab_smile))" :title="category.name"/>
      </div>
    </div>
    <div class="smiles">
      <div class="search">
        <input type="text" v-model="search" placeholder="Поиск" class="content-inline search_smile_input"/>
      </div>
      <div class="list hiddenScroll">
        <template v-if="activeCategory === '-1' && current_smiles.length === 0">
          <div class="empty-favorites">Тут пока ничего нет</div>
        </template>
        <template v-else>
          <div class="smile" v-for="smile of current_smiles" @click="sendSmile(smile)"
               @mouseenter="hoveredSmile = smile.id" @mouseleave="hoveredSmile = null"
               style="position: relative;">
            <img :src="getSmileUrl(smile)" :alt="smile.title"/>
            <span v-if="hoveredSmile === smile.id"
                  class="favorite-star"
                  :class="{active: isFavorite(smile.id)}"
                  @click.stop="toggleFavorite(smile.id)"
                  style="position: absolute; top: 2px; right: 2px; cursor: pointer; font-size: 18px;">
              {{ isFavorite(smile.id) ? '★' : '☆' }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, computed} from 'vue'
import { getSmiles } from "../api";
import { parasite } from "../utils";
import {ISmile, ISmileCategory} from "../types";

const search = ref('')
const categories = ref<ISmileCategory[]>([])
const smiles = ref<ISmile[]>([])
const activeCategory = ref<string>("")
const hoveredSmile = ref<string|null>(null)
const favorites = ref<string[]>([])

const FAVORITES_KEY = 'smilesPanel_favorites';


const current_smiles = computed(() => {
  if (search.value.trim() !== '') {
    const query = search.value.trim().toLowerCase();
    return smiles.value.filter(smile =>
        smile.title.toLowerCase().includes(query)
    );
  } else if (activeCategory.value === '-1') {
    return smiles.value.filter(smile => favorites.value.includes(smile.id));
  } else if (activeCategory.value) {
    return smiles.value.filter((e) => e.category_id === activeCategory.value);
  } else {
    return [];
  }
});

function sendSmile(smile: ISmile) {
  parasite("SMILE", {title: smile.title, url: getSmileUrl(smile)});
}

function openCategory(category: string) {
  activeCategory.value = category;
  localStorage.setItem('smilesPanel_lastCategory', category);
}

function getSmileUrl(smile: ISmile) {
  return '/img/forum/emoticons/' + smile.filename
}

function findSmileById(id: string): ISmile {
  return smiles.value.find(smile => smile.id === id)!;
}

function isFavorite(smileId: string): boolean {
  return favorites.value.includes(smileId);
}

function toggleFavorite(smileId: string) {
  const idx = favorites.value.indexOf(smileId);
  if (idx === -1) {
    favorites.value.push(smileId);
  } else {
    favorites.value.splice(idx, 1);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value));
}

onMounted(async () => {
  const parse = await getSmiles()
  categories.value = parse!.categories;
  smiles.value = parse!.smiles;

  categories.value.unshift({id: '-1', name: 'Избранное', img_tab_smile: '729'});

  const fav = localStorage.getItem(FAVORITES_KEY);
  if (fav) {
    try { favorites.value = JSON.parse(fav); } catch {}
  }
  const lastCategory = localStorage.getItem('smilesPanel_lastCategory') || "14";
  openCategory(lastCategory);
})
</script>