import { v4 } from '@lukeed/uuid';

import { FileCollection } from '../FileCollection';
import { SourceItem } from '../SourceItem';

export async function appendText(
  fileCollection: FileCollection,
  relativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
) {
  const source = await getSourceFromText(relativePath, text, options);
  await fileCollection.appendSource(source);
}

async function getSourceFromText(
  relativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
): Promise<SourceItem> {
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
