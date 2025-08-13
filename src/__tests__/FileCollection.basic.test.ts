import { assert, expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.ts';

test('FileCollection basic ium tests', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendText('hello.txt', 'Hello word');

  const ium = await fileCollection.toIum();

  const newCollection = [...(await FileCollection.fromIum(ium))];

  expect(newCollection).toHaveLength(1);
  expect(newCollection).toMatchObject([
    {
      relativePath: 'hello.txt',
      name: 'hello.txt',
      baseURL: 'ium:/',
    },
  ]);

  const firstFile = newCollection[0];
  assert(firstFile);
  const text = await firstFile.text();

  expect(text).toBe('Hello word');
});
