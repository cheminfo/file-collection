import type { ItemData } from './ItemData.js';
import type { SourceItem } from './SourceItem.ts';

export interface ExtendedSourceItem extends SourceItem, ItemData {
  uuid: string;
  name: string;
}
