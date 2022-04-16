const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  externals: {
    'pixi.js': 'PIXI'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './project')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Project2',
      template: './template.html',
      inject: 'body'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, './project'),
    }
  }
}
