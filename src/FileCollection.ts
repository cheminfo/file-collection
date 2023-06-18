import { CachedFileItem } from './CachedFileItem';
import { ExtendedSourceItem } from './ExtendedSourceItem';
import { FileItem } from './FileItem';
import { FilterOptions, Options } from './Options';
import { Source } from './Source';
import { ZipFileContent } from './ZipFileContent';
import { appendArrayBuffer } from './append/appendArrayBuffer';
import { appendFileList } from './append/appendFileList';
import { appendPath } from './append/appendPath';
import { appendSource } from './append/appendSource';
import { appendText } from './append/appendText';
import { appendWebSource } from './append/appendWebSource';
import { fromIum } from './fromIum';
import { ToIumOptions, toIum } from './toIum';
import { convertExtendedSourceToFile } from './utilities/convertExtendedSourceToFile';
import { expandAndFilter } from './utilities/expand/expandAndFilter';
import { getNameInfo } from './utilities/getNameInfo';
import { shouldAddItem } from './utilities/shouldAddItem';

export class FileCollection {
  readonly files: FileItem[];
  readonly sources: ExtendedSourceItem[];
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
  async appendExtendedSource(source: ExtendedSourceItem): Promise<void> {
    if (!shouldAddItem(source.relativePath, this.filter)) return;
    this.sources.push(source);
    const sourceFile = convertExtendedSourceToFile(source);
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

  /**
   * Save an object to the collection. This method will convert typed array to normal array and will
   * replace potentially existing file with the same name.
   * @param key
   * @param value
   * @returns
   */
  set(key: string, value: any): Promise<void> {
    this.removeFile(key);
    const string = JSON.stringify(value, (key, value) =>
      ArrayBuffer.isView(value) ? Array.from(value as any) : value,
    );
    return this.appendText(key, string);
  }

  removeFile(originalRelativePath: string): void | FileItem {
    const { relativePath } = getNameInfo(originalRelativePath);
    const index = this.files.findIndex((f) => f.relativePath === relativePath);
    let removedFile;
    if (index !== -1) {
      const sourceUUID = this.files[index].sourceUUID;
      removedFile = this.files.splice(index, 1)[0];
      // any other files with the same sourceUUID?
      if (this.files.some((f) => f.sourceUUID === sourceUUID)) return;
      // delete the source
      const sourceIndex = this.sources.findIndex((s) => s.uuid === sourceUUID);
      if (sourceIndex !== -1) {
        this.sources.splice(sourceIndex, 1);
      } else {
        throw new Error(`Source not found for UUID: ${sourceUUID}`);
      }
    }
    return removedFile;
  }

  async get(key: string): Promise<any> {
    const { relativePath } = getNameInfo(key);
    const file = this.files.find((f) => f.relativePath === relativePath);
    if (!file) {
      throw new Error(`Key not found: ${key}`);
    }
    const string = await file.text();
    return JSON.parse(string);
  }

  appendWebSource(
    webSourceURL: string,
    options: { baseURL?: string } = {},
  ): Promise<void> {
    return appendWebSource(this, webSourceURL, options);
  }

  appendFileList(fileList: FileList): Promise<void> {
    return appendFileList(this, fileList);
  }

  appendSource(webSource: Source, options: { baseURL?: string } = {}) {
    return appendSource(this, webSource, options);
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

  toIum(options: ToIumOptions = {}) {
    this.alphabetical();
    return toIum(this, options);
  }

  static async fromIum(ium: ZipFileContent) {
    const fileCollection = await fromIum(ium);
    fileCollection.alphabetical();
    return fileCollection;
  }

  alphabetical() {
    this.sources.sort((a: ExtendedSourceItem, b: ExtendedSourceItem) =>
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
