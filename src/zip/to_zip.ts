import { Uint8ArrayWriter, ZipWriter } from '@zip.js/zip.js';

import type { FileCollection } from '../FileCollection.js';

/**
 * This method will zip a file collection and return the zip as an ArrayBuffer
 * @param collection - The file collection to zip
 * @returns Zip as an Uint8Array
 */
export async function toZip(
  collection: FileCollection,
): Promise<Uint8Array<ArrayBuffer>> {
  const zipWriter = new ZipWriter<Uint8Array<ArrayBuffer>>(
    new Uint8ArrayWriter(),
  );

  const pathUsed = new Set<string>();

  await Promise.all(
    collection.sources.map(async (source) => {
      const baseUrl = new URL(source.baseURL || 'ium:/');
      let path = `${baseUrl.pathname}/${source.relativePath}`.replaceAll(
        /\/\/+/g,
        '/',
      );
      if (pathUsed.has(path)) {
        path = `${source.uuid}/${path}`.replaceAll(/\/\/+/g, '/');
      } else {
        pathUsed.add(path);
      }
      await zipWriter.add(path, source.stream());
    }),
  );

  return await zipWriter.close();
}
