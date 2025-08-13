import { createReadStream, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';

import { TextReader, Uint8ArrayWriter, ZipWriter } from '@zip.js/zip.js';
import { assert, describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.js';

describe('FileCollection.fromZip', async () => {
  const zipWriter = new ZipWriter(new Uint8ArrayWriter());
  await zipWriter.add('/hello.txt', new TextReader('Hello World!'));
  await zipWriter.add('/foo.txt', new TextReader('bar'));
  const zipBuffer = await zipWriter.close();

  it('should create FileCollection from zip', async () => {
    const collection = await FileCollection.fromZip(zipBuffer);

    expect(collection.files).toHaveLength(2);

    const hello = collection.files.find((f) => f.relativePath === 'hello.txt');
    const foo = collection.files.find((f) => f.relativePath === 'foo.txt');
    assert(hello);
    assert(foo);

    await expect(hello.text()).resolves.toBe('Hello World!');
    await expect(foo.text()).resolves.toBe('bar');
  });

  it('simple data.zip', async () => {
    const fileCollection = await FileCollection.fromZip(
      new Uint8Array(readFileSync(join(import.meta.dirname, 'data.zip'))),
    );

    expect(
      Array.from(fileCollection.files.map((a) => a.relativePath)),
    ).toStrictEqual([
      'data/dir1/a.txt',
      'data/dir1/b.txt',
      'data/dir1/dir3/e.txt',
      'data/dir1/dir3/f.txt',
      'data/dir2/c.txt',
      'data/dir2/d.txt',
    ]);

    const first = fileCollection.files.at(0);
    assert(first);

    await expect(first.text()).resolves.toBe('a');

    const last = fileCollection.files.at(-1);
    assert(last);

    await expect(last.text()).resolves.toBe('d');
  });

  it('should support Node.js Buffer', async () => {
    const buffer = await readFile(join(import.meta.dirname, 'data.zip'));

    await expect(FileCollection.fromZip(buffer)).resolves.toBeInstanceOf(
      FileCollection,
    );
  });

  it('should support Node.js Buffer ArrayBuffer', async () => {
    const buffer = await readFile(join(import.meta.dirname, 'data.zip'));

    await expect(FileCollection.fromZip(buffer.buffer)).resolves.toBeInstanceOf(
      FileCollection,
    );
  });

  it('should support Readable.toWeb', async () => {
    const stream = createReadStream(join(import.meta.dirname, 'data.zip'));

    await expect(
      FileCollection.fromZip(Readable.toWeb(stream)),
    ).resolves.toBeInstanceOf(FileCollection);
  });
});
