const path = require('path');
const webpack = require("webpack");

module.exports = function (env, arg) {
  return {
    entry: './src/Application.ts',
    mode: 'development',
    devtool: 'source-map',
    target: 'node',
    node: {
      __dirname: false
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    externals: {
      'restify': 'commonjs restify',
      'restify-errors': 'commonjs restify-errors',
    },
    plugins: [
      new webpack.BannerPlugin({ banner: '#!/usr/local/bin/node', raw: true })
    ],
    resolve: {
      extensions: ['.ts', '.js' ]
    },
    output: {
      filename: 'LED-Controller.js',
      path: __dirname
    }
  }
};