import { ungzip } from 'pako';

import { FileItem } from '../../FileItem';

export function ungzipStream(file: FileItem) {
  return new ReadableStream({
    start(controller) {
      void file
        .arrayBuffer()
        .then((arrayBuffer) => ungzip(new Uint8Array(arrayBuffer)))
        .then((arrayBuffer) => {
          controller.enqueue(arrayBuffer);
          controller.close();
        });
    },
  });
}
