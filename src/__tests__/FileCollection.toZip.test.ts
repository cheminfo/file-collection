import { createReadStream, openAsBlob } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';

import { Uint8ArrayReader, ZipReader } from '@zip.js/zip.js';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { expect, test } from 'vitest';

import { FileCollection } from '../FileCollection.js';

interface FsFile {
  name: string;
  size: number;
  relativePath: string;
  lastModified: number;
}

async function getJSON(path: string) {
  const entries: FsFile[] = [];
  await appendFiles(entries, path);
  for (const entry of entries) {
    entry.relativePath = entry.relativePath.replace(/.*__tests__\//, '');
  }
  return { entries };
}

/* eslint-disable no-await-in-loop */
async function appendFiles(files: FsFile[], currentDir: string) {
  const entries = await readdir(currentDir);
  for (const entry of entries) {
    const current = join(currentDir, entry);
    const info = await stat(current);

    if (info.isDirectory()) {
      await appendFiles(files, current);
    } else {
      files.push({
        name: entry,
        size: info.size,
        relativePath: join(currentDir, entry).replaceAll('\\', '/'),
        lastModified: Math.round(info.mtimeMs),
      });
    }
  }
}
/* eslint-enable no-await-in-loop */

test('Properly repack with external sources', async () => {
  const url = 'https://image-js.github.io/image-dataset-demo/biology/';
  const fileCollection = await new FileCollection().appendWebSource(url);

  const zip = await fileCollection.toZip();
  const zipReader = new ZipReader(new Uint8ArrayReader(zip));
  const entries = await zipReader.getEntries();

  expect(entries).toHaveLength(3);
});

test('properly repack with recursive zip', async () => {
  const stream = createReadStream(
    join(import.meta.dirname, 'dataRecursiveZip/data.zip'),
  );
  const webStream = Readable.toWeb(stream);
  const fileCollection = await FileCollection.fromZip(webStream);

  const zip = await fileCollection.toZip();
  const zipReader = new ZipReader(new Uint8ArrayReader(zip));
  const entries = await zipReader.getEntries();

  expect(entries).toHaveLength(1);
});

const server = setupServer(
  http.get('http://localhost/data*', async ({ request }) => {
    const pathname = join(import.meta.dirname, new URL(request.url).pathname);
    const pathnameStat = await stat(pathname);
    if (pathnameStat.isDirectory()) {
      const source = await getJSON(join(__dirname, 'dataUnzip'));
      return HttpResponse.json(source);
    } else if (pathnameStat.isFile()) {
      const data = await openAsBlob(pathname).then((blob) =>
        blob.arrayBuffer(),
      );
      return HttpResponse.arrayBuffer(data);
    } else {
      throw new Error(`unknown path: ${pathname}`);
    }
  }),
);

test('properly repack with zip from external datasources', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  using _ = { [Symbol.dispose]: () => server.close() };
  server.listen();

  const source1 = {
    entries: [
      {
        relativePath: 'data.zip',
      },
    ],
    baseURL: 'http://localhost/dataRecursiveZip/',
  };

  const source2 = {
    entries: [
      {
        relativePath: 'data.zip',
      },
    ],
    baseURL: 'http://localhost/',
  };

  const fileCollection = await FileCollection.fromSource(source1);
  await fileCollection.appendSource(source2);

  expect(fileCollection.sources).toHaveLength(2);
  expect(fileCollection.files).toHaveLength(12);

  const zip = await fileCollection.toZip();
  const zipReader = new ZipReader(new Uint8ArrayReader(zip));
  const entries = await zipReader.getEntries();

  expect(entries).toHaveLength(2);
});
