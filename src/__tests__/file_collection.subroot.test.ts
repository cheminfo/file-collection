import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.ts';

function mapRelativePath(item: { relativePath: string }) {
  return item.relativePath;
}

test('should support empty collection', () => {
  const collection = new FileCollection();
  const subCollection = collection.subroot('subPath');

  expect(subCollection.sources).toStrictEqual([]);
  expect(subCollection.files).toStrictEqual([]);
});

test('should support collection with no files at path', async () => {
  const collection = new FileCollection();
  await collection.appendText('foo/bar.txt', 'hello');
  const subCollection = collection.subroot('subPath');

  expect(subCollection.sources).toStrictEqual([]);
  expect(subCollection.files).toStrictEqual([]);
});

test('should include files at subPath', async () => {
  const collection = new FileCollection();
  await collection.appendText('a.txt', 'hello');
  await collection.appendText('foo/bar.txt', 'hello');
  await collection.appendText('subPath/baz.txt', 'world');
  await collection.appendText('subPath/bar.txt', 'world');
  const subCollection = collection.subroot('subPath');

  const sources = subCollection.sources.map(mapRelativePath).toSorted();
  const files = subCollection.files.map(mapRelativePath).toSorted();
  const expected = ['baz.txt', 'bar.txt'].toSorted();

  expect(sources).toStrictEqual(expected);
  expect(files).toStrictEqual(expected);
});

test('should not include "subPath" file', async () => {
  const collection = new FileCollection();
  await collection.appendText('subPath/baz.txt', 'world');
  await collection.appendText('subPath/bar.txt', 'world');
  await collection.appendText('subPath', 'world');
  const subCollection = collection.subroot('subPath');

  const sources = subCollection.sources.map(mapRelativePath).toSorted();
  const files = subCollection.files.map(mapRelativePath).toSorted();
  const expected = ['baz.txt', 'bar.txt'].toSorted();

  expect(sources).toStrictEqual(expected);
  expect(files).toStrictEqual(expected);
});
