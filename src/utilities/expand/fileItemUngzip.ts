import type { FileItem } from '../../FileItem.ts';
import type { Options } from '../../Options.ts';
import { defaultOptions } from '../../Options.ts';

/**
 * Some files in the fileItems may actually be gzip. This method will ungzip those files.
 * The method will actually not really ungzip the files but decompress them if you need.
 * During this process the extension .gz will be removed
 * @param fileItem - The file item to check and potentially ungzip.
 * @param options - Options to filter the files and control the ungzip behavior.
 * @returns A file item with ungzipped data.
 */

export async function fileItemUngzip(
  fileItem: FileItem,
  options: Options = {},
): Promise<FileItem> {
  const { ungzip: ungzipOptions = {}, logger } = options;
  let { gzipExtensions = defaultOptions.ungzip.gzipExtensions } = ungzipOptions;
  gzipExtensions = gzipExtensions.map((extension) => extension.toLowerCase());

  const extension = fileItem.name.replace(/^.*\./, '').toLowerCase();
  if (!gzipExtensions.includes(extension)) {
    return fileItem;
  }

  if (!(await isGzip(fileItem))) {
    logger?.info(
      `Could not ungzip the following file: ${fileItem.relativePath}`,
    );
    return fileItem;
  }

  return {
    sourceUUID: fileItem.sourceUUID,
    parent: fileItem,
    name: fileItem.name.replace(/\.[^.]+$/, ''),
    size: fileItem.size,
    relativePath: `${fileItem.relativePath}/${fileItem.name.replace(/\.[^.]+$/, '')}`,
    lastModified: fileItem.lastModified,
    text: (): Promise<string> => {
      const stream = toUngzip(fileItem);

      // Simplest way to convert a stream to text
      // https://stackoverflow.com/a/72718732
      return new Response(stream).text();
    },
    arrayBuffer: (): Promise<ArrayBuffer> => {
      const stream = toUngzip(fileItem);

      return new Response(stream).arrayBuffer();
    },
    stream: () => {
      return toUngzip(fileItem);
    },
  };
}

async function isGzip(file: FileItem) {
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength < 2) return false;
  const bytes = new Uint8Array(buffer);

  return bytes[0] === 0x1f && bytes[1] === 0x8b;
}

function toUngzip(file: FileItem) {
  // @ts-expect-error `stream()` may return a stream of SharedArrayBuffer, which is not supported by the types of `DecompressionStream`.
  return file.stream().pipeThrough(new DecompressionStream('gzip'));
}
