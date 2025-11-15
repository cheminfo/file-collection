export function isZip(buffer: ArrayBufferLike): boolean {
  if (buffer.byteLength < 5) return false;
  const bytes = new Uint8Array(buffer);
  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  );
}
