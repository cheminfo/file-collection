import { describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.js';

/**
 * This is a network test, it may be flaky.
 * If we face issues with these tests,
 * simulate a server with `file.zip/content` zenodo behavior if needed
 */
describe('Zenodo 13307304', () => {
  it('should expand 1d.zip/content', async () => {
    const collection = await FileCollection.fromSource(
      {
        baseURL: 'https://zenodo.org/api/records/13307304/files/',
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

    expect(collection.files.length).toBe(18);
  });
});
