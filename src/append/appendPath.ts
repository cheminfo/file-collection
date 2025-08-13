/* eslint-disable no-await-in-loop */
import { createReadStream, openAsBlob } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { Readable } from 'node:stream';

import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileCollection } from '../FileCollection.ts';

/**
 * Append files from a directory to a FileCollection.
 * @param fileCollection - FileCollection to append files to
 * @param path - Path to the directory to append
 * @param options - Options for appending files
 * @param options.keepBasename - If true, the basename of the path will be kept in the relative paths of the files.
 */
export async function appendPath(
  fileCollection: FileCollection,
  path: string,
  options: { keepBasename?: boolean } = {},
) {
  const { keepBasename = true } = options;
  path = resolve(path);
  const base = keepBasename ? basename(path) : '';
  await appendFiles(fileCollection, path, base);
}

async function appendFiles(
  fileCollection: FileCollection,
  currentDir: string,
  base: string,
) {
  const entries = await readdir(currentDir);
  for (const entry of entries) {
    const current = join(currentDir, entry);
    const info = await stat(current);

    if (info.isDirectory()) {
      if (base) {
        await appendFiles(fileCollection, current, `${base}/${entry}`);
      } else {
        await appendFiles(fileCollection, current, entry);
      }
    } else {
      const relativePath = `${base}/${entry}`;
      const source: ExtendedSourceItem = {
        uuid: crypto.randomUUID(),
        name: entry,
        baseURL: 'ium:/',
        size: info.size,
        relativePath,
        lastModified: Math.round(info.mtimeMs),
        text: () => openAsBlob(current).then((blob) => blob.text()),
        arrayBuffer: () =>
          openAsBlob(current).then((blob) => blob.arrayBuffer()),
        stream: () =>
          Readable.toWeb(createReadStream(current)) as ReadableStream<
            Uint8Array<ArrayBuffer>
          >,
      };
      await fileCollection.appendExtendedSource(source);
    }
  }
}
