/* eslint-disable */
const path = require( 'path' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
var NODE_ENV = process.env.NODE_ENV || 'development';

const externals = {
	'@woocommerce/components': { this: [ 'wc', 'components' ] },
	'@wordpress/components': { this: [ 'wp', 'components' ] },
	'@wordpress/element': { this: [ 'wp', 'element' ] },
	'@wordpress/hooks': { this: [ 'wp', 'hooks' ] },
	'@wordpress/i18n': { this: [ 'wp', 'i18n' ] },
	jquery: 'jQuery',
	tinymce: 'tinymce',
	moment: 'moment',
	react: 'React',
	'react-dom': 'ReactDOM',
};

const webpackConfig = {
	mode: NODE_ENV,
	entry: {
		plugin: './js/src/plugin.js',
	},
	output: {
		path: path.resolve( 'js' ),
		filename: '[name].js',
		library: [ 'wp', 'wcext' ],
		libraryTarget: 'this',
	},
	externals,
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract( {
					fallback: 'style-loader',
					use: [ 'css-loader', 'sass-loader' ],
				} ),
			},
		],
	},
	plugins: [
		new ExtractTextPlugin( 'style.css' ),
	],
};

if ( webpackConfig.mode !== 'production' ) {
	webpackConfig.devtool = process.env.SOURCEMAP || 'source-map';
}

module.exports = webpackConfig;
