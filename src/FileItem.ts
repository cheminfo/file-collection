export interface FileItem {
  relativePath: string;
  parent?: FileItem; // if zip of gz file
  name: string;
  lastModified?: number;
  size?: number;
  baseURL?: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
  stream: () => ReadableStream<Uint8Array>;
  text: () => Promise<string>;
  sourceUUID: string;
}
