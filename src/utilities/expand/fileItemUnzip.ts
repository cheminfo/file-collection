import { FileItem } from '../../FileItem';
import { Options } from '../../Options';
import { shouldAddItem } from '../shouldAddItem';

import { expandAndFilter } from './expandAndFilter';
import { fileItemsFromZip } from './fileItemsFromZip';

/**
 * Some files in the fileItems may actually be zip. This method will unzip those files.
 * The method will actually not really unzip the files but only add them in the fileItems.
 * Unzipping will only take place when you want to actually retrieve the data.
 * @param fileItems
 * @param options
 * @returns
 */

export async function fileItemUnzip(
  fileItem: FileItem,
  options: Options = {},
): Promise<FileItem[]> {
  const { unzip = {}, filter = {}, logger } = options;
  let { zipExtensions = ['zip'] } = unzip;
  const { recursive = true } = unzip;
  zipExtensions = zipExtensions.map((extension) => extension.toLowerCase());
  const extension = fileItem.name.replace(/^.*\./, '').toLowerCase();

  if (!fileItem.sourceUUID) {
    throw new Error('fileItem.sourceUUID is not defined');
  }

  if (!zipExtensions.includes(extension)) {
    return [fileItem];
  }

  const buffer = await fileItem.arrayBuffer();

  if (!isZip(buffer)) {
    if (logger) {
      logger.info(
        `Could not unzip the following file: ${fileItem.relativePath}`,
      );
    }
    return [fileItem];
  }
  const zipFileItems = await fileItemsFromZip(
    buffer,
    fileItem.sourceUUID,
    options,
  );

  const fileItems: FileItem[] = [];
  for (const zipEntry of zipFileItems) {
    zipEntry.relativePath = `${fileItem.relativePath}/${zipEntry.relativePath}`;
    zipEntry.sourceUUID = fileItem.sourceUUID;
    if (recursive) {
      fileItems.push(...(await expandAndFilter(zipEntry, options)));
    } else if (shouldAddItem(zipEntry.relativePath, filter)) {
      fileItems.push(zipEntry);
    }
  }

  return fileItems;
}

function isZip(buffer: ArrayBuffer) {
  if (buffer.byteLength < 5) return false;
  const bytes = new Uint8Array(buffer);
  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  );
}
