import {loadSettings} from "../settings";
import {getOrUpdateUserInfo} from "../storage";

loadSettings(async (settings) => {

    const userId = Number(window.location.pathname.match(/\.([0-9]+)\/?$/)?.[1]) || 0;
    const userInfo = await getOrUpdateUserInfo(userId)
    const avatarImg = document.querySelector(".forum-profile__head-img");

    if (settings.followersFrame && userInfo.relationType === "subscriber") {
        avatarImg?.classList.add("followed");
    }

    if (settings.ignoredByFrame && userInfo.relationType === "ignored") {
        avatarImg?.classList.add("ignored");
    }
})