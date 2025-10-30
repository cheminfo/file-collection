// There is some ts incompatibilities between
// Node.js Web ReadableStream and globalThis.ReadableStream.
// So we explicitly support both types to avoid ts errors.
import type { ReadableStream as NodeWebRS } from 'node:stream/web';

import type { ZipReader, ZipWriterAddDataOptions } from '@zip.js/zip.js';
import {
  BlobReader,
  TextReader,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from '@zip.js/zip.js';

import type { FileCollection } from './FileCollection.ts';
import type { Options } from './Options.ts';
import { mergeOptions } from './Options.ts';
import type { SourceItem } from './SourceItem.ts';
import type { ToIumIndex } from './transformation/ium.js';
import { toIumSourceToPath } from './transformation/source_zip.js';
import { shouldAvoidCompression } from './utilities/should_avoid_compression.ts';

export interface ExtraFileContentInput {
  /**
   * Primitives from file reading libraries
   */
  buffer: Uint8Array | ArrayBufferLike | Blob;

  /**
   * From file reading stream api
   */
  stream: ReadableStream | NodeWebRS;

  /**
   * Raw text content (no binary string encoding nor base64)
   */
  text: string;
}

export type ExtraFileContent =
  ExtraFileContentInput[keyof ExtraFileContentInput];

export interface ToIumOptionsExtraFile {
  relativePath: string;
  data: ExtraFileContent;
  options?: Options;
}

export interface ToIumOptions {
  /**
   * If true, the data of the files will always be included in the zip.
   * @default true
   */
  includeData?: boolean;

  getExtraFiles?: (
    index: ToIumIndex,
    fileCollection: FileCollection,
  ) => Iterable<ToIumOptionsExtraFile>;
}
/**
 * This method will zip a file collection and return the zip as an ArrayBuffer
 * @param fileCollection - The file collection to zip
 * @param options - Options for the zip process
 * @returns Zip as an Uint8Array
 */
export async function toIum(
  fileCollection: FileCollection,
  options: ToIumOptions = {},
): Promise<Uint8Array<ArrayBuffer>> {
  const { includeData = true, getExtraFiles } = options;
  const zipWriter = new ZipWriter<Uint8Array<ArrayBuffer>>(
    new Uint8ArrayWriter(),
  );

  const sources: SourceItem[] = [];
  const promises: Array<Promise<unknown>> = [];
  for (const source of fileCollection.sources) {
    const newSource: SourceItem = {
      uuid: source.uuid,
      relativePath: source.relativePath,
      baseURL: source.baseURL,
      lastModified: source.lastModified,
      size: source.size,
      extra: source.extra,
      options: source.options,
    };
    sources.push(newSource);
    const shouldIncludeFile = includeData || source.baseURL === 'ium:/';
    if (!shouldIncludeFile) continue;

    newSource.baseURL = 'ium:/';
    const pathname = toIumSourceToPath(newSource);

    const addOptions: ZipWriterAddDataOptions | undefined =
      shouldAvoidCompression(source) ? { compressionMethod: 0 } : undefined;
    promises.push(zipWriter.add(pathname, source.stream(), addOptions));
  }

  await Promise.all(promises);

  const index: ToIumIndex = {
    options: fileCollection.options,
    sources,
  };

  if (getExtraFiles) {
    await Promise.all(
      map(
        getExtraFiles(structuredClone(index), fileCollection),
        async (extraFile) => {
          const { relativePath, data } = extraFile;

          const source: SourceItem = {
            extra: true,
            baseURL: 'ium:/',
            relativePath,
            options: extraFile.options
              ? mergeOptions(fileCollection.options, extraFile.options)
              : fileCollection.options,
          };
          sources.push(source);
          const pathname = toIumSourceToPath(source);

          const addOptions: ZipWriterAddDataOptions | undefined =
            shouldAvoidCompression(source)
              ? { compressionMethod: 0 }
              : undefined;
          const fileReader = getExtraFileContentReader(data);
          await zipWriter.add(pathname, fileReader, addOptions);
        },
      ),
    );
  }

  await zipWriter.add(
    'index.json',
    new TextReader(JSON.stringify(index, null, 2)),
  );

  return await zipWriter.close();
}

export const UNSUPPORTED_EXTRA_FILE_CONTENT_ERROR = `Unsupported file content type.
If you passed a Node.js Stream convert it to Web Stream.`;

function getExtraFileContentReader(
  fileContent: ExtraFileContent,
): ConstructorParameters<typeof ZipReader>[0] {
  if (typeof fileContent === 'string') {
    return new TextReader(fileContent);
  } else if (fileContent instanceof Uint8Array) {
    // support Node.js Buffer they extend Uint8Array,
    // but when it is read by Uint8ArrayReader it produces `Error: Split zip file`
    // wrap Node.js Buffer into a new Uint8Array fix the issue
    return new Uint8ArrayReader(
      new Uint8Array(
        fileContent.buffer,
        fileContent.byteOffset,
        fileContent.length,
      ),
    );
  } else if (fileContent instanceof ArrayBuffer) {
    return new Uint8ArrayReader(new Uint8Array(fileContent));
  } else if (fileContent instanceof Blob) {
    return new BlobReader(fileContent);
  } else if (fileContent instanceof ReadableStream) {
    return fileContent;
  }

  throw new Error(UNSUPPORTED_EXTRA_FILE_CONTENT_ERROR);
}

function* map<T, R>(items: Iterable<T>, mapFn: (item: T) => R) {
  for (const item of items) {
    yield mapFn(item);
  }
}
