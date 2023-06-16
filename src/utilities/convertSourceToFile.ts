import { FileItem } from '../FileItem';
import { SourceItem } from '../SourceItem';

export function convertSourceToFile(this: void, source: SourceItem): FileItem {
  let stream = source.stream
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
