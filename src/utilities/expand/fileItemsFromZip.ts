import { TextWriter, Uint8ArrayReader, ZipReader } from '@zip.js/zip.js';

import type { FileItem } from '../../FileItem.ts';
import type { Options } from '../../Options.ts';
import { shouldAddItem } from '../shouldAddItem.ts';

/**
 * Extracts file items from a zip file buffer.
 * @param buffer - The zip file as ArrayBuffer.
 * @param sourceUUID - The UUID of the source from which the zip file was created.
 * @param options - Options to filter the files.
 * @returns A promise that resolves to an array of file items.
 */
export async function fileItemsFromZip(
  buffer: ArrayBuffer,
  sourceUUID: string,
  options: Options = {},
) {
  const zipReader = new ZipReader(new Uint8ArrayReader(new Uint8Array(buffer)));

  const fileItems: FileItem[] = [];
  for await (const entry of zipReader.getEntriesGenerator()) {
    if (entry.directory) continue;
    if (!shouldAddItem(entry.filename, options.filter)) continue;
    const getData = entry.getData?.bind(entry);
    if (!getData) continue;

    fileItems.push({
      name: entry.filename.replace(/^.*\//, ''),
      sourceUUID,
      relativePath: entry.filename,
      lastModified: entry.lastModDate.getTime(),
      size: entry.uncompressedSize,
      text: () => {
        return getData(new TextWriter());
      },
      arrayBuffer: async () => {
        const stream = new TransformStream();

        const [buffer] = await Promise.all([
          new Response(stream.readable).arrayBuffer(),
          getData(stream.writable),
        ]);

        return buffer;
      },
      stream: () => {
        const { writable, readable } = new TransformStream<
          Uint8Array,
          Uint8Array
        >();

        /* v8 ignore start */
        // getData and writable are local, there is no easy way to force an error
        async function propagateErrorToStream(error: unknown) {
          await Promise.allSettled([
            writable.abort(error),
            readable.cancel(error),
          ]);
        }
        /* v8 ignore end */
        void getData(writable).catch(propagateErrorToStream);

        return readable;
      },
    });
  }
  return fileItems;
}
