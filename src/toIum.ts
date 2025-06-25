import { ZipWriter, Uint8ArrayWriter, TextReader } from '@zip.js/zip.js';

import type { FileCollection } from './FileCollection.ts';
import type { SourceItem } from './SourceItem.ts';

export interface ToIumOptions {
  /**
   * If true, the data of the files will always be included in the zip.
   * @default true
   */
  includeData?: boolean;
}
/**
 * This method will zip a file collection and return the zip as an ArrayBuffer
 * @param fileCollection - The file collection to zip
 * @param options - Options for the zip process
 * @returns Zip as an Uint8Array
 */
export async function toIum(
  fileCollection: FileCollection,
  options: ToIumOptions = {},
): Promise<Uint8Array> {
  const { includeData = true } = options;
  const zipWriter = new ZipWriter(new Uint8ArrayWriter());

  const sources: SourceItem[] = [];
  const promises: Array<Promise<void>> = [];
  for (const source of fileCollection.sources) {
    const newSource = {
      relativePath: source.relativePath,
      baseURL: source.baseURL,
      name: source.name,
      lastModified: source.lastModified,
      size: source.size,
    };
    sources.push(newSource);
    if (includeData || source.baseURL === 'ium:/') {
      newSource.baseURL = 'ium:/';
      const url = new URL(`data/${source.relativePath}`, newSource.baseURL);
      promises.push(
        zipWriter.add(url.pathname, source.stream()).then(() => void 0),
      );
    }
  }

  await Promise.all(promises);

  const index = {
    options: fileCollection.options,
    sources,
  };

  const url = new URL('index.json', 'ium:/');

  await zipWriter.add(
    url.pathname,
    new TextReader(JSON.stringify(index, null, 2)),
  );
  return await zipWriter.close();
}
