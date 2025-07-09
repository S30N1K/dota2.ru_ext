import {createApp, DefineComponent} from "vue";
export function getPageNumberFromUrl(url: string): number | null {
  const match = url.match(/page-(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
export function getThreadIdFromUrl(url: string): string | null {
  const match = url.match(/threads\/[^.]+\.(\d+)/);
  return match ? match[1] : null;
}
export function safeAlert(msg: string) {
  console.log(msg);
}
export function loadVue(selector: string, component: DefineComponent<{}, {}, any>) {
  const container = document.querySelector(selector);
  if (container) {
    container.innerHTML = '';
    createApp(component).mount(container);
  }
}
export interface IForumSections {
  name: string;
  id: number;
}
export async function pareForumSections(): Promise<IForumSections[]> {
  const response = await fetch('https://dota2.ru/forum/');
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll(".forum-page__list .forum-page__item-title-block a")].map(e => {
    const href = e.getAttribute("href") || "";
    const match = href.match(/forums\/(.*)\.(\d+)\//);
    const id = match ? parseInt(match[2]) : null;
    const name = e.textContent?.trim() || null;
    return id && name ? { id, name } : null;
  }).filter(item => item !== null);
}
interface Thread {
  id: string;
  title: string;
  replies_count: string;
  views_count: string;
  last_post_timestamp: string;
  pages: number;
  first_post: FirstPost;
  forum: Forum;
  user: User;
}
interface FirstPost {
  id: number;
  forum_id: number;
  topic_id: number;
  user_id: number;
  date_created: any[];
  message_state: string;
  content_html_stored: string;
  username: string;
  avatar_timestamp: string;
  user_nick_color: string;
  rated: any[];
  like_smiles_count: number;
  dislike_smiles_count: number;
  user_rated: any[];
  user_rewards: any[];
  is_ignored_user: boolean;
  link: string;
  timestamp: number;
  string: string;
}
interface Forum {
  id: number;
  title: string;
  description: string;
  node_id: number;
  last_post_id: number;
  last_topic_id: number;
  last_post_username: string;
  restrict_groups: any;
  node_type_id: string;
  prefix: string;
  link: string;
  icon: string;
}
interface User {
  username: string;
  id: string;
  user_group_id: number;
  nick_color: string;
  group_nick_color: string;
  avatar_timestamp: number;
  link: string;
  avatar: string;
}
export async function parseFeed(offset: number = 0): Promise<Thread[]> {
  const res = await fetch("https://dota2.ru/forum/api/feed/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    referrer: "https://dota2.ru/forum/feed/",
    body: JSON.stringify({
      offset,
      order: "new"
    })
  })
  return (await res.json()).items;
}
export function stripAllHtmlContent(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  const tagsToRemove = ['script', 'style', 'template', 'noscript'];
  tagsToRemove.forEach(tag => {
    div.querySelectorAll(tag).forEach(el => el.remove());
  });
  const text = div.textContent || '';
  return text.trim().slice(-300);
}
