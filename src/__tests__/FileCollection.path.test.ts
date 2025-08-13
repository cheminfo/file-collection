import { join } from 'node:path';

import { assert, expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.ts';

test('appendPath data folder', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendPath(join(__dirname, 'data/'));

  const ium = await fileCollection.toIum();

  const newCollection = [...(await FileCollection.fromIum(ium))];

  expect(newCollection).toHaveLength(9);

  const firstFile = newCollection[0];
  assert(firstFile);
  const text = await firstFile.text();

  expect(text).toBe('a');
});

test('appendPath data folder and keepBasename', async () => {
  const fileCollection = await FileCollection.fromPath(
    join(__dirname, 'data/'),
    {},
    { keepBasename: true },
  );
  const relativePaths = fileCollection.files.map((file) => file.relativePath);

  expect(relativePaths).toStrictEqual([
    'data/dir1/a.txt',
    'data/dir1/b.txt',
    'data/dir1/dir3/e.txt',
    'data/dir1/dir3/f.txt',
    'data/dir2/c.txt',
    'data/dir2/d.txt',
    'data/dir3/a.MpT',
    'data/dir3/a.mpr',
    'data/dir3/a.mps',
  ]);
});

test('appendPath data folder and do not keepBasename', async () => {
  const fileCollection = await FileCollection.fromPath(
    join(__dirname, 'data/'),
    {},
    { keepBasename: false },
  );

  const relativePaths = fileCollection.files.map((file) => file.relativePath);

  expect(relativePaths).toStrictEqual([
    'dir1/a.txt',
    'dir1/b.txt',
    'dir1/dir3/e.txt',
    'dir1/dir3/f.txt',
    'dir2/c.txt',
    'dir2/d.txt',
    'dir3/a.MpT',
    'dir3/a.mpr',
    'dir3/a.mps',
  ]);
});

test('appendPath dataUnzip', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendPath(join(__dirname, 'dataUnzip/'));

  expect(fileCollection.sources).toHaveLength(8);
  expect(fileCollection.files).toHaveLength(15);

  const ium = await fileCollection.toIum();
  const newCollection = await FileCollection.fromIum(ium);

  expect(newCollection.sources).toHaveLength(8);
  expect(newCollection.files).toHaveLength(15);

  const firstFile = newCollection.files[0];
  assert(firstFile);
  const text = await firstFile.text();

  expect(text).toBe('c');

  const sourceUUIDs = fileCollection.files
    .map((file) => file.sourceUUID)
    .filter(Boolean);

  expect(sourceUUIDs).toHaveLength(15);
});

test('appendPath dataUnzip no unzip', async () => {
  const fileCollection = new FileCollection({ unzip: { zipExtensions: [] } });

  await fileCollection.appendPath(join(__dirname, 'dataUnzip/'));

  expect(fileCollection.sources).toHaveLength(8);
  expect(fileCollection.files).toHaveLength(8);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);

  expect(newCollection.sources).toHaveLength(8);
  expect(newCollection.files).toHaveLength(8);

  const firstFile = newCollection.files[0];
  assert(firstFile);
  const array = new Uint8Array(await firstFile.arrayBuffer()).slice(0, 2);

  expect(array).toStrictEqual(new Uint8Array([80, 75])); // PK
});

test('appendPath dataUngzip', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendPath(join(__dirname, 'dataUngzip/'));

  expect(fileCollection.sources).toHaveLength(6);
  expect(fileCollection.files).toHaveLength(6);

  expect(
    fileCollection.files.map((file) => ({
      relativePath: file.relativePath,
      parentRelativePath: file.parent?.relativePath,
    })),
  ).toStrictEqual([
    {
      relativePath: 'dataUngzip/dir1/a.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUngzip/dir1/b.txt.gz/b.txt',
      parentRelativePath: 'dataUngzip/dir1/b.txt.gz',
    },
    {
      relativePath: 'dataUngzip/dir1/dir3/e.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUngzip/dir1/dir3/f.txt.gz/f.txt',
      parentRelativePath: 'dataUngzip/dir1/dir3/f.txt.gz',
    },
    {
      relativePath: 'dataUngzip/dir2/c.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUngzip/dir2/d.txt',
      parentRelativePath: undefined,
    },
  ]);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);

  expect(newCollection.sources).toHaveLength(6);
  expect(newCollection.files).toHaveLength(6);

  const firstFile = newCollection.files[0];
  assert(firstFile);
  const text = await firstFile.text();

  expect(text).toBe('a');

  expect(
    newCollection.sources.map((source) => source.relativePath),
  ).toStrictEqual([
    'dataUngzip/dir1/a.txt',
    'dataUngzip/dir1/b.txt.gz',
    'dataUngzip/dir1/dir3/e.txt',
    'dataUngzip/dir1/dir3/f.txt.gz',
    'dataUngzip/dir2/c.txt',
    'dataUngzip/dir2/d.txt',
  ]);
  expect(newCollection.files.map((file) => file.relativePath)).toStrictEqual([
    'dataUngzip/dir1/a.txt',
    'dataUngzip/dir1/b.txt.gz/b.txt',
    'dataUngzip/dir1/dir3/e.txt',
    'dataUngzip/dir1/dir3/f.txt.gz/f.txt',
    'dataUngzip/dir2/c.txt',
    'dataUngzip/dir2/d.txt',
  ]);
});

