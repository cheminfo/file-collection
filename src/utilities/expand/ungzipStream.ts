import { ReadStream } from 'fs';
import { createGunzip } from 'zlib';

import { FileItem } from '../../FileItem';

export function ungzipStream(file: FileItem) {
  if (ReadStream.toWeb) {
    return ReadStream.toWeb(
      //@ts-expect-error Should fix this definition
      ReadStream.fromWeb(file.stream()).pipe(createGunzip()),
    );
  }
  throw new Error('The stream() method is only supported in Node.js >= 18.0.0');
}
