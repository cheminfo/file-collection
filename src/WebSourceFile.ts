export interface WebSourceFile {
  relativePath: string;
  lastModified?: number;
  size?: number;
  baseURL?: string;
}

export interface WebSource {
  entries: WebSourceFile[];
  baseURL?: string;
}
