import {loadVue} from '../utils';
import indexForums from "../vue/index-forums.vue";
setTimeout(async function () {
    loadVue('.forum__list', indexForums);
}, 0)
