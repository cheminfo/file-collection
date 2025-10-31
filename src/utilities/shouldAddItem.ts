import type { FilterOptions } from '../Options.ts';
import { defaultOptions } from '../Options.ts';

/**
 * Utility function that allows to filter files from a FileCollection ignores by default the dotFiles
 * @param relativePath - The relative path of the file to check
 * @param options - the filter options to use
 * @returns boolean
 */
export function shouldAddItem(
  relativePath: string,
  options: FilterOptions = {},
): boolean {
  const { ignoreDotfiles = defaultOptions.filter.ignoreDotfiles } = options;
  if (!ignoreDotfiles) return true;

  if (relativePath.startsWith('.')) return false;
  if (relativePath.includes('/.')) return false;

  return true;
}
