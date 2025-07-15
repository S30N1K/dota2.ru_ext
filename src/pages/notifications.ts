import {getNotifications} from "../utils";

const currentPageElement = document.querySelector('#pagination-vue .pagination-vue-item.checked');
const currentPage = currentPageElement ? parseInt(currentPageElement.textContent || '1') : 1;

console.log(currentPage);

(async () => {
    const a = await getNotifications(1)
    console.log(a)


    const items = document.querySelectorAll('.notices-body__items-item');

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const b = a[i]

        if (b.type === "forum_post_liked"){

        }
    }
})()