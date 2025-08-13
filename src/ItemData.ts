export interface ItemData {
  arrayBuffer: () => Promise<ArrayBufferLike>;
  text: () => Promise<string>;
  stream: () => ReadableStream<Uint8Array>;
}
