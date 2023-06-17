import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection';

test('webSourceURL and save with data', async () => {
  const url = 'https://image-js.github.io/image-dataset-demo/';
  const fileCollection = new FileCollection();
  await fileCollection.appendWebSourceURL(url);

  expect(fileCollection.files).toHaveLength(5);
  const first = await fileCollection.files[0].arrayBuffer();

  expect(Array.from(Buffer.from(first)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);

  const ium = await fileCollection.toIum();

  const fileCollection2 = await FileCollection.fromIum(ium);
  expect(fileCollection2.files).toHaveLength(5);
  const first2 = await fileCollection2.files[0].arrayBuffer();
  expect(Array.from(Buffer.from(first2)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);
});

test.only('webSourceURL and save original link', async () => {
  const url = 'https://image-js.github.io/image-dataset-demo/';
  const fileCollection = new FileCollection();
  await fileCollection.appendWebSourceURL(url);

  expect(fileCollection.files).toHaveLength(5);
  const first = await fileCollection.files[0].arrayBuffer();

  expect(Array.from(Buffer.from(first)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);

  const ium = await fileCollection.toIum({ includeData: false });

  const fileCollection2 = await FileCollection.fromIum(ium);
  expect(fileCollection2.files).toHaveLength(5);
  const first2 = await fileCollection2.files[0].arrayBuffer();
  expect(Array.from(Buffer.from(first2)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);
});
