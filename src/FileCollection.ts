import { FileItem } from './FileItem';
import { Options } from './Options';
import { SourceItem } from './SourceItem';
import { ZipFileContent } from './ZipFileContent';
import { appendArrayBuffer } from './append/appendArrayBuffer';
import { appendFileList } from './append/appendFileList';
import { appendText } from './append/appendText';
import { fromIum } from './fromIum';
import { toIum } from './toIum';
import { expandAndFilter } from './utilities/expand/expandAndFilter';

export class FileCollection {
  readonly files: FileItem[];
  readonly sources: SourceItem[];
  readonly options: Options;

  constructor(options: Options = {}) {
    this.options = options;
    this.files = [];
    this.sources = [];
  }

  async appendSource(source: SourceItem) {
    this.sources.push(source);
    this.files.push(...(await expandAndFilter(source)));
  }

  async appendFileList(fileList: FileList) {
    await appendFileList(this, fileList);
  }

  async appendText(
    relativePath: string,
    text: string | Promise<string>,
    options: { dateModified?: number } = {},
  ) {
    await appendText(this, relativePath, text, options);
  }

  async appendArrayBuffer(
    relativePath: string,
    arrayBuffer: ArrayBuffer | Promise<ArrayBuffer>,
    options: { dateModified?: number } = {},
  ) {
    await appendArrayBuffer(this, relativePath, arrayBuffer, options);
  }

  toIum() {
    return toIum(this);
  }

  static fromIum(ium: ZipFileContent) {
    return fromIum(ium);
  }

  [Symbol.iterator]() {
    return this.files.values();
  }
}
