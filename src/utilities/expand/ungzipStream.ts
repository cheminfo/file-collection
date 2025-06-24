import { ReadStream } from 'node:fs';
import { createGunzip } from 'node:zlib';

import type { FileItem } from '../../FileItem.ts';

export function ungzipStream(file: FileItem) {
  if (ReadStream.toWeb) {
    return ReadStream.toWeb(
      //@ts-expect-error Should fix this definition
      ReadStream.fromWeb(file.stream()).pipe(createGunzip()),
    );
  }
  throw new Error('The stream() method is only supported in Node.js >= 18.0.0');
}
