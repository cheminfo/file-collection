/* eslint-disable no-await-in-loop */
import { readdir, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  describe,
  expect,
  test,
  assert,
} from 'vitest';

import { FileCollection } from '../FileCollection.ts';

let fileRequestedCounter = 0;
const server = setupServer(
  http.get('http://localhost/data*', async ({ request }) => {
    const pathname = join(__dirname, new URL(request.url).pathname);
    const pathnameStat = await stat(pathname);
    if (pathnameStat.isDirectory()) {
      const source = await getJSON(join(__dirname, 'dataUnzip'));
      return HttpResponse.json(source);
    } else if (pathnameStat.isFile()) {
      fileRequestedCounter++;
      const data = await readFile(pathname);
      return HttpResponse.arrayBuffer(data);
    } else {
      throw new Error(`unknown path: ${pathname}`);
    }
  }),
);

// Enable request interception.
beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  fileRequestedCounter = 0;
});

// Reset handlers so that each test could alter them
// without affecting other, unrelated tests.
afterEach(() => server.resetHandlers());

// Don't forget to clean up afterwards.
afterAll(() => {
  server.close();
});

describe('fileCollectionFromWebSource', () => {
  test('with baseURL in options', async () => {
    const source = {
      entries: [
        {
          relativePath: 'data/dir1/a.txt',
        },
        {
          relativePath: 'data/dir1/b.txt',
        },
      ],
      baseURL: 'http://localhost/',
    };

    const fileCollection = await FileCollection.fromSource(source);
    expect(fileCollection.files).toHaveLength(2);

    const firstFile = fileCollection.files[0];
    const secondFile = fileCollection.files[1];
    assert(firstFile);
    assert(secondFile);

    const first = await firstFile.text();
    expect(first).toBe('a');
    await firstFile.text();

    // no cache it is reloaded a second time
    expect(fileRequestedCounter).toBe(2);
    const second = await secondFile.arrayBuffer();
    expect(Array.from(Buffer.from(second))).toStrictEqual([98]);
  });

  test('without any baseURL', async () => {
    const source = {
      entries: [
        {
          relativePath: 'data/dir1/a.txt',
        },
        {
          relativePath: 'data/dir1/b.txt',
        },
      ],
    };

    await expect(async () => {
      const fileCollection = new FileCollection();
      await fileCollection.appendSource(source);
    }).rejects.toThrow('We could not find a baseURL for data/dir1/a.txt');
  });

  test('without baseURL but with a global location href', async () => {
    // @ts-expect-error we want to test the behavior when location is set like in the browser
    globalThis.location = { href: 'http://localhost/' };
    const source = {
      entries: [
        {
          relativePath: 'data/dir1/a.txt',
        },
        {
          relativePath: 'data/dir1/b.txt',
        },
      ],
    };

    const fileCollection = new FileCollection();
    await fileCollection.appendSource(source);

    const firstFile = fileCollection.files[0];
    const secondFile = fileCollection.files[1];
    assert(firstFile);
    assert(secondFile);

    const first = await firstFile.text();
    expect(first).toBe('a');
    const second = await secondFile.text();
    expect(second).toBe('b');

    // @ts-expect-error need to remove it for the next test
    delete globalThis.location;
  });

  test('with cache', async () => {
    const source = {
      entries: [
        {
          relativePath: 'data/dir1/a.txt',
        },
        {
          relativePath: 'data/dir1/b.txt',
        },
      ],
      baseURL: 'http://localhost/',
    };

    const fileCollection = new FileCollection({ cache: true });
    await fileCollection.appendSource(source);

    expect(fileCollection.files).toHaveLength(2);

    const file = fileCollection.files[0];
    assert(file);

    const first = await file.text();
    expect(first).toBe('a');
    await file.text();
    // cached it is loaded only once
    expect(fileRequestedCounter).toBe(1);
  });

  test('with cache and arrayBuffer conversion', async () => {
    const source = {
      entries: [
        {
          relativePath: 'data/dir1/a.txt',
        },
      ],
      baseURL: 'http://localhost/',
    };

    const fileCollection = new FileCollection({ cache: true });
    await fileCollection.appendSource(source);
    expect(fileCollection.files).toHaveLength(1);
    const file = fileCollection.files[0];
    assert(file);
    const first = await file.arrayBuffer();
    const array = Array.from(Buffer.from(first));
    expect(array[0]).toBe(97);
    // cached it is loaded only once and we convert the arrayBuffer to text
    const text = await file.text();
    expect(text).toBe('a');
    expect(fileRequestedCounter).toBe(1);
  });

  test('with duplicate', async () => {
    const source = {
      entries: [
        {
          relativePath: 'data/dir1/a.txt',
        },
        {
          relativePath: 'data/dir1/a.txt',
        },
      ],
      baseURL: 'http://localhost/',
    };

    await expect(async () => {
      const fileCollection = new FileCollection();
      await fileCollection.appendSource(source);
    }).rejects.toThrow('Duplicate relativePath: data/dir1/a.txt');
  });

  test('with defaultBaseURL', async () => {
    const url = 'http://localhost/data';
    const response = await fetch(url);
    const source = await response.json();

    source.baseURL = 'http://localhost/';

    const fileCollection = new FileCollection();
    await fileCollection.appendSource(source);

    // it seems acceptable to me that the order is not guaranteed when appending a source
    fileCollection.files.sort((a, b) =>
      a.relativePath.localeCompare(b.relativePath),
    );

    expect(fileCollection.files).toHaveLength(15);
    const firstFile = fileCollection.files[0];
    const secondFile = fileCollection.files[1];
    const lastFile = fileCollection.files[14];
    assert(firstFile);
    assert(secondFile);
    assert(lastFile);

    const first = await firstFile.text();
    expect(first).toBe('c');
    const second = await secondFile.arrayBuffer();
    expect(Array.from(Buffer.from(second))).toStrictEqual([100]);
    const third = await lastFile.arrayBuffer();
    expect(Array.from(Buffer.from(third))).toHaveLength(580);
  });

  test('with baseURL in the file', async () => {
    const url = 'http://localhost/data';
    const response = await fetch(url);
    const source = await response.json();

    for (const entry of source.entries) {
      entry.baseURL = 'http://localhost/';
    }

    const fileCollection = new FileCollection();
    await fileCollection.appendSource(source);

    // it seems acceptable to me that the order is not guaranteed when appending a source
    fileCollection.files.sort((a, b) =>
      a.relativePath.localeCompare(b.relativePath),
    );

    expect(fileCollection.files).toHaveLength(15);
    const firstFile = fileCollection.files[0];
    const secondFile = fileCollection.files[1];
    const lastFile = fileCollection.files[14];
    assert(firstFile);
    assert(secondFile);
    assert(lastFile);

    const first = await firstFile.text();
    expect(first).toBe('c');
    const second = await secondFile.arrayBuffer();
    expect(Array.from(Buffer.from(second))).toStrictEqual([100]);
    const third = await lastFile.arrayBuffer();
    expect(Array.from(Buffer.from(third))).toHaveLength(580);
  });
});

async function getJSON(path: string) {
  const entries: FsFile[] = [];
  await appendFiles(entries, path);
  for (const entry of entries) {
    entry.relativePath = entry.relativePath.replace(/.*__tests__\//, '');
  }
  return { entries };
}

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

interface FsFile {
  name: string;
  size: number;
  relativePath: string;
  lastModified: number;
}
