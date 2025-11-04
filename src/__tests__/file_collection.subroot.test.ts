import { createReadStream } from 'node:fs';
import { join } from 'node:path';

import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { FileCollection } from '../FileCollection.ts';

function mapRelativePath(item: { relativePath: string }) {
  return item.relativePath;
}

describe.concurrent('basic', () => {
  it('should support empty collection', () => {
    const collection = new FileCollection();
    const subCollection = collection.subroot('subPath');

    expect(subCollection.sources).toStrictEqual([]);
    expect(subCollection.files).toStrictEqual([]);
  });

  it('should support collection with no files at path', async () => {
    const collection = new FileCollection();
    await collection.appendText('foo/bar.txt', 'hello');
    const subCollection = collection.subroot('subPath');

    expect(subCollection.sources).toStrictEqual([]);
    expect(subCollection.files).toStrictEqual([]);
  });

  it('should include files at subPath', async () => {
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

  it('should not include "subPath" file', async () => {
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

  it.each(['subPath/', '/subPath', './subPath', './subPath/'])(
    'should sanitize subPath',
    async (subPath) => {
      const collection = new FileCollection();
      await collection.appendText('subPath/baz.txt', 'world');
      await collection.appendText('subPath/bar.txt', 'world');
      await collection.appendText('subPath', 'world');
      const subCollection = collection.subroot(subPath);

      const sources = subCollection.sources.map(mapRelativePath).toSorted();
      const files = subCollection.files.map(mapRelativePath).toSorted();
      const expected = ['baz.txt', 'bar.txt'].toSorted();

      expect(sources).toStrictEqual(expected);
      expect(files).toStrictEqual(expected);
    },
  );
});

describe.sequential('web source', () => {
  let requestCounter: number;
  const server = setupServer(
    http.get('http://localhost/*', (ctx) => {
      const basePath = join(import.meta.dirname, 'webSource');
      const url = new URL(ctx.request.url);
      const stream = createReadStream(join(basePath, url.pathname));
      requestCounter++;

      return new HttpResponse(stream, { status: 200 });
    }),
  );

  beforeAll(() => server.listen());

  beforeEach(() => {
    requestCounter = 0;
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  // eslint-disable-next-line unicorn/consistent-function-scoping
  async function getCollectionWithMixedData() {
    const _self = new FileCollection();
    await _self.appendWebSource('http://localhost/self/index.json');

    const _other = new FileCollection();
    await _other.appendWebSource('http://localhost/other/index.json');

    const collection = new FileCollection();

    collection.appendFileCollection(_self, 'self');
    await collection.appendText('self/foo.txt', 'bar');

    collection.appendFileCollection(_other, 'other');
    await collection.appendText('other/bar.txt', 'baz');

    // ensure consume files for requestCounter
    await Promise.all(collection.files.map((f) => f.arrayBuffer()));

    return collection;
  }

  it('should works with mixed data sources', async () => {
    const collection = await getCollectionWithMixedData();
    const self = collection.subroot('self').alphabetical();
    const sources = self.sources.map(mapRelativePath);
    const files = self.files.map(mapRelativePath);
    const expected = ['dir1/a.txt', 'dir2/b.txt', 'foo.txt'].toSorted();

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should be able to serialize / deserialize mixed data sources with includeData: false', async () => {
    const collection = await getCollectionWithMixedData();
    const self = collection.subroot('self').alphabetical();
    const iumBuffer = await self.toIum({ includeData: false });

    expect(requestCounter).toBe(6); // web-sources (2) + entries (4)

    const ium = await FileCollection.fromIum(iumBuffer);
    ium.alphabetical();
    await Promise.all(ium.files.map((f) => f.arrayBuffer()));

    expect(requestCounter).toBe(8); // fetch entries (2 into webSource/self)

    const sources = ium.sources.map(mapRelativePath);
    const files = ium.files.map(mapRelativePath);
    const expected = ['dir1/a.txt', 'dir2/b.txt', 'foo.txt'].toSorted();

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should be able to serialize / deserialize mixed data sources with includeData: true', async () => {
    const collection = await getCollectionWithMixedData();
    const self = collection.subroot('self').alphabetical();
    const iumBuffer = await self.toIum({ includeData: true });

    expect(requestCounter).toBe(6); // web-sources (2) + entries (4)

    const ium = await FileCollection.fromIum(iumBuffer);
    ium.alphabetical();
    await Promise.all(ium.files.map((f) => f.arrayBuffer()));

    expect(requestCounter).toBe(6); // no fetch entries, there are embed into the archive

    const sources = ium.sources.map(mapRelativePath);
    const files = ium.files.map(mapRelativePath);
    const expected = ['dir1/a.txt', 'dir2/b.txt', 'foo.txt'].toSorted();

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });
});
