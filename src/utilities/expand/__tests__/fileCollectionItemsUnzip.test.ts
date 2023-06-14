import { join } from 'path';

import { FifoLogger } from 'fifo-logger';

import { fileCollectionFromPath } from '../../../appendFromPath';

describe('fileItemUnzip', () => {
  it('default value, read from path unzip everything that ends with .zip', async () => {
    const fileCollection = await fileCollectionFromPath(
      join(__dirname, '../../../__tests__/dataUnzip'),
    );

    const paths = fileCollection.files.map(
      (a) => `${a.relativePath} - ${a.name}`,
    );

    expect(paths).toStrictEqual([
      'dataUnzip/data.zip/data/c.txt - c.txt',
      'dataUnzip/data.zip/data/d.txt - d.txt',
      'dataUnzip/data.zip/data/dir1/a.txt - a.txt',
      'dataUnzip/data.zip/data/dir1/b.txt - b.txt',
      'dataUnzip/data.zip/data/dir1/dir3/e.txt - e.txt',
      'dataUnzip/data.zip/data/dir1/dir3/f.txt - f.txt',
      'dataUnzip/data.zip/data/dir1/dir3/zipFile3.zip/c.txt - c.txt',
      'dataUnzip/data.zip/data/dir1/dir3/zipFile3.zip/d.txt - d.txt',
      'dataUnzip/dir1/a.txt - a.txt',
      'dataUnzip/dir1/b.txt - b.txt',
      'dataUnzip/dir1/dir3/e.txt - e.txt',
      'dataUnzip/dir1/dir3/f.txt - f.txt',
      'dataUnzip/dir2/c.txt - c.txt',
      'dataUnzip/dir2/d.txt - d.txt',
      'dataUnzip/dir2/data.zipped - data.zipped',
    ]);

    const text = await fileCollection.files[1].text();
    expect(text).toBe('d');
  });

  it('forced extension, only zip and zipped', async () => {
    const fileCollection = await fileCollectionFromPath(
      join(__dirname, '../../../__tests__/dataUnzip'),
      { unzip: { zipExtensions: ['zip', 'zipped'] } },
    );

    expect(
      Array.from(
        fileCollection.files.map((a) => `${a.relativePath} - ${a.name}`),
      ),
    ).toStrictEqual([
      'dataUnzip/data.zip/data/c.txt - c.txt',
      'dataUnzip/data.zip/data/d.txt - d.txt',
      'dataUnzip/data.zip/data/dir1/a.txt - a.txt',
      'dataUnzip/data.zip/data/dir1/b.txt - b.txt',
      'dataUnzip/data.zip/data/dir1/dir3/e.txt - e.txt',
      'dataUnzip/data.zip/data/dir1/dir3/f.txt - f.txt',
      'dataUnzip/data.zip/data/dir1/dir3/zipFile3.zip/c.txt - c.txt',
      'dataUnzip/data.zip/data/dir1/dir3/zipFile3.zip/d.txt - d.txt',
      'dataUnzip/dir1/a.txt - a.txt',
      'dataUnzip/dir1/b.txt - b.txt',
      'dataUnzip/dir1/dir3/e.txt - e.txt',
      'dataUnzip/dir1/dir3/f.txt - f.txt',
      'dataUnzip/dir2/c.txt - c.txt',
      'dataUnzip/dir2/d.txt - d.txt',
      'dataUnzip/dir2/data.zipped/data/subDir1/c.txt - c.txt',
      'dataUnzip/dir2/data.zipped/data/subDir1/d.txt - d.txt',
    ]);

    const text = await fileCollection.files[15].text();
    expect(text).toBe('d');
  });

  it('check non zip', async () => {
    const logger = new FifoLogger();
    const fileCollection = await fileCollectionFromPath(
      join(__dirname, '../../../__tests__/dataUnzip'),
      { unzip: { zipExtensions: ['txt', 'zip', 'zipped'] }, logger },
    );

    // we try to unzip txt files, it does not make sense
    expect(logger.getLogs()).toHaveLength(16);

    expect(
      Array.from(
        fileCollection.files.map((a) => `${a.relativePath} - ${a.name}`),
      ),
    ).toStrictEqual([
      'dataUnzip/data.zip/data/c.txt - c.txt',
      'dataUnzip/data.zip/data/d.txt - d.txt',
      'dataUnzip/data.zip/data/dir1/a.txt - a.txt',
      'dataUnzip/data.zip/data/dir1/b.txt - b.txt',
      'dataUnzip/data.zip/data/dir1/dir3/e.txt - e.txt',
      'dataUnzip/data.zip/data/dir1/dir3/f.txt - f.txt',
      'dataUnzip/data.zip/data/dir1/dir3/zipFile3.zip/c.txt - c.txt',
      'dataUnzip/data.zip/data/dir1/dir3/zipFile3.zip/d.txt - d.txt',
      'dataUnzip/dir1/a.txt - a.txt',
      'dataUnzip/dir1/b.txt - b.txt',
      'dataUnzip/dir1/dir3/e.txt - e.txt',
      'dataUnzip/dir1/dir3/f.txt - f.txt',
      'dataUnzip/dir2/c.txt - c.txt',
      'dataUnzip/dir2/d.txt - d.txt',
      'dataUnzip/dir2/data.zipped/data/subDir1/c.txt - c.txt',
      'dataUnzip/dir2/data.zipped/data/subDir1/d.txt - d.txt',
    ]);

    const text = await fileCollection.files[15].text();
    expect(text).toBe('d');
  });
});
