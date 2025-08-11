import {ExtensionConfig} from "../types";
import {getOrUpdateUserInfo} from "../storage";
import {createDomTree, initTinyMcePlugins, loadVue} from "../utils";
import newRatePanel from "../vue/newRatePanel.vue";

function openNewRatePanel(messageId: number) {
    const modal = document.createElement("div");
    document.body.append(modal);
    loadVue(modal, newRatePanel, {messageId});
}

export default async function page(config: ExtensionConfig) {

    if (config.ignoreForumPost){
        document.querySelectorAll(".ignored").forEach((el) => {
            el.remove();
        })
    }

    initTinyMcePlugins(config)

    for (const tab of document.querySelectorAll(".message-tab")) {
        const userPanel = tab.querySelector(".theme-user-block");
        const userLink = userPanel?.querySelector(".forum-theme__item-name a")
        const userId = parseInt(userLink?.getAttribute("href")?.match(/\.(\d+)\//)?.[1] || "0")
        const userAvatarImg = userPanel?.querySelector(".forum-theme__item-avatar img")
        const userInfo = await getOrUpdateUserInfo(userId)
        const message = tab.querySelector("blockquote");
        const messageId = parseInt(tab.querySelector(".forum-theme__item")?.getAttribute("data-id") || "0")

        if (config.showSignatures && userInfo.signature && message?.parentElement) {
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

        if (config.followersFrame && userInfo.relationType === "subscriber") {
            (config.oldDesign ? userPanel : userAvatarImg)?.classList.add("user-followed");
        }

        if (config.ignoredByFrame && userInfo.relationType === "ignored") {
            (config.oldDesign ? userPanel : userAvatarImg)?.classList.add("user-ignored");
        }

        if (config.newRatePanel) {
            tab.querySelector(".rate-btn-plus")?.remove()

            const node = createDomTree({
                tag: "li",
                attrs: {class: "forum-theme__item-like-item"},
                children: [
                    {
                        tag: "a",
                        attrs: {id: "rate-btn", class: "forum-theme__item-like-link rate-btn-plus"},
                        children: [
                            {
                                tag: "i",
                                attrs: {class: "fas fa-plus"}
                            }
                        ]
                    }
                ]
            })
            tab.querySelector(".forum-theme__item-like-list")?.appendChild(node)

            node.querySelector(".rate-btn-plus")?.addEventListener("click", async () => {
                openNewRatePanel(messageId);
            })

        }

    }
}