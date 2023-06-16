import { createReadStream } from 'node:fs';
import { readdir, stat, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { Readable } from 'node:stream';

import { FileCollection } from '../FileCollection';
import { SourceItem } from '../SourceItem';
import { v4 } from '@lukeed/uuid';

export async function appendPath(fileCollection: FileCollection, path: string) {
  path = resolve(path);
  const base = basename(path);
  await appendFiles(fileCollection, path, base);
}

async function appendFiles(
  fileCollection: FileCollection,
  currentDir: string,
  base: string,
) {
  const entries = await readdir(currentDir);
  for (let entry of entries) {
    const current = join(currentDir, entry);
    const info = await stat(current);

    if (info.isDirectory()) {
      await appendFiles(fileCollection, current, `${base}/${entry}`);
    } else {
      const relativePath = `${base}/${entry}`;
      const source: SourceItem = {
        uuid: v4(),
        name: entry,
        baseURL: 'ium:/',
        size: info.size,
        relativePath,
        lastModified: Math.round(info.mtimeMs),
        text: (): Promise<string> => {
          return readFile(current, {
            encoding: 'utf8',
          });
        },
        arrayBuffer: (): Promise<ArrayBuffer> => {
          return readFile(current);
        },
        stream: (): ReadableStream => {
          if (Readable.toWeb) {
            //@ts-expect-error todo should be fixed
            return Readable.toWeb(createReadStream(current));
          }
          throw new Error(
            'The stream() method is only supported in Node.js >= 18.0.0',
          );
        },
      };
      await fileCollection.appendSource(source);
    }
  }
}
