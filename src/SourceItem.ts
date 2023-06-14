export interface SourceItem {
  relativePath: string;
  baseURL: string;
  name: string;
  lastModified?: number;
  size?: number;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  stream?(): ReadableStream<Uint8Array>;
}
