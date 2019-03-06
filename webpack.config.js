const path = require('path');

const DEV_DIR = path.resolve(__dirname, 'dev');
const DIST_DIR = path.resolve(__dirname, 'dist');
const JS_DEV_DIR = path.resolve(DEV_DIR, 'js');

const config = {
	entry : `${JS_DEV_DIR}/main.js`,
	output: {
		path    : DIST_DIR,
		filename: 'bundle.js'
	},
	resolve: { extensions: [ '.js', '.ts' ]},
	module: {
		rules: []
	}
};

module.exports = config;
