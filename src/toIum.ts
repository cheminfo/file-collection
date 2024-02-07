import JSZip from 'jszip';

import { FileCollection } from './FileCollection';
import { SourceItem } from './SourceItem';

export interface ToIumOptions {
  /**
   * If true, the data of the files will be always included in the zip.
   * @default true
   */
  includeData?: boolean;
}
/**
 * This method will zip a file collection and return the zip as an ArrayBuffer
 * @param fileCollecrtion
 * @returns
 */
export async function toIum(
  fileCollection: FileCollection,
  options: ToIumOptions = {},
): Promise<Uint8Array> {
  const jsZip = new JSZip();
  const { includeData = true } = options;

  const sources: SourceItem[] = [];
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
      jsZip.file(url.pathname, await source.arrayBuffer());
    }
  }

  const index = {
    options: fileCollection.options,
    sources,
  };

  const url = new URL('index.json', 'ium:/');

  jsZip.file(url.pathname, JSON.stringify(index, null, 2));
  return jsZip.generateAsync({ type: 'uint8array' });
}
