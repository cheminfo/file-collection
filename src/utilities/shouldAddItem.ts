import type { FilterOptions } from '../Options.ts';

/**
 * Utility function that allows to filter files from a FileCollection ignore by default the dotFiles
 * @param relativePath
 * @param options
 * @returns
 */
export function shouldAddItem(
  relativePath: string,
  options: FilterOptions = {},
): boolean {
  const { ignoreDotfiles = true } = options;
  if (!ignoreDotfiles) return true;

  if (relativePath.startsWith('.')) return false;
  if (relativePath.includes('/.')) return false;

  return true;
}
