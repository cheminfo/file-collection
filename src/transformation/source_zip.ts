import type { SourceItem } from '../SourceItem.js';

export function sourceToIumPath(source: SourceItem) {
  const pathname = sourceToIumPathLegacy(source);

  return pathnameToSafePath(pathname);
}

export function sourceToIumPathLegacy(source: SourceItem) {
  const url = new URL(
    source.extra
      ? source.relativePath
      : // ensure the path is relative and does not start with a slash
        `data/${source.relativePath.replace(/^\/+/, '')}`,
    'ium:/',
  );

  return url.pathname;
}

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
      .replaceAll(/[#*:<>?\\|+,;=[\]]+/g, '-')
  );
}
