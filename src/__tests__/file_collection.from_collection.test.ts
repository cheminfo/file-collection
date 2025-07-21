import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { FileCollection } from '../FileCollection.js';

describe('FileCollection.fromCollection', () => {
  it('should basic clone', async () => {
    const collection = await FileCollection.fromPath(
      join(import.meta.dirname, 'data'),
    );
    const clonedCollection = FileCollection.fromCollection(collection);

    expect(clonedCollection).toStrictEqual(clonedCollection);
    expect(clonedCollection.files[0]).not.toBe(collection.files[0]);
    expect(clonedCollection.sources[0]).not.toBe(collection.sources[0]);
  });

  it('should clone with merge options', async () => {
    const collection = await FileCollection.fromPath(
      join(import.meta.dirname, 'data'),
      { cache: true, filter: { ignoreDotfiles: true } },
    );

    const clonedCollection = FileCollection.fromCollection(collection, {
      cache: false,
      filter: { ignoreDotfiles: false },
    });

    expect(clonedCollection.options.filter?.ignoreDotfiles).toBe(false);
    expect(clonedCollection.options.cache).toBe(false);

    // match instead of strict equality because clone files / sources with cache false instead of cache true.
    expect(clonedCollection.files).toMatchObject(collection.files);
    expect(clonedCollection.sources).toMatchObject(collection.sources);

    expect(clonedCollection.files[0]).not.toBe(collection.files[0]);
    expect(clonedCollection.sources[0]).not.toBe(collection.sources[0]);
  });
});
