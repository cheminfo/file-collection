import type { Logger } from 'cheminfo-types';

export interface FilterOptions {
  /**
   * Should we ignored files starting with dot
   * @default true
   */
  ignoreDotfiles?: boolean;
}

export interface UnzipExpandOptions {
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
}

export interface UngzipExpandOptions {
  /**
   * List of extensions to expand
   * @default ['gz']
   */
  gzipExtensions?: string[];
}

export interface Options {
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
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function mergeOptions(base: Options, override: Options) {
  // merge options
  const options: Options = {
    filter: override.filter
      ? { ...base.filter, ...override.filter }
      : base.filter,
    unzip: override.unzip ? { ...base.unzip, ...override.unzip } : base.unzip,
    ungzip: override.ungzip
      ? { ...base.ungzip, ...override.ungzip }
      : base.ungzip,
    logger: override.logger ?? base.logger,
  };

  // remove undefined values
  if (!options.filter) {
    delete options.filter;
  } else if (typeof options.filter.ignoreDotfiles !== 'boolean') {
    delete options.filter.ignoreDotfiles;
  }
  if (!options.unzip) {
    delete options.unzip;
  } else {
    if (typeof options.unzip.recursive !== 'boolean') {
      delete options.unzip.recursive;
    }
    if (!options.unzip.zipExtensions) delete options.unzip.zipExtensions;
  }
  if (!options.ungzip) {
    delete options.ungzip;
  } else if (!options.ungzip.gzipExtensions) {
    delete options.ungzip.gzipExtensions;
  }
  if (!options.logger) delete options.logger;

  return options;
}
