/* eslint-disable no-await-in-loop */
import { createReadStream, openAsBlob } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { Readable } from 'node:stream';

import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { AppendPathOptions, FileCollection } from '../FileCollection.ts';
import { streamFromAsyncBlob } from '../utilities/stream_from_async_blob.ts';

/**
 * Append files from a directory to a FileCollection.
 * @param fileCollection - FileCollection to append files to
 * @param path - Path to the directory to append
 * @param options - Options for appending files
 */
export async function appendPath(
  fileCollection: FileCollection,
  path: string,
  options: AppendPathOptions = {},
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
      const relativePath = base ? `${base}/${entry}` : entry;

      let _blobPromise: Promise<Blob> | undefined;
      function readCachedBlob() {
        if (!_blobPromise) _blobPromise = openAsBlob(current);

        return _blobPromise;
      }

      const source: ExtendedSourceItem = {
        uuid: crypto.randomUUID(),
        name: entry,
        baseURL: 'ium:/',
        size: info.size,
        relativePath,
        lastModified: Math.round(info.mtimeMs),
        text: () => readCachedBlob().then((blob) => blob.text()),
        arrayBuffer: () => readCachedBlob().then((blob) => blob.arrayBuffer()),
        stream: () => streamFromAsyncBlob(readCachedBlob),
      };
      await fileCollection.appendExtendedSource(source);
    }
  }
}
