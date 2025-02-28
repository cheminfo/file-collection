import type { FileItem } from '../../FileItem';
import type { Options } from '../../Options';
import { shouldAddItem } from '../shouldAddItem';

import { fileItemUngzip } from './fileItemUngzip';
import { fileItemUnzip } from './fileItemUnzip';

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
