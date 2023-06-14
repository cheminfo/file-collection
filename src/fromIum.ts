import JSZip from 'jszip';

import { FileCollection } from './FileCollection';
import { ZipFileContent } from './ZipFileContent';

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

  for (const source of index.sources) {
    const url = new URL(source.relativePath, source.baseURL);
    if (url.protocol === 'ium:') {
      const zipEntry = zip.files[`/data${url.pathname}`];
      if (!zipEntry) {
        throw new Error(`Invalid IUM file: missing ${url.pathname}`);
      }
      await fileCollection.appendArrayBuffer(
        url.pathname,
        zipEntry.async('arraybuffer'),
      );
    } else {
      // should come from the web
    }
  }

  return fileCollection;
}
