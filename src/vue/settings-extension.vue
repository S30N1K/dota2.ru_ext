<template>
  <div class="settings-page__columns">
    <div class="settings-page__column">
      <div class="bg-main-block settings-page__block">
        <p class="settings-page__block-title">Настройки расширения</p>
        <div class="settings-page__block-splitter">
          <div class="settings-page__block-splitter--item">Использовать старое оформление</div>
          <div class="settings-page__block-splitter--item">
            <input type="checkbox" v-model="oldDesign" @change="saveSettings" id="oldDesign">
          </div>
        </div>
        <hr>
        <div class="settings-page__block-splitter">
          <div class="settings-page__block-splitter--item">Новая панель со смайлами</div>
          <div class="settings-page__block-splitter--item">
            <input type="checkbox" v-model="newSmilePanel" @change="saveSettings" id="newSmilePanel">
          </div>
        </div>
        <hr>
        <div class="settings-page__block-splitter">
          <div class="settings-page__block-splitter--item">Вставка изображений по Ctrl+V</div>
          <div class="settings-page__block-splitter--item">
            <input type="checkbox" v-model="pasteImage" @change="saveSettings" id="pasteImage">
          </div>
        </div>
        <div style="margin-bottom: 10px; margin-left: 20px; font-size: 13px;" v-if="pasteImage">
          Для работы требуется imgbb token.<br>
          <b>Инструкция</b><br>
          Идем сюда <a href="https://imgbb.com/" target="_blank">https://imgbb.com/</a><br>
          1) Регистрируемся, или заходим под своей учеткой, если уже зарегистрированы.<br>
          2) как авторизовались, идем сюда <a href="https://api.imgbb.com/" target="_blank">https://api.imgbb.com/</a><br>
          3) жмем кнопку вверху "GET API KEY"<br>
          4) получаем длинный ключ, копируем его.<br>
          5) вставляем его в поле ниже
          <div style="margin-top: 8px;">
            <label>imgbb token:
              <input type="text" v-model="imgbbToken" @input="saveSettings" placeholder="Введите ваш imgbb token"/>
            </label>
          </div>
        </div>
        <hr>
        <div class="settings-page__block-splitter">
          <div class="settings-page__block-splitter--item">Звуковые оповещения при поступлении уведомлений</div>
          <div class="settings-page__block-splitter--item">
            <input type="checkbox" v-model="soundNotifications" @change="saveSettings" id="soundNotifications">
          </div>
        </div>
        <div v-if="soundNotifications" style="margin-bottom: 10px; margin-left: 20px; font-size: 13px;">
          <div>Выберите звук оповещения:</div>
          <label>
            <input type="radio" value="default" v-model="soundType" @change="saveSettings"/>
            Стандартный звук
          </label>
          <label style="margin-left: 16px;">
            <input type="radio" value="custom" v-model="soundType" @change="saveSettings"/>
            Свой звук
          </label>
          <div v-if="soundType === 'custom'" style="margin-top: 8px;">
            <input type="file" accept="audio/*" @change="onSoundFileChange"/>
            <div v-if="customSoundName">Загружен файл: {{ customSoundName }}</div>
          </div>
        </div>
        <hr>
        <div class="settings-page__block-splitter">
          <div class="settings-page__block-splitter--item">Вывод последней страницы уведомлений при наведении на значок уведомлений</div>
          <div class="settings-page__block-splitter--item">
            <input type="checkbox" v-model="hoverLastNotifications" @change="saveSettings" id="hoverLastNotifications">
          </div>
        </div>
        <hr>
        <div class="settings-page__block-splitter">
          <div class="settings-page__block-splitter--item">Отображение оценок на странице уведомлений</div>
          <div class="settings-page__block-splitter--item">
            <input type="checkbox" v-model="showNotificationRatings" @change="saveSettings" id="showNotificationRatings">
          </div>
        </div>
        <hr>
        <div class="settings-page__block-splitter">
          <div class="settings-page__block-splitter--item">Улучшенная выгрузка аватаров</div>
          <div class="settings-page__block-splitter--item">
            <input type="checkbox" v-model="betterAvatarExport" @change="saveSettings" id="betterAvatarExport">
          </div>
        </div>
        <div style="margin-bottom: 10px; margin-left: 20px; font-size: 13px;">
          Улучшает выгрузку аватаров. Частично снимает ограничение на выгрузку. Улучшенный выбор кадра. Можно выбирать кадр из гиф, если нет премиума. Гифки теперь тоже можно обрезать.
        </div>
      </div>
    </div>
    <hr>
    <div class="settings-page__column">
      <div class="bg-main-block settings-page__block">
        <div id="forum_nodes" class="bg-main-block settings-page__block">
          <p class="settings-page__block-title">Настройка выводимых тем</p>
          <p style="font-size: 13px;">Снимите галочку с тех разделов, темы из которых вы не хотите видеть в отображении на главной странице сайта</p>
          <hr>
          <label class="settings-page__block-splitter" v-for="e of ignoredSections" :key="e.id">
            <span class="settings-page__block-splitter--item">{{ e.name }}</span>
             <span class="settings-page__block-splitter--item">
               <input type="checkbox"
                      :checked="ignoredSectionIds.includes(Number(e.id))"
                      @change="toggleIgnoredSection(Number(e.id))">
             </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref, watch, onMounted, computed} from 'vue';
