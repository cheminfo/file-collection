import type { SourceItem } from './SourceItem';

export interface Source {
  entries: SourceItem[];
  baseURL?: string;
}
