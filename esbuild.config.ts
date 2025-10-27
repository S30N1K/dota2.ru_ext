// === Импорт модулей ===
import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync, readdirSync } from "fs";
import { resolve, relative } from "path";
import { compile } from "sass";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";
import vuePlugin from "esbuild-plugin-vue3";
import os from "os";

// === Константы проекта ===
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
const { name: EXT_NAME, version: EXT_VERSION } = pkg;

const WEBSOCKET_PORT = 5899;
const CHAT_URL = "neuravoid.online:5569";
const VERSION_TOKEN = "llutNoShhOFnwlZASEDztQs";

type BrowserTarget = "chrome" | "firefox";
type BuildMode = "dev" | "production";

const TARGET = (process.argv[2] as BrowserTarget) || "chrome";
const MODE = (process.argv[3] as BuildMode) || "production";
const IS_DEV = MODE === "dev";

if (!["chrome", "firefox"].includes(TARGET)) throw new Error("TARGET: chrome | firefox");
if (!["dev", "production"].includes(MODE)) throw new Error("MODE: dev | production");

export class Builder {
    private distDir = resolve(`dist/${TARGET}`);
    private jsContexts = new Map<string, esbuild.BuildContext>();
    private wss: WebSocketServer | null = null;
    private concurrency = Math.max(1, os.cpus().length - 1);

    constructor() {
        this.cleanDist();
    }

    /** 🧹 Очистка dist директории */
    private cleanDist() {
        rmSync(this.distDir, { recursive: true, force: true });
        mkdirSync(this.distDir, { recursive: true });
    }

    /** 🎨 Компиляция SCSS → CSS (исправлено с поддержкой импортов) */
    private buildScss(changedFile?: string) {
        const srcDir = resolve("src/style");
        if (!existsSync(srcDir)) return;

        const outDir = resolve(this.distDir, "style");
        mkdirSync(outDir, { recursive: true });

        const compileFile = (inFile: string) => {
            const rel = relative(srcDir, inFile);
            const outFile = resolve(outDir, rel.replace(/\.scss$/, ".css"));
            try {
                const result = compile(inFile, {
                    loadPaths: [srcDir],
                    style: IS_DEV ? "expanded" : "compressed"
                });
                mkdirSync(resolve(outFile, ".."), { recursive: true });
                writeFileSync(outFile, result.css);
                this.log(`🎨 SCSS → ${relative(process.cwd(), outFile)}`);
            } catch (e) {
                console.error(`❌ Ошибка SCSS: ${inFile}`, e);
            }
        };

        // Если изменился импорт (файл с _), пересобираем все SCSS
        if (!changedFile || changedFile.includes("_")) {
            const files = readdirSync(srcDir)
                .filter(f => f.endsWith(".scss") && !f.startsWith("_"))
                .map(f => resolve(srcDir, f));
            for (const f of files) compileFile(f);
            return;
        }

        // Если изменился конкретный файл
        if (changedFile.endsWith(".scss") && changedFile.startsWith(srcDir))
            compileFile(changedFile);
    }

    /** ⚙️ Сборка JS с помощью esbuild */
    private async buildJs() {
        const base: esbuild.BuildOptions = {
            bundle: true,
            minify: !IS_DEV,
            sourcemap: IS_DEV,
            target: ["chrome108", "firefox120"],
            resolveExtensions: [".vue", ".ts", ".js", ".json"],
            define: {
                "process.env.NODE_ENV": JSON.stringify(MODE),
                "process.env.LOG_LEVEL": JSON.stringify(IS_DEV ? "debug" : "warn"),
                "process.env.WEBSOCKET_PORT": JSON.stringify(WEBSOCKET_PORT),
                "process.env.EXT_NAME": JSON.stringify(EXT_NAME),
                "process.env.EXT_VERSION": JSON.stringify(EXT_VERSION),
                "process.env.CHAT_URL": JSON.stringify(CHAT_URL),
                "process.env.VERSION_TOKEN": JSON.stringify(VERSION_TOKEN)
            },
            plugins: [
                vuePlugin({
                    compilerOptions: { isCustomElement: (t: string) => t.startsWith("custom-") }
                }) as any
            ]
        };

        const entries = {
            injected: "src/extension/injected.ts",
            content: "src/extension/content.ts",
            background: "src/extension/background.ts"
        };

        // 🧩 Базовые сборки
        const builds: esbuild.BuildOptions[] = Object.entries(entries).map(([name, entry]) => ({
            ...base,
            entryPoints: [entry],
            outfile: resolve(this.distDir, `${name}.js`),
            format: name === "content" ? "esm" : "iife"
        }));

        // 📄 Страницы и loader
        const pagesDir = resolve("src/pages");
        const pages = existsSync(pagesDir)
            ? readdirSync(pagesDir).filter(f => f.endsWith(".ts")).map(f => resolve(pagesDir, f))
            : [];
        const loader = resolve("src/extension/loader.ts");
        if (existsSync(loader)) pages.push(loader);

        const pagesBuild: esbuild.BuildOptions = {
            ...base,
            entryPoints: pages,
            outdir: resolve(this.distDir, "pages"),
            splitting: true,
            chunkNames: "chunks/[name]-[hash]",
            entryNames: "[name]",
            format: "esm"
        };

        if (IS_DEV) {
            // 🧠 Инкрементальная пересборка
            for (const [i, opts] of builds.entries()) {
                const ctx = await (esbuild as any).context(opts);
                await ctx.watch();
                this.jsContexts.set(Object.keys(entries)[i], ctx);
            }
            if (pages.length) {
                const ctx = await (esbuild as any).context(pagesBuild);
                await ctx.watch();
                this.jsContexts.set("pages", ctx);
            }
            this.log("👀 JS watch активирован (incremental)");
        } else {
            // 🧵 Параллельная сборка
            const queue = [...builds, ...(pages.length ? [pagesBuild] : [])];
            const runChunk = async (chunk: esbuild.BuildOptions[]) =>
                await Promise.all(chunk.map(cfg => esbuild.build(cfg)));

            for (let i = 0; i < queue.length; i += this.concurrency) {
                const chunk = queue.slice(i, i + this.concurrency);
                await runChunk(chunk);
            }

            this.log(`✅ JS сборка завершена (параллельно ×${this.concurrency})`);
        }
    }

