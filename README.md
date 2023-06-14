# file-collection

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Library to manage large amount of files coming from different sources

## Introduction

This library allows to manipulate a large amount of files coming from local or remote source.

In order to make compatible code between the browser and node and to allow drag and drop of a folder it is useful to an abstraction level.

This package allows to create a `file-collection` than can further be saved as a `ium` file (zip file containing all the data
and an index.json file).

The structure of the zip file is at follow:

- index.json
- data/
  - all the files

## Installation

`npm i file-collection`

## Basic usage

### Append a browser filelist

```js
import { FileCollection } from 'file-collection';

const fileList; // a fileList resulting from a drag / drop in the browser
const fileCollection = new FileCollection();
await fileCollection.appendFileList(fileList);

// get a zip file that can be reload later
const iumFile = fileCollection.toIum();

// list the content of the fileCollection
for (const file of fileCollection) {
  console.log(file.name);
  console.log(await file.text());
}

```

### Reload a 'ium' file

```js
import { fromIum } from 'file-collection';

const fileCollection = await fromIum(iumFile);

for (const file of fileCollection) {
  console.log(file.name);
  console.log(await file.text());
}
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
