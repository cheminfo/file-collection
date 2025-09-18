import type { FileEntry } from '@zip.js/zip.js';
import { TextWriter, Uint8ArrayWriter } from '@zip.js/zip.js';

import { FileCollection } from './FileCollection.ts';
import type { ZipFileContent } from './ZipFileContent.ts';
import { sourceItemToExtendedSourceItem } from './append/sourceItemToExtendedSourceItem.ts';
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
  const index = await JSON.parse(rawData);
  const fileCollection = new FileCollection(index.options);

  const promises: Array<Promise<unknown>> = [];
  for (const source of index.sources) {
    const url = new URL(source.relativePath, source.baseURL);
    if (url.protocol === 'ium:') {
      const key = source.extra
        ? url.pathname
        : `/data/${url.pathname.slice(1)}`;
      const zipEntry = zipFiles.get(key);
      if (!zipEntry) {
        throw new Error(`Invalid IUM file: missing ${url.pathname}`);
      }
      promises.push(appendEntry(zipEntry, url, fileCollection, source.extra));
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
  url: URL,
  fileCollection: FileCollection,
  extra: boolean,
): Promise<void> {
  // TODO: remove explicit type when https://github.com/gildas-lormeau/zip.js/pull/594 is released.
  const buffer = await entry.getData<ArrayBuffer>(new Uint8ArrayWriter());
  await fileCollection.appendArrayBuffer(url.pathname.slice(1), buffer, {
    dateModified: entry.lastModDate.getTime(),
    extra,
  });
}
