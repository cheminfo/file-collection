import {
  TextReader,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from '@zip.js/zip.js';
import { assert, describe, expect, it } from 'vitest';

import { fileItemsFromZip } from '../fileItemsFromZip.js';

describe('generated FileItem equal to original', async () => {
  // TODO: remove explicit type when https://github.com/gildas-lormeau/zip.js/pull/594 is released.
  const zipWriter = new ZipWriter<Uint8Array<ArrayBuffer>>(
    new Uint8ArrayWriter(),
  );

  const expectedText = 'Hello, World!';
  await zipWriter.add('test.txt', new TextReader(expectedText));

  // 32 Kb of easy compressible data (large repetitive pattern)
  const expectedBinary = new Uint8Array(2 ** 15);
  for (let i = 0; i < expectedBinary.length; i++) {
    expectedBinary[i] = Math.floor(i / 128);
  }
  await zipWriter.add('test.bin', new Uint8ArrayReader(expectedBinary));

  const zipBuffer = await zipWriter.close();

  it('zip file should have size inferior to expectedBinary', () => {
    expect(zipBuffer.byteLength).toBeLessThan(expectedBinary.byteLength);
  });

  it('.text() should return the original text', async () => {
    const collection = await arrayFromAsync(
      fileItemsFromZip(zipBuffer, crypto.randomUUID()),
    );

    const file = collection.find((f) => f.name === 'test.txt');
    assert(file, 'File not found in collection');

    const result = await file.text();

    expect(result).toBe(expectedText);
  });

  it('.arrayBuffer() should return the original binary', async () => {
    const collection = await arrayFromAsync(
      fileItemsFromZip(zipBuffer, crypto.randomUUID()),
    );

    const file = collection.find((f) => f.name === 'test.bin');
    assert(file, 'File not found in collection');

    const result = new Uint8Array(await file.arrayBuffer());

    expect(result).toStrictEqual(expectedBinary);
  });

  it('.stream() should stream the original binary', async () => {
    const collection = await arrayFromAsync(
      fileItemsFromZip(zipBuffer, crypto.randomUUID()),
    );

    const file = collection.find((f) => f.name === 'test.bin');
    assert(file, 'File not found in collection');

    const chunks: Uint8Array[] = [];
    for await (const chunk of file.stream()) {
      chunks.push(chunk);
    }
    const result = chunks.flatMap((chunk) => Array.from(chunk));

    expect(result).toStrictEqual(Array.from(expectedBinary));
  });
});

// Need Array.fromAsync only for this test file,
// This package will run in browsers and is available only in recent browsers.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync
// Middle 2026, we can use the right lib from ts to use it anywhere.
async function arrayFromAsync<T>(
  asyncIterable: AsyncIterable<T>,
): Promise<T[]> {
  const result: T[] = [];

  for await (const chunk of asyncIterable) {
    result.push(chunk);
  }

  return result;
}
