import type { FileCollection } from '../FileCollection.ts';
import type { Source } from '../Source.ts';
import { shouldAddItem } from '../utilities/shouldAddItem.ts';

import { sourceItemToExtendedSourceItem } from './sourceItemToExtendedSourceItem.ts';

/**
 * Append a source to a FileCollection
 * @param fileCollection - The FileCollection to append the files to.
 * @param source - The source to append.
 * @param options - Options for appending the source.
 * @param options.baseURL - The base URL to use for the source if it doesn't have one.
 * @returns Promise<void>
 */
export async function appendSource(
  fileCollection: FileCollection,
  source: Source,
  options: { baseURL?: string } = {},
): Promise<void> {
  const {
    options: { filter },
  } = fileCollection;
  const { entries, baseURL } = source;
  const promises: Array<Promise<unknown>> = [];
  for (const entry of entries) {
    const { relativePath } = entry;
    if (!shouldAddItem(relativePath, entry.options?.filter ?? filter)) continue;
    const alternativeBaseURL = baseURL || options.baseURL;
    const source = sourceItemToExtendedSourceItem(entry, alternativeBaseURL);
    promises.push(fileCollection.appendExtendedSource(source));
  }
  await Promise.all(promises);
}
