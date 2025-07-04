import { CachedFileItem } from './CachedFileItem.ts';
import type { ExtendedSourceItem } from './ExtendedSourceItem.ts';
import type { FileItem } from './FileItem.ts';
import type { FilterOptions, Options } from './Options.ts';
import type { Source } from './Source.ts';
import type { ZipFileContent } from './ZipFileContent.ts';
import { appendArrayBuffer } from './append/appendArrayBuffer.ts';
import { appendFileList } from './append/appendFileList.ts';
import { appendPath } from './append/appendPath.ts';
import { appendSource } from './append/appendSource.ts';
import { appendText } from './append/appendText.ts';
import { appendWebSource } from './append/appendWebSource.ts';
import { fromIum } from './fromIum.ts';
import { fromZip } from './from_zip.js';
import type { ToIumOptions } from './toIum.ts';
import { toIum } from './toIum.ts';
import { convertExtendedSourceToFile } from './utilities/convertExtendedSourceToFile.ts';
import { expandAndFilter } from './utilities/expand/expandAndFilter.ts';
import { getNameInfo } from './utilities/getNameInfo.ts';
import { shouldAddItem } from './utilities/shouldAddItem.ts';

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
      const file = this.files[index];
      const sourceUUID = file?.sourceUUID;
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
   * @param path
   * @param options
   * @param options.keepBasename
   */
  appendPath(
    path: string,
    options: { keepBasename?: boolean } = {},
  ): Promise<void> {
    return appendPath(this, path, options);
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

  static async fromZip(
    zipContent: ZipFileContent,
    options: Options = {},
  ): Promise<FileCollection> {
    const collection = new FileCollection(options);
    await fromZip(collection, zipContent, options);
    collection.alphabetical();
    return collection;
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
