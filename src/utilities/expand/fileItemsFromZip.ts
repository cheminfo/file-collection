import type { FileEntry } from '@zip.js/zip.js';
import { Uint8ArrayReader, ZipReader } from '@zip.js/zip.js';

import type { FileItem } from '../../FileItem.ts';
import type { Options } from '../../Options.ts';
import { fileEntryToData } from '../../zip/file_entry_to_data.ts';
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
  buffer: ArrayBufferLike | ArrayBufferView,
  sourceUUID: string,
  options: Options = {},
) {
  const uint8Array = ArrayBuffer.isView(buffer)
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);
  const zipReader = new ZipReader(new Uint8ArrayReader(uint8Array));

  for await (const entry of zipReader.getEntriesGenerator()) {
    if (entry.directory) continue;
    if (!shouldAddItem(entry.filename, options.filter)) continue;

    yield entryToFileItem(entry, sourceUUID);
  }
}

function entryToFileItem(entry: FileEntry, sourceUUID: string): FileItem {
  return {
    name: entry.filename.replace(/^.*\//, ''),
    sourceUUID,
    relativePath: entry.filename,
    lastModified: entry.lastModDate.getTime(),
    size: entry.uncompressedSize,
    ...fileEntryToData(entry),
  };
}
