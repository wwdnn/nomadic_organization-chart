const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: isProduction ? 'production' : 'development',
        entry: './src/NomadicChart.js', 
        
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? 'nomadic-chart.min.js' : 'nomadic-chart.js',
            library: {
                name: 'NomadicChart',
                type: 'umd',
                export: 'default',
            },
            globalObject: 'this',
            clean: true,
        },

        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            compress: true,
            port: 8080,
            open: true,
            hot: true,
            historyApiFallback: true,
        },

        module: {
            rules: [
                {
                    test: /\.js$/i,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
            ],
        },

        optimization: {
            minimize: isProduction,
            minimizer: [new TerserPlugin()],
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: isProduction ? 'nomadic-chart.min.css' : 'nomadic-chart.css',
            }),
            new HtmlWebpackPlugin({
                template: './public/index.html',
                inject: 'head',
                scriptLoading: 'blocking'
            })
        ],

        resolve: {
            extensions: ['.js'],
        },
        
        devtool: isProduction ? false : 'eval-source-map',
    };
};