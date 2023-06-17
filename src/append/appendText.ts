import { v4 } from '@lukeed/uuid';

import { ExtendedSourceItem } from '../ExtendedSourceItem';
import { FileCollection } from '../FileCollection';

export async function appendText(
  fileCollection: FileCollection,
  relativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
) {
  const source = await getExtendedSourceFromText(relativePath, text, options);
  await fileCollection.appendExtendedSource(source);
}

async function getExtendedSourceFromText(
  relativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
): Promise<ExtendedSourceItem> {
  const url = new URL(relativePath, 'ium:/');

  const blob = new Blob([await text], { type: 'text/plain' });

  return {
    uuid: v4(),
    relativePath: url.pathname,
    name: relativePath.split('/').pop() as string,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: () => blob.text(),
    stream: () => blob.stream(),
    arrayBuffer: () => blob.arrayBuffer(),
  };
}
