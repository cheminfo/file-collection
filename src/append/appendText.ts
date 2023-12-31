import { v4 } from '@lukeed/uuid';

import { ExtendedSourceItem } from '../ExtendedSourceItem';
import { FileCollection } from '../FileCollection';
import { getNameInfo } from '../utilities/getNameInfo';

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
  originalRelativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
): Promise<ExtendedSourceItem> {
  const { relativePath, name } = getNameInfo(originalRelativePath);

  const blob = new Blob([await text], { type: 'text/plain' });

  return {
    uuid: v4(),
    relativePath,
    name,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: () => blob.text(),
    stream: () => blob.stream(),
    arrayBuffer: () => blob.arrayBuffer(),
  };
}
