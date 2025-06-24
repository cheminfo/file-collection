import type { SourceItem } from './SourceItem.ts';

export interface Source {
  entries: SourceItem[];
  baseURL?: string;
}
