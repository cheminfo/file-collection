import { FileItem } from '../../FileItem';
import { Options } from '../../Options';
import { SourceItem } from '../../SourceItem';
import { ensureStream } from '../ensureStream';
import { shouldAddItem } from '../shouldAddItem';

import { fileItemUngzip } from './fileItemUngzip';
import { fileItemUnzip } from './fileItemUnzip';

/**
 * Utility function that allows to expand gzip and zip files without really expanding them
 * @param fileCollection
 * @param options
 * @returns
 */
export async function expandAndFilter(
  sourceItem: SourceItem | FileItem,
  options: Options = {},
): Promise<FileItem[]> {
  const { filter = {} } = options;

  if (!shouldAddItem(sourceItem.relativePath, filter)) {
    return [];
  }

  let fileItem = ensureStream(sourceItem);

  fileItem = await fileItemUngzip(fileItem, options);

  const fileItems = fileItemUnzip(fileItem, options);

  return fileItems;
}
