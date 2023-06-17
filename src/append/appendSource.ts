import { FileCollection } from '../FileCollection';
import { Source } from '../Source';
import { shouldAddItem } from '../utilities/shouldAddItem';

import { sourceItemToExtendedSourceItem } from './sourceItemToExtendedSourceItem';

export async function appendSource(
  fileCollection: FileCollection,
  source: Source,
  options: { baseURL?: string } = {},
): Promise<void> {
  const { filter } = fileCollection;
  const { entries, baseURL } = source;
  for (const entry of entries) {
    const { relativePath } = entry;
    if (!shouldAddItem(relativePath, filter)) continue;
    const alternativeBaseURL = baseURL || options.baseURL;

    const source = sourceItemToExtendedSourceItem(entry, alternativeBaseURL);
    await fileCollection.appendExtendedSource(source);
  }
}
