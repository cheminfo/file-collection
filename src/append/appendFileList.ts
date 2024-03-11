import { v4 } from '@lukeed/uuid';

import { ExtendedSourceItem } from '../ExtendedSourceItem';
import { FileCollection } from '../FileCollection';

export async function appendFileList(
  fileCollection: FileCollection,
  fileList: FileList,
) {
  const promises = [];
  for (const file of fileList) {
    const source: ExtendedSourceItem = {
      uuid: v4(),
      name: file.name,
      size: file.size,
      baseURL: 'ium:/',
      //@ts-expect-error We allow file.path as alternative to webkitRelativePath
      relativePath: file.webkitRelativePath || file.path || file.name,
      lastModified: file.lastModified,
      text: () => file.text(),
      arrayBuffer: () => file.arrayBuffer(),
      stream: () => file.stream(),
    };
    promises.push(fileCollection.appendExtendedSource(source));
  }
  await Promise.all(promises);
}
