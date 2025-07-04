import { TextWriter } from '@zip.js/zip.js';
import type { Entry } from '@zip.js/zip.js';

import type { ItemData } from '../ItemData.js';

type GetData = Exclude<Entry['getData'], undefined>;

/**
 * Converts a zip entry's getData method to an ItemData object.
 * @param getData - The getData method of the zip entry.
 * @returns An ItemData object with methods to retrieve the data in different formats.
 */
export function getDataEntryToData(getData: GetData): ItemData {
  return {
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
  };
}
