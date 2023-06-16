import JSZip from 'jszip';

import { FileItem } from '../../FileItem';
import { Options } from '../../Options';
import { shouldAddItem } from '../shouldAddItem';

export type ZipFileContent = Parameters<typeof JSZip.loadAsync>[0];

export async function fileItemsFromZip(
  zipContent: ZipFileContent,
  sourceUUID: string,
  options: Options = {},
) {
  const jsZip = new JSZip();
  const zip = await jsZip.loadAsync(zipContent);
  let fileItems: FileItem[] = [];
  for (let key in zip.files) {
    const entry = zip.files[key];
    if (entry.dir) continue;
    if (!shouldAddItem(entry.name, options.filter)) continue;
    const item = {
      name: entry.name.replace(/^.*\//, ''),
      sourceUUID,
      relativePath: entry.name,
      lastModified: entry.date.getTime(),
      // @ts-expect-error _data is not exposed because missing for folder   but it is really there
      size: entry._data.uncompressedSize,
      text: () => {
        return entry.async('text');
      },
      arrayBuffer: () => {
        return entry.async('arraybuffer');
      },
      stream: () => {
        return new ReadableStream({
          start(controller) {
            void entry.async('arraybuffer').then((arrayBuffer) => {
              controller.enqueue(arrayBuffer);
              controller.close();
            });
          },
        });
      },
    };
    fileItems.push(item);
  }
  return fileItems;
}
