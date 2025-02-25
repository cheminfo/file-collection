import type { SourceItem } from './SourceItem';

export interface ExtendedSourceItem extends SourceItem {
  uuid: string;
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
  text: () => Promise<string>;
  stream: () => ReadableStream<Uint8Array>;
}
