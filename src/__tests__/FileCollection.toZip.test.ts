import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';

import { Uint8ArrayReader, ZipReader } from '@zip.js/zip.js';
import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.js';

test('Properly repack with external sources', async () => {
  const url = 'https://image-js.github.io/image-dataset-demo/biology/';
  const fileCollection = await new FileCollection().appendWebSource(url);

  const zip = await fileCollection.toZip();
  const zipReader = new ZipReader(new Uint8ArrayReader(zip));
  const entries = await zipReader.getEntries();

  expect(entries).toHaveLength(3);
});

test('properly repack with recursive zip', async () => {
  const stream = createReadStream(
    join(import.meta.dirname, 'dataRecursiveZip/data.zip'),
  );
  const webStream = Readable.toWeb(stream);
  const fileCollection = await FileCollection.fromZip(webStream);

  const zip = await fileCollection.toZip();
  const zipReader = new ZipReader(new Uint8ArrayReader(zip));
  const entries = await zipReader.getEntries();

  expect(entries).toHaveLength(1);
});
