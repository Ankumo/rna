import path from 'path';
import crypto from 'crypto';
import { promises } from 'fs';
import esbuildModule from 'esbuild';
import $ from 'cheerio';
import { collectStyles } from './collectStyles.js';
import { collectScripts } from './collectScripts.js';
import { collectAssets } from './collectAssets.js';
import { collectWebManifest } from './collectWebManifest.js';
import { collectIcons } from './collectIcons.js';

const { readFile, writeFile, mkdir } = promises;

/**
 * @typedef {Object} Entrypoint
 * @property {import('esbuild').Loader} [loader] The loader to use.
 * @property {Partial<import('esbuild').BuildOptions>} options The file name of the referenced file.
 * @property {(filePath: string, outputFiles: string[]) => Promise<void>|void} finisher A callback function to invoke when output file has been generated.
 */

/**
 * @return An esbuild plugin.
 */
export default function({ 
    esbuild = esbuildModule, 
    scriptsTarget = 'es6', 
    modulesTarget = 'es2020', 
    generateIcons = true,
    overrideOptions = {},
} = {}) {
    /**
     * @type {import('esbuild').Plugin}
     */
    const plugin = {
        name: 'html',
        setup(build) {
            const options = {
                ...build.initialOptions,
                ...overrideOptions,
            };

            build.onLoad({ filter: /\.html$/ }, async ({ path: filePath }) => {
                const contents = await readFile(filePath, 'utf-8');
                const basePath = path.dirname(filePath);
                const outdir = /** @type {string} */ (options.outdir || (options.outfile && path.dirname(options.outfile)));
                const dom = $.load(contents);
                const root = dom.root();

                const entrypoints = /** @type {Entrypoint[]} */ ([
                    ...collectIcons(root, basePath, outdir, options, generateIcons),
                    ...collectWebManifest(root, basePath, outdir),
                    ...collectStyles(root, basePath, outdir, options),
                    ...collectScripts(root, basePath, outdir, { scriptsTarget, modulesTarget }, options),
                    ...collectAssets(root, basePath, outdir, options),
                ]);

                for (let i = 0; i < entrypoints.length; i++) {
                    const entrypoint = entrypoints[i];
                    /** @type {string[]} */
                    const outputFiles = [];
                    /** @type {string} */
                    let outputFile;
                    if (entrypoint.loader === 'file') {
                        const files = /** @type {string[]|undefined}} */ (entrypoint.options.entryPoints);
                        const file = files && files[0];
                        if (!file) {
                            continue;
                        }
                        const ext = path.extname(file);
                        const basename = path.basename(file, ext);
                        const buffer = await readFile(file);
                        const assetNames = entrypoint.options.assetNames || options.assetNames || '[name]';
                        let computedName = assetNames
                            .replace('[name]', basename)
                            .replace('[hash]', () => {
                                const hash = crypto.createHash('sha1');
                                hash.update(buffer);
                                return hash.digest('hex').substr(0, 8);
                            });
                        computedName += ext;
                        outputFile = path.join(outdir, computedName);
                        await mkdir(path.dirname(outputFile), {
                            recursive: true,
                        });
                        await writeFile(outputFile, buffer);
                        outputFile = path.relative(process.cwd(), outputFile);
                        outputFiles.push(outputFile);
                    } else {
                        /** @type {import('esbuild').BuildOptions} */
                        const config = {
                            ...options,
                            outfile: undefined,
                            outdir,
                            metafile: true,
                            external: [],
                            ...entrypoint.options,
                        };
                        const result = await esbuild.build(config);
                        if (!result.metafile) {
                            continue;
                        }

                        const inputFiles = /** @type {string[]} */ (entrypoint.options.entryPoints || []);
                        const outputs = result.metafile.outputs;
                        const outputFiles = Object.keys(outputs);
                        outputFile = outputFiles
                            .filter((output) => !output.endsWith('.map'))
                            .filter((output) => outputs[output].entryPoint)
                            .find((output) => inputFiles.includes(path.resolve(/** @type {string} */(outputs[output].entryPoint)))) || outputFiles[0];
                    }
                    await entrypoint.finisher(outputFile, outputFiles);
                }

                return {
                    contents: dom.html(),
                    loader: 'file',
                };
            });
        },
    };

    return plugin;
}
