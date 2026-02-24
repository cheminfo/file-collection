# Changelog

## [6.6.1](https://github.com/cheminfo/file-collection/compare/v6.6.0...v6.6.1) (2026-02-24)


### Bug Fixes

* avoid infinite loop in toZip when lot of files are zipped ([#86](https://github.com/cheminfo/file-collection/issues/86)) ([a16ce64](https://github.com/cheminfo/file-collection/commit/a16ce64bded81ae0e8f3fe82c7279ef7586ee48f))

## [6.6.0](https://github.com/cheminfo/file-collection/compare/v6.5.0...v6.6.0) (2026-01-19)


### Features

* use `.mimetype` instead `mimetype` for macos unarchiver ([#82](https://github.com/cheminfo/file-collection/issues/82)) ([7232d81](https://github.com/cheminfo/file-collection/commit/7232d81969763026d2bc8251bde793f2af5dfa22))

## [6.5.0](https://github.com/cheminfo/file-collection/compare/v6.4.0...v6.5.0) (2025-12-11)


### Features

* improve `file` cli tool support ([#80](https://github.com/cheminfo/file-collection/issues/80)) ([d164bd5](https://github.com/cheminfo/file-collection/commit/d164bd5a7af47155f2fb57994bf03e2d8cb20249))

## [6.4.0](https://github.com/cheminfo/file-collection/compare/v6.3.0...v6.4.0) (2025-12-04)


### Features

* add paths mapping in ium index ([#78](https://github.com/cheminfo/file-collection/issues/78)) ([e1f1d02](https://github.com/cheminfo/file-collection/commit/e1f1d028332cf0df8210896a21665822ba991bbb))
* add version to ium index ([#76](https://github.com/cheminfo/file-collection/issues/76)) ([1c792bf](https://github.com/cheminfo/file-collection/commit/1c792bf509c5c39bd31bae3d3a4c8a1c612dfc64))

## [6.3.0](https://github.com/cheminfo/file-collection/compare/v6.2.1...v6.3.0) (2025-11-17)


### Features

* add `isIum` as `FileCollection` static method with mimetype check ([#73](https://github.com/cheminfo/file-collection/issues/73)) ([68d8c4f](https://github.com/cheminfo/file-collection/commit/68d8c4f354b9f4ba0d273d40cd4c98a246c6583e))
* add `isZip` as `FileCollection` static method ([68d8c4f](https://github.com/cheminfo/file-collection/commit/68d8c4f354b9f4ba0d273d40cd4c98a246c6583e))
* put mimetype file into ium archive for fast signature check ([#73](https://github.com/cheminfo/file-collection/issues/73)) ([68d8c4f](https://github.com/cheminfo/file-collection/commit/68d8c4f354b9f4ba0d273d40cd4c98a246c6583e))


### Bug Fixes

* `isZip` signature validation ([#73](https://github.com/cheminfo/file-collection/issues/73)) ([68d8c4f](https://github.com/cheminfo/file-collection/commit/68d8c4f354b9f4ba0d273d40cd4c98a246c6583e))

## [6.2.1](https://github.com/cheminfo/file-collection/compare/v6.2.0...v6.2.1) (2025-11-12)


### Bug Fixes

* keep tracks of `originalRelativePath` ([#71](https://github.com/cheminfo/file-collection/issues/71)) ([d2d0d92](https://github.com/cheminfo/file-collection/commit/d2d0d92c6c1a87ba9021ad0d2ac15715e1c8044b))

## [6.2.0](https://github.com/cheminfo/file-collection/compare/v6.1.0...v6.2.0) (2025-11-10)


### Features

* stable source uuid with subroot and appendFileCollection ([#69](https://github.com/cheminfo/file-collection/issues/69)) ([b3331c6](https://github.com/cheminfo/file-collection/commit/b3331c6fdea8defde94ab30e67e78330c22fc33a))

## [6.1.0](https://github.com/cheminfo/file-collection/compare/v6.0.0...v6.1.0) (2025-11-04)


### Features

* add `appendFileCollection` method with optional `subPath` argument ([#64](https://github.com/cheminfo/file-collection/issues/64)) ([cae0f2a](https://github.com/cheminfo/file-collection/commit/cae0f2a4065746cf7d8a203357cf42849b7a18c6))
* add `subroot` method ([#65](https://github.com/cheminfo/file-collection/issues/65)) ([a717eef](https://github.com/cheminfo/file-collection/commit/a717eef28fbeba06420a78afed97413e2902420e))
* avoid to compress files known to be already compressed ([#63](https://github.com/cheminfo/file-collection/issues/63)) ([e55020c](https://github.com/cheminfo/file-collection/commit/e55020c5ba2b8c5c07448a2dd24a445913bfb2ed))
* improve source options serialization / deserialization ([#60](https://github.com/cheminfo/file-collection/issues/60)) ([e9c68e4](https://github.com/cheminfo/file-collection/commit/e9c68e4f3aebffedc6d045d5b9cb365ccc71c2de))

### Misc

🎉 This is the first release with 100% code coverage.

## [6.0.0](https://github.com/cheminfo/file-collection/compare/v5.4.0...v6.0.0) (2025-10-29)


### ⚠ BREAKING CHANGES

* cache option is removed from `FileCollection`, now each source / file use cached data, even streams. It's a breaking change only for typescript usage of the lib. If somehow, a `cache` option is given to `FileCollection` it would ignore it.

### Features

* avoid refetch each time we read a file from an external source ([#55](https://github.com/cheminfo/file-collection/issues/55)) ([1a5c705](https://github.com/cheminfo/file-collection/commit/1a5c7056cd7ae4ec834feee89221bc6be660c8a8))
* avoid re-read each time we read a file from filesystem ([#59](https://github.com/cheminfo/file-collection/issues/59)) ([68b6904](https://github.com/cheminfo/file-collection/commit/68b6904bf64964c0c7292659550b22ed219525fe))

### Code Refactoring

* remove cache option ([#59](https://github.com/cheminfo/file-collection/issues/59)) ([68b6904](https://github.com/cheminfo/file-collection/commit/68b6904bf64964c0c7292659550b22ed219525fe))

## [5.4.0](https://github.com/cheminfo/file-collection/compare/v5.3.0...v5.4.0) (2025-10-24)


### Features

* ensure source uuid is stable ([#53](https://github.com/cheminfo/file-collection/issues/53)) ([8e67fce](https://github.com/cheminfo/file-collection/commit/8e67fcee0009db8fe89d5214e0303df4c46232e1))


### Bug Fixes

* no absolute path for zip ([#53](https://github.com/cheminfo/file-collection/issues/53)) ([8e67fce](https://github.com/cheminfo/file-collection/commit/8e67fcee0009db8fe89d5214e0303df4c46232e1))

## [5.3.0](https://github.com/cheminfo/file-collection/compare/v5.2.2...v5.3.0) (2025-10-22)


### Features

* add `finalPaths` procedure option to `toZip` ([89d2b72](https://github.com/cheminfo/file-collection/commit/89d2b72c4e11975ae34373c76f567522dcfa2594))


### Bug Fixes

* ensure ium archive have stable `relativePath` source's across `toIum` / `fromIum` ([89d2b72](https://github.com/cheminfo/file-collection/commit/89d2b72c4e11975ae34373c76f567522dcfa2594))
* use safe for filesystem path in zip and ium ([#51](https://github.com/cheminfo/file-collection/issues/51)) ([89d2b72](https://github.com/cheminfo/file-collection/commit/89d2b72c4e11975ae34373c76f567522dcfa2594))

## [5.2.2](https://github.com/cheminfo/file-collection/compare/v5.2.1...v5.2.2) (2025-10-17)


### Bug Fixes

* **perf:** update zip.js ([6ef3aad](https://github.com/cheminfo/file-collection/commit/6ef3aadbf8daf0dd8e3cee8660ddacf50929448e))

## [5.2.1](https://github.com/cheminfo/file-collection/compare/v5.2.0...v5.2.1) (2025-10-14)


### Bug Fixes

* appendPath with keepBasename had a leading '/' for first level files ([76979c3](https://github.com/cheminfo/file-collection/commit/76979c37712eceaeafc8ca9aa9d0791e6a82d8c0))

## [5.2.0](https://github.com/cheminfo/file-collection/compare/v5.1.1...v5.2.0) (2025-09-29)


### Features

* add toZip helper and getExtraFiles option on toIum ([#41](https://github.com/cheminfo/file-collection/issues/41)) ([3619a6b](https://github.com/cheminfo/file-collection/commit/3619a6bd555a892970dac8b5000ee2647dfb4035))

## [5.1.1](https://github.com/cheminfo/file-collection/compare/v5.1.0...v5.1.1) (2025-08-13)


### Bug Fixes

* exports and ArrayBuffer handling with TS 4.9 ([#39](https://github.com/cheminfo/file-collection/issues/39)) ([d56ac7b](https://github.com/cheminfo/file-collection/commit/d56ac7beb1f3e69ed8f744019895fb641949c8e8))

## [5.1.0](https://github.com/cheminfo/file-collection/compare/v5.0.1...v5.1.0) (2025-07-24)


### Features

* add options support on SourceItem ([#35](https://github.com/cheminfo/file-collection/issues/35)) ([e09fab1](https://github.com/cheminfo/file-collection/commit/e09fab10efd45a29695c4ec90e94075e4c8935b1))

## [5.0.1](https://github.com/cheminfo/file-collection/compare/v5.0.0...v5.0.1) (2025-07-23)


### Bug Fixes

* complete buffer types supported by `appendArrayBuffer` ([#32](https://github.com/cheminfo/file-collection/issues/32)) ([03c1ac5](https://github.com/cheminfo/file-collection/commit/03c1ac5f505afb6c474514be7dcb89db3d9149d6))
* normalize relativePath ([#34](https://github.com/cheminfo/file-collection/issues/34)) ([c8a4621](https://github.com/cheminfo/file-collection/commit/c8a4621a474d70a8574a5daa9f5cc2bac05720e7))

## [5.0.0](https://github.com/cheminfo/file-collection/compare/v4.1.1...v5.0.0) (2025-07-21)


### ⚠ BREAKING CHANGES

* Remove `filter` and `cache` props shortcut. Access `filter` and `cache` directly from `options` props.

### Features

* add `.filter` method to `FileCollection` prototype ([8757cc0](https://github.com/cheminfo/file-collection/commit/8757cc0d56f71a9020a2bac56f2b01ec3bdf4257))
* expose chainable API ([#30](https://github.com/cheminfo/file-collection/issues/30)) ([8757cc0](https://github.com/cheminfo/file-collection/commit/8757cc0d56f71a9020a2bac56f2b01ec3bdf4257))


### Bug Fixes

* export missing `Source` and `SourceItem` interfaces ([8757cc0](https://github.com/cheminfo/file-collection/commit/8757cc0d56f71a9020a2bac56f2b01ec3bdf4257))


### Code Refactoring

* remove `filter` and `cache` props shortcut ([8757cc0](https://github.com/cheminfo/file-collection/commit/8757cc0d56f71a9020a2bac56f2b01ec3bdf4257))

## [4.1.1](https://github.com/cheminfo/file-collection/compare/v4.1.0...v4.1.1) (2025-07-10)


### Bug Fixes

* properly support Node.js Buffer ([#28](https://github.com/cheminfo/file-collection/issues/28)) ([ef12814](https://github.com/cheminfo/file-collection/commit/ef12814dbbd9423fd60e2d84215294e2dbdfb5a6))

## [4.1.0](https://github.com/cheminfo/file-collection/compare/v4.0.0...v4.1.0) (2025-07-09)


### Features

* add `FileCollection.fromPath` static method ([#25](https://github.com/cheminfo/file-collection/issues/25)) ([0b1c783](https://github.com/cheminfo/file-collection/commit/0b1c783b75074410661ec872c3d37b134c1631d0))
* add `FileCollection.fromSource` static method ([#26](https://github.com/cheminfo/file-collection/issues/26)) ([588002f](https://github.com/cheminfo/file-collection/commit/588002f9084dbd6f3ee35f4c57cb238b6564f7e8))
* add `FileCollection.fromZip` static method ([#23](https://github.com/cheminfo/file-collection/issues/23)) ([77498b9](https://github.com/cheminfo/file-collection/commit/77498b90f4d864e2a76f623023bf32113eb12c8f))

Theses are ports of methods from `filelist-utils`:

* `fileCollectionFromPath`
* `fileCollectionFromWebSource`
* `fileCollectionFromZip`

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
