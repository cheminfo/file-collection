import type { Options } from './Options.js';

export interface SourceItem {
  uuid?: string;
  /**
   * If there is an originalRelativePath,
   * `ItemData` methods must use it instead of `relativePath`
   * to get the data from a distant resource.
   */
  originalRelativePath?: string;
  relativePath: string;
  lastModified?: number;
  size?: number;

  /**
   * If the baseURL don't start with 'ium:/', it should be a http(s) base url.
   * To fetch the resource, the url should be `new URL(originalRelativePath ?? relativePath, baseURL)`
   */
  baseURL?: 'ium:/' | string | undefined;
  /**
   * If true, this source contains extra data not bound into the /data directory
   * Only used for source with baseURL 'ium:/'
   */
  extra?: boolean;
  options?: Options;
}
