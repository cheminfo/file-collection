import { BlobReader, Uint8ArrayReader, ZipReader } from '@zip.js/zip.js';

import type { ZipFileContent } from '../ZipFileContent.ts';

/**
 * Creates a ZipReader from the provided zip file content.
 * @param buffer - The content of the zip file, which can be a Uint8Array, ArrayBuffer, Blob, or ReadableStream.
 * @returns A ZipReader instance that can be used to read the zip file.
 */
export function getZipReader(buffer: ZipFileContent): ZipReader<unknown> {
  const contentReader = getZipContentReader(buffer);
  return new ZipReader(contentReader);
}

export const UNSUPPORTED_ZIP_CONTENT_ERROR = `Unsupported zip content type.
If you passed a Node.js Stream convert it to Web Stream.
If you passed a (binary) string, decode it to Uint8Array.`;
function getZipContentReader(
  zipContent: ZipFileContent,
): ConstructorParameters<typeof ZipReader>[0] {
  if (zipContent instanceof Uint8Array) {
    // support Node.js Buffer they extend Uint8Array,
    // but when it is read by Uint8ArrayReader it produces `Error: Split zip file`
    // wrap Node.js Buffer into a new Uint8Array fix the issue
    return new Uint8ArrayReader(
      new Uint8Array(
        zipContent.buffer,
        zipContent.byteOffset,
        zipContent.length,
      ),
    );
  } else if (zipContent instanceof ArrayBuffer) {
    return new Uint8ArrayReader(new Uint8Array(zipContent));
  } else if (zipContent instanceof Blob) {
    return new BlobReader(zipContent);
  } else if (zipContent instanceof ReadableStream) {
    return zipContent;
  }

  throw new Error(UNSUPPORTED_ZIP_CONTENT_ERROR);
}
