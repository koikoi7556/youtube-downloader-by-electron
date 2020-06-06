const path = require('path');

module.exports = {
  target: 'electron-main',
  // mode: 'development',
  entry: './src/renderer/index.js', 
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'app')
  },
  // devtool: "source-map",
  module: {
    rules: [
      { 
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',   //loader名
          options: {                //Babelの設定
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  devServer: {
    // サーバーの基準パス
    contentBase: './app',
    // livereloadする
    watchContentBase: true,
    port: 8001
  }
};