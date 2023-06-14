export interface FileItem {
  relativePath: string;
  name: string;
  lastModified?: number;
  size?: number;
  baseURL?: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  stream(): ReadableStream<Uint8Array>;
  text(): Promise<string>;
}
