// === Импорт модулей ===
import * as esbuild from "esbuild";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  rmSync,
  existsSync,
  readdirSync
} from "fs";
import { resolve, relative } from "path";
import { compile } from "sass";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";
import vuePlugin from "esbuild-plugin-vue3";

// === Константы проекта ===
const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
const EXT_NAME = packageJson.name;
const EXT_VERSION = packageJson.version;
const WEBSOCKET_PORT = 5899;
const CHAT_URL = "neuravoid.online:5569";

type BrowserTarget = "chrome" | "firefox";
type BuildMode = "dev" | "production";

export class Builder {
  private target: BrowserTarget;
  private mode: BuildMode;
  private IS_DEV: boolean;
  private distDir: string;
  private jsContexts = new Map<string, esbuild.BuildContext>();
  private wss: WebSocketServer | null = null;

  constructor(target: BrowserTarget, mode: BuildMode = "production") {
    if (!["chrome", "firefox"].includes(target))
      throw new Error("Укажи целевой браузер: chrome или firefox");
    if (!["dev", "production"].includes(mode))
      throw new Error("Режим должен быть dev или production");

    this.target = target;
    this.mode = mode;
    this.IS_DEV = mode === "dev";
    this.distDir = resolve(process.cwd(), `dist/${target}`);

    this.cleanDist();
  }

  /** 🧹 Очистка dist директории */
  private cleanDist() {
    if (existsSync(this.distDir)) rmSync(this.distDir, { recursive: true, force: true });
    mkdirSync(this.distDir, { recursive: true });
  }

  /** 🎨 Компиляция SCSS в CSS */
  private buildScss(file?: string) {
    const styleDir = resolve(process.cwd(), "src/style");
    const files = file
      ? [file]
      : existsSync(styleDir)
        ? readdirSync(styleDir).filter(f => f.endsWith(".scss"))
        : [];
    if (files.length === 0) return;

    const cssOutputDir = resolve(this.distDir, "style");
    mkdirSync(cssOutputDir, { recursive: true });

    for (const scssFile of files) {
      const scssPath = resolve(styleDir, scssFile);
      const cssFileName = scssFile.replace(/^.*[\\/]/, "").replace(".scss", ".css");
      const outPath = resolve(cssOutputDir, cssFileName);

      try {
        const scss = compile(scssPath);
        writeFileSync(outPath, scss.css);
        this.log(`🎨 SCSS скомпилирован: ${scssPath} → ${outPath}`);
      } catch (err) {
        console.error(`❌ Ошибка компиляции ${scssPath}:`, err);
      }
    }
  }

  /** ⚙️ Сборка JS с помощью esbuild */
  private async buildJs() {
    const baseOptions: esbuild.BuildOptions = {
      bundle: true,
      minify: !this.IS_DEV,
      sourcemap: this.IS_DEV,
      target: ["chrome108", "firefox120"],
      resolveExtensions: [".vue", ".ts", ".js", ".json"],
      define: {
        "process.env.NODE_ENV": JSON.stringify(this.mode),
        "process.env.LOG_LEVEL": JSON.stringify(this.IS_DEV ? "debug" : "warn"),
        "process.env.WEBSOCKET_PORT": JSON.stringify(WEBSOCKET_PORT),
        "process.env.EXT_NAME": JSON.stringify(EXT_NAME),
        "process.env.EXT_VERSION": JSON.stringify(EXT_VERSION),
        "process.env.CHAT_URL": JSON.stringify(CHAT_URL)
      },
      plugins: [
        vuePlugin({
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith("custom-")
          }
        }) as unknown as esbuild.Plugin
      ]
    };

    // Точки входа для разных частей расширения
    const builds: Record<string, esbuild.BuildOptions> = {
      injected: {
        ...baseOptions,
        entryPoints: ["src/extension/injected.ts"],
        outfile: resolve(this.distDir, "injected.js"),
        format: "iife"
      },
      content: {
        ...baseOptions,
        entryPoints: ["src/extension/content.ts"],
        outfile: resolve(this.distDir, "content.js"),
        format: "esm"
      },
      background: {
        ...baseOptions,
        entryPoints: ["src/extension/background.ts"],
        outfile: resolve(this.distDir, "background.js"),
        format: "iife"
      }
    };

    // === Сборка страниц + loader (общие чанки) ===
    const pagesDir = resolve(process.cwd(), "src/pages");
    const pageFiles = existsSync(pagesDir)
      ? readdirSync(pagesDir)
          .filter(f => f.endsWith(".ts"))
          .map(f => resolve(pagesDir, f))
      : [];

    // Добавляем loader.ts, если он есть
    const loaderPath = resolve(process.cwd(), "src/extension/loader.ts");
    const entryPoints = [...pageFiles];
    if (existsSync(loaderPath)) {
      entryPoints.push(loaderPath);
    }

    const pagesOptions: esbuild.BuildOptions = {
      ...baseOptions,
      entryPoints,
      outdir: resolve(this.distDir, "pages"),
      format: "esm",
      splitting: true,
      chunkNames: "chunks/[name]-[hash]",
      entryNames: "[name]"
    };

