import type { Operation } from "fast-json-patch";

export interface RealtimeRESTClientOptions {
  prefixUrl: string;

  /**
   * Required for write operations
   */
  token?: string;
}

export type Patch = Operation[];
