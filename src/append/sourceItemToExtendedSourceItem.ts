import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { SourceItem } from '../SourceItem.ts';
import { streamFromAsyncBlob } from '../utilities/stream_from_async_blob.ts';

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

  const fileURL = new URL(
    entry.originalRelativePath ?? entry.relativePath,
    baseURL,
  );
  let _blobPromise: Promise<Blob> | undefined;
  async function getBlobCached() {
    if (!_blobPromise) _blobPromise = fetch(fileURL).then((r) => r.blob());

    return _blobPromise;
  }

  return {
    uuid: entry.uuid ?? crypto.randomUUID(),
    name: entry.relativePath.split('/').pop() || '',
    size: entry.size,
    baseURL,
    extra: entry.extra,
    originalRelativePath: entry.originalRelativePath,
    relativePath: entry.relativePath,
    lastModified: entry.lastModified,
    options: entry.options,
    text: async (): Promise<string> => {
      const blob = await getBlobCached();
      return blob.text();
    },
    arrayBuffer: async (): Promise<ArrayBuffer> => {
      const blob = await getBlobCached();
      return blob.arrayBuffer();
    },
    stream: () => streamFromAsyncBlob(getBlobCached),
  };
}
