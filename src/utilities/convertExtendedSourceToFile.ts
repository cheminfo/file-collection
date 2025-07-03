import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileItem } from '../FileItem.ts';

// eslint-disable-next-line jsdoc/require-jsdoc
export function convertExtendedSourceToFile(
  source: ExtendedSourceItem,
): FileItem {
  return {
    sourceUUID: source.uuid,
    relativePath: source.relativePath,
    name: source.name,
    lastModified: source.lastModified,
    size: source.size,
    baseURL: source.baseURL,
    arrayBuffer: () => source.arrayBuffer(),
    text: () => source.text(),
    stream: () => source.stream(),
  };
}
