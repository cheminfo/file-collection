import { assert, describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.ts';
import type { ToIumOptionsExtraFile } from '../toIum.js';
import { UNSUPPORTED_EXTRA_FILE_CONTENT_ERROR } from '../toIum.js';
import { getZipReader } from '../zip/get_zip_reader.js';

describe('FileCollection basic ium', async () => {
  it('pack unpack single file', async () => {
    const fileCollection = new FileCollection();
    await fileCollection.appendText('hello.txt', 'Hello word');

    const ium = await fileCollection.toIum();
    const newCollection = [...(await FileCollection.fromIum(ium))];

    expect(newCollection).toHaveLength(1);
    expect(newCollection).toMatchObject([
      {
        relativePath: 'hello.txt',
        name: 'hello.txt',
        baseURL: 'ium:/',
      },
    ]);

    const firstFile = newCollection[0];
    assert(firstFile);
    const text = await firstFile.text();

    expect(text).toBe('Hello word');
  });

  it('pack, unpack, pack, unpack, with extra file', async () => {
    const fileCollection = new FileCollection();
    await fileCollection.appendText('hello.txt', 'Hello word');

    const iumBytes = await fileCollection.toIum({
      *getExtraFiles() {
        yield {
          relativePath: 'extra.txt',
          data: 'Extra file content',
        };
      },
    });

    const newCollection = await FileCollection.fromIum(iumBytes);

    expect(newCollection.files).toHaveLength(2);

    const newIumBytes = await newCollection.toIum();
    const newCollection2 = await FileCollection.fromIum(newIumBytes);

    expect(newCollection2.files).toHaveLength(2);
    expect(newCollection2.sources.some((s) => s.extra)).toBe(true);
  });

  it('support all extra file types', async () => {
    const fileCollection = new FileCollection();

    const dataString = 'Extra file content';
    const dataBytes = new TextEncoder().encode(dataString);
    const dataBlob = new Blob([dataBytes], {
      type: 'text/plain',
    });
    const dataArrayBuffer = await dataBlob.arrayBuffer();
    const dataStream = dataBlob.stream();

    const ium = await fileCollection.toIum({
      *getExtraFiles(): Generator<ToIumOptionsExtraFile> {
        yield {
          relativePath: 'extra-string.txt',
          data: dataString,
        };

        yield {
          relativePath: 'extra-bytes.txt',
          data: dataBytes,
        };

        yield {
          relativePath: 'extra-blob.txt',
          data: dataBlob,
        };

        yield {
          relativePath: 'extra-arraybuffer.txt',
          data: dataArrayBuffer,
        };

        yield {
          relativePath: 'extra-stream.txt',
          data: dataStream,
        };
      },
    });

    const newCollection = await FileCollection.fromIum(ium);
    const content = await Promise.all(
      newCollection.files.map((file) => {
        return file.text();
      }),
    );

    expect(newCollection.files).toHaveLength(5);
    expect(content).toStrictEqual([
      'Extra file content',
      'Extra file content',
      'Extra file content',
      'Extra file content',
      'Extra file content',
    ]);
  });

  it('throw on invalid extra file type', async () => {
    const fileCollection = new FileCollection();
    const promise = fileCollection.toIum({
      getExtraFiles: () => {
        return [
          {
            relativePath: 'extra-invalid.txt',
            data: 0 as never,
          },
        ];
      },
    });

    await expect(promise).rejects.toThrow(UNSUPPORTED_EXTRA_FILE_CONTENT_ERROR);
  });
});

describe('FileCollection with exotic paths', () => {
  it('should support exotic paths and encode them safely for file-systems', async () => {
    const relativePath = `deep/path/with special characters/foo/\\bar/08:50:12/[baz]/*/5 < 10 > 5/1=1/file.txt#anchor removed`;

    const fileCollection = new FileCollection();
    await fileCollection.appendText(relativePath, 'Hello word');

    const iumBuffer = await fileCollection.toIum();

    const zipReader = getZipReader(iumBuffer);
    const entries = await zipReader.getEntries();
    const entry = entries.find(
      (entry) =>
        entry.filename !== '/index.json' && entry.filename !== 'mimetype',
    );

    // safely encoded for fs
    expect(entry?.filename).toBe(
      `data/deep/path/with special characters/foo/-bar/08-50-12/-baz-/-/5 - 10 - 5/1-1/file.txt`,
    );

    const ium = await FileCollection.fromIum(iumBuffer);

    // keep url encoded path for internals
    expect(ium.sources[0]?.relativePath).toBe(
      `deep/path/with%20special%20characters/foo/\\bar/08:50:12/[baz]/*/5%20%3C%2010%20%3E%205/1=1/file.txt`,
    );
  });
});
