import { Uint8ArrayReader, ZipReader } from '@zip.js/zip.js';
import type { Entry } from '@zip.js/zip.js';

import type { FileItem } from '../../FileItem.ts';
import type { Options } from '../../Options.ts';
import { getDataEntryToData } from '../../zip/get_data_entry_to_data.js';
import { shouldAddItem } from '../shouldAddItem.ts';

/**
 * Extracts file items from a zip file buffer.
 * @param buffer - The zip file as ArrayBuffer.
 * @param sourceUUID - The UUID of the source from which the zip file was created.
 * @param options - Options to filter the files.
 * @returns An async generator that yields file item.
 * @yields FileItem - The file item extracted from the zip.
 */
export async function* fileItemsFromZip(
  buffer: ArrayBuffer,
  sourceUUID: string,
  options: Options = {},
) {
  const zipReader = new ZipReader(new Uint8ArrayReader(new Uint8Array(buffer)));

  for await (const entry of zipReader.getEntriesGenerator()) {
    if (entry.directory) continue;
    if (!shouldAddItem(entry.filename, options.filter)) continue;

    const file = entryToFileItem(entry, sourceUUID);
    if (!file) continue;

    yield file;
  }
}

function entryToFileItem(
  entry: Entry,
  sourceUUID: string,
): FileItem | undefined {
  const getData = entry.getData?.bind(entry);
  if (!getData) return;

  return {
    name: entry.filename.replace(/^.*\//, ''),
    sourceUUID,
    relativePath: entry.filename,
    lastModified: entry.lastModDate.getTime(),
    size: entry.uncompressedSize,
    ...getDataEntryToData(getData),
  };
}
