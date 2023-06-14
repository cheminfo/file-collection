import { test, expect } from 'vitest';

import { FileCollection } from '../FileCollection';

test('appendPath data folder', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendPath(new URL('data/', import.meta.url).pathname);

  const ium = await fileCollection.toIum();

  const newCollection = [...(await FileCollection.fromIum(ium))];
  expect(newCollection).toHaveLength(9);
  const text = await newCollection[0].text();
  expect(text).toStrictEqual('a');
});

test('appendPath dataUnzip', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendPath(
    new URL('dataUnzip/', import.meta.url).pathname,
  );
  expect(fileCollection.sources).toHaveLength(8);
  expect(fileCollection.files).toHaveLength(15);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);
  expect(newCollection.sources).toHaveLength(8);
  expect(newCollection.files).toHaveLength(15);
  const text = await newCollection.files[0].text();
  expect(text).toStrictEqual('c');
});

test.only('appendPath dataUnzip no unzip', async () => {
  const fileCollection = new FileCollection({ unzip: { zipExtensions: [] } });

  await fileCollection.appendPath(
    new URL('dataUnzip/', import.meta.url).pathname,
  );
  expect(fileCollection.sources).toHaveLength(8);
  expect(fileCollection.files).toHaveLength(8);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);
  expect(newCollection.sources).toHaveLength(8);
  expect(newCollection.files).toHaveLength(8);
  const array = new Uint8Array(
    await newCollection.files[0].arrayBuffer(),
  ).slice(0, 2);

  expect(array).toStrictEqual(new Uint8Array([80, 75])); // PK
});

test('appendPath dataUngzip', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendPath(
    new URL('dataUngzip/', import.meta.url).pathname,
  );
  expect(fileCollection.sources).toHaveLength(6);
  expect(fileCollection.files).toHaveLength(6);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);
  expect(newCollection.sources).toHaveLength(6);
  expect(newCollection.files).toHaveLength(6);
  const text = await newCollection.files[0].text();
  expect(text).toStrictEqual('a');

  expect(
    newCollection.sources.map((source) => source.relativePath),
  ).toStrictEqual([
    '/dataUngzip/dir1/a.txt',
    '/dataUngzip/dir1/b.txt.gz',
    '/dataUngzip/dir1/dir3/e.txt',
    '/dataUngzip/dir1/dir3/f.txt.gz',
    '/dataUngzip/dir2/c.txt',
    '/dataUngzip/dir2/d.txt',
  ]);
  expect(
    newCollection.files.map((source) => source.relativePath),
  ).toStrictEqual([
    '/dataUngzip/dir1/a.txt',
    '/dataUngzip/dir1/b.txt',
    '/dataUngzip/dir1/dir3/e.txt',
    '/dataUngzip/dir1/dir3/f.txt',
    '/dataUngzip/dir2/c.txt',
    '/dataUngzip/dir2/d.txt',
  ]);
});
