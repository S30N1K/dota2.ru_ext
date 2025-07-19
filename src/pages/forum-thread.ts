import {getOrUpdateUserInfo} from "../storage";
import {loadSettings} from "../settings";

loadSettings(settings => {
    document.querySelectorAll(".message-tab").forEach(async (tab) => {
        const userPanel = tab.querySelector(".theme-user-block");
        const userLink = userPanel?.querySelector(".forum-theme__item-name a")
        const userId = parseInt(userLink?.getAttribute("href")?.match(/\.(\d+)\//)?.[1] || "0")
        const userAvatarImg = userPanel?.querySelector(".forum-theme__item-avatar img")
        const userInfo = await getOrUpdateUserInfo(userId)
        const message = tab.querySelector("blockquote");

        console.log(tab)
        console.log(userInfo)


        if (settings.showSignatures && userInfo.signature && message?.parentElement) {
            const blockquote = document.createElement("blockquote");
            blockquote.classList.add("signature")
            blockquote.innerHTML = userInfo.signature
            message.parentElement.appendChild(blockquote);

            const contentHeight = blockquote.scrollHeight;
            const maxVisibleHeight = 200;

            if (contentHeight < maxVisibleHeight) {
                blockquote.classList.add('open');
            }

            blockquote.addEventListener("click", async () => {
                if (!blockquote.classList.contains("open")) {
                    blockquote.classList.add("open");
                }
            })
        }

        if (settings.followersFrame && userInfo.relationType === "subscriber") {
            (settings.oldDesign ? userPanel : userAvatarImg)?.classList.add("followed");
        }

        if (settings.ignoredByFrame && userInfo.relationType === "ignored") {
            (settings.oldDesign ? userPanel : userAvatarImg)?.classList.add("ignored");
        }
    })
})