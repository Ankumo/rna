import sourceFilter from './sourceFilter.js';
import path from 'path';
import $ from './esm-cheerio.js';

/**
 * Collect and bundle each node with a src reference.
 * @param {import('./esm-cheerio').Document} dom The DOM element.
 * @param {string} base The base dir.
 * @param {string} outdir The output dir.
 * @param {import('esbuild').BuildOptions} options Build options.
 * @return {import('./index').Entrypoint[]} A list of entrypoints.
 */
export function collectAssets(dom, base, outdir, options) {
    return [
        ...dom
            .find('[src]:not(script)')
            .get()
            .filter((element) => sourceFilter($(element).attr('src')))
            .map((element) => ({
                loader: /** @type {import('esbuild').Loader} */ ('file'),
                options: {
                    entryPoints: [
                        path.resolve(base, /** @type {string} */ ($(element).attr('src'))),
                    ],
                    entryNames: `assets/${options.entryNames || '[name]'}`,
                    chunkNames: `assets/${options.chunkNames || '[name]'}`,
                    assetNames: `assets/${options.assetNames || '[name]'}`,
                },
                /**
                 * @param {string} filePath
                 */
                finisher(filePath) {
                    $(element).attr('src', path.relative(outdir, filePath));
                },
            })),
        ...dom
            .find('link[href]:not([rel="stylesheet"]):not([rel="manifest"]):not([rel*="icon"]), a[download][href], iframe[href]')
            .get()
            .filter((element) => sourceFilter($(element).attr('href')))
            .map((element) => ({
                loader: /** @type {import('esbuild').Loader} */ ('file'),
                options: {
                    entryPoints: [
                        path.resolve(base, /** @type {string} */ ($(element).attr('href'))),
                    ],
                    entryNames: `assets/${options.entryNames || '[name]'}`,
                    chunkNames: `assets/${options.chunkNames || '[name]'}`,
                    assetNames: `assets/${options.assetNames || '[name]'}`,
                },
                /**
                 * @param {string} filePath
                 */
                finisher(filePath) {
                    $(element).attr('href', path.relative(outdir, filePath));
                },
            })),
    ];
}
