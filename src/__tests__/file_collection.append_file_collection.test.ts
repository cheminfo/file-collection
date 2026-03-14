import { createReadStream } from 'node:fs';
import { join } from 'node:path';

import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { assert, describe, expect, it } from 'vitest';

import { FileCollection } from '../index.ts';

function isHello(item: { relativePath: string }) {
  return item.relativePath === 'hello.txt';
}

function isFoo(item: { relativePath: string }) {
  return item.relativePath === 'foo.txt';
}

function mapRelativePath(item: { relativePath: string }) {
  return item.relativePath;
}

describe('same root', () => {
  it('should keep empty if both are empty', () => {
    const self = new FileCollection();
    const other = new FileCollection();

    self.appendFileCollection(other);

    expect(self.sources).toHaveLength(0);
    expect(self.files).toHaveLength(0);
  });

  it('should append source from other file collection', async () => {
    const self = new FileCollection();
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.appendFileCollection(other);

    expect(self.sources).toHaveLength(2);
    expect(self.files).toHaveLength(2);

    const helloSource = self.sources.find(isHello);
    const helloFile = self.files.find(isHello);
    const fooSource = self.sources.find(isFoo);
    const fooFile = self.files.find(isFoo);
    assert(helloSource && helloFile && fooSource && fooFile);

    await expect(helloSource.text()).resolves.toBe('Hello World!');
    await expect(helloFile.text()).resolves.toBe('Hello World!');
    await expect(fooSource.text()).resolves.toBe('bar');
    await expect(fooFile.text()).resolves.toBe('bar');
  });

  it('should clone appended files and sources', async () => {
    const self = new FileCollection();
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.appendFileCollection(other);

    expect(self.sources.find(isHello)).not.toBe(other.sources.find(isHello));
    expect(self.files.find(isHello)).not.toBe(other.files.find(isHello));
    expect(self.sources.find(isFoo)).not.toBe(other.sources.find(isFoo));
    expect(self.files.find(isFoo)).not.toBe(other.files.find(isFoo));
  });

  it('should keep self files and sources', async () => {
    const self = new FileCollection();
    await self.appendText('bar.txt', 'foo');
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.appendFileCollection(other);

    const sources = self.sources.map(mapRelativePath);
    const files = self.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const expected = ['bar.txt', 'foo.txt', 'hello.txt'];

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should not touch files or sources in other', async () => {
    const self = new FileCollection();
    await self.appendText('bar.txt', 'foo');
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.appendFileCollection(other);

    const sources = other.sources.map(mapRelativePath);
    const files = other.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const expected = ['foo.txt', 'hello.txt'];

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should throw error on duplicate files', async () => {
    const self = new FileCollection();
    await self.appendText('hello.txt', 'Hello World!');
    const other = new FileCollection();
    await other.appendText('hello.txt', '!World Hello');

    expect(() => self.appendFileCollection(other)).toThrow(Error);
  });
});

