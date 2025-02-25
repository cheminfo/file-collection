import { v4 } from '@lukeed/uuid';

import type { ExtendedSourceItem } from '../ExtendedSourceItem';
import type { SourceItem } from '../SourceItem';

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
