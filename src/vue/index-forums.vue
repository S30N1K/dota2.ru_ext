<template>
  <li class="forum__item component-block__link-wrapper" v-for="e of forumList">
    <a class="component-block__link" :href="e.first_post.link">
      <img class="component-block__img component-block__img--width-36 component-block__img--radius"
           src="/img/forum/forum-icons/20.png?813" alt="img">
      <div class="component-block__block forum__block">
        <p class="component-text-grey-13 text-clip">
          {{ e.title }}
        </p>
        <span class="component-text-grey-11"> {{ e.user.username }}
          <img src="/img/forum/icon-2.svg" alt="img"> {{ e.replies_count }}
        </span>
      </div>
    </a>
    <div class="short">
      <div class="topic-header">{{ e.title }}</div>
      <div class="short-author">
        <div class="author">Автор: {{ e.first_post.username }}</div>
        <div class="node">{{ e.forum.title }}</div>
      </div>
      <div class="message">
        {{ stripAllHtmlContent(e.first_post.content_html_stored)}}
      </div>
      <div class="bottom-block">
        <time class="node" :data-time="e.first_post.timestamp">0</time>
      </div>
    </div>
  </li>
</template>
<script lang="ts" setup>
import {onMounted, ref} from "vue";
import { parseFeed } from "../api";
import { stripAllHtmlContent } from "../utils";
const forumList = ref<any[]>([]);
onMounted(async () => {
  forumList.value = [...await parseFeed(), ...await parseFeed(10)]
})
</script>
<style lang="scss" scoped>
</style>