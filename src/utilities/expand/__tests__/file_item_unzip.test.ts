import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { FifoLogger } from 'fifo-logger';
import { expect, test } from 'vitest';

import type { FileItem } from '../../../FileItem.ts';
import { expandAndFilter } from '../expandAndFilter.ts';
import { fileItemUnzip } from '../fileItemUnzip.ts';

const payload = 'Hello 🫱🏿‍🫲🏻, World! 👋';

test('should throw if no sourceUUID is provided', async () => {
  const zipWriter = new ZipWriter(new BlobWriter());
  await zipWriter.add('a.txt', new TextReader(payload));
  const zipBlob = await zipWriter.close();

  const file: FileItem = {
    sourceUUID: '',
    name: 'test.zip',
    relativePath: 'test.zip',
    stream: zipBlob.stream.bind(zipBlob),
    arrayBuffer: zipBlob.arrayBuffer.bind(zipBlob),
    text: zipBlob.text.bind(zipBlob),
  };

  await expect(fileItemUnzip(file)).rejects.toThrowError(Error);
});

test('should warn if not a zip payload', async () => {
  const blob = new Blob([payload], { type: 'text/plain' });

  const file: FileItem = {
    sourceUUID: crypto.randomUUID(),
    name: 'test.zip',
    relativePath: 'test.zip',
    stream: blob.stream.bind(blob),
    arrayBuffer: blob.arrayBuffer.bind(blob),
    text: blob.text.bind(blob),
  };
  const logger = new FifoLogger();

  await expect(fileItemUnzip(file, { logger })).resolves.toStrictEqual([file]);
  expect(logger.getLogs().map((l) => l.message)).toStrictEqual([
    'Could not unzip the following file: test.zip',
  ]);
});

test('should support recursive unzip', async () => {
  const level2ZipWriter = new ZipWriter(new BlobWriter());
  await level2ZipWriter.add('a.txt', new TextReader(payload));
  await level2ZipWriter.add('b.txt', new TextReader(payload));
  const level2ZipBlob = await level2ZipWriter.close();

  const level1ZipWriter = new ZipWriter(new BlobWriter());
  await level1ZipWriter.add('level2.zip', new BlobReader(level2ZipBlob));
  const level1ZipBlob = await level1ZipWriter.close();

  const level0ZipWriter = new ZipWriter(new BlobWriter());
  await level0ZipWriter.add('level1.zip', new BlobReader(level1ZipBlob));
  const level0ZipBlob = await level0ZipWriter.close();

  const file: FileItem = {
    sourceUUID: crypto.randomUUID(),
    name: 'level0.zip',
    relativePath: 'level0.zip',
    stream: level0ZipBlob.stream.bind(level0ZipBlob),
    arrayBuffer: level0ZipBlob.arrayBuffer.bind(level0ZipBlob),
    text: level0ZipBlob.text.bind(level0ZipBlob),
  };

  const files = await fileItemUnzip(file);
  const filesPath = files.map((f) => f.relativePath).toSorted();
  const expectedPaths = [
    'level0.zip/level1.zip/level2.zip/a.txt',
    'level0.zip/level1.zip/level2.zip/b.txt',
  ];

  expect(filesPath).toStrictEqual(expectedPaths);
});

test('should support unzip not recursive', async () => {
  const level2ZipWriter = new ZipWriter(new BlobWriter());
  await level2ZipWriter.add('a.txt', new TextReader(payload));
  await level2ZipWriter.add('b.txt', new TextReader(payload));
  const level2ZipBlob = await level2ZipWriter.close();

  const level1ZipWriter = new ZipWriter(new BlobWriter());
  await level1ZipWriter.add('level2.zip', new BlobReader(level2ZipBlob));
  const level1ZipBlob = await level1ZipWriter.close();

  const level0ZipWriter = new ZipWriter(new BlobWriter());
  await level0ZipWriter.add('level1.zip', new BlobReader(level1ZipBlob));
  const level0ZipBlob = await level0ZipWriter.close();

  const file: FileItem = {
    sourceUUID: crypto.randomUUID(),
    name: 'level0.zip',
    relativePath: 'level0.zip',
    stream: level0ZipBlob.stream.bind(level0ZipBlob),
    arrayBuffer: level0ZipBlob.arrayBuffer.bind(level0ZipBlob),
    text: level0ZipBlob.text.bind(level0ZipBlob),
  };

  const files = await fileItemUnzip(file, { unzip: { recursive: false } });
  const filesPath = files.map((f) => f.relativePath).toSorted();
  const expectedPaths = ['level0.zip/level1.zip'];

  expect(filesPath).toStrictEqual(expectedPaths);
});

test('should filter files', async () => {
  const level2ZipWriter = new ZipWriter(new BlobWriter());
  await level2ZipWriter.add('a.txt', new TextReader(payload));
  await level2ZipWriter.add('b.txt', new TextReader(payload));
  const level2ZipBlob = await level2ZipWriter.close();

  const level1ZipWriter = new ZipWriter(new BlobWriter());
  await level1ZipWriter.add('.level2.zip', new BlobReader(level2ZipBlob));
  await level1ZipWriter.add('a.txt', new TextReader(payload));
  await level1ZipWriter.add('b.txt', new TextReader(payload));
  const level1ZipBlob = await level1ZipWriter.close();

  const level0ZipWriter = new ZipWriter(new BlobWriter());
  await level0ZipWriter.add('level1.zip', new BlobReader(level1ZipBlob));
  const level0ZipBlob = await level0ZipWriter.close();

  const file: FileItem = {
    sourceUUID: crypto.randomUUID(),
    name: 'level0.zip',
    relativePath: 'level0.zip',
    stream: level0ZipBlob.stream.bind(level0ZipBlob),
    arrayBuffer: level0ZipBlob.arrayBuffer.bind(level0ZipBlob),
    text: level0ZipBlob.text.bind(level0ZipBlob),
  };

  const files = await fileItemUnzip(file, {
    unzip: { recursive: true },
    filter: { ignoreDotfiles: true },
  });
  const filesPath = files.map((f) => f.relativePath).toSorted();
  const expectedPaths = [
    'level0.zip/level1.zip/a.txt',
    'level0.zip/level1.zip/b.txt',
    // 'level0.zip/level1.zip/.level2.zip/a.txt', filtered because of ignoreDotfiles
    // 'level0.zip/level1.zip/.level2.zip/b.txt', filtered because of ignoreDotfiles
  ];

  expect(filesPath).toStrictEqual(expectedPaths);
});

test('should filter with expandAndFilter', async () => {
  const zipWriter = new ZipWriter(new BlobWriter());
  await zipWriter.add('a.txt', new TextReader(payload));
  const zipBlob = await zipWriter.close();

  const file: FileItem = {
    sourceUUID: crypto.randomUUID(),
    name: 'level0.zip',
    relativePath: '.level0.zip',
    stream: zipBlob.stream.bind(zipBlob),
    arrayBuffer: zipBlob.arrayBuffer.bind(zipBlob),
    text: zipBlob.text.bind(zipBlob),
  };

  const files = await expandAndFilter(file, {
    unzip: { recursive: true },
    filter: { ignoreDotfiles: true },
  });
  const filesPath = files.map((f) => f.relativePath).toSorted();

  expect(filesPath).toStrictEqual([]);
});