describe('at subPath', () => {
  it('should keep empty if both are empty', () => {
    const self = new FileCollection();
    const other = new FileCollection();

    self.appendFileCollection(other, 'subPath');

    expect(self.sources).toHaveLength(0);
    expect(self.files).toHaveLength(0);
  });

  it('should append source from other file collection', async () => {
    const self = new FileCollection();
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.appendFileCollection(other, 'subPath');

    expect(self.sources).toHaveLength(2);
    expect(self.files).toHaveLength(2);

    const sources = self.sources.map(mapRelativePath);
    const files = self.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const expected = ['subPath/foo.txt', 'subPath/hello.txt'];

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should keep self files and sources', async () => {
    const self = new FileCollection();
    await self.appendText('bar.txt', 'foo');
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.appendFileCollection(other, 'subPath');

    const sources = self.sources.map(mapRelativePath);
    const files = self.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const expected = ['bar.txt', 'subPath/foo.txt', 'subPath/hello.txt'];

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should not touch files or sources in other', async () => {
    const self = new FileCollection();
    await self.appendText('bar.txt', 'foo');
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.appendFileCollection(other, 'subPath');

    const sources = other.sources.map(mapRelativePath);
    const files = other.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const expected = ['foo.txt', 'hello.txt'];

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should throw error on duplicate files', async () => {
    const self = new FileCollection();
    await self.appendText('subPath/hello.txt', 'Hello World!');
    const other = new FileCollection();
    await other.appendText('hello.txt', '!World Hello');

    expect(() => self.appendFileCollection(other, 'subPath')).toThrow(Error);
  });

  it('should support recursive zip', async () => {
    const zipWriterLevel3 = new ZipWriter(new BlobWriter());
    await zipWriterLevel3.add('a.txt', new TextReader('Recursive'));
    await zipWriterLevel3.add('b.txt', new TextReader('Recursive'));
    const zipBlobLevel3 = await zipWriterLevel3.close();

    const zipWriterLevel2 = new ZipWriter(new BlobWriter());
    await zipWriterLevel2.add('level3.zip', new BlobReader(zipBlobLevel3), {
      compressionMethod: 0,
    });
    const zipBlobLevel2 = await zipWriterLevel2.close();

    const zipWriterLevel1 = new ZipWriter(new BlobWriter());
    await zipWriterLevel1.add('level2.zip', new BlobReader(zipBlobLevel2), {
      compressionMethod: 0,
    });
    const zipBlobLevel1 = await zipWriterLevel1.close();

    const zipWriter = new ZipWriter(new BlobWriter());
    await zipWriter.add('level1.zip', new BlobReader(zipBlobLevel1), {
      compressionMethod: 0,
    });
    await zipWriter.add('level2.zip', new BlobReader(zipBlobLevel2), {
      compressionMethod: 0,
    });
    await zipWriter.add('level3.zip', new BlobReader(zipBlobLevel3), {
      compressionMethod: 0,
    });
    const zipBlob = await zipWriter.close();

    const self = new FileCollection();
    const other = await FileCollection.fromZip(zipBlob);
    self.appendFileCollection(other, 'subPath');

    const otherSources = other.sources.map(mapRelativePath);
    const otherFiles = other.files.map(mapRelativePath);
    otherSources.sort();
    otherFiles.sort();

    // reminder of what looks like other, with fromZip and recursive
    const otherSourcesExpected = ['level1.zip', 'level2.zip', 'level3.zip'];
    const otherFilesExpected = [
      'level1.zip/level2.zip/level3.zip/a.txt',
      'level1.zip/level2.zip/level3.zip/b.txt',
      'level2.zip/level3.zip/a.txt',
      'level2.zip/level3.zip/b.txt',
      'level3.zip/a.txt',
      'level3.zip/b.txt',
    ];

    expect(otherSources).toStrictEqual(otherSourcesExpected);
    expect(otherFiles).toStrictEqual(otherFilesExpected);

    // check the self-instance after merge
    const sources = self.sources.map(mapRelativePath);
    const files = self.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const sourcesExpected = [
      'subPath/level1.zip',
      'subPath/level2.zip',
      'subPath/level3.zip',
    ];
    const filesExpected = [
      'subPath/level1.zip/level2.zip/level3.zip/a.txt',
      'subPath/level1.zip/level2.zip/level3.zip/b.txt',
      'subPath/level2.zip/level3.zip/a.txt',
      'subPath/level2.zip/level3.zip/b.txt',
      'subPath/level3.zip/a.txt',
      'subPath/level3.zip/b.txt',
    ];

    expect(sources).toStrictEqual(sourcesExpected);
    expect(files).toStrictEqual(filesExpected);
  });

  it('should works with complete scenario imply Web-Source and complete serialization processus', async (testCtx) => {
    let filesGet = 0;
    const server = setupServer(
      http.get('http://localhost/*', async ({ request }) => {
        const serverRoot = join(import.meta.dirname, 'webSource');
        const pathname = join(serverRoot, new URL(request.url).pathname);
        const stream = createReadStream(pathname);
        filesGet++;
        return new HttpResponse(stream, { status: 200 });
      }),
    );
    server.listen();
    testCtx.onTestFinished(() => server.close());

    const self = new FileCollection();
    await self.appendWebSource('http://localhost/self/index.json');
    await self.appendText('self.txt', 'Self Hello World!');
    self.alphabetical();

    {
      const sourcesData = await Promise.all(self.sources.map((s) => s.text()));
      const filesData = await Promise.all(self.files.map((f) => f.text()));
      const expectedData = ['a', 'b', 'Self Hello World!'];

      // fetch the web source + 2 file entries
      expect(filesGet).toBe(3);
      expect(sourcesData).toStrictEqual(expectedData);
      expect(filesData).toStrictEqual(expectedData);
    }

    const other = new FileCollection();
    await other.appendWebSource('http://localhost/other/index.json');
    await other.appendText('other.txt', 'Other Hello World!');
    other.alphabetical();

    {
      const sourcesData = await Promise.all(other.sources.map((s) => s.text()));
      const filesData = await Promise.all(other.files.map((f) => f.text()));
      const expectedData = ['a', 'b', 'Other Hello World!'];

      // fetch the web source + 2 file entries
      expect(filesGet).toBe(6);
      expect(sourcesData).toStrictEqual(expectedData);
      expect(filesData).toStrictEqual(expectedData);
    }

    self.appendFileCollection(other, 'other');

    // merge don't refetch
    expect(filesGet).toBe(6);

    const iumBuffer = await self.toIum({ includeData: false });
    const deserialized = await FileCollection.fromIum(iumBuffer);

    const expectedPaths = [
      'dir1/a.txt',
      'dir2/b.txt',
      'other/dir1/a.txt',
      'other/dir2/b.txt',
      'other/other.txt',
      'self.txt',
    ];

    {
      const sourcesData = await Promise.all(
        deserialized.sources.map((s) => s.text()),
      );
      const filesData = await Promise.all(
        deserialized.files.map((f) => f.text()),
      );
      const expectedData = [
        'a',
        'b',
        'a',
        'b',
        'Other Hello World!',
        'Self Hello World!',
      ];

      // 2 file entries for each web source (+4)
      expect(filesGet).toBe(10);
      expect(sourcesData).toStrictEqual(expectedData);
      expect(filesData).toStrictEqual(expectedData);
    }

    {
      const deserializedSources = deserialized.sources.map(mapRelativePath);
      const deserializedFiles = deserialized.files.map(mapRelativePath);
      const selfSources = self.sources.map(mapRelativePath);
      const selfFiles = self.files.map(mapRelativePath);

      expect(deserializedSources).toStrictEqual(expectedPaths);
      expect(deserializedFiles).toStrictEqual(expectedPaths);
      expect(selfSources).toStrictEqual(expectedPaths);
      expect(selfFiles).toStrictEqual(expectedPaths);
    }

    const iumBufferFull = await deserialized.toIum();
    const deserializedFull = await FileCollection.fromIum(iumBufferFull);

    {
      const sourcesData = await Promise.all(
        deserializedFull.sources.map((s) => s.text()),
      );
      const filesData = await Promise.all(
        deserializedFull.files.map((f) => f.text()),
      );
      const expectedData = [
        'a',
        'b',
        'a',
        'b',
        'Other Hello World!',
        'Self Hello World!',
      ];

      // all data embed into the ium, no fetch.
      expect(filesGet).toBe(10);
      expect(sourcesData).toStrictEqual(expectedData);
      expect(filesData).toStrictEqual(expectedData);
    }

    {
      const deserializedSources = deserializedFull.sources.map(mapRelativePath);
      const deserializedFiles = deserializedFull.files.map(mapRelativePath);
      const selfSources = self.sources.map(mapRelativePath);
      const selfFiles = self.files.map(mapRelativePath);

      expect(deserializedSources).toStrictEqual(expectedPaths);
      expect(deserializedFiles).toStrictEqual(expectedPaths);
      expect(selfSources).toStrictEqual(expectedPaths);
      expect(selfFiles).toStrictEqual(expectedPaths);
    }
  });
});
