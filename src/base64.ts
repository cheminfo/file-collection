export async function encode(binary: Uint8Array): Promise<string> {
  return Buffer.from(binary).toString('base64');
}

export async function decode(base64: string): Promise<Uint8Array> {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}
