import {ExtensionConfig} from "../types";
import {loadVue} from "../utils";
import indexForums from "../vue/indexForums.vue";
import {getIgnoreList, parseFeed} from "../api";

export default async function page(config: ExtensionConfig) {
    if (config.listTopicSections){
        const list = [...await parseFeed(), ...await parseFeed(10)]
        console.log(list)
        loadVue(".forum__list", indexForums, { forumList: list })
    }
}