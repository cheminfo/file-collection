import type { FileCollection } from '../FileCollection.ts';
import type { Source } from '../Source.ts';
import { shouldAddItem } from '../utilities/shouldAddItem.ts';

import { sourceItemToExtendedSourceItem } from './sourceItemToExtendedSourceItem.ts';

export async function appendSource(
  fileCollection: FileCollection,
  source: Source,
  options: { baseURL?: string } = {},
): Promise<void> {
  const { filter } = fileCollection;
  const { entries, baseURL } = source;
  const promises: Array<Promise<void>> = [];
  for (const entry of entries) {
    const { relativePath } = entry;
    if (!shouldAddItem(relativePath, filter)) continue;
    const alternativeBaseURL = baseURL || options.baseURL;
    const source = sourceItemToExtendedSourceItem(entry, alternativeBaseURL);
    promises.push(fileCollection.appendExtendedSource(source));
  }
  await Promise.all(promises);
}
