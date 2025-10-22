import type { FileEntry } from '@zip.js/zip.js';
import { TextWriter, Uint8ArrayWriter } from '@zip.js/zip.js';

import type { ExtendedSourceItem } from './ExtendedSourceItem.js';
import { FileCollection } from './FileCollection.ts';
import type { SourceItem } from './SourceItem.js';
import type { ZipFileContent } from './ZipFileContent.ts';
import { sourceItemToExtendedSourceItem } from './append/sourceItemToExtendedSourceItem.ts';
import type { ToIumIndex } from './transformation/ium.js';
import { fromIumSourceToPath } from './transformation/source_zip.js';
import { getZipReader } from './zip/get_zip_reader.ts';

/**
 * Creates a FileCollection from an IUM zip file.
 * @param zipContent - The content of the IUM zip file, which can be a Uint8Array, ArrayBuffer, Blob, or ReadableStream.
 * @returns A Promise that resolves to a FileCollection containing the data from the IUM file.
 */
export async function fromIum(
  zipContent: ZipFileContent,
): Promise<FileCollection> {
  const zipReader = getZipReader(zipContent);
  const zipFiles = new Map<string, FileEntry>();
  for await (const entry of zipReader.getEntriesGenerator()) {
    if (entry.directory) continue;
    zipFiles.set(entry.filename.replaceAll(/\/\/+/g, '/'), entry);
  }
  const indexFile = zipFiles.get('/index.json');
  if (!indexFile) {
    throw new Error('Invalid IUM file: missing index.json');
  }
  const rawData = await indexFile.getData(new TextWriter());
  const index: ToIumIndex = await JSON.parse(rawData);
  const fileCollection = new FileCollection(index.options);

  const promises: Array<Promise<unknown>> = [];
  for (const source of index.sources) {
    const [url, key, legacyKey] = fromIumSourceToPath(source);
    if (url.protocol === 'ium:') {
      const zipEntry = zipFiles.get(key) ?? zipFiles.get(legacyKey);
      if (!zipEntry) {
        throw new Error(`Invalid IUM file: missing ${url.pathname}`);
      }
      promises.push(appendEntry(zipEntry, source, fileCollection));
    } else {
      promises.push(
        fileCollection.appendExtendedSource(
          sourceItemToExtendedSourceItem(source, undefined),
        ),
      );
      // should come from the web
    }
  }
  await Promise.all(promises);
  return fileCollection;
}

async function appendEntry(
  entry: FileEntry,
  source: SourceItem,
  fileCollection: FileCollection,
): Promise<void> {
  const buffer = await entry.getData(new Uint8ArrayWriter());
  const blob = new Blob([buffer]);

  const lastSlash = source.relativePath.lastIndexOf('/') + 1;
  const name = source.relativePath.slice(lastSlash);

  const extendedSource: ExtendedSourceItem = {
    uuid: source.uuid ?? crypto.randomUUID(),
    name,
    relativePath: source.relativePath,
    baseURL: source.baseURL ?? 'ium:/',
    lastModified: source.lastModified ?? entry.lastModDate.getTime(),
    size: source.size ?? entry.uncompressedSize,
    options: source.options,
    extra: source.extra,
    arrayBuffer: () => blob.arrayBuffer(),
    stream: () => blob.stream(),
    text: () => blob.text(),
  };

  await fileCollection.appendExtendedSource(
    extendedSource,
    extendedSource.options,
  );
}
