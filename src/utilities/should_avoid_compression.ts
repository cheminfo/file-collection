import { defaultOptions } from '../Options.ts';
import type { SourceItem } from '../SourceItem.ts';

/**
 * Check if the file is known to be compressed or not
 * @param source - The source item to check, it should contain options to check by extension
 * @returns boolean
 */
export function shouldAvoidCompression(source: SourceItem) {
  const { relativePath, options = {} } = source;
  const lastSlashIndex = relativePath.lastIndexOf('/');
  const name = relativePath.slice(lastSlashIndex + 1);

  const unzipExtensions =
    options.unzip?.zipExtensions ?? defaultOptions.unzip.zipExtensions;
  const ungzipExtensions =
    options.ungzip?.gzipExtensions ?? defaultOptions.ungzip.gzipExtensions;

  const toStoreExtensions = new Set(
    [...unzipExtensions, ...ungzipExtensions].map((ext) => ext.toLowerCase()),
  );

  const lastDotIndex = name.lastIndexOf('.');
  const extension = name.slice(lastDotIndex + 1).toLowerCase();

  return toStoreExtensions.has(extension);
}
