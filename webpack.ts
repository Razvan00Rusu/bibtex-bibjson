import webpack from 'webpack';
import path from 'path';
import { argv } from 'process';

let env = process.env['NODE_ENV'];
let isProduction = env && env.match(/production/);
let watching = argv.reduce((prev, cur) => prev || cur === '--watch', false);

let config: webpack.Configuration = {
    context: path.join(__dirname, 'src'),
    entry: {
        app: './bibtex-bibjson.ts'
    },
    output: {
        filename: 'bibtex-bibjson.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'bibtexBibjson',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: [ '.ts', '.tsx', 'js' ]
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    compilerOptions: {
                        isolatedModules: true
                    }
                }
            }
        ]
    },
    node: false,
    externals: {},
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development')
            }
        })
    ],
    optimization: {
        minimize: isProduction ? true : false
    }
};

/**
 * Start Build
 */

const runCallback = (err: Error, stats: webpack.Stats) => {
    if (err) return console.error(err);

    if (stats.hasErrors()) {
        let statsJson = stats.toJson();
        console.log('❌' + ' · Error · ' + 'bibtex-bibjson failed to compile:');
        for (let error of statsJson.errors) {
            console.log(error);
        }
        return;
    }
    console.log(
        '✔️️' +
            '  · Success · ' +
            'bibtex-bibjson' +
            (isProduction ? ' (production) ' : ' (development) ') +
            'built in ' +
            (+stats.endTime - +stats.startTime + ' ms.')
    );
};

const watchCallback = (err: Error, stats: webpack.Stats) => {
    if (err) return console.error(err);

    if (stats.hasErrors()) {
        let statsJson = stats.toJson();
        console.log('❌' + ' · Error · ' + 'bibtex-bibjson failed to compile:');
        for (let error of statsJson.errors) {
            console.log(error);
        }
        console.log('\n👀  · Watching for changes... · \n');
        return;
    }
    console.log(
        '✔️️' +
            '  · Success · ' +
            'bibtex-bibjson' +
            (isProduction ? ' (production) ' : ' (development) ') +
            'built in ' +
            (+stats.endTime - +stats.startTime + ' ms.') +
            '\n👀  · Watching for changes... · \n'
    );
};

if (watching) {
    const compiler: webpack.Compiler = webpack(config);
    compiler.watch({}, watchCallback);
} else {
    // CommonJS
    webpack(config).run(runCallback);
    // Browser
    webpack({
        ...config,
        output: { ...config.output, libraryTarget: 'window', filename: 'bibtex-bibjson.browser.js' }
    }).run(runCallback);
}
