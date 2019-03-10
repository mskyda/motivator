const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const DEV_DIR = path.resolve(__dirname, 'dev');
const DIST_DIR = path.resolve(__dirname, 'dist');
const JS_DEV_DIR = path.resolve(DEV_DIR, 'js');

const config = {
	entry : `${JS_DEV_DIR}/main.ts`,
	output: {
		path    : DIST_DIR,
		publicPath: '/dist/',
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: { appendTsSuffixTo: [/\.vue$/] }
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.s?css$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new VueLoaderPlugin
	],
	devServer: { port: 9000 }
};

module.exports = config;
