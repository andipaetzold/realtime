import type { CompressedPatch } from "./json-patch.js";

export type SubscriptionParamsPath = {
  type: "path";
  path: string;
};
export type SubscriptionParamsQuery = {
  type: "query";
  query: string;
};
export type SubscriptionParams =
  | SubscriptionParamsPath
  | SubscriptionParamsQuery;
export type SubscriptionParamsType = SubscriptionParams["type"];

export interface ServerToClientEvents {
  data: (params: SubscriptionParams, data: any) => void;
  patch: (params: SubscriptionParams, operation: CompressedPatch) => void;
}

export interface ClientToServerEvents {
  subscribe: (params: SubscriptionParams) => void;
  unsubscribe: (params: SubscriptionParams) => void;
  get: (params: SubscriptionParams, callback: (data: any) => void) => void;
}
