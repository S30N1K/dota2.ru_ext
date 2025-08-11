import {ExtensionConfig} from "../types";
import {initTinyMcePlugins} from "../utils";

export default async function page(config: ExtensionConfig) {
    initTinyMcePlugins(config)
}