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
    const realBaseURL = entry.baseURL || baseURL || options.baseURL;

    const source = getSource(entry, realBaseURL);
    await fileCollection.appendSource(source);
  }
}

function getSource(entry: any, realBaseURL: string | undefined): SourceItem {
  if (!realBaseURL) {
    if (typeof location === 'undefined' || !location.href) {
      throw new Error(`We could not find a baseURL for ${entry.relativePath}`);
    } else {
      realBaseURL = location.href;
    }
  }

  const fileURL = new URL(entry.relativePath, realBaseURL);
  const source: SourceItem = {
    uuid: v4(),
    name: entry.relativePath.split('/').pop() || '',
    size: entry.size,
    baseURL: realBaseURL,
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
