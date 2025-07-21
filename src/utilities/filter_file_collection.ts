import { cloneExtendedSourceItem } from '../ExtendedSourceItem.js';
import type { ExtendedSourceItem } from '../ExtendedSourceItem.js';
import type { FileCollection } from '../FileCollection.js';
import { cloneFileItem } from '../FileItem.js';
import type { FileItem } from '../FileItem.js';

// eslint-disable-next-line jsdoc/require-jsdoc
export function filterFileCollection(
  collection: FileCollection,
  predicate: (
    this: FileItem[],
    file: FileItem,
    index: number,
    array: FileItem[],
  ) => boolean,
  newCollection: FileCollection,
): FileCollection {
  const sourcesMap = new Map<string, ExtendedSourceItem>(
    collection.sources.map((s) => [s.uuid, s]),
  );
  const filteredFiles: FileItem[] = [];
  const filteredSources = new Map<string, ExtendedSourceItem>();

  for (const [index, file] of collection.files.entries()) {
    if (!predicate.call(collection.files, file, index, collection.files)) {
      continue;
    }

    filteredFiles.push(cloneFileItem(file));

    const source = sourcesMap.get(file.sourceUUID);
    if (!source) continue;
    if (filteredSources.has(file.sourceUUID)) continue;

    filteredSources.set(file.sourceUUID, cloneExtendedSourceItem(source));
  }

  Object.assign(newCollection, {
    files: filteredFiles,
    sources: Array.from(filteredSources.values()),
  });

  return newCollection;
}
