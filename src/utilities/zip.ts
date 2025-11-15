const SIGNATURE_NORMAL = 0x504b0304; // PK\x03\x04
const SIGNATURE_EMPTY = 0x504b0506; // PK\x05\x06
const SIGNATURE_SPANNED = 0x504b0708; // PK\x07\x08
const SIGNATURES = new Set([
  SIGNATURE_NORMAL,
  SIGNATURE_EMPTY,
  SIGNATURE_SPANNED,
]);

/**
 * Fast check if the buffer is a zip file
 * @param buffer - the buffer to check
 * @returns boolean
 */
export function isZip(buffer: ArrayBufferLike): boolean {
  // https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT#:~:text=4.3.16%20end%20of%20central%20directory%20record%3A
  // empty zip file has minimal 22 bytes size (it's only an "end of central directory record")
  // normal / spanned zip files have minimal 30 bytes
  if (buffer.byteLength < 22) return false;

  const view = new DataView(buffer);
  const signature = view.getUint32(0, false);
  return SIGNATURES.has(signature);
}

/*
 4.3.7  Local file header:
    local file header signature     4 bytes  (0x04034b50)
    version needed to extract       2 bytes
    general purpose bit flag        2 bytes
    compression method              2 bytes
    last mod file time              2 bytes
    last mod file date              2 bytes
    crc-32                          4 bytes
    compressed size                 4 bytes
    uncompressed size               4 bytes
    file name length                2 bytes
    extra field length              2 bytes

    file name (variable size)
    extra field (variable size)
 */
const MIMETYPE_FILENAME = 'mimetype';
const COMPRESSION_METHOD_OFFSET =
  4 + // local file header signature
  2 + // version needed to extract
  2; // general purpose bit flag
const UNCOMPRESSION_SIZE_OFFSET =
  COMPRESSION_METHOD_OFFSET +
  2 + // compression method
  2 + // last mod file time
  2 + // last mod file date
  4 + // crc-32
  4; // compressed size
const FILENAME_SIZE_OFFSET = UNCOMPRESSION_SIZE_OFFSET + 4; // uncompressed size
const EXTRA_FIELD_SIZE_OFFSET = FILENAME_SIZE_OFFSET + 2; // file name length;
const LOCAL_FILE_HEADER_MINIMAL_SIZE = EXTRA_FIELD_SIZE_OFFSET + 2; // extra field length;

/**
 * Check if the buffer is a valid ium archive.
 * Check the mimetype if provided.
 * The check assume the first entry:
 *  - is a file with name "mimetype"
 *  - the size of the file is in the local file header
 *    (some zip tools can set it to 0 and put the size into the data descriptor)
 *  - the compression method is 0 (store)
 * @param buffer - the buffer to check
 * @param mimetype - the mimetype to check as the first file in zip named "mimetype"
 * @returns boolean
 */
export function isIum(
  buffer: ArrayBufferLike,
  mimetype: string | undefined,
): boolean {
  if (buffer.byteLength < LOCAL_FILE_HEADER_MINIMAL_SIZE) return false;

  const view = new DataView(buffer);
  const signature = view.getUint32(0, false);

  // ium archive is never empty, and zip spanned is not supported
  if (signature !== SIGNATURE_NORMAL) return false;

  // if no mimetype to check, we consider it as valid
  if (typeof mimetype !== 'string') return true;

  // mimetype file must not be compressed
  const compressionMethod = view.getUint16(COMPRESSION_METHOD_OFFSET, true);
  if (compressionMethod > 0) return false;

  const nameSize = view.getUint16(FILENAME_SIZE_OFFSET, true);
  if (nameSize !== 8) return false; // if size is not 8, it cannot be a file named "mimetype"

  const fileSize = view.getUint32(UNCOMPRESSION_SIZE_OFFSET, true);
  const extraFieldLength = view.getUint16(EXTRA_FIELD_SIZE_OFFSET, true);

  const startFilename = LOCAL_FILE_HEADER_MINIMAL_SIZE;
  const startExtraField = startFilename + nameSize;
  const startFileData = startExtraField + extraFieldLength;
  const minimalTotalSize = startFileData + fileSize;

  // The buffer may be truncated
  if (buffer.byteLength < minimalTotalSize) return false;

  const filename = new TextDecoder().decode(
    buffer.slice(startFilename, startExtraField),
  );

  // the first file of the zip is not a mimetype file
  if (filename !== MIMETYPE_FILENAME) return false;

  const mimetypeValue = new TextDecoder().decode(
    buffer.slice(startFileData, minimalTotalSize),
  );

  return mimetypeValue === mimetype;
}
