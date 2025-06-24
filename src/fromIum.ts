import JSZip from 'jszip';

import { FileCollection } from './FileCollection.ts';
import type { ZipFileContent } from './ZipFileContent.ts';
import { sourceItemToExtendedSourceItem } from './append/sourceItemToExtendedSourceItem.ts';

export async function fromIum(
  zipContent: ZipFileContent,
): Promise<FileCollection> {
  const jsZip = new JSZip();
  const zip = await jsZip.loadAsync(zipContent);

  if (!zip.files['/index.json']) {
    throw new Error('Invalid IUM file: missing index.json');
  }

  const index = JSON.parse(await zip.files['/index.json'].async('text'));

  const fileCollection = new FileCollection(index.options);

  const promises: Array<Promise<void>> = [];
  for (const source of index.sources) {
    const url = new URL(source.relativePath, source.baseURL);
    if (url.protocol === 'ium:') {
      const zipEntry = zip.files[`/data${url.pathname}`];
      if (!zipEntry) {
        throw new Error(`Invalid IUM file: missing ${url.pathname}`);
      }
      promises.push(
        fileCollection.appendArrayBuffer(
          url.pathname,
          zipEntry.async('arraybuffer'),
        ),
      );
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
