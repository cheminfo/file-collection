import type { ItemData } from './ItemData.js';
import type { SourceItem } from './SourceItem.ts';

export interface ExtendedSourceItem extends SourceItem, ItemData {
  uuid: string;
  name: string;
}

export function cloneExtendedSourceItem(
  source: ExtendedSourceItem,
): ExtendedSourceItem {
  return { ...source };
}
