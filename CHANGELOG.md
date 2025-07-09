# Changelog

## [4.1.0](https://github.com/cheminfo/file-collection/compare/v4.0.0...v4.1.0) (2025-07-09)


### Features

* add `FileCollection.fromPath` static method ([#25](https://github.com/cheminfo/file-collection/issues/25)) ([0b1c783](https://github.com/cheminfo/file-collection/commit/0b1c783b75074410661ec872c3d37b134c1631d0))
* add `FileCollection.fromSource` static method ([#26](https://github.com/cheminfo/file-collection/issues/26)) ([588002f](https://github.com/cheminfo/file-collection/commit/588002f9084dbd6f3ee35f4c57cb238b6564f7e8))
* port fromZip from `filelist-utils` ([#23](https://github.com/cheminfo/file-collection/issues/23)) ([77498b9](https://github.com/cheminfo/file-collection/commit/77498b90f4d864e2a76f623023bf32113eb12c8f))

## [4.0.0](https://github.com/cheminfo/file-collection/compare/v3.0.0...v4.0.0) (2025-06-27)


### ⚠ BREAKING CHANGES

* remove `fromIum` input `string` and `NodeJS.ReadableStream` support. If you used string you have to decode it to `Uint8Array`. If you used Node.js Readable Streams, convert them to Web Stream with `Readable.toWeb`
* migrate to ESM-only ([#15](https://github.com/cheminfo/file-collection/issues/15))

### Bug Fixes

* `.stream()` method on `sources` added by `FileCollection.appendSource` ([156cab8](https://github.com/cheminfo/file-collection/commit/156cab8b8ba32ba33e7b0ad8af2d14060cd08f35))  
  It returned a promise rejecting an error because it used `.stream()` on a response (this method does not exist).  
  Now it instantiates a stream, the body response is piped to the stream, and it returns the stream synchronously.
* file paths from `toIum` zip should not include `//` anymore ([156cab8](https://github.com/cheminfo/file-collection/commit/156cab8b8ba32ba33e7b0ad8af2d14060cd08f35))


### Code Refactoring

* migrate to ESM-only ([#15](https://github.com/cheminfo/file-collection/issues/15)) ([cc8e2c7](https://github.com/cheminfo/file-collection/commit/cc8e2c7dadf131cc85017707514a053cdd00e8cf))
* switching to `@zip.js/zip.js` ([#18](https://github.com/cheminfo/file-collection/issues/18)) ([156cab8](https://github.com/cheminfo/file-collection/commit/156cab8b8ba32ba33e7b0ad8af2d14060cd08f35))

## [3.0.0](https://github.com/cheminfo/file-collection/compare/v2.0.0...v3.0.0) (2025-03-07)


### ⚠ BREAKING CHANGES

* ungzip create a relativePath that contains the .gz file and the name is appended

### Features

* ungzip create a relativePath that contains the .gz file and the name is appended ([6819ac9](https://github.com/cheminfo/file-collection/commit/6819ac93b2fd56912cd6c7d30432545257f8bc18))

## [2.0.0](https://github.com/cheminfo/file-collection/compare/v1.0.0...v2.0.0) (2025-03-07)


### ⚠ BREAKING CHANGES

* remove support of node 18 to use crypto.randomUUID
* remove support of node 18 to use crypto.randomUUID

### Features

* add parent FileItem if item is decompressed ([3c60b18](https://github.com/cheminfo/file-collection/commit/3c60b188c4d2f4ebb02333ef3d85d430dfed736b))
* remove support of node 18 to use crypto.randomUUID ([4006fe5](https://github.com/cheminfo/file-collection/commit/4006fe50e8224b49bd5e084864abb8e13275672f))
* remove support of node 18 to use crypto.randomUUID ([4006fe5](https://github.com/cheminfo/file-collection/commit/4006fe50e8224b49bd5e084864abb8e13275672f))


### Bug Fixes

* remove @lukeed/uuid dependency and use crypto uuid generator ([d9baf96](https://github.com/cheminfo/file-collection/commit/d9baf96ebb3e8768f4f59ee192c8d70fd13d0dfe))

## [1.0.0](https://github.com/cheminfo/file-collection/compare/v0.2.0...v1.0.0) (2024-07-13)


### ⚠ BREAKING CHANGES

* update depencies

### Features

* add keepBasename option in appendPath ([83af64f](https://github.com/cheminfo/file-collection/commit/83af64fc8b1f15a8da4298aba0174f9702735120))


### Miscellaneous Chores

* update depencies ([bbf1875](https://github.com/cheminfo/file-collection/commit/bbf1875acfd29a36c2bfee1b93efcfecceb3f066))

## [0.2.0](https://github.com/cheminfo/file-collection/compare/v0.1.0...v0.2.0) (2023-06-18)


### Features

* add get / set methods ([9e48da2](https://github.com/cheminfo/file-collection/commit/9e48da204e347324a7dfc6da9010a4a0e3869fc4))

## [0.1.0](https://github.com/cheminfo/file-collection/compare/v0.0.1...v0.1.0) (2023-06-17)


### Features

* add appendWebSource and fix many bugs ([c34605e](https://github.com/cheminfo/file-collection/commit/c34605e0db500315d8830d99590298167bbdeb5b))
* add appendWebSourceURL ([8e99623](https://github.com/cheminfo/file-collection/commit/8e996230182f7baf653115600c25dace830061bb))
* add cache ([6800440](https://github.com/cheminfo/file-collection/commit/6800440b6c99e35e7c855589174e797abd20790b))


### Bug Fixes

* build for browser is working now correctly ([ac7326f](https://github.com/cheminfo/file-collection/commit/ac7326f6bd8ebfcec3d7527a1ea7509a6dc3e4b8))
* deal correctly with unzip and ungzip options ([d851341](https://github.com/cheminfo/file-collection/commit/d851341d00520aa4a646e069eeec2164fddf08a6))


### Documentation

* improve README ([15cde97](https://github.com/cheminfo/file-collection/commit/15cde976e3941e1d672c2862ce1af410baf71ea9))
* improve README ([abf9614](https://github.com/cheminfo/file-collection/commit/abf9614a01274e7568a7b5119f5c3219039f7267))

## 0.0.1 (2023-06-14)


### release-as

* 0.0.1 ([f59b1a8](https://github.com/cheminfo/file-collection/commit/f59b1a8b3e47dfcb961d835f24b4a5d651c8fd61))


### Documentation

* improve index.html example ([7845b69](https://github.com/cheminfo/file-collection/commit/7845b6974a7bbcd8c0b1ef7eb3861077f66d0a65))
* improve README ([0966bde](https://github.com/cheminfo/file-collection/commit/0966bdea7e2158472d7258c1c1c0b9402f3c7106))
