import { FileCollection } from '../FileCollection';

import { appendWebSource } from './appendWebSource';

export async function appendWebSourceURL(
  fileCollection: FileCollection,
  webSourceURL: string,
  options: { baseURL?: string } = {},
): Promise<void> {
  const response = await fetch(webSourceURL);
  const webSource = await response.json();
  return appendWebSource(fileCollection, webSource, {
    baseURL: webSourceURL,
    ...options,
  });
}
