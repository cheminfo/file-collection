import type { FileEntry } from '@zip.js/zip.js';

import type { ExtendedSourceItem } from './ExtendedSourceItem.ts';
import type { FileCollection } from './FileCollection.ts';
import type { Options } from './Options.ts';
import type { ZipFileContent } from './ZipFileContent.ts';
import { shouldAddItem } from './utilities/shouldAddItem.ts';
import { fileEntryToData } from './zip/file_entry_to_data.js';
import { getZipReader } from './zip/get_zip_reader.ts';

/**
 * Create a FileCollection from a zip
 * @param collection - The FileCollection to append the files to.
 * @param zipContent - The content of the zip file, which can be a Uint8Array, ArrayBuffer, Blob, or ReadableStream.
 * @param options - Options for creating the FileCollection.
 */
export async function fromZip(
  collection: FileCollection,
  zipContent: ZipFileContent,
  options?: Options,
) {
  const reader = getZipReader(zipContent);

  for await (const entry of reader.getEntriesGenerator()) {
    if (entry.directory) continue;
    if (!shouldAddItem(entry.filename, options?.filter)) continue;

    const source = entryToSource(entry);
    await collection.appendExtendedSource(source);
  }
}

/**
 * Converts a zip entry to an ExtendedSourceItem.
 * @param entry - The zip entry to convert.
 * @returns An ExtendedSourceItem or undefined if the entry does not have getData (should not happen).
 * @see https://github.com/gildas-lormeau/zip.js/issues/574
 */
function entryToSource(entry: FileEntry): ExtendedSourceItem {
  return {
    uuid: crypto.randomUUID(),
    size: entry.uncompressedSize,
    baseURL: 'ium:/',
    relativePath: entry.filename,
    name: entry.filename.replace(/^.*\//, ''),
    lastModified: entry.lastModDate.getTime(),
    ...fileEntryToData(entry),
  };
}