import {IForumSections, pareForumSections} from "../utils";
const oldDesign = ref(false);
const newSmilePanel = ref(false);
const pasteImage = ref(false);
const imgbbToken = ref('');
const soundNotifications = ref(false);
const soundType = ref('default');
const customSound = ref<File | null>(null);
const customSoundName = ref('');
const hoverLastNotifications = ref(false);
const showNotificationRatings = ref(false);
const betterAvatarExport = ref(false);
const ignoredSections = ref<IForumSections[]>([]);
const ignoredSectionIds = ref<number[]>([]);
declare const Utils: { notify(msg: string): void; };
onMounted(async() => {
  ignoredSections.value = await pareForumSections()
})
function saveSettings() {
  const normalizedIgnoredSectionIds = ignoredSectionIds.value.map(Number);
  const settings = {
    oldDesign: oldDesign.value,
    newSmilePanel: newSmilePanel.value,
    pasteImage: pasteImage.value,
    imgbbToken: imgbbToken.value,
    soundNotifications: soundNotifications.value,
    soundType: soundType.value,
    customSoundName: customSoundName.value,
    hoverLastNotifications: hoverLastNotifications.value,
    showNotificationRatings: showNotificationRatings.value,
    betterAvatarExport: betterAvatarExport.value,
    ignoredSectionIds: normalizedIgnoredSectionIds,
  };
  chrome.storage.sync.set(settings, () => {});
}
function loadSettings() {
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
    'ignoredSectionIds',
  ], (result: any) => {
    oldDesign.value = result.oldDesign ?? false;
    newSmilePanel.value = result.newSmilePanel ?? false;
    pasteImage.value = result.pasteImage ?? false;
    imgbbToken.value = result.imgbbToken ?? '';
    soundNotifications.value = result.soundNotifications ?? false;
    soundType.value = result.soundType ?? 'default';
    customSoundName.value = result.customSoundName ?? '';
    hoverLastNotifications.value = result.hoverLastNotifications ?? false;
    showNotificationRatings.value = result.showNotificationRatings ?? false;
    betterAvatarExport.value = result.betterAvatarExport ?? false;
    const loadedIds = Array.isArray(result.ignoredSectionIds) ? result.ignoredSectionIds.map(Number) : [];
    ignoredSectionIds.value = loadedIds;
  });
}
function onSoundFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    customSound.value = file;
    customSoundName.value = file.name;
    saveSettings();
  }
}
async function toggleIgnoredSection(id: number) {
  if (ignoredSectionIds.value.includes(id)) {
    ignoredSectionIds.value = ignoredSectionIds.value.filter(x => x !== id);
  } else {
    ignoredSectionIds.value = [...ignoredSectionIds.value, id];
  }
  saveSettings();
  await fetch("/forum/api/feed/saveSettings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    },
    body: JSON.stringify({
      ids: [...ignoredSectionIds.value]
    })
  });
}
onMounted(() => {
  loadSettings();
});
watch(imgbbToken, saveSettings);
</script>
<style lang="scss" scoped>
</style>