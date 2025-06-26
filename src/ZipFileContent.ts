export interface ZipFileContentInput {
  /**
   * Primitives from file reading libraries
   */
  buffer: Uint8Array | ArrayBuffer | Blob;

  /**
   * From file reading stream api
   */
  stream: ReadableStream;
}

export type ZipFileContent = ZipFileContentInput[keyof ZipFileContentInput];