    /** 🧾 Manifest.json */
    private buildManifest() {
        const manifest = JSON.parse(readFileSync(resolve("src/extension/manifest.json"), "utf8"));
        manifest.version = EXT_VERSION;
        if (IS_DEV) manifest.name += " (Dev)";
        if (TARGET === "firefox") manifest.browser_specific_settings = { gecko: { id: "addon@dota2ru-helper" } };
        manifest.web_accessible_resources = [{
            resources: ["injected.js", "pages/*.js", "chunks/*", "style/*.css", "assets/*"],
            matches: ["<all_urls>"]
        }];

        const out = resolve(this.distDir, "manifest.json");
        writeFileSync(out, JSON.stringify(manifest, null, 2));
        this.log("📜 Manifest →", relative(process.cwd(), out));
    }

    /** 📦 Копирование ассетов */
    private copyAssets(file?: string) {
        const copyDir = (src: string, dest: string) => {
            if (existsSync(src)) cpSync(src, dest, { recursive: true });
        };

        const iconsSrc = resolve("src/extension/icons");
        const assetsSrc = resolve("src/assets");
        const iconsDest = resolve(this.distDir, "icons");
        const assetsDest = resolve(this.distDir, "assets");

        if (!file) {
            copyDir(iconsSrc, iconsDest);
            copyDir(assetsSrc, assetsDest);
            this.log("📦 Ассеты скопированы");
            return;
        }

        const abs = resolve(file);
        const updateFile = (srcDir: string, destDir: string, label: string) => {
            if (abs.startsWith(srcDir)) {
                const rel = relative(srcDir, abs);
                const dest = resolve(destDir, rel);
                mkdirSync(resolve(dest, ".."), { recursive: true });
                cpSync(abs, dest);
                this.log(`${label} обновлён → ${rel}`);
            }
        };

        updateFile(iconsSrc, iconsDest, "🖼️ Icon");
        updateFile(assetsSrc, assetsDest, "📦 Asset");
    }

    /** 🔌 WebSocket сервер для live reload */
    private startDevServer() {
        if (!IS_DEV) return;
        this.wss = new WebSocketServer({ port: WEBSOCKET_PORT });
        this.wss.on("connection", ws => ws.send(JSON.stringify({ type: "connected" })));
        this.log(`📡 WebSocket запущен: ws://localhost:${WEBSOCKET_PORT}`);
    }

    /** 🚀 Основная сборка */
    public async build() {
        const start = Date.now();
        this.buildScss();
        await this.buildJs();
        this.buildManifest();
        this.copyAssets();
        this.log(`🎯 Сборка завершена для ${TARGET} [${MODE}] за ${(Date.now() - start) / 1000}s`);

        if (IS_DEV) {
            this.startDevServer();
            this.watchFiles();
        }
    }

    /** 👀 Watcher */
    private watchFiles() {
        chokidar.watch("src", { ignoreInitial: true }).on("all", (_evt, path) => {
            if (!path) return;
            if (path.endsWith(".scss")) this.buildScss(path);
            else if (path.endsWith("manifest.json")) this.buildManifest();
            else if (path.includes("/assets/") || path.includes("/icons/")) this.copyAssets(path);

            if (IS_DEV && this.wss) {
                for (const c of this.wss.clients)
                    if (c.readyState === c.OPEN)
                        c.send(JSON.stringify({ type: "reload", file: path }));
                this.log(`↻ Reload → ${path}`);
            }
        });
    }

    private log(...args: any[]) {
        console.log("📄", ...args);
    }
}

// === Запуск ===
new Builder().build().catch(err => {
    console.error("❌ Ошибка сборки:", err);
    process.exit(1);
});
