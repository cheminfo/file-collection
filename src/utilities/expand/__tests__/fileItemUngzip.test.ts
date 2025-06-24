import { ReadableStream } from 'node:stream/web';
import { gzipSync } from 'node:zlib';

import { test, expect, describe } from 'vitest';

import type { FileItem } from '../../../FileItem.js';
import { fileItemUngzip } from '../fileItemUngzip.js';

describe('fileItemUngzip.ts', () => {
  const payload = new TextEncoder().encode('Hello 🫱🏿‍🫲🏻, World! 👋');

  const file: FileItem = {
    sourceUUID: crypto.randomUUID(),
    name: 'test.gz',
    relativePath: 'test',
    // @ts-expect-error incompatible types for Web Stream from Node.js and browser
    stream() {
      return ReadableStream.from([payload]);
    },
    arrayBuffer() {
      return new Response(this.stream()).arrayBuffer();
    },
    text() {
      return new Response(this.stream()).text();
    },
  };

  const gzipPayload = gzipSync(payload);
  const gzipFile: FileItem = {
    sourceUUID: crypto.randomUUID(),
    name: 'test.gz',
    relativePath: 'test',
    // @ts-expect-error incompatible types for Web Stream from Node.js and browser
    stream: () => {
      return ReadableStream.from([gzipPayload]);
    },
    arrayBuffer() {
      return new Response(this.stream()).arrayBuffer();
    },
    text() {
      return new Response(this.stream()).text();
    },
  };

  test('should return the same file item if it is not gzip', async () => {
    const result = await fileItemUngzip(file);
    expect(result).toBe(file);
  });

  test('ungzip gzip stream should be equal to original payload', async () => {
    const ungziped = await fileItemUngzip(gzipFile);

    const fileStreamReader = ungziped.stream().getReader();
    const ungzipedStreamReader = file.stream().getReader();

    const fileChunks: Uint8Array[] = [];
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await fileStreamReader.read();
      if (done) break;
      fileChunks.push(value);
    }
    const ungzippedChunks: Uint8Array[] = [];
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await ungzipedStreamReader.read();
      if (done) break;
      ungzippedChunks.push(value);
    }

    const flatFileChunks = fileChunks.flatMap((v) => Array.from(v));
    const flatUngzippedChunks = ungzippedChunks.flatMap((v) => Array.from(v));

    expect(flatUngzippedChunks).toStrictEqual(flatFileChunks);
  });

  test('ungzip gzip arrayBuffer should be equal to original payload', async () => {
    const ungziped = await fileItemUngzip(gzipFile);

    const fileBuffer = await file.arrayBuffer();
    const ungzipedBuffer = await ungziped.arrayBuffer();

    const fileArray = Array.from(new Uint8Array(fileBuffer));
    const ungzipedArray = Array.from(new Uint8Array(ungzipedBuffer));

    expect(ungzipedArray).toStrictEqual(fileArray);
  });

  test('ungzip gzip text should be equal to original payload', async () => {
    const ungziped = await fileItemUngzip(gzipFile);

    const fileText = await file.text();
    const ungzipedText = await ungziped.text();

    expect(ungzipedText).toStrictEqual(fileText);
  });
});
