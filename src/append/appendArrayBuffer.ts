import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileCollection } from '../FileCollection.ts';
import { getNameInfo } from '../utilities/getNameInfo.ts';

export async function appendArrayBuffer(
  fileCollection: FileCollection,
  relativePath: string,
  arrayBuffer: ArrayBuffer | Promise<ArrayBuffer>,
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
  arrayBuffer: ArrayBuffer | Promise<ArrayBuffer | Uint8Array> | Uint8Array,
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
