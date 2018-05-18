var HTMLWebpackPlugin       = require('html-webpack-plugin'),
    ExtractTextPlugin       = require('extract-text-webpack-plugin');
    webpack                 = require('webpack');
    path                    = require('path');


var loaders = {
  css: {
    loader: 'css-loader'
  },
  postcss: {
    loader: 'postcss-loader',
    options: {
      plugins: (loader) => [
        autoprefixer({
          browsers: ['last 2 versions']
        })
      ]
    }
  },
  sass: {
    loader: 'sass-loader',
    options: {
      indentedSyntax: true,
      includePaths: [path.resolve(__dirname, './src')]
    }
  }
}

module.exports = {
  entry: __dirname + '/app/index.js',
  module:{
    rules:[
      {
        test: /\.(html)$/,
        exclude: /node_modules/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: [':data-src']
          }
        }
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: "file-loader"
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use:{
          loader:'babel-loader',
          options:{
            presets: ['stage-0']
          }
        }
      },
      {
        test: /\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [loaders.css, loaders.sass]
        })
      },
      {
        test: /\.css$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
              fallback: 'style-loader',

              // Could also be write as follow:
              // use: 'css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
              use: [
                  {
                      loader: 'css-loader',
                      query: {
                          modules: true,
                          localIdentName: '[name]__[local]___[hash:base64:5]'
                      }
                  },
                  'postcss-loader'
              ]
          })
      },
      {
        test: /\.scss$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
              fallback: 'style-loader',

              // Could also be write as follow:
              // use: 'css-loader?modules&importLoader=2&sourceMap&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader'
              use: [
                  {
                      loader: 'css-loader',
                      query: {
                          modules: true,
                          sourceMap: true,
                          importLoaders: 2,
                          localIdentName: '[name]__[local]___[hash:base64:5]'
                      }
                  },
                  'sass-loader'
              ]
          })
      }
    ]
  },
  output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'bundle.js',
      publicPath: '/public/',
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins:[
    new ExtractTextPlugin('[name].css'),
    new HTMLWebpackPlugin({
      template: __dirname +'/app/index.html',
      filename: 'index.html',
      inject:'body'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default']
    })
  ],
  resolve: {
    extensions: ['.js', '.sass'],
    modules: [path.join(__dirname, './src'), 'node_modules']
  }
};
