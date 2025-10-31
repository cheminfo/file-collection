import type { ZipWriterAddDataOptions } from '@zip.js/zip.js';
import { Uint8ArrayWriter, ZipWriter } from '@zip.js/zip.js';

import type { ExtendedSourceItem } from '../ExtendedSourceItem.js';
import type { FileCollection } from '../FileCollection.js';
import { sourceToZipPath } from '../transformation/source_zip.js';
import { shouldAvoidCompression } from '../utilities/should_avoid_compression.ts';

/**
 * This method will zip a file collection and return the zip as an ArrayBuffer
 * @param collection - The file collection to zip
 * @param finalPaths - toZip will fill this map with the final paths of the sources
 * @returns Zip as an Uint8Array
 */
export async function toZip(
  collection: FileCollection,
  finalPaths?: Map<ExtendedSourceItem, string>,
): Promise<Uint8Array<ArrayBuffer>> {
  const zipWriter = new ZipWriter<Uint8Array<ArrayBuffer>>(
    new Uint8ArrayWriter(),
  );

  const pathUsed = new Set<string>();

  await Promise.all(
    collection.sources.map(async (source) => {
      const path = sourceToZipPath(source, pathUsed);
      pathUsed.add(path);
      finalPaths?.set(source, path);

      const addOptions: ZipWriterAddDataOptions | undefined =
        shouldAvoidCompression(source) ? { compressionMethod: 0 } : undefined;
      await zipWriter.add(path, source.stream(), addOptions);
    }),
  );

  return await zipWriter.close();
}
