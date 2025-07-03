import { TextReader, Uint8ArrayWriter, ZipWriter } from '@zip.js/zip.js';
import { assert, describe, expect, test } from 'vitest';

describe('FileCollection.fromZip', async () => {
  const zipWriter = new ZipWriter(new Uint8ArrayWriter());
  await zipWriter.add('/hello.txt', new TextReader('Hello World!'));
  await zipWriter.add('/foo.txt', new TextReader('bar'));
  const zipBuffer = await zipWriter.close();

  test('should create FileCollection from zip', async () => {
    const { FileCollection } = await import('../FileCollection.js');
    const collection = await FileCollection.fromZip(zipBuffer);

    expect(collection.files.length).toBe(2);

    const hello = collection.files.find((f) => f.relativePath === '/hello.txt');
    const foo = collection.files.find((f) => f.relativePath === '/foo.txt');
    assert(hello);
    assert(foo);

    await expect(hello.text()).resolves.toBe('Hello World!');
    await expect(foo.text()).resolves.toBe('bar');
  });
});
