import type { FileCollection } from '../FileCollection.ts';
import type { Source } from '../Source.ts';

import { appendSource } from './appendSource.ts';

export async function appendWebSource(
  fileCollection: FileCollection,
  webSourceURL: string,
  options: { baseURL?: string } = {},
): Promise<void> {
  const response = await fetch(webSourceURL);
  const webSource = (await response.json()) as Source;
  return appendSource(fileCollection, webSource, {
    baseURL: webSourceURL,
    ...options,
  });
}
