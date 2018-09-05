const path = require('path');
const webpack = require("webpack");

module.exports = function (env, arg) {
  return {
    entry: './src/Application.ts',
    mode: 'development',
    devtool: 'source-map',
    target: 'node',
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
      'dotstar': 'commonjs dotstar',
      'pi-spi': 'commonjs pi-spi',
      'restify': 'commonjs restify',
      'restify-errors': 'commonjs restify-errors',
      'heapdump': 'commonjs heapdump'
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