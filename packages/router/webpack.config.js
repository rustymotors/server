/* eslint-disable @typescript-eslint/no-var-requires */
const PnpWebpackPlugin = require("pnp-webpack-plugin")

module.exports = {
  mode: 'development',
  entry: './app.ts',
  target: 'node',
  resolve: {
    extensions: ['.ts','.js', '.json'],
    plugins: [
      PnpWebpackPlugin,
    ]
  },
  resolveLoader: {
    plugins: [
      PnpWebpackPlugin.moduleLoader(module)
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [
          // /node_modules/,
        ]
      }
    ]
  },
  // externals: ['pino-pretty'],
  stats: {
    errorDetails: true
  },
  externalsPresets: {
    node: true,
  },
  externals: {
    'pino-pretty': 'commonjs2 pino-pretty',
  },
}