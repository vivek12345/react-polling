/* eslint-disable */
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: __dirname + "/dist",
    filename: 'ReactPing.js',
    libraryTarget: 'umd',
    library: 'ReactPing'
  },
  module: {
    rules: [
      {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
      }
    ]
  },
  externals: [
    'react',
    'react-dom',
    'prop-types'
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};