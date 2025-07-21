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

/**
 * Clones a FileItem object.
 * @param fileItem - The FileItem to clone.
 * @returns A new FileItem object with the same properties as the original.
 */
export function cloneFileItem(fileItem: FileItem): FileItem {
  return { ...fileItem };
}
