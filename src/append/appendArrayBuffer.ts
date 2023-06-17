import { v4 } from '@lukeed/uuid';

import { ExtendedSourceItem } from '../ExtendedSourceItem';
import { FileCollection } from '../FileCollection';

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
  relativePath: string,
  arrayBuffer: ArrayBuffer | Promise<ArrayBuffer | Uint8Array> | Uint8Array,
  options: { dateModified?: number } = {},
): Promise<ExtendedSourceItem> {
  const blob = new Blob([await arrayBuffer], {
    type: 'application/octet-stream',
  });

  return {
    uuid: v4(),
    relativePath,
    name: relativePath.split('/').pop() as string,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: () => blob.text(),
    stream: () => blob.stream(),
    arrayBuffer: () => blob.arrayBuffer(),
  };
}
