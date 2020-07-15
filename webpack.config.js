const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env')
})

module.exports = {
  entry: {
    index: './index'
  },
  output: {
    filename: '[name].pack.js'
  },
  module: {
    rules: [
      {
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env', 'babel-preset-react'],
            plugins: ['babel-plugin-transform-runtime']
          }
        },
        exclude: /node_modules/,
        test: /\.js$/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed)
    })
  ]
}
