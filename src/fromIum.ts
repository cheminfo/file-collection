import {
  ZipReader,
  Uint8ArrayReader,
  TextWriter,
  Uint8ArrayWriter,
} from '@zip.js/zip.js';
import type { Entry } from '@zip.js/zip.js';

import { FileCollection } from './FileCollection.ts';
import type { ZipFileContent } from './ZipFileContent.ts';
import { sourceItemToExtendedSourceItem } from './append/sourceItemToExtendedSourceItem.ts';

export async function fromIum(
  zipContent: ZipFileContent,
): Promise<FileCollection> {
  const zipReader = new ZipReader(new Uint8ArrayReader(zipContent));
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
