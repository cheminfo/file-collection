import { FileCollection } from '../FileCollection';
import { SourceItem } from '../SourceItem';

export async function appendArrayBuffer(
  fileCollection: FileCollection,
  relativePath: string,
  arrayBuffer: ArrayBuffer | Promise<ArrayBuffer>,
  options: { dateModified?: number } = {},
) {
  const source = getSourceFromArrayBuffer(relativePath, arrayBuffer, options);
  await fileCollection.appendSource(source);
}

function getSourceFromArrayBuffer(
  relativePath: string,
  arrayBuffer: ArrayBuffer | Promise<ArrayBuffer | Uint8Array> | Uint8Array,
  options: { dateModified?: number } = {},
): SourceItem {
  return {
    relativePath,
    name: relativePath.split('/').pop() as string,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: async () => {
      const decoder = new TextDecoder();
      arrayBuffer = await arrayBuffer;
      if (arrayBuffer instanceof Uint8Array) {
        arrayBuffer = arrayBuffer.buffer;
      }
      const text = decoder.decode(arrayBuffer);
      return text;
    },
    arrayBuffer: async () => {
      arrayBuffer = await arrayBuffer;
      if (arrayBuffer instanceof Uint8Array) {
        arrayBuffer = arrayBuffer.buffer;
      }
      return arrayBuffer;
    },
  };
}
