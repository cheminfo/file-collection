import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { SourceItem } from '../SourceItem.ts';

// eslint-disable-next-line jsdoc/require-jsdoc
export function sourceItemToExtendedSourceItem(
  entry: SourceItem,
  alternativeBaseURL: string | undefined,
): ExtendedSourceItem {
  let baseURL = entry.baseURL || alternativeBaseURL;
  if (!baseURL) {
    if (!globalThis.location?.href) {
      throw new Error(`We could not find a baseURL for ${entry.relativePath}`);
    } else {
      baseURL = globalThis.location.href;
    }
  }

  const fileURL = new URL(entry.relativePath, baseURL);
  const source: ExtendedSourceItem = {
    uuid: crypto.randomUUID(),
    name: entry.relativePath.split('/').pop() || '',
    size: entry.size,
    baseURL,
    relativePath: entry.relativePath,
    lastModified: entry.lastModified,
    text: async (): Promise<string> => {
      const response = await fetch(fileURL.toString());
      return response.text();
    },
    arrayBuffer: async (): Promise<ArrayBuffer> => {
      const response = await fetch(fileURL.toString());
      return response.arrayBuffer();
    },
    stream: () => {
      const { writable, readable } = new TransformStream<
        Uint8Array,
        Uint8Array
      >();

      async function propagateErrorToStream(error: unknown) {
        await Promise.allSettled([
          writable.abort(error),
          readable.cancel(error),
        ]);
      }
      async function pipeFetchToStream() {
        const response = await fetch(fileURL.toString());
        // Should not be null
        const body = response.body as ReadableStream<Uint8Array>;
        await body.pipeTo(writable);
      }
      void pipeFetchToStream().catch(propagateErrorToStream);

      return readable;
    },
  };
  return source;
}
