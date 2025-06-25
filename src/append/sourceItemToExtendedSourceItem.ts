import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { SourceItem } from '../SourceItem.ts';

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
      const stream = new TransformStream<Uint8Array, Uint8Array>();

      async function pipeFetchToStream() {
        try {
          const response = await fetch(fileURL.toString());
          const body = response.body;
          if (!body) {
            throw new Error('Did not receive a body from the response');
          }
          await body.pipeTo(stream.writable);
        } catch (error: unknown) {
          await stream.readable.cancel(error);
          await stream.writable.abort(error);
        }
      }
      void pipeFetchToStream();

      return stream.readable;
    },
  };
  return source;
}
