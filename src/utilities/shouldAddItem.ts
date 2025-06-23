import type { FilterOptions } from '../Options.ts';

/**
 * Utility function that allows to filter files from a FileCollection ignore by default the dotFiles
 * @param fileCollection
 * @param relativePath
 * @param options
 * @returns
 */
export function shouldAddItem(
  relativePath: string,
  options: FilterOptions = {},
): boolean {
  const { ignoreDotfiles = true } = options;
  if (ignoreDotfiles) {
    return (
      relativePath.split('/').filter((part) => part.startsWith('.')).length ===
      0
    );
  }
  return true;
}
