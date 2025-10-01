const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const crypto = require('crypto');
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = (algorithm) =>
    crypto_orig_createHash(algorithm == 'md4' ? 'sha256' : algorithm);

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: [path.resolve(__dirname, './src/index.js')],
        mode: isProduction ? 'production' : 'development',
        output: {
            filename: isProduction ? '[name].[contenthash].js' : 'bundle.js',
            path: path.resolve(__dirname, './public'),
            clean: true,
            publicPath: '/'
        },
        ...(isProduction
            ? {}
            : {
                  devServer: {
                      static: {
                          directory: path.join(__dirname, 'dist')
                      },
                      historyApiFallback: true, // Fixes routing issues with React Router
                      compress: true,
                      port: 3000,
                      hot: true, // Enable Hot Module Replacement (HMR)
                      liveReload: false, // Disable live reload to prevent double renders
                      client: {
                          overlay: {
                              errors: true,
                              warnings: false // Hide warnings overlay to reduce noise
                          },
                          reconnect: 3 // Limit reconnection attempts
                      }
                  }
              }),
        devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react'
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction
                            ? MiniCssExtractPlugin.loader
                            : 'style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    type: 'asset/resource'
                }
            ]
        },
        optimization: {
            minimize: isProduction,
            minimizer: isProduction ? [new TerserPlugin()] : [],
            splitChunks: isProduction
                ? {
                      chunks: 'all',
                      cacheGroups: {
                          vendor: {
                              test: /[\\/]node_modules[\\/]/,
                              name: 'vendors',
                              chunks: 'all'
                          },
                          common: {
                              name: 'common',
                              minChunks: 2,
                              chunks: 'all',
                              enforce: true
                          }
                      }
                  }
                : {}
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html', // Use clean template from src
                filename: 'index.html',
                inject: 'body',
                scriptLoading: 'defer',
                hash: false,
                cache: false, // Disable cache to prevent duplicates
                excludeChunks: [], // Don't exclude any chunks
                minify: isProduction
                    ? {
                          removeComments: true,
                          collapseWhitespace: true,
                          removeRedundantAttributes: true,
                          useShortDoctype: true,
                          removeEmptyAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          keepClosingSlash: true,
                          minifyJS: true,
                          minifyCSS: true,
                          minifyURLs: true
                      }
                    : false
            }),
            ...(isProduction
                ? [
                      new MiniCssExtractPlugin({
                          filename: '[name].[contenthash].css'
                      })
                  ]
                : [])
        ],
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js', '.css']
        },
        watch: false
    };
};
