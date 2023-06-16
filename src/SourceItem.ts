export interface SourceItem {
  uuid: string;
  relativePath: string;
  baseURL: string | undefined;
  name: string;
  lastModified?: number;
  size?: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
  text: () => Promise<string>;
  stream: () => ReadableStream<Uint8Array>;
}
