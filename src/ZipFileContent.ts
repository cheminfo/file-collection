interface ZipFileContentInput {
  /**
   * Primitives from file reading libraries
   */
  buffer: Uint8Array | ArrayBuffer | Blob;

  /**
   * From file reading stream api
   */
  stream: ReadableStream;

  /**
   * Base64 encoded string representation of the zip file content.
   * It can be obtained by:
   * - encoding buffer to base64
   *   - using `FileReader.readAsDataURL`
   * - `base64` binary
   */
  binaryString: string;
}

export type ZipFileContent = ZipFileContentInput[keyof ZipFileContentInput];
