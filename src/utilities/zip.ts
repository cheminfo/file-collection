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
