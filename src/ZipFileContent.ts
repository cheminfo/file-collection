// There is some ts incompatibilities between
// Node.js Web ReadableStream and globalThis.ReadableStream.
// So we explicitly support both types to avoid ts errors.
import type { ReadableStream as NodeWebRS } from 'node:stream/web';

export interface ZipFileContentInput {
  /**
   * Primitives from file reading libraries
   */
  buffer: Uint8Array | ArrayBufferLike | Blob;

  /**
   * From file reading stream api
   */
  stream: ReadableStream | NodeWebRS;
}

export type ZipFileContent = ZipFileContentInput[keyof ZipFileContentInput];
