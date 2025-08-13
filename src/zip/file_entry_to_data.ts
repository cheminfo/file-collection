import type { FileEntry } from '@zip.js/zip.js';
import { TextWriter } from '@zip.js/zip.js';

import type { ItemData } from '../ItemData.js';

/**
 * Converts a zip entry to an ItemData object.
 * @param entry - The zip file entry.
 * @returns An ItemData object with methods to retrieve the data in different formats.
 */
export function fileEntryToData(entry: FileEntry): ItemData {
  return {
    text: () => {
      return entry.getData(new TextWriter());
    },
    arrayBuffer: async () => {
      const stream = new TransformStream();

      const [buffer] = await Promise.all([
        new Response(stream.readable).arrayBuffer(),
        entry.getData(stream.writable),
      ]);

      return buffer;
    },
    stream: () => {
      const { writable, readable } = new TransformStream<
        Uint8Array<ArrayBuffer>,
        Uint8Array<ArrayBuffer>
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
      void entry.getData(writable).catch(propagateErrorToStream);

      return readable;
    },
  };
}
