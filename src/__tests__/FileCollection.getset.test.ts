import { test, expect } from 'vitest';

import { FileCollection } from '../FileCollection';

test('FileCollection get set', async () => {
  const fileCollection = new FileCollection();

  const value = {
    hello: 'world',
    array: Uint8Array.from([1, 2, 3]),
  };

  await fileCollection.set('hello', value);
  // should not throw an error
  value.hello = 'world2';
  await fileCollection.set('hello', value);

  expect(fileCollection.files).toHaveLength(1);
  expect(fileCollection.sources).toHaveLength(1);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);
  expect(newCollection.files).toHaveLength(1);
  expect(newCollection.sources).toHaveLength(1);

  const newValue = await newCollection.get('hello');
  expect(newValue).toStrictEqual({
    hello: 'world2',
    array: [1, 2, 3],
  });
});
