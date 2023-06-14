import { test, expect } from 'vitest';

import { FileCollection } from '../FileCollection';

test('FileCollection basic ium tests', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendText('hello.txt', 'Hello word');

  const ium = await fileCollection.toIum();

  const newCollection = [...(await FileCollection.fromIum(ium))];
  expect(newCollection).toHaveLength(1);
  expect(newCollection).toMatchObject([
    {
      relativePath: '/hello.txt',
      name: 'hello.txt',
      baseURL: 'ium:/',
    },
  ]);
  const text = await newCollection[0].text();
  expect(text).toStrictEqual('Hello word');
});
