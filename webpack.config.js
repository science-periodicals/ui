const path = require('path');
const webpack = require('webpack');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

const { babel } = require('./package.json');

const PUBLIC_PATH = 'http://127.0.0.1:3030';

module.exports = {
  target: 'web',
  mode: 'development',

  entry: {
    main: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
      './example/app.js'
    ]
  },

  output: {
    filename: `ui-bundle.[name].js`,
    // jsonpFunction: 'jsonpFunction', see https://stackoverflow.com/questions/52447286/migrating-to-webpack-4-from-webpack-3
    path: path.resolve(__dirname, 'example'),
    publicPath: PUBLIC_PATH + '/'
  },

  resolve: {
    mainFields: ['browser', 'main'],
    alias: {
      '@scienceai/librarian$': path.resolve(
        __dirname,
        'node_modules/@scienceai/librarian/src/browser.js'
      )
    }
  },

  devtool: 'cheap-module-eval-source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: babel.presets,
              plugins: babel.plugins.concat('react-hot-loader/babel')
            }
          }
        ],
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'example')
        ]
      },

      // CSS
      {
        test: /\.css$/,
        sideEffects: true,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: function(loader) {
                return [
                  require('postcss-import')(),
                  require('postcss-url')(),
                  require('postcss-preset-env')({
                    browsers: 'last 2 versions',
                    stage: 3,
                    features: {
                      'nesting-rules': false /* disable css nesting which does not allow nesting of selectors without white spaces between them */,
                      'custom-media-queries': true
                    }
                  }),
                  require('postcss-nested') /*replace cssnext nesting with this one which allows for sass style nesting*/,
                  require('postcss-reporter')({
                    clearAllMessages: false
                  })
                ];
              }
            }
          }
        ],
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'example')
        ]
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.DB_NAME': JSON.stringify(process.env.DB_NAME || 'scienceai')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new DuplicatePackageCheckerPlugin({
      verbose: true
    })
  ]
};
