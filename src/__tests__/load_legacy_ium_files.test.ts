import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';

import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.js';
import { getZipReader } from '../zip/get_zip_reader.js';

/**
 * Run once on v5.2.2 to generate the legacy archive, pre-fix path encoding for filesystems.
 * This test must not be edited or removed.
 */
test('Generate a ium archive with problematic characters', async () => {
  const fc = new FileCollection();

  const relativePath = String.raw`deep/path/with special characters/foo/\bar/08:50:12/[baz]/*/5 < 10 > 5/1=1/file.txt#anchor removed`;
  await fc.appendArrayBuffer(
    relativePath,
    new TextEncoder().encode('Hello World!'),
  );

  const iumBuffer = await fc.toIum();
  const fc2 = await FileCollection.fromIum(iumBuffer);

  const url = new URL(relativePath, 'ium:/');

  // relativePath is stable across versions.
  expect(fc2.sources[0]?.relativePath).toBe(url.pathname.slice(1));
  expect(fc2.sources[0]?.relativePath).toBe(
    // Note: ium path encoding can be url encoded
    // it contains forbidden characters for filesystem paths like `:` or `*`
    // chars after `#` are removed
    String.raw`deep/path/with%20special%20characters/foo/\bar/08:50:12/[baz]/*/5%20%3C%2010%20%3E%205/1=1/file.txt`,
  );

  // fails once the file is written into the repository
  await expect(
    writeFile(join(import.meta.dirname, 'v5.2.2.ium.zip'), iumBuffer, {
      flag: 'wx',
    }),
  ).rejects.toThrowError(/EEXIST: file already exists.*/);
});

test('Is able to unpack a legacy ium archive', async () => {
  const ium = await FileCollection.fromIum(
    Readable.toWeb(
      createReadStream(join(import.meta.dirname, 'v5.2.2.ium.zip')),
    ),
  );

  // Check fromIum had properly read the archive,
  // with relativePath is stable across versions.
  expect(ium.sources[0]?.relativePath).toBe(
    String.raw`deep/path/with%20special%20characters/foo/\bar/08:50:12/[baz]/*/5%20%3C%2010%20%3E%205/1=1/file.txt`,
  );

  // Check we have the data.
  await expect(ium.files[0]?.text()).resolves.toBe('Hello World!');

  const zipReader = getZipReader(
    Readable.toWeb(
      createReadStream(join(import.meta.dirname, 'v5.2.2.ium.zip')),
    ),
  );

  const entries = await zipReader.getEntries();
  const entry = entries.find((entry) => entry.filename !== '/index.json');

  // legacy ium path encoding was not safe for filesystems
  expect(entry?.filename).toBe(
    String.raw`/data/deep/path/with%20special%20characters/foo/\bar/08:50:12/[baz]/*/5%20%3C%2010%20%3E%205/1=1/file.txt`,
  );
});
