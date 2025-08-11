import path from 'path';
import fs from 'fs';
import webpack, { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { VueLoaderPlugin } from 'vue-loader';

type Browser = 'chrome' | 'firefox';

const DIR = {
  style: path.resolve(__dirname, 'src/style'),
  assets: path.resolve(__dirname, 'src/assets'),
  manifest: path.resolve(__dirname, 'src/extension/manifest.json'),
};

interface Resources {
  entries: Record<string, string>;
  cssFiles: string[];
  assetFiles: string[];
}

function scanResources(): Resources {
  const entries: Record<string, string> = {};
  const cssFiles: string[] = [];
  const assetFiles: string[] = [];

  if (fs.existsSync(DIR.style)) {
    for (const file of fs.readdirSync(DIR.style)) {
      if (file.endsWith('.scss')) {
        const name = path.parse(file).name;
        const entryName = `style/${name}`;
        entries[entryName] = `./src/style/${file}`;
        cssFiles.push(`${entryName}.css`);
      }
    }
  }

  if (fs.existsSync(DIR.assets)) {
    for (const file of fs.readdirSync(DIR.assets)) {
      assetFiles.push(`assets/${file}`);
    }
  }

  return { entries, cssFiles, assetFiles };
}

function generateManifest(browser: Browser, cssFiles: string[], assetFiles: string[]): string {
  const raw = fs.readFileSync(DIR.manifest, 'utf-8');
  const manifest = JSON.parse(raw);

  if (manifest.web_accessible_resources?.length > 0) {
    const resources: string[] = manifest.web_accessible_resources[0].resources || [];
    manifest.web_accessible_resources[0].resources = Array.from(new Set([
      ...resources,
      ...cssFiles,
      ...assetFiles,
    ]));
  }

  if (browser === 'firefox') {
    manifest.browser_specific_settings = {
      ...manifest.browser_specific_settings,
      gecko: {
        ...(manifest.browser_specific_settings?.gecko || {}),
        id: 'dota2ru-ext@dota2.ru',
      },
    };
  }

  return JSON.stringify(manifest, null, 2);
}

function createWebpackConfig(browser: Browser): Configuration {
  const { entries: styleEntries, cssFiles, assetFiles } = scanResources();

  return {
    entry: {
      content: './src/extension/content.ts',
      background: './src/extension/background.ts',
      injected: './src/extension/injected.ts',
      'pages/index': './src/pages/index.ts',
      ...styleEntries,
    },
    output: {
      path: path.resolve(__dirname, `build/${browser}`),
      clean: true,
      publicPath: '',
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.js', '.vue'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/],
          },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.s?css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: DIR.manifest,
            to: 'manifest.json',
            transform: () => generateManifest(browser, cssFiles, assetFiles),
          },
          { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
          { from: 'src/routes.json', to: 'routes.json', noErrorOnMissing: true },
          { from: 'src/extension/icons', to: 'icons', noErrorOnMissing: true },
        ],
      }),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
    devtool: 'source-map',
    mode: 'production',
    optimization: {
      // splitChunks: {
      //   chunks: 'all',
      //   name: 'common',
      // },
      // runtimeChunk: {
      //   name: 'runtime',
      // },
    },
  };
}

const browsers: Browser[] = ['chrome', 'firefox'];
export default browsers.map(createWebpackConfig);