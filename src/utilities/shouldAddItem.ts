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
  const {
    ignoreDotfiles = defaultOptions.filter.ignoreDotfiles,
    exclude,
    include,
  } = options;
  if (!ignoreDotfiles) return true;

  if (relativePath.startsWith('.')) return false;
  if (relativePath.includes('/.')) return false;

  if (exclude && isMatchAnyPattern(exclude, relativePath)) {
    return false;
  }

  if (include && !isMatchAnyPattern(include, relativePath)) {
    return false;
  }

  return true;
}

function isMatchAnyPattern(
  patterns: string | RegExp | Array<string | RegExp>,
  path: string,
): boolean {
  if (Array.isArray(patterns)) {
    return patterns.some((pattern) => isMatchPattern(pattern, path));
  }

  return isMatchPattern(patterns, path);
}

function isMatchPattern(pattern: string | RegExp, path: string): boolean {
  if (typeof pattern === 'string') {
    return path.includes(pattern);
  }

  return pattern.test(path);
}
