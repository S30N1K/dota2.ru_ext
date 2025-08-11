import {ExtensionConfig} from "../types";
import {getOrUpdateUserInfo} from "../storage";

export default async function members(config: ExtensionConfig) {
    const userId = Number(window.location.pathname.match(/\.([0-9]+)\/?$/)?.[1]) || 0;
    const userInfo = await getOrUpdateUserInfo(userId)
    const avatarImg = document.querySelector(".forum-profile__head-img");

    if (config.followersFrame && userInfo.relationType === "subscriber") {
        avatarImg?.classList.add("user-followed");
    }

    if (config.ignoredByFrame && userInfo.relationType === "ignored") {
        avatarImg?.classList.add("user-ignored");
    }
}