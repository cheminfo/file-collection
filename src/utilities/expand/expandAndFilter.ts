import type { FileItem } from '../../FileItem.ts';
import type { Options } from '../../Options.ts';
import { shouldAddItem } from '../shouldAddItem.ts';

import { fileItemUngzip } from './fileItemUngzip.ts';
import { fileItemUnzip } from './fileItemUnzip.ts';

/**
 * Utility function that allows to expand gzip and zip files without really expanding them
 * @param fileCollection
 * @param originalFileItem
 * @param options
 * @returns
 */
export async function expandAndFilter(
  originalFileItem: FileItem,
  options: Options = {},
): Promise<FileItem[]> {
  const { filter = {} } = options;

  if (!shouldAddItem(originalFileItem.relativePath, filter)) {
    return [];
  }

  const fileItem = await fileItemUngzip(originalFileItem, options);

  const fileItems = await fileItemUnzip(fileItem, options);

  for (const fileItem of fileItems) {
    fileItem.sourceUUID = originalFileItem.sourceUUID;
  }

  return fileItems;
}
