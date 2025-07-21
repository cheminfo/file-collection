import { join } from 'node:path';

import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.js';

test('Should filter files', async () => {
  const collection = await FileCollection.fromPath(
    join(import.meta.dirname, 'data'),
    undefined,
    { keepBasename: false },
  );
  const filtered = collection
    .filter((file) => file.relativePath.startsWith('dir1/'))
    .alphabetical();

  const result = filtered.files.map((f) => f.relativePath);

  expect(result).toStrictEqual([
    'dir1/a.txt',
    'dir1/b.txt',
    'dir1/dir3/e.txt',
    'dir1/dir3/f.txt',
  ]);
});
