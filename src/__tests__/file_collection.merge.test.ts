import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { assert, describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.ts';

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

    self.merge(other);

    expect(self.sources).toHaveLength(0);
    expect(self.files).toHaveLength(0);
  });

  it('should append source from other file collection', async () => {
    const self = new FileCollection();
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.merge(other);

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
    self.merge(other);

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
    self.merge(other);

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
    self.merge(other);

    const sources = other.sources.map(mapRelativePath);
    const files = other.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const expected = ['foo.txt', 'hello.txt'];

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  // TODO: discuss on what to do with duplicate
  // throw an error, warn and skip, override, change path (add random folder on top of the file)
  // for source, duplicate are on relativePath and uuid
  // for file, duplicate are on relativePath
  // Consider we merge the files before the sources,
  // if we have a duplicated file
  //   if sourceUUID exists in this file collection and both files share the same UUID
  //   then we can ignore safely the file
  // else ???
  // if source with same uuid already exists
  //   if they share the same relative path
  //     we can ignore safely the source
  //   else ???
  // else (it means two different sources with same relative path)
  //   ???
  it('should throw error on duplicate files', async () => {
    const self = new FileCollection();
    await self.appendText('hello.txt', 'Hello World!');
    const other = new FileCollection();
    await other.appendText('hello.txt', '!World Hello');

    expect(() => self.merge(other)).toThrow(Error);
  });
});

describe('at subPath', () => {
  it('should keep empty if both are empty', () => {
    const self = new FileCollection();
    const other = new FileCollection();

    self.merge(other, 'subPath');

    expect(self.sources).toHaveLength(0);
    expect(self.files).toHaveLength(0);
  });

  it('should append source from other file collection', async () => {
    const self = new FileCollection();
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.merge(other, 'subPath');

    expect(self.sources).toHaveLength(2);
    expect(self.files).toHaveLength(2);

    const sources = self.sources.map(mapRelativePath);
    const files = self.files.map(mapRelativePath);
    sources.sort();
    files.sort();

    const expected = ['subPath/hello.txt', 'subPath/foo.txt'];

    expect(sources).toStrictEqual(expected);
    expect(files).toStrictEqual(expected);
  });

  it('should keep self files and sources', async () => {
    const self = new FileCollection();
    await self.appendText('bar.txt', 'foo');
    const other = new FileCollection();
    await other.appendText('hello.txt', 'Hello World!');
    await other.appendText('foo.txt', 'bar');
    self.merge(other, 'subPath');

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
    self.merge(other, 'subPath');

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

    expect(() => self.merge(other, 'subPath')).toThrow(Error);
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
    self.merge(other, 'subPath');

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
});
