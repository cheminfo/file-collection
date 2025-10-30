import { assert, describe, expect, it } from 'vitest';

import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import { FileCollection } from '../FileCollection.ts';
import type { Options } from '../Options.ts';

describe('options merge', () => {
  it('should use options from collection', async () => {
    const fileCollectionOptions: Options = {
      unzip: {
        recursive: false,
      },
    };
    const fileCollection = new FileCollection(fileCollectionOptions);

    expect(fileCollection.options).toBe(fileCollectionOptions);

    const source = getSource();
    await fileCollection.appendExtendedSource(source);
    const fcSource = fileCollection.sources[0];
    assert(fcSource);

    expect(fcSource).not.toBe(source);
    expect(fcSource).toStrictEqual({
      ...source,
      options: fileCollectionOptions,
    });
  });

  it('should merge source options', async () => {
    const fileCollectionOptions: Options = {
      ungzip: { gzipExtensions: [] },
      unzip: { recursive: false },
    };
    const fileCollection = new FileCollection(fileCollectionOptions);

    expect(fileCollection.options).toBe(fileCollectionOptions);

    const source: ExtendedSourceItem = {
      ...getSource(),
      options: {
        unzip: { recursive: true },
      },
    };
    await fileCollection.appendExtendedSource(source);
    const fcSource = fileCollection.sources[0];
    assert(fcSource);

    expect(fcSource).not.toBe(source);
    expect(fcSource).toStrictEqual({
      ...source,
      options: {
        ungzip: { gzipExtensions: [] },
        unzip: { recursive: true },
      },
    });
  });

  it('should merge source options and method options', async () => {
    const fileCollectionOptions: Options = {
      ungzip: { gzipExtensions: [] },
      unzip: { recursive: false },
      filter: { ignoreDotfiles: false },
    };
    const fileCollection = new FileCollection(fileCollectionOptions);

    expect(fileCollection.options).toBe(fileCollectionOptions);

    const source: ExtendedSourceItem = {
      ...getSource(),
      options: {
        unzip: { recursive: true },
        filter: { ignoreDotfiles: true },
      },
    };
    const appendOptions: Options = {
      ungzip: { gzipExtensions: ['gz'] },
      unzip: { zipExtensions: ['content'] },
      filter: { ignoreDotfiles: false },
    };
    await fileCollection.appendExtendedSource(source, appendOptions);
    const fcSource = fileCollection.sources[0];
    assert(fcSource);

    expect(fcSource).not.toBe(source);
    expect(fcSource).toStrictEqual({
      ...source,
      options: {
        ungzip: { gzipExtensions: ['gz'] },
        unzip: { recursive: true, zipExtensions: ['content'] },
        filter: { ignoreDotfiles: false },
      },
    });
  });

  it('should preserve source options across toIum / fromIum', async () => {
    const fileCollectionOptions: Options = {
      ungzip: { gzipExtensions: [] },
      unzip: { recursive: false },
      filter: { ignoreDotfiles: false },
    };
    const fileCollection = new FileCollection(fileCollectionOptions);
    const source: ExtendedSourceItem = {
      ...getSource(),
      options: {
        unzip: { recursive: true },
        filter: { ignoreDotfiles: true },
      },
    };
    const appendOptions: Options = {
      ungzip: { gzipExtensions: ['gz'] },
      unzip: { zipExtensions: ['content'] },
      filter: { ignoreDotfiles: false },
    };
    await fileCollection.appendExtendedSource(source, appendOptions);
    const iumBuffer = await fileCollection.toIum();

    const ium = await FileCollection.fromIum(iumBuffer);
    const iumSource = ium.sources[0];
    assert(iumSource);

    expect(iumSource.uuid).toBe(source.uuid);
    expect(iumSource.relativePath).toBe(source.relativePath);
    expect(iumSource.options).toStrictEqual({
      ungzip: { gzipExtensions: ['gz'] },
      unzip: { recursive: true, zipExtensions: ['content'] },
      filter: { ignoreDotfiles: false },
    });
  });
});

function getSource(): ExtendedSourceItem {
  const blob = new Blob(['test']);
  return {
    uuid: crypto.randomUUID(),
    name: 'test',
    relativePath: 'test.txt',
    arrayBuffer: blob.arrayBuffer.bind(blob),
    text: blob.text.bind(blob),
    stream: blob.stream.bind(blob),
  };
}
