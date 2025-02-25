import type { ExtendedSourceItem } from '../ExtendedSourceItem';
import type { FileItem } from '../FileItem';

export function convertExtendedSourceToFile(
  this: void,
  source: ExtendedSourceItem,
): FileItem {
  const stream = source.stream
    ? () => source.stream?.()
    : (): ReadableStream => {
        return new ReadableStream({
          start: (controller) => {
            void source.arrayBuffer().then((arrayBuffer) => {
              controller.enqueue(arrayBuffer);
              controller.close();
            });
          },
        });
      };

  return {
    sourceUUID: source.uuid,
    relativePath: source.relativePath,
    name: source.name,
    lastModified: source.lastModified,
    size: source.size,
    baseURL: source.baseURL,
    arrayBuffer: () => source.arrayBuffer(),
    text: () => source.text(),
    stream,
  };
}
