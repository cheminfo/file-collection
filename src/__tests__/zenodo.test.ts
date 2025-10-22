import { createReadStream } from 'node:fs';
import { join } from 'node:path';

import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.js';

const server = setupServer(
  http.get('http://localhost/zenodo/*', async ({ request }) => {
    const pathname = join(import.meta.dirname, new URL(request.url).pathname);
    const stream = createReadStream(pathname);
    return new HttpResponse(stream, { status: 200 });
  }),
);

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('Zenodo 13307304', () => {
  it('should expand 1d.zip/content', async () => {
    const collection = await FileCollection.fromSource(
      {
        baseURL: 'http://localhost/zenodo/api/records/13307304/files/',
        entries: [
          {
            relativePath: '1d.zip/content',
            options: {
              unzip: {
                // Zenodo file buffer is served under `content` subpath.
                zipExtensions: ['content'],
              },
            },
          },
        ],
      },
      { unzip: { zipExtensions: ['zip', 'nmredata'] } },
    );

    expect(collection.files).toHaveLength(18);
  });
});
