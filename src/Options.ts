import { Logger } from 'cheminfo-types';

export type FilterOptions = {
  /**
   * Should we ignored files starting with dot
   * @default true
   */
  ignoreDotfiles?: boolean;
};

export type UnzipExpandOptions = {
  /**
   * List of extensions to expand
   * @default ['zip']
   */
  zipExtensions?: string[];
  /**
   * Recursively expand all zip and gzip files
   * @default true
   */
  recursive?: boolean;
};

export type UngzipExpandOptions = {
  /**
   * List of extensions to expand
   * @default ['gz']
   */
  gzipExtensions?: string[];
};

export type Options = {
  /**
   * Filter options that determines the files to include / exclude
   * @default {}
   */
  filter?: FilterOptions;
  /**
   * Expand all zip files
   * Set this value to undefined to prevent unzip
   * @default {}
   */
  unzip?: UnzipExpandOptions;
  /**
   * Expand all gzip files
   * Set this value to undefined to prevent ungzip
   * @default {}
   */
  ungzip?: UngzipExpandOptions;
  logger?: Logger;
};
