const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

module.exports = {
  entry: {
    content: './src/content.ts',
    background: './src/background.ts',
    parasite: './src/parasite.ts',
    'style/main': './src/style/main.scss',
    'style/smilesPanel': './src/style/smilesPanel.scss',
    'pages/forum-thread': './src/pages/forum-thread.ts',
    'pages/settings': './src/pages/settings.ts',
    'pages/settings-extension': './src/pages/settings-extension.ts',
    'pages/index': './src/pages/index.ts',
    'pages/notifications': './src/pages/notifications.ts',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    clean: true,
    publicPath: ''
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.png$/,
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
        { from: 'src/manifest.json', to: '.' },
        { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
        { from: 'src/icons', to: 'icons', noErrorOnMissing: true }
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
    splitChunks: false,
    runtimeChunk: false,
  },
}; 