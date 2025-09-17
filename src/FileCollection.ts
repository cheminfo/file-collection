import { CachedFileItem } from './CachedFileItem.ts';
import type { ExtendedSourceItem } from './ExtendedSourceItem.ts';
import { cloneExtendedSourceItem } from './ExtendedSourceItem.ts';
import type { FileItem } from './FileItem.ts';
import { cloneFileItem } from './FileItem.ts';
import type { Options } from './Options.ts';
import { mergeOptions } from './Options.ts';
import type { Source } from './Source.ts';
import type { ZipFileContent } from './ZipFileContent.ts';
import type { SupportedBufferInput } from './append/appendArrayBuffer.ts';
import { appendArrayBuffer } from './append/appendArrayBuffer.ts';
import { appendFileList } from './append/appendFileList.ts';
import { appendPath } from './append/appendPath.ts';
import { appendSource } from './append/appendSource.ts';
import { appendText } from './append/appendText.ts';
import { appendWebSource } from './append/appendWebSource.ts';
import { fromIum } from './fromIum.ts';
import type { ToIumOptions } from './toIum.ts';
import { toIum } from './toIum.ts';
import { convertExtendedSourceToFile } from './utilities/convertExtendedSourceToFile.ts';
import { expandAndFilter } from './utilities/expand/expandAndFilter.ts';
import { filterFileCollection } from './utilities/filter_file_collection.ts';
import { getNameInfo } from './utilities/getNameInfo.ts';
import { shouldAddItem } from './utilities/shouldAddItem.ts';
import { fromZip } from './zip/from_zip.ts';
import { toZip } from './zip/to_zip.js';

export class FileCollection {
  readonly files: FileItem[];
  readonly sources: ExtendedSourceItem[];
  readonly options: Options;

  constructor(options: Options = {}, toClone?: FileCollection) {
    this.options = toClone ? mergeOptions(toClone.options, options) : options;
    if (toClone) {
      this.files = toClone.files.map((file) => {
        file = cloneFileItem(file);

        return this.options.cache ? new CachedFileItem(file) : file;
      });
      this.sources = toClone.sources.map(cloneExtendedSourceItem);
    } else {
      this.files = [];
      this.sources = [];
    }
  }

  /**
   * This is unexpected to be used directly
   * @param source - The source to append, which should be an ExtendedSourceItem.
   * @param itemOptions - Options for the item, which will be merged with the collection's options.
   * @private
   * @returns - A promise that resolves to the FileCollection instance.
   */
  async appendExtendedSource(
    source: ExtendedSourceItem,
    itemOptions?: Options,
  ): Promise<this> {
    const options = itemOptions
      ? mergeOptions(this.options, itemOptions)
      : this.options;
    const shouldAdd = shouldAddItem(source.relativePath, options.filter);
    if (!shouldAdd) return this;

    this.sources.push(source);

    const sourceFile = convertExtendedSourceToFile(source);
    const files = await expandAndFilter(sourceFile, options);

    const existingFiles = new Set(this.files.map((f) => f.relativePath));
    for (const file of files) {
      if (existingFiles.has(file.relativePath)) {
        throw new Error(`Duplicate relativePath: ${file.relativePath}`);
      }
      if (options.cache) {
        this.files.push(new CachedFileItem(file));
      } else {
        this.files.push(file);
      }
    }

    return this;
  }

  /**
   * Save an object to the collection.
   * This method will convert typed arrays to normal arrays and will
   * replace a potentially existing file with the same name.
   * @param key - The key is the relative path of the file in the collection.
   * @param value - The value is the object to save.
   *   It will be serialized using JSON.stringify.
   * @returns A promise that resolves when the file is saved.
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  set(key: string, value: any): Promise<this> {
    this.removeFile(key);
    const string = JSON.stringify(value, (key, value) =>
      ArrayBuffer.isView(value) ? Array.from(value as any) : value,
    );
    return this.appendText(key, string);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(key: string): Promise<any> {
    const { relativePath } = getNameInfo(key);
    const file = this.files.find((f) => f.relativePath === relativePath);
    if (!file) {
      throw new Error(`Key not found: ${key}`);
    }
    const string = await file.text();
    return JSON.parse(string);
  }

  async appendWebSource(
    webSourceURL: string,
    options: { baseURL?: string } = {},
  ): Promise<this> {
    await appendWebSource(this, webSourceURL, options);

    return this;
  }

  /**
   * This method will append a list of files to the collection.
   * @param fileList - pass a FileList (from dom input file element or similar) or an iterable of File objects.
   * @returns - A promise that resolves when the files are appended.
   */
  async appendFileList(fileList: Iterable<File>): Promise<this> {
    await appendFileList(this, fileList);

    return this;
  }

  async appendSource(
    webSource: Source,
    options: { baseURL?: string } = {},
  ): Promise<this> {
    await appendSource(this, webSource, options);

    return this;
  }

  /**
   * This method can only be used from nodejs and will throw an error in the browser
   * @param path - The path to the file or directory to append.
   * @param options - Options for appending the path.
   * @param [options.keepBasename=true] - If true, the basename of the path will be kept as the relative path.
   * @returns A promise that resolves when the path is appended.
   */
  async appendPath(
    path: string,
    options: { keepBasename?: boolean } = {},
  ): Promise<this> {
    await appendPath(this, path, options);

    return this;
  }

  async appendText(
    relativePath: string,
    text: string | Promise<string>,
    options: { dateModified?: number } = {},
  ): Promise<this> {
    await appendText(this, relativePath, text, options);

    return this;
  }

  async appendArrayBuffer(
    relativePath: string,
    arrayBuffer: SupportedBufferInput,
    options: { dateModified?: number } = {},
  ): Promise<this> {
    await appendArrayBuffer(this, relativePath, arrayBuffer, options);

    return this;
  }

  toIum(options: ToIumOptions = {}) {
    return toIum(this.alphabetical(), options);
  }

  toZip() {
    return toZip(this);
  }

  static async fromIum(ium: ZipFileContent) {
    const fileCollection = await fromIum(ium);
    return fileCollection.alphabetical();
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

  static async fromPath(
    path: string,
    collectionOptions: Options = {},
    options: { keepBasename?: boolean } = {},
  ): Promise<FileCollection> {
    const collection = new FileCollection(collectionOptions);
    await collection.appendPath(path, options);
    return collection;
  }

  static async fromSource(
    source: Source,
    collectionOptions: Options = {},
    options: { baseURL?: string } = {},
  ): Promise<FileCollection> {
    const collection = new FileCollection(collectionOptions);
    await collection.appendSource(source, options);
    collection.alphabetical();
    return collection;
  }

  static fromCollection(
    collection: FileCollection,
    options?: Options,
  ): FileCollection {
    return new FileCollection(options, collection);
  }

  alphabetical(): this {
    this.sources.sort((a, b) => (a.relativePath < b.relativePath ? -1 : 1));
    this.files.sort((a, b) => (a.relativePath < b.relativePath ? -1 : 1));

    return this;
  }

  [Symbol.iterator]() {
    return this.files.values();
  }

  /**
   * Filter files of the collection based on a predicate function.
   * @param predicate - Function which takes a FileItem, its index, and the array of FileItems, must return a boolean.
   *  True to keep the file, false to remove it.
   * @returns A new FileCollection containing only the files that match the predicate (and sources attached to these files).
   */
  filter(
    predicate: (
      this: FileItem[],
      file: FileItem,
      index: number,
      array: FileItem[],
    ) => boolean,
  ): FileCollection {
    return filterFileCollection(
      this,
      predicate,
      new FileCollection(this.options),
    );
  }
}
