import type { Options } from './Options.js';

export interface SourceItem {
  uuid?: string;
  relativePath: string;
  lastModified?: number;
  size?: number;
  baseURL?: 'ium:/' | string | undefined;
  /**
   * If true, this source contains extra data not bound into the /data directory
   * Only used for source with baseURL 'ium:/'
   */
  extra?: boolean;
  options?: Options;
}
