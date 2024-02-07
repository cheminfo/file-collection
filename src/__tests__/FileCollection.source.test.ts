import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

import { fetch } from 'cross-fetch';
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
} from 'vitest';

import { FileCollection } from '../FileCollection';

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

    const fileCollection = new FileCollection();
    await fileCollection.appendSource(source);
    expect(fileCollection.files).toHaveLength(2);
    const first = await fileCollection.files[0].text();
    expect(first).toBe('a');
    await fileCollection.files[0].text();
    // no cache it is reloaded a second time
    expect(fileRequestedCounter).toBe(2);
    const second = await fileCollection.files[1].arrayBuffer();
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
    global.location = { href: 'http://localhost/' };
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

    const first = await fileCollection.files[0].text();
    expect(first).toBe('a');
    const second = await fileCollection.files[1].text();
    expect(second).toBe('b');

    // @ts-expect-error need to remove it for the next test
    delete global.location;
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
    const first = await fileCollection.files[0].text();
    expect(first).toBe('a');
    await fileCollection.files[0].text();
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
    const first = await fileCollection.files[0].arrayBuffer();
    const array = Array.from(Buffer.from(first));
    expect(array[0]).toBe(97);
    // cached it is loaded only once and we convert the arrayBuffer to text
    const text = await fileCollection.files[0].text();
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

    expect(fileCollection.files).toHaveLength(15);
    const first = await fileCollection.files[0].text();
    expect(first).toBe('c');
    const second = await fileCollection.files[1].arrayBuffer();
    expect(Array.from(Buffer.from(second))).toStrictEqual([100]);
    const third = await fileCollection.files[14].arrayBuffer();
    expect(Array.from(Buffer.from(third))).toHaveLength(580);
  });

  test('with baseURL in the file', async () => {
    const url = 'http://localhost/data';
    const response = await fetch(url);
    const source = await response.json();

    source.entries.forEach((entry: any) => {
      entry.baseURL = 'http://localhost/';
    });

    const fileCollection = new FileCollection();
    await fileCollection.appendSource(source);

    expect(fileCollection.files).toHaveLength(15);
    const first = await fileCollection.files[0].text();
    expect(first).toBe('c');
    const second = await fileCollection.files[1].arrayBuffer();
    expect(Array.from(Buffer.from(second))).toStrictEqual([100]);
    const third = await fileCollection.files[14].arrayBuffer();
    expect(Array.from(Buffer.from(third))).toHaveLength(580);
  });
});

async function getJSON(path: string) {
  const entries: any = [];
  await appendFiles(entries, path);
  entries.forEach((entry: any) => {
    entry.relativePath = entry.relativePath.replace(/.*__tests__\//, '');
  });
  return { entries };
}

async function appendFiles(files: any, currentDir: string) {
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
        relativePath: join(currentDir, entry).replace(/\\/g, '/'),
        lastModified: Math.round(info.mtimeMs),
      });
    }
  }
}
