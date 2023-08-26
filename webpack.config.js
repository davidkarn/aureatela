const path = require('path')

module.exports = {
    entry: {
        main: __dirname + path.sep + 'web' + path.sep + 'mainv2.js'
    },
    output: {
        path: path.join(__dirname, "/public/js"),
        filename: 'bundle.js'
    },
    optimization: {
        minimize: false
    },
    plugins: [
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
}

