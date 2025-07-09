import type { ExtendedSourceItem } from '../ExtendedSourceItem.ts';
import type { FileCollection } from '../FileCollection.ts';

// eslint-disable-next-line jsdoc/require-jsdoc
export async function appendFileList(
  fileCollection: FileCollection,
  fileList: Iterable<File>,
) {
  await Promise.all(toSourceAppend(fileCollection, fileList));
}

function* toSourceAppend(
  fileCollection: FileCollection,
  fileList: Iterable<File>,
) {
  for (const file of fileList) {
    const source: ExtendedSourceItem = {
      uuid: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      baseURL: 'ium:/',
      // @ts-expect-error We allow file.path as alternative to webkitRelativePath
      relativePath: file.webkitRelativePath || file.path || file.name,
      lastModified: file.lastModified,
      text: () => file.text(),
      arrayBuffer: () => file.arrayBuffer(),
      stream: () => file.stream(),
    };

    yield fileCollection.appendExtendedSource(source);
  }
}
