import type { Options } from './Options.js';

export interface SourceItem {
  uuid?: string;
  relativePath: string;
  lastModified?: number;
  size?: number;
  baseURL?: string | undefined;
  options?: Options;
}
