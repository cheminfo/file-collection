import { v4 } from '@lukeed/uuid';

import { FileCollection } from '../FileCollection';
import { SourceItem } from '../SourceItem';

export async function appendFileList(
  fileCollection: FileCollection,
  fileList: FileList,
) {
  for (const file of fileList) {
    const source: SourceItem = {
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
    await fileCollection.appendSource(source);
  }
}
