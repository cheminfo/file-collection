import { FileCollection } from '../FileCollection';
import { Source } from '../Source';

import { appendSource } from './appendSource';

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
