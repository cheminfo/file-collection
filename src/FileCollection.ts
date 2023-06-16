import { CachedFileItem } from './CachedFileItem';
import { FileItem } from './FileItem';
import { FilterOptions, Options } from './Options';
import { SourceItem } from './SourceItem';
import { WebSource } from './WebSourceFile';
import { ZipFileContent } from './ZipFileContent';
import { appendArrayBuffer } from './append/appendArrayBuffer';
import { appendFileList } from './append/appendFileList';
import { appendPath } from './append/appendPath';
import { appendText } from './append/appendText';
import { appendWebSource } from './append/appendWebSource';
import { fromIum } from './fromIum';
import { toIum } from './toIum';
import { convertSourceToFile } from './utilities/convertSourceToFile';
import { expandAndFilter } from './utilities/expand/expandAndFilter';
import { shouldAddItem } from './utilities/shouldAddItem';

export class FileCollection {
  readonly files: FileItem[];
  readonly sources: SourceItem[];
  readonly options: Options;
  readonly filter: FilterOptions;
  readonly cache: boolean;

  constructor(options: Options = {}) {
    this.options = options;
    this.filter = options.filter || {};
    this.files = [];
    this.sources = [];
    this.cache = options.cache ?? false;
  }

  /**
   * This is unexpected to be used directly
   * @param source
   * @private
   */
  async appendSource(source: SourceItem): Promise<void> {
    if (!shouldAddItem(source.relativePath, this.filter)) return;
    this.sources.push(source);
    const sourceFile = convertSourceToFile(source);
    const files = await expandAndFilter(sourceFile, this.options);
    for (const file of files) {
      if (
        this.files.some(
          (existing) => existing.relativePath === file.relativePath,
        )
      ) {
        throw new Error(`Duplicate relativePath: ${file.relativePath}`);
      }
      if (this.cache) {
        this.files.push(new CachedFileItem(file));
      } else {
        this.files.push(file);
      }
    }
  }

  appendFileList(fileList: FileList): Promise<void> {
    return appendFileList(this, fileList);
  }

  appendWebSource(webSource: WebSource, options: { baseURL?: string } = {}) {
    return appendWebSource(this, webSource, options);
  }
  /**
   * This method can only be used from nodejs and will throw an error in the browser
   */
  appendPath(path: string): Promise<void> {
    return appendPath(this, path);
  }

  appendText(
    relativePath: string,
    text: string | Promise<string>,
    options: { dateModified?: number } = {},
  ): Promise<void> {
    return appendText(this, relativePath, text, options);
  }

  appendArrayBuffer(
    relativePath: string,
    arrayBuffer: ArrayBuffer | Promise<ArrayBuffer>,
    options: { dateModified?: number } = {},
  ): Promise<void> {
    return appendArrayBuffer(this, relativePath, arrayBuffer, options);
  }

  toIum() {
    this.alphabetical();
    return toIum(this);
  }

  static async fromIum(ium: ZipFileContent) {
    const fileCollection = await fromIum(ium);
    fileCollection.alphabetical();
    return fileCollection;
  }

  alphabetical() {
    this.sources.sort((a: SourceItem, b: SourceItem) =>
      a.relativePath < b.relativePath ? -1 : 1,
    );
    this.files.sort((a: FileItem, b: FileItem) =>
      a.relativePath < b.relativePath ? -1 : 1,
    );
  }

  [Symbol.iterator]() {
    return this.files.values();
  }
}
