import type { ItemData } from './ItemData.js';

export interface FileItem extends ItemData {
  relativePath: string;
  /**
   * If zip of gz file
   */
  parent?: FileItem;
  name: string;
  lastModified?: number;
  size?: number;
  baseURL?: string;
  sourceUUID: string;
}
