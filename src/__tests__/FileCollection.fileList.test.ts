import { assert, expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.js';

test('FileCollection.appendFileList', async () => {
  const collection = new FileCollection();

  const file = new File(
    [new TextEncoder().encode('Hello World!')],
    'hello.txt',
    {
      type: 'plain/text',
    },
  );
  Object.assign(file, { webkitRelativePath: './path/hello.txt' });

  await collection.appendFileList([file]);

  const fileItem = collection.files[0];
  assert(fileItem);

  expect(fileItem.name).toBe('hello.txt');
  expect(fileItem.relativePath).toBe('path/hello.txt');
  await expect(fileItem.text()).resolves.toBe('Hello World!');
});
