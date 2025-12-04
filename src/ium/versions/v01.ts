import type { Logger } from 'cheminfo-types';

export interface OptionsV1 {
  filter?: {
    ignoreDotfiles?: boolean;
  };
  unzip?: {
    zipExtensions?: string[];
    recursive?: boolean;
  };
  ungzip?: {
    gzipExtensions?: string[];
  };
  logger?: Logger;
}

export interface SourceItemV1 {
  uuid: string;
  relativePath: string;
  originalRelativePath?: string;
  baseURL?: 'ium:/' | string | undefined;
  lastModified?: number;
  size?: number;
  extra?: boolean;
  options?: OptionsV1;
}

export interface ToIumIndexV1 {
  version?: 1;
  options: OptionsV1;
  sources: SourceItemV1[];
}
