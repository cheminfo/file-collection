import { Uint8ArrayReader, Uint8ArrayWriter, ZipWriter } from '@zip.js/zip.js';

import type { ExtendedSourceItem } from '../ExtendedSourceItem.js';
import type { FileCollection } from '../FileCollection.js';
import type { FileItem } from '../FileItem.js';

/**
 * This method will zip a file collection and return the zip as an ArrayBuffer
 * @param collection - The file collection to zip
 * @returns Zip as an Uint8Array
 */
export async function toZip(
  collection: FileCollection,
): Promise<Uint8Array<ArrayBuffer>> {
  const zipWriter = new ZipWriter<Uint8Array<ArrayBuffer>>(
    new Uint8ArrayWriter(),
  );

  const sources = new Map<ExtendedSourceItem['uuid'], ExtendedSourceItem>();
  const filesToZip = new Map<ExtendedSourceItem['uuid'], FileItem[]>();

  const promises: Array<Promise<unknown>> = [];

  // zip source ium:/ files
  for (const source of collection.sources) {
    if (source.baseURL !== 'ium:/') {
      filesToZip.set(source.uuid, []);
      sources.set(source.uuid, source);
      continue;
    }

    const zipAdd = zipWriter.add(source.relativePath, source.stream());
    promises.push(zipAdd);
  }

  // group files by sourceUUID if not ium:/
  for (const file of collection.files) {
    const files = filesToZip.get(file.sourceUUID);
    if (!files) continue;
    files.push(file);
  }

  // zip grouped files by sourceUUID
  // add zip of files as ${source.relativePath}.zip
  for (const [sourceUUID, files] of filesToZip) {
    if (files.length === 0) continue;
    const source = sources.get(sourceUUID);
    if (!source) continue;

    promises.push(
      sourceFilesToZip({ files }).then((blob) =>
        zipWriter.add(`${source.relativePath}.zip`, new Uint8ArrayReader(blob)),
      ),
    );
  }

  await Promise.all(promises);
  return await zipWriter.close();
}

interface SourceFilesToZipOptions {
  files: FileItem[];
}
async function sourceFilesToZip(options: SourceFilesToZipOptions) {
  const { files } = options;

  const sourceZipWriter = new ZipWriter<Uint8Array<ArrayBuffer>>(
    new Uint8ArrayWriter(),
  );

  await Promise.all(
    files.map((file) => sourceZipWriter.add(file.relativePath, file.stream())),
  );

  return await sourceZipWriter.close();
}
