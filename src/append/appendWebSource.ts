import { v4 } from '@lukeed/uuid';

import { FileCollection } from '../FileCollection';
import { SourceItem } from '../SourceItem';
import { WebSource } from '../WebSourceFile';
import { shouldAddItem } from '../utilities/shouldAddItem';

export async function appendWebSource(
  fileCollection: FileCollection,
  webSource: WebSource,
  options: { baseURL?: string } = {},
): Promise<void> {
  const { filter } = fileCollection;
  const { entries, baseURL } = webSource;
  for (const entry of entries) {
    const { relativePath } = entry;
    if (!shouldAddItem(relativePath, filter)) continue;
    const alternativeBaseURL = baseURL || options.baseURL;

    const source = getWebSource(entry, alternativeBaseURL);
    await fileCollection.appendSource(source);
  }
}

export function getWebSource(
  entry: any,
  alternativeBaseURL: string | undefined,
): SourceItem {
  let baseURL = entry.baseURL || alternativeBaseURL;
  if (!baseURL) {
    if (typeof location === 'undefined' || !location.href) {
      throw new Error(`We could not find a baseURL for ${entry.relativePath}`);
    } else {
      baseURL = location.href;
    }
  }

  const fileURL = new URL(entry.relativePath, baseURL);
  const source: SourceItem = {
    uuid: v4(),
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
    // @ts-expect-error Should contain stream
    stream: async (): Promise<ArrayBuffer> => {
      const response = await fetch(fileURL.toString());
      //@ts-expect-error Should contain stream
      return response.stream();
    },
  };
  return source;
}
