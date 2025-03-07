import { ungzip } from 'pako';

import type { FileItem } from '../../FileItem';
import type { Options } from '../../Options';

import { ungzipStream } from './ungzipStream';

/**
 * Some files in the fileItems may actually be gzip. This method will ungzip those files.
 * The method will actually not really ungzip the files but decompress them if you need.
 * During this process the extension .gz will be removed
 * @param fileItems
 * @param fileItem
 * @param options
 * @returns
 */

export async function fileItemUngzip(
  fileItem: FileItem,
  options: Options = {},
): Promise<FileItem> {
  const { ungzip: ungzipOptions = {}, logger } = options;
  let { gzipExtensions = ['gz'] } = ungzipOptions;
  gzipExtensions = gzipExtensions.map((extension) => extension.toLowerCase());

  const extension = fileItem.name.replace(/^.*\./, '').toLowerCase();
  if (!gzipExtensions.includes(extension)) {
    return fileItem;
  }

  if (!(await isGzip(fileItem))) {
    if (logger) {
      logger.info(
        `Could not ungzip the following file: ${fileItem.relativePath}`,
      );
    }
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
      return fileItem.arrayBuffer().then((arrayBuffer) => {
        const decoder = new TextDecoder('utf8');
        return decoder.decode(ungzip(new Uint8Array(arrayBuffer)));
      });
    },
    arrayBuffer: (): Promise<ArrayBuffer> => {
      return fileItem
        .arrayBuffer()
        .then((arrayBuffer) => ungzip(new Uint8Array(arrayBuffer)));
    },
    // @ts-expect-error feature is too new
    stream: () => {
      return ungzipStream(fileItem);
    },
  };
}

async function isGzip(file: FileItem) {
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength < 2) return false;
  const bytes = new Uint8Array(buffer);

  return bytes[0] === 0x1f && bytes[1] === 0x8b;
}
