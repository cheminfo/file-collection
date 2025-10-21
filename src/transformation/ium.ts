import type { FileCollection } from '../FileCollection.js';
import type { SourceItem } from '../SourceItem.js';

export interface ToIumIndex {
  options: FileCollection['options'];
  sources: SourceItem[];
}
