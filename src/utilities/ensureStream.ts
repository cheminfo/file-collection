import { FileItem } from '../FileItem';
import { SourceItem } from '../SourceItem';

export function ensureStream(source: FileItem | SourceItem): FileItem {
  if (source.stream) {
    return source as FileItem;
  }

  const stream = () => {
    return new ReadableStream({
      start(controller) {
        void source.arrayBuffer().then((arrayBuffer) => {
          controller.enqueue(arrayBuffer);
          controller.close();
        });
      },
    });
  };

  return {
    ...source,
    stream,
  };
}
