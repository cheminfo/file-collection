/**
 * Normalizes a relative path so it doesn't start with '/' or './'.
 * @param path - The path to normalize
 * @returns The normalized path
 */
export function normalizeRelativePath(path: string): string {
  return path.replace(/^\.?\//, '');
}
