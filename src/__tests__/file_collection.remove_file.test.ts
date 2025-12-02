import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.ts';

async function getFileCollection() {
  const zipWriter = new ZipWriter(new BlobWriter());
  await zipWriter.add('a.txt', new TextReader('a'));
  await zipWriter.add('b.txt', new TextReader('b'));
  const zipBlob = await zipWriter.close();

  const collection = new FileCollection();
  await collection.appendExtendedSource({
    uuid: crypto.randomUUID(),
    relativePath: 'hello.zip',
    name: 'hello.zip',
    text: zipBlob.text.bind(zipBlob),
    arrayBuffer: zipBlob.arrayBuffer.bind(zipBlob),
    stream: zipBlob.stream.bind(zipBlob),
  });

  expect(collection.sources).toHaveLength(1);
  expect(collection.files).toHaveLength(2);

  return collection;
}

test('should remove file and keep source', async () => {
  const collection = await getFileCollection();
  collection.removeFile('hello.zip/a.txt');

  expect(collection.sources).toHaveLength(1);
  expect(collection.files).toHaveLength(1);
});

test('should remove file and remove source', async () => {
  const collection = await getFileCollection();
  collection.removeFile('hello.zip/a.txt');
  collection.removeFile('hello.zip/b.txt');

  expect(collection.sources).toHaveLength(0);
  expect(collection.files).toHaveLength(0);
});

test('should throw if incoherent sources', async () => {
  const collection = await getFileCollection();
  collection.removeFile('hello.zip/a.txt');
  collection.sources.splice(0, 1);

  expect(() => collection.removeFile('hello.zip/b.txt')).toThrowError(Error);
});
