# file-collection

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Library to manage large amount of files coming from different sources

## Introduction

This library allows to manipulate a large amount of files coming from local or remote source.

In order to make compatible code between the browser and node and to allow drag and drop of a folder it is useful to an abstraction level.

This package allows to create a `file-collection` than can further be saved as a `ium` file (zip file containing all the data and an index.json file).

- a [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList) (that implements an Iterator of [File](https://developer.mozilla.org/en-US/docs/Web/API/File)).
- a relative path (with its basedir)
- a webservice that returns a JSON containing an array of object that has the following properties: `relativePath`, `name`, `lastModified`, `size`

A `FileCollection` has an iterator on `FileItem` that has the following properties:

- lastModified: number;
- name: string;
- relativePath: string;
- size: number;
- arrayBuffer(): Promise<ArrayBuffer>;
- stream(): ReadableStream<Uint8Array>;
- text(): Promise<string>;

## Load and Save from remote server

// You should have a webservice that returns this kind of object

```js
const source = {
  files: [
    {
      name: 'data.zip',
      size: 1589,
      relativePath: 'dataUnzip/data.zip',
      lastModified: 1664430693588,
    },
    {
      name: 'a.txt',
      size: 1,
      relativePath: 'dataUnzip/dir1/a.txt',
      lastModified: 1664430693588,
    },
  ],
  baseURL: 'http://localhost/',
};
const file-collection = file-collectionFromSource(source);
```

## Installation

`npm i file-collection`

## Usage

```js
import { file-collectionFromPath } from 'file-collection';

const file-collection = file-collectionFromPath(__dirname);
```

```js
import { file-collectionFromZip } from 'file-collection';

const zip = readFileSync(join(__dirname, 'test.zip'));
const file-collection = file-collectionFromZip(zip);
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/file-collection.svg
[npm-url]: https://www.npmjs.com/package/file-collection
[ci-image]: https://github.com/cheminfo/file-collection/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/file-collection/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/file-collection.svg
[codecov-url]: https://codecov.io/gh/cheminfo/file-collection
[download-image]: https://img.shields.io/npm/dm/file-collection.svg
[download-url]: https://www.npmjs.com/package/file-collection
