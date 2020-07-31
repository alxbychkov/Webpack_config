const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const filename = (name,ext) => isDev ? `${name}.${ext}` : `${name}.[hash].${ext}`

const optimization = () => {
    const config = {  
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new TerserPlugin(),
            new OptimizeCssAssetsPlugin()
        ]
    }

    return config
}

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true,
                publicPath: '../'
            },
        },
        'css-loader'
    ]
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader' ,
            options: {
                presets: [
                    '@babel/preset-env'
                ],
                plugins: [
                    '@babel/plugin-proposal-class-properties'
                ]
            }
        }
    ]

    if (isDev) {
        loaders.push('eslint-loader')
    }

    return loaders
}

module.exports = {
    context: path.resolve(__dirname,'src'),
    mode: 'development',
    entry: ['@babel/polyfill','./index.js'],
    output: {
        filename: `js/${filename('bundle','js')}`,
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        alias: {
            '@models': path.resolve(__dirname,'src/models'),
            '@': path.resolve(__dirname,'src')
        }
    },
    optimization: optimization(),
    devServer: {
        port: 4500,
        hot: isDev,
        contentBase: './dist',
    },
    devtool: isDev && 'source-map', 
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: path.resolve(__dirname,'src/favicon.ico'), 
                    to: path.resolve(__dirname,'dist')
                },
                { 
                    from: path.resolve(__dirname,'src/models'), 
                    to: path.resolve(__dirname,'dist/images')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: `css/${filename('style','css')}`
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ax]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|gif|webp)$/,
                use: ['file-loader?name=./images/[name].[ext]']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader?name=fonts/[name].[ext]']
            },
            { 
                test: /\.js$/, 
                exclude: /node_modules/, 
                use: jsLoaders()
            }
        ]
    }
};