import type { SourceItem } from '../SourceItem.js';

/**
 * This method will transform a source item to a path that can be used by filesystems
 * @param source - The source item to transform
 * @returns The transformed path and the URL
 */
export function toIumSourceToPath(source: SourceItem) {
  const pathname = toIumSourceToLegacyPath(source);

  return pathnameToSafePath(pathname);
}

function toIumSourceToLegacyPath(source: SourceItem) {
  const url = new URL(
    source.extra
      ? source.relativePath
      : // ensure the path is relative and does not start with a slash
        `data/${source.relativePath.replace(/^\/+/, '')}`,
    'ium:/',
  );

  return url.pathname;
}

/**
 * This method will transform a source item to a path that had been serialised for filesystems
 * @param source - The source item to transform
 * @returns A tuple containing the URL, transformed path, and the legacy path
 */
export function fromIumSourceToPath(
  source: SourceItem,
): [url: URL, zipPath: string, legacyZipPath: string] {
  const [url, legacyZipPath] = fromIumSourceToLegacyPath(source);

  return [url, pathnameToSafePath(legacyZipPath), legacyZipPath];
}

function fromIumSourceToLegacyPath(
  source: SourceItem,
): [url: URL, zipPath: string] {
  const url = new URL(source.relativePath, source.baseURL);

  const zipPath = source.extra
    ? url.pathname
    : `/data/${url.pathname.slice(1)}`;

  return [url, zipPath];
}

/**
 * This method will transform a source item to a path that is safe for filesystems
 * @param source - The source item to transform
 * @param pathUsed - A set of paths already used to avoid collisions
 * @returns the path safe for filesystems
 */
export function sourceToZipPath(source: SourceItem, pathUsed: Set<string>) {
  const path = sourceToZipPathLegacy(source, pathUsed);

  return pathnameToSafePath(path);
}

function sourceToZipPathLegacy(source: SourceItem, pathUsed: Set<string>) {
  const baseUrl = new URL(source.baseURL || 'ium:/');
  let path = `${baseUrl.pathname}/${source.relativePath}`.replaceAll(
    /\/\/+/g,
    '/',
  );
  if (pathUsed.has(path)) {
    path = `${source.uuid}/${path}`.replaceAll(/\/\/+/g, '/');
  }

  return path;
}

function pathnameToSafePath(pathname: string) {
  const decodedPathname = decodeURIComponent(pathname);

  // https://en.wikipedia.org/wiki/Filename#Comparison_of_filename_limitations
  return (
    decodedPathname
      // eslint-disable-next-line no-control-regex
      .replaceAll(/[\u0000-\u001F\u007F\u00FF]/g, '')
      // replace problematic fs characters
      .replaceAll(/[#*:<>?\\|+,;=[\]]+/g, '-')
      // ensure the path is relative
      .replace(/^\.?\/+/, '')
      // trim multiple slashes
      .replaceAll(/\/\/+/g, '/')
  );
}
