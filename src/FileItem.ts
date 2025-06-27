export interface FileItem {
  relativePath: string;
  /**
   * If zip of gz file
   */
  parent?: FileItem;
  name: string;
  lastModified?: number;
  size?: number;
  baseURL?: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
  stream: () => ReadableStream<Uint8Array>;
  text: () => Promise<string>;
  sourceUUID: string;
}
