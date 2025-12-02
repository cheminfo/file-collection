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
} from './ium/to_ium.ts';
export type { ToIumIndex } from './ium/versions/index.js';
export { CURRENT_IUM_VERSION } from './ium/versions/index.js';
export type { Source } from './Source.js';
export type { SourceItem } from './SourceItem.js';
export type { FromIumOptions } from './ium/from_ium.ts';

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
