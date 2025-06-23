import type { FileItem } from './FileItem.ts';

export interface CacheOptions {
  /**
   * Should we cache the data
   * @default false
   */
  cache?: boolean;
}

export class CachedFileItem {
  readonly fileItem: FileItem;
  private textCache?: string;
  private arrayBufferCache?: ArrayBuffer;

  constructor(fileItem: FileItem) {
    this.fileItem = fileItem;
  }
  async text() {
    if (this.arrayBufferCache) {
      return new TextDecoder().decode(this.arrayBufferCache);
    }
    return (this.textCache = this.textCache || (await this.fileItem.text()));
  }
  async arrayBuffer() {
    return (this.arrayBufferCache =
      this.arrayBufferCache || (await this.fileItem.arrayBuffer()));
  }
  stream() {
    return this.fileItem.stream(); // no cache for stream !
  }
  get lastModified() {
    return this.fileItem.lastModified;
  }
  get name() {
    return this.fileItem.name;
  }
  get relativePath() {
    return this.fileItem.relativePath;
  }
  get size() {
    return this.fileItem.size;
  }
  get sourceUUID() {
    return this.fileItem.sourceUUID;
  }
}
