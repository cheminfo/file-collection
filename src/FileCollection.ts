import { FileItem } from './FileItem';
import { Options } from './Options';
import { SourceItem } from './SourceItem';
import { ZipFileContent } from './ZipFileContent';
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

  async appendFileList(fileList: FileList) {
    for (const file of fileList) {
      const source: SourceItem = {
        name: file.name,
        size: file.size,
        baseURL: 'ium:/',
        //@ts-expect-error We allow file.path as alternative to webkitRelativePath
        relativePath: file.webkitRelativePath || file.path || file.name,
        lastModified: file.lastModified,
        text: () => file.text(),
        arrayBuffer: () => file.arrayBuffer(),
        stream: () => file.stream(),
      };
      this.sources.push(source);
      this.files.push(...(await expandAndFilter(source)));
    }
  }

  async appendText(
    relativePath: string,
    text: string | Promise<string>,
    options: { dateModified?: number } = {},
  ) {
    const source = getSourceFromText(relativePath, text, options);
    this.sources.push(source);
    this.files.push(...(await expandAndFilter(source)));
    return source;
  }

  async appendArrayBuffer(
    relativePath: string,
    arrayBuffer: ArrayBuffer | Promise<ArrayBuffer>,
    options: { dateModified?: number } = {},
  ) {
    const source = getSourceFromArrayBuffer(relativePath, arrayBuffer, options);
    this.sources.push(source);
    this.files.push(...(await expandAndFilter(source)));
    return source;
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

function getSourceFromText(
  relativePath: string,
  text: string | Promise<string>,
  options: { dateModified?: number } = {},
): SourceItem {
  const url = new URL(relativePath, 'ium:/');

  return {
    relativePath: url.pathname,
    name: relativePath.split('/').pop() as string,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: async () => {
      return text;
    },
    arrayBuffer: async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(await text);
      return data.buffer;
    },
  };
}

function getSourceFromArrayBuffer(
  relativePath: string,
  arrayBuffer: ArrayBuffer | Promise<ArrayBuffer | Uint8Array> | Uint8Array,
  options: { dateModified?: number } = {},
): SourceItem {
  return {
    relativePath,
    name: relativePath.split('/').pop() as string,
    lastModified: options.dateModified || Date.now(),
    baseURL: 'ium:/',
    text: async () => {
      const decoder = new TextDecoder();
      arrayBuffer = await arrayBuffer;
      if (arrayBuffer instanceof Uint8Array) {
        arrayBuffer = arrayBuffer.buffer;
      }
      const text = decoder.decode(arrayBuffer);
      return text;
    },
    arrayBuffer: async () => {
      arrayBuffer = await arrayBuffer;
      if (arrayBuffer instanceof Uint8Array) {
        arrayBuffer = arrayBuffer.buffer;
      }
      return arrayBuffer;
    },
  };
}
