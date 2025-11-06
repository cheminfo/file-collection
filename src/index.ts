import { configure } from '@zip.js/zip.js';

configure({
  useCompressionStream: true,
  useWebWorkers: false,
});

export * from './FileCollection.ts';

export type { ZipFileContent, ZipFileContentInput } from './ZipFileContent.ts';
export type { FileItem } from './FileItem.ts';
export type { ExtendedSourceItem } from './ExtendedSourceItem.ts';
export type {
  FilterOptions,
  Options,
  UngzipExpandOptions,
  UnzipExpandOptions,
} from './Options.js';
export type {
  ExtraFileContent,
  ToIumOptions,
  ToIumOptionsExtraFile,
} from './toIum.js';
export type { ToIumIndex } from './transformation/ium.js';
export type { Source } from './Source.js';
export type { SourceItem } from './SourceItem.js';
export { MERGE_STRATEGY } from './append/append_file_collection.ts';
export type {
  AppendFileCollectionOptions,
  MergeStrategy,
} from './append/append_file_collection.ts';

/**
 * Tools using this package can configure zip.js with the following `zipJsConfigure` method
 *
 * The default configuration from FileCollection is:
 * ```ts
 * configure({
 *   useCompressionStream: true,
 *   useWebWorkers: false,
 * });
 * ```
 * @see https://github.com/gildas-lormeau/zip.js/tree/master/dist
 */
export { configure as zipJsConfigure } from '@zip.js/zip.js';
export type { Configuration as ZipJsConfiguration } from '@zip.js/zip.js';
