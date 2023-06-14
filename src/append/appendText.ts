import { FileCollection } from '../FileCollection';
import { SourceItem } from '../SourceItem';

export async function appendText(
  fileCollection: FileCollection,
  relativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
) {
  const source = getSourceFromText(relativePath, text, options);
  await fileCollection.appendSource(source);
}

function getSourceFromText(
  relativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
): SourceItem {
  const url = new URL(relativePath, 'ium:/');

  return {
    relativePath: url.pathname,
    name: relativePath.split('/').pop() as string,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: async () => {
      return text;
    },
    arrayBuffer: async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(await text);
      return data.buffer;
    },
  };
}
