import { assert, describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.ts';
import type { ToIumOptionsExtraFile } from '../toIum.js';

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
});
