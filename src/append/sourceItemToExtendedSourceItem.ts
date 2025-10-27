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
  let _fetchPromise: Promise<Response> | undefined;
  async function getFetchCached() {
    if (!_fetchPromise) _fetchPromise = fetch(fileURL);

    const response = await _fetchPromise;
    // clone the response to prevent error when need to consume the response multiple times
    return response.clone();
  }

  return {
    uuid: entry.uuid ?? crypto.randomUUID(),
    name: entry.relativePath.split('/').pop() || '',
    size: entry.size,
    baseURL,
    extra: entry.extra,
    relativePath: entry.relativePath,
    lastModified: entry.lastModified,
    text: async (): Promise<string> => {
      const response = await getFetchCached();
      return response.text();
    },
    arrayBuffer: async (): Promise<ArrayBuffer> => {
      const response = await getFetchCached();
      return response.arrayBuffer();
    },
    stream: () => {
      const { writable, readable } = new TransformStream<
        Uint8Array<ArrayBuffer>,
        Uint8Array<ArrayBuffer>
      >();

      async function propagateErrorToStream(error: unknown) {
        await Promise.allSettled([
          writable.abort(error),
          readable.cancel(error),
        ]);
      }

      async function pipeFetchToStream() {
        const response = await getFetchCached();
        // Should not be null
        const body = response.body as ReadableStream<Uint8Array>;
        await body.pipeTo(writable);
      }

      void pipeFetchToStream().catch(propagateErrorToStream);

      return readable;
    },
  };
}
