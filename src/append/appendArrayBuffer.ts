import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileCollection } from '../FileCollection.ts';
import { getNameInfo } from '../utilities/getNameInfo.ts';

type SyncOrAsync<T> = T | Promise<T>;
export type SupportedBufferInput = SyncOrAsync<
  // most generic binary data manipulation
  | Uint8Array
  // generic binary data transfer
  | ArrayBuffer
  | ArrayBufferView
>;

// eslint-disable-next-line jsdoc/require-jsdoc
export async function appendArrayBuffer(
  fileCollection: FileCollection,
  relativePath: string,
  arrayBuffer: SupportedBufferInput,
  options: { dateModified?: number } = {},
) {
  const source = await getExtendedSourceFromArrayBuffer(
    relativePath,
    arrayBuffer,
    options,
  );
  await fileCollection.appendExtendedSource(source);
}

async function getExtendedSourceFromArrayBuffer(
  originalRelativePath: string,
  arrayBuffer: SupportedBufferInput,
  options: { dateModified?: number } = {},
): Promise<ExtendedSourceItem> {
  const { name, relativePath } = getNameInfo(originalRelativePath);
  const blob = new Blob([await arrayBuffer], {
    type: 'application/octet-stream',
  });

  return {
    uuid: crypto.randomUUID(),
    relativePath,
    name,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: () => blob.text(),
    stream: () => blob.stream(),
    arrayBuffer: () => blob.arrayBuffer(),
  };
}
