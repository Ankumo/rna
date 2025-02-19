<p align="center">
    <strong>Esbuild Plugin Transform</strong> • Pipe transformation plugin for <a href="https://esbuild.github.io/">esbuild</a>.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/esbuild-plugin-transform"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/esbuild-plugin-transform.svg?style=flat-square"></a>
</p>

---

## Install

```sh
$ npm i @chialab/esbuild-plugin-transform -D
$ yarn add @chialab/esbuild-plugin-transform -D
```

## Usage

```js
import esbuild from 'esbuild';
import { start, end } from '@chialab/esbuild-plugin-transform';

await esbuild.build({
    plugins: [
        start(),
        end(),
    ],
});
```

## Create a plugin

First of all, install **Esbuild Plugin Transform**:

```sh
npm i @chialab/esbuild-plugin-transform
```

Then, use module helpers to retrieve contents and mappings:

```js
import { getTransformOptions } from '@chialab/esbuild-plugin-transform';

async function transform(code, map) {
    ...
}

export default {
    name: '...',
    setup(build) {
        const { filter, running, getEntry, buildEntry } = getTransformOptions(build);

        build.onLoad({ filter: /\./, namespace: 'file' }, async (args) => {
            const entry = await getEntry(args.path);
            const { code, map } = await transform(entry.code);
            entry.code = code;
            entry.mappings.push(map);

            return buildEntry(entry, {
                loader: 'js',
            });
        });
    },
};

```

---

## License

**Esbuild Plugin Transform** is released under the [MIT](https://github.com/chialab/rna/blob/master/packages/esbuild-plugin-transform/LICENSE) license.
