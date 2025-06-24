import { assert, expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.ts';
import type { FileItem } from '../FileItem.ts';

test('webSourceURL and save with data', async () => {
  const url = 'https://image-js.github.io/image-dataset-demo/biology/';
  const fileCollection = new FileCollection();
  await fileCollection.appendWebSource(url);

  expect(fileCollection.files.length).toBeGreaterThan(2);
  const png = fileCollection.files.find((file) =>
    file.name.endsWith('.png'),
  ) as FileItem;
  const first = await png.arrayBuffer();

  expect(Array.from(Buffer.from(first)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);

  const ium = await fileCollection.toIum();

  const fileCollection2 = await FileCollection.fromIum(ium);
  expect(fileCollection2.files.length).toBeGreaterThan(2);
  const file = fileCollection2.files[0];
  assert(file);
  const first2 = await file.arrayBuffer();
  expect(Array.from(Buffer.from(first2)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);
});

test('webSourceURL and save original link', async () => {
  const url = 'https://image-js.github.io/image-dataset-demo/biology/';
  const fileCollection = new FileCollection();
  await fileCollection.appendWebSource(url);

  expect(fileCollection.files.length).toBeGreaterThan(2);
  const png = fileCollection.files.find((file) =>
    file.name.endsWith('.png'),
  ) as FileItem;
  const first = await png.arrayBuffer();

  expect(Array.from(Buffer.from(first)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);

  const ium = await fileCollection.toIum({ includeData: false });

  const fileCollection2 = await FileCollection.fromIum(ium);
  expect(fileCollection2.files.length).toBeGreaterThan(2);
  const file = fileCollection2.files[0];
  assert(file);
  const first2 = await file.arrayBuffer();
  expect(Array.from(Buffer.from(first2)).slice(0, 4)).toStrictEqual([
    137,
    80,
    78,
    71, // PNG file
  ]);
});