    // === Dev режим (watch через esbuild context API) ===
    if (this.IS_DEV) {
      for (const [key, options] of Object.entries(builds)) {
        const ctx = await (esbuild as any).context(options) as esbuild.BuildContext;
        await ctx.watch();
        this.jsContexts.set(key, ctx);
      }

      if (entryPoints.length) {
        const ctx = await (esbuild as any).context(pagesOptions) as esbuild.BuildContext;
        await ctx.watch();
        this.jsContexts.set("pages", ctx);
      }

      this.log("👀 JS watch активирован (ESBuild context API)");
    }
    // === Production сборка (обычная) ===
    else {
      for (const options of Object.values(builds)) {
        await esbuild.build(options);
      }
      if (entryPoints.length) await esbuild.build(pagesOptions);
      this.log("✅ JS сборка завершена");
    }
  }

  /** 🧾 Генерация manifest.json */
  private buildManifest() {
    const manifestPath = resolve(process.cwd(), "src/extension/manifest.json");
    const baseManifest = JSON.parse(readFileSync(manifestPath, "utf8"));

    baseManifest.version = EXT_VERSION;

    if (this.IS_DEV) baseManifest.name += " (Dev)";
    if (this.target === "firefox") {
      baseManifest.browser_specific_settings = {
        gecko: { id: "addon@dota2ru-helper" }
      };
    }

    baseManifest.web_accessible_resources = [
      {
        resources: ["injected.js", "pages/*.js", "chunks/*", "style/*.css", "assets/*"],
        matches: ["<all_urls>"]
      }
    ];

    const outPath = resolve(this.distDir, "manifest.json");
    writeFileSync(outPath, JSON.stringify(baseManifest, null, 2));
    this.log(`📜 Manifest сгенерирован → ${outPath}`);
  }

  /** 📦 Копирование ассетов (иконок и ресурсов) */
  private copyAssets(file?: string) {
    const iconsSrc = resolve(process.cwd(), "src/extension/icons");
    const iconsDest = resolve(this.distDir, "icons");
    const assetsSrc = resolve(process.cwd(), "src/assets");
    const assetsDest = resolve(this.distDir, "assets");

    if (file) {
      const abs = resolve(file);
      if (abs.startsWith(iconsSrc)) {
        const rel = relative(iconsSrc, abs);
        const dest = resolve(iconsDest, rel);
        mkdirSync(resolve(dest, ".."), { recursive: true });
        cpSync(abs, dest);
        this.log(`🖼️ Иконка обновлена → ${dest}`);
      } else if (abs.startsWith(assetsSrc)) {
        const rel = relative(assetsSrc, abs);
        const dest = resolve(assetsDest, rel);
        mkdirSync(resolve(dest, ".."), { recursive: true });
        cpSync(abs, dest);
        this.log(`📦 Asset обновлён → ${dest}`);
      }
    } else {
      if (existsSync(iconsSrc)) cpSync(iconsSrc, iconsDest, { recursive: true });
      if (existsSync(assetsSrc)) cpSync(assetsSrc, assetsDest, { recursive: true });
      this.log("📦 Ассеты скопированы");
    }
  }

  /** 🔌 Запуск WebSocket сервера для live reload */
  private startDevServer() {
    if (!this.IS_DEV) return;

    this.wss = new WebSocketServer({ port: WEBSOCKET_PORT });
    this.wss.on("connection", ws => {
      this.log("📡 Клиент подключён к WebSocket серверу");
      ws.send(JSON.stringify({ type: "connected" }));
    });

    this.log(`📡 WebSocket сервер запущен на ws://localhost:${WEBSOCKET_PORT}`);
  }

  /** 🚀 Основная сборка проекта */
  public async build() {
    this.buildScss();
    await this.buildJs();
    this.buildManifest();
    this.copyAssets();
    this.log(`🎯 Сборка завершена для ${this.target} [${this.mode}]`);

    if (this.IS_DEV) {
      this.startDevServer();
      this.watchFiles();
    }
  }

  /** 👀 Отслеживание изменений файлов */
  private watchFiles() {
    const srcDir = resolve(process.cwd(), "src");

    chokidar.watch(srcDir, { ignoreInitial: true }).on("all", async (_event, path) => {
      if (!path) return;

      if (path.endsWith(".scss")) {
        this.buildScss(path);
      } else if (path.endsWith(".json") && path.includes("manifest.json")) {
        this.buildManifest();
      } else if (path.includes("/assets/") || path.includes("/icons/")) {
        this.copyAssets(path);
      }

      // Отправляем reload всем клиентам через WebSocket
      if (this.IS_DEV && this.wss) {
        for (const client of this.wss.clients) {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: "reload", file: path }));
          }
        }
        this.log(`↻ Reload отправлен → ${path}`);
      }
    });
  }

  /** 🪵 Простой логгер */
  public log(...args: any[]) {
    console.log("📄", ...args);
  }
}

// === Запуск билда ===
const target = (process.argv[2] as BrowserTarget) || "chrome";
const mode = (process.argv[3] as BuildMode) || "production";

const builder = new Builder(target, mode);
builder.build().catch(err => {
  console.error("❌ Ошибка при сборке:", err);
  process.exit(1);
});