test('appendPath dataUnzip with custom extension', async () => {
  const fileCollection = new FileCollection({
    unzip: { zipExtensions: ['zipped'] },
  });

  await fileCollection.appendPath(join(__dirname, 'dataUnzip/'));

  expect(fileCollection.sources).toHaveLength(8);
  expect(fileCollection.files).toHaveLength(9);

  expect(
    fileCollection.files.map((file) => ({
      relativePath: file.relativePath,
      parentRelativePath: file.parent?.relativePath,
    })),
  ).toStrictEqual([
    { relativePath: 'dataUnzip/data.zip', parentRelativePath: undefined },
    {
      relativePath: 'dataUnzip/dir1/a.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUnzip/dir1/b.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUnzip/dir1/dir3/e.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUnzip/dir1/dir3/f.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUnzip/dir2/c.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUnzip/dir2/d.txt',
      parentRelativePath: undefined,
    },
    {
      relativePath: 'dataUnzip/dir2/data.zipped/data/subDir1/c.txt',
      parentRelativePath: 'dataUnzip/dir2/data.zipped',
    },
    {
      relativePath: 'dataUnzip/dir2/data.zipped/data/subDir1/d.txt',
      parentRelativePath: 'dataUnzip/dir2/data.zipped',
    },
  ]);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);

  expect(newCollection.sources).toHaveLength(8);
  expect(newCollection.files).toHaveLength(9);

  expect(newCollection.files.map((file) => file.relativePath)).toStrictEqual([
    'dataUnzip/data.zip',
    'dataUnzip/dir1/a.txt',
    'dataUnzip/dir1/b.txt',
    'dataUnzip/dir1/dir3/e.txt',
    'dataUnzip/dir1/dir3/f.txt',
    'dataUnzip/dir2/c.txt',
    'dataUnzip/dir2/d.txt',
    'dataUnzip/dir2/data.zipped/data/subDir1/c.txt',
    'dataUnzip/dir2/data.zipped/data/subDir1/d.txt',
  ]);
});

test('appendPath data with keep dotfiles', async () => {
  const fileCollection = new FileCollection({
    filter: { ignoreDotfiles: false },
  });

  await fileCollection.appendPath(join(__dirname, 'data/'));

  expect(fileCollection.sources).toHaveLength(11);
  expect(fileCollection.files).toHaveLength(11);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);

  expect(newCollection.sources).toHaveLength(11);
  expect(newCollection.files).toHaveLength(11);

  expect(newCollection.files.map((file) => file.relativePath)).toStrictEqual([
    'data/.dotFile',
    'data/.dotFolder/a.txt',
    'data/dir1/a.txt',
    'data/dir1/b.txt',
    'data/dir1/dir3/e.txt',
    'data/dir1/dir3/f.txt',
    'data/dir2/c.txt',
    'data/dir2/d.txt',
    'data/dir3/a.MpT',
    'data/dir3/a.mpr',
    'data/dir3/a.mps',
  ]);
});

test('appendPath data with keep duplicates', async () => {
  const fileCollection = new FileCollection({});

  await fileCollection.appendPath(join(__dirname, 'duplicates/'));

  expect(fileCollection.sources).toHaveLength(3);
  expect(fileCollection.files).toHaveLength(3);

  expect(fileCollection.files.map((file) => file.relativePath)).toStrictEqual([
    'duplicates/a.txt',
    'duplicates/a.txt.gz/a.txt',
    'duplicates/a.txt.zip/a.txt',
  ]);

  const ium = await fileCollection.toIum();

  const newCollection = await FileCollection.fromIum(ium);

  expect(newCollection.sources).toHaveLength(3);
  expect(newCollection.files).toHaveLength(3);

  expect(newCollection.files.map((file) => file.relativePath)).toStrictEqual([
    'duplicates/a.txt',
    'duplicates/a.txt.gz/a.txt',
    'duplicates/a.txt.zip/a.txt',
  ]);
});
