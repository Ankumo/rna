<p align="center">
    <strong>CommonJS to ESM</strong> • A commonjs to esm converter, inspired by [WMR](https://github.com/preactjs/wmr).
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/cjs-to-esm"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/cjs-to-esm.svg?style=flat-square"></a>
</p>

---

## Install

```sh
$ npm i @chialab/cjs-to-esm -D
$ yarn add @chialab/cjs-to-esm -D
```

## Usage

```js
import { transform } from '@chialab/cjs-to-esm';

const { code, map } = transform('require("tslib"); module.exports = function() {}');
```

---

## License

**CommonJS to ESM** is released under the [MIT](https://github.com/chialab/rna/blob/master/packages/cjs-to-esm/LICENSE) license.
