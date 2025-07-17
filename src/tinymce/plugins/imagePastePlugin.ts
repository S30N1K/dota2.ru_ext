import {uploadToImgbb} from "../../api";

export function registerImagePastePlugin(editor: any, imgbbToken: string) {
    editor.on("paste", (event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return; 

        for (const item of items) {
            if (item.type.includes("image")) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const base64 = e.target?.result as string;
                        const url = await uploadToImgbb(base64, imgbbToken);
                        if (url) {
                            editor.insertContent(`<img src="${url}" alt="Image"/>`);
                        } else {
                            console.warn("Не удалось загрузить изображение на imgbb");
                        }
                    };
                    reader.readAsDataURL(file);
                    event.preventDefault();
                    break;
                }
            }
        }
    });
}
