import {
  TextReader,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';
import { assert, expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.ts';

test('avoid recompression', async () => {
  const zipWriter = new ZipWriter(new Uint8ArrayWriter());
  await zipWriter.add('hello.txt', new TextReader('Hello World!'));
  const zipBuffer = await zipWriter.close();
  const zipBlob = new Blob([zipBuffer], { type: 'application/zip' });

  const fc = new FileCollection({
    unzip: {
      zipExtensions: ['zip'],
    },
  });

  await fc.appendArrayBuffer('hello.zip', zipBuffer);
  await fc.appendExtendedSource({
    uuid: crypto.randomUUID(),
    name: 'recompress.zip',
    relativePath: 'recompress.zip',
    extra: true,
    options: {
      unzip: {
        zipExtensions: [],
      },
    },
    text: () => zipBlob.text(),
    arrayBuffer: () => zipBlob.arrayBuffer(),
    stream: () => zipBlob.stream(),
  });
  const helloFile = fc.files.find(
    (f) => f.relativePath === 'hello.zip/hello.txt',
  );
  const recompressFile = fc.files.find(
    (f) => f.relativePath === 'recompress.zip',
  );
  assert(helloFile);
  assert(recompressFile);

  const iumBuffer = await fc.toIum({
    getExtraFiles: () => {
      return [
        {
          relativePath: 'recompress_ium_extra.zip',
          data: zipBuffer,
          options: {
            unzip: {
              zipExtensions: [],
            },
          },
        },
        {
          relativePath: 'hello_ium_extra.zip',
          data: zipBuffer,
        },
      ];
    },
  });
  const fcZipBuffer = await fc.toZip();

  const iumZipReader = new ZipReader(new Uint8ArrayReader(iumBuffer));
  const fcZipReader = new ZipReader(new Uint8ArrayReader(fcZipBuffer));
  const iumEntries = await iumZipReader.getEntries();
  const fcEntries = await fcZipReader.getEntries();
  const helloIumZipEntry = iumEntries.find(
    (e) => e.filename === 'data/hello.zip',
  );
  const helloFcZipEntry = fcEntries.find((e) => e.filename === 'hello.zip');
  const recompressIumZipEntry = iumEntries.find(
    (e) => e.filename === 'recompress.zip',
  );
  const recompressFcZipEntry = fcEntries.find(
    (e) => e.filename === 'recompress.zip',
  );
  const recompressExtraIumZipEntry = iumEntries.find(
    (e) => e.filename === 'recompress_ium_extra.zip',
  );
  const helloExtraIumZipEntry = iumEntries.find(
    (e) => e.filename === 'hello_ium_extra.zip',
  );
  assert(helloIumZipEntry);
  assert(helloFcZipEntry);
  assert(recompressIumZipEntry);
  assert(recompressFcZipEntry);
  assert(recompressExtraIumZipEntry);
  assert(helloExtraIumZipEntry);

  expect(helloIumZipEntry.compressionMethod).toBe(0);
  expect(helloFcZipEntry.compressionMethod).toBe(0);
  expect(helloIumZipEntry.compressedSize).toBe(
    helloIumZipEntry.uncompressedSize,
  );
  expect(helloFcZipEntry.compressedSize).toBe(helloFcZipEntry.uncompressedSize);
  expect(zipBuffer.byteLength).toBe(helloIumZipEntry.compressedSize);
  expect(zipBuffer.byteLength).toBe(helloFcZipEntry.compressedSize);

  expect(recompressIumZipEntry.compressionMethod).not.toBe(0);
  expect(recompressFcZipEntry.compressionMethod).not.toBe(0);
  expect(recompressIumZipEntry.compressedSize).toBeLessThan(
    recompressIumZipEntry.uncompressedSize,
  );
  expect(recompressFcZipEntry.compressedSize).toBeLessThan(
    recompressFcZipEntry.uncompressedSize,
  );
  expect(zipBuffer.byteLength).toBe(recompressIumZipEntry.uncompressedSize);
  expect(zipBuffer.byteLength).toBe(recompressFcZipEntry.uncompressedSize);

  expect(recompressExtraIumZipEntry.compressionMethod).not.toBe(0);
  expect(recompressExtraIumZipEntry.compressedSize).toBeLessThan(
    recompressExtraIumZipEntry.uncompressedSize,
  );
  expect(zipBuffer.byteLength).toBe(
    recompressExtraIumZipEntry.uncompressedSize,
  );

  expect(helloExtraIumZipEntry.compressionMethod).toBe(0);
  expect(helloExtraIumZipEntry.compressedSize).toBe(
    helloExtraIumZipEntry.uncompressedSize,
  );
  expect(zipBuffer.byteLength).toBe(helloExtraIumZipEntry.compressedSize);

  const fcFromIum = await FileCollection.fromIum(iumBuffer);
  const fcFromZip = await FileCollection.fromZip(fcZipBuffer);

  const fcFromIumHelloFile = fcFromIum.files.find(
    (f) => f.relativePath === 'hello.zip/hello.txt',
  );
  const fcFromZipHelloFile = fcFromZip.files.find(
    (f) => f.relativePath === 'hello.zip/hello.txt',
  );
  assert(fcFromIumHelloFile);
  assert(fcFromZipHelloFile);

  await expect(fcFromIumHelloFile.text()).resolves.toBe('Hello World!');
  await expect(fcFromZipHelloFile.text()).resolves.toBe('Hello World!');

  const fcFromIumRecompressFile = fcFromIum.files.find(
    (f) => f.relativePath === 'recompress.zip',
  );
  // toZip / fromZip loss the source options, so the source is decompressed, and files added to the collection
  const fcFromZipRecompressSource = fcFromZip.sources.find(
    (f) => f.relativePath === 'recompress.zip',
  );
  assert(fcFromIumRecompressFile);
  assert(fcFromZipRecompressSource);

  const fcFromIumRecompressFileBuffer = new Uint8Array(
    await fcFromIumRecompressFile.arrayBuffer(),
  );
  const fcFromZipRecompressFileBuffer = new Uint8Array(
    await fcFromZipRecompressSource.arrayBuffer(),
  );

  expect(fcFromIumRecompressFileBuffer).toStrictEqual(zipBuffer);
  expect(fcFromZipRecompressFileBuffer).toStrictEqual(zipBuffer);

  const fcFromIumRecompressExtraFile = fcFromIum.files.find(
    (f) => f.relativePath === 'recompress_ium_extra.zip',
  );
  assert(fcFromIumRecompressExtraFile);

  const fcFromIumRecompressExtraFileBuffer = new Uint8Array(
    await fcFromIumRecompressExtraFile.arrayBuffer(),
  );

  expect(fcFromIumRecompressExtraFileBuffer).toStrictEqual(zipBuffer);

  const fcFromIumHelloExtraSource = fcFromIum.sources.find(
    (f) => f.relativePath === 'hello_ium_extra.zip',
  );
  assert(fcFromIumHelloExtraSource);

  const fcFromIumHelloExtraFileBuffer = new Uint8Array(
    await fcFromIumHelloExtraSource.arrayBuffer(),
  );

  expect(fcFromIumHelloExtraFileBuffer).toStrictEqual(zipBuffer);
});
