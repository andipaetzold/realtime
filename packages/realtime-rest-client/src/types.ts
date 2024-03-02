import type { Operation } from "fast-json-patch";

export interface RealtimeRESTClientOptions {
  prefixUrl: string;

  /**
   * Required for write operations
   */
  token?: string | undefined;
}

export type Patch = Operation[];
