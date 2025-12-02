import type { SourceItemV1, ToIumIndexV1 } from './v01.ts';

export interface ToIumIndexV2 extends Omit<ToIumIndexV1, 'version'> {
  version: 2;
  paths: Record<SourceItemV1['uuid'], string | undefined>;
}
