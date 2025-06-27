import { configure } from '@zip.js/zip.js';

configure({
  useCompressionStream: true,
  useWebWorkers: false,
});

export * from './FileCollection.ts';

export type { ZipFileContent, ZipFileContentInput } from './ZipFileContent.ts';
export type { FileItem } from './FileItem.js';
export type { ExtendedSourceItem } from './ExtendedSourceItem.js';
export type {
  Options,
  FilterOptions,
  UngzipExpandOptions,
  UnzipExpandOptions,
} from './Options.js';
export type { ToIumOptions } from './toIum.js';

/**
 * Tools using this package can configure zip.js with the following `zipJsConfigure` method
 *
 * default configuration from FileCollection is:
 * ```ts
 * configure({
 *   useCompressionStream: true,
 *   useWebWorkers: false,
 * });
 *
 * @see https://github.com/gildas-lormeau/zip.js/tree/master/dist
 * ```
 */
export { configure as zipJsConfigure } from '@zip.js/zip.js';
export type { Configuration as ZipJsConfiguration } from '@zip.js/zip.js';
