var path      = require('path')
var webpack   = require('webpack');

var nodeModules = {};
module.exports = {
    externals: nodeModules,
    context: __dirname + path.sep,

    entry: {main:  __dirname + path.sep + 'web' + path.sep + 'main.js'},
    output: { 
        path: __dirname + path.sep + 'public' + path.sep + 'js' + path.sep,
        filename: '[name].bundle.js' },

    optimization: {
	minimize: false },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {} }),

	new webpack.DefinePlugin({
            '__DEVTOOLS__': false }) ],
        
    devtool: "eval",
    module: {
        rules: [{
            test: /.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'stage-1'],
		plugins: [
		    "transform-decorators-legacy",
		    ["babel-plugin-inferno", {"imports": true}]] }} ]},

    resolve: {
        modules: [
            __dirname + path.sep, __dirname + "/node_modules/"],

        alias: {
            "inferno": __dirname + path.sep + 'node_modules' + path.sep + 'inferno',
            "inferno-mobx": __dirname + path.sep + 'node_modules' + path.sep + 'inferno-mobx',
            "inferno-component": __dirname + path.sep + 'node_modules' + path.sep + 'inferno-component',
            "inferno-create-element": __dirname + path.sep + 'node_modules' + path.sep + 'inferno-create-element' }},
	    
    cache: true }

