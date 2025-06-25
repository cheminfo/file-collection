import {
  ZipReader,
  Uint8ArrayReader,
  TextWriter,
  Uint8ArrayWriter,
  BlobReader,
} from '@zip.js/zip.js';
import type { Entry } from '@zip.js/zip.js';

import { FileCollection } from './FileCollection.ts';
import type { ZipFileContent } from './ZipFileContent.ts';
import { sourceItemToExtendedSourceItem } from './append/sourceItemToExtendedSourceItem.ts';
import { decode } from './base64.js';

/**
 * Creates a FileCollection from an IUM zip file.
 * @param zipContent - The content of the IUM zip file, which can be a Uint8Array, ArrayBuffer, Blob, or ReadableStream.
 * @returns A Promise that resolves to a FileCollection containing the data from the IUM file.
 */
export async function fromIum(
  zipContent: ZipFileContent,
): Promise<FileCollection> {
  const zipReader = new ZipReader(await getZipContentReader(zipContent));
  const zipFiles = new Map<string, Entry>();
  for await (const entry of zipReader.getEntriesGenerator()) {
    zipFiles.set(entry.filename, entry);
  }
  const indexFile = zipFiles.get('/index.json');
  if (!indexFile) {
    throw new Error('Invalid IUM file: missing index.json');
  }
  const index = await JSON.parse(
    (await indexFile.getData?.(new TextWriter())) ?? '',
  );

  const fileCollection = new FileCollection(index.options);

  const promises: Array<Promise<void>> = [];
  for (const source of index.sources) {
    const url = new URL(source.relativePath, source.baseURL);
    if (url.protocol === 'ium:') {
      const zipEntry = zipFiles.get(`/data${url.pathname}`);
      if (!zipEntry) {
        throw new Error(`Invalid IUM file: missing ${url.pathname}`);
      }

      promises.push(appendEntry(zipEntry, url, fileCollection));
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
  entry: Entry,
  url: URL,
  fileCollection: FileCollection,
): Promise<void> {
  const getData = entry.getData?.bind(entry);
  if (!getData) return;

  const buffer = await getData(new Uint8ArrayWriter());
  await fileCollection.appendArrayBuffer(url.pathname, buffer, {
    dateModified: entry.lastModDate.getTime(),
  });
}

async function getZipContentReader(
  zipContent: ZipFileContent,
): Promise<ConstructorParameters<typeof ZipReader>[0]> {
  if (zipContent instanceof Uint8Array) {
    return new Uint8ArrayReader(zipContent);
  } else if (zipContent instanceof ArrayBuffer) {
    return new Uint8ArrayReader(new Uint8Array(zipContent));
  } else if (zipContent instanceof Blob) {
    return new BlobReader(zipContent);
  } else if (zipContent instanceof ReadableStream) {
    return zipContent;
  } else if (typeof zipContent === 'string') {
    return new Uint8ArrayReader(await decode(zipContent));
  }

  throw new Error(
    'Unsupported zip content type, if you passed a Node.js Stream convert it to Web Stream',
  );
}
