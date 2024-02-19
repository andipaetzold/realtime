import {
  type SubscriptionParams,
  type SubscriptionParamsType,
} from "@andipaetzold/realtime-common";
import { SubscriptionKey } from "./RealtimeWebSocketClient.js";

export function getSubscriptionKey(
  params: SubscriptionParams
): SubscriptionKey {
  switch (params.type) {
    case "path":
      return `${params.type}:${params.path}`;
    case "query":
      return `${params.type}:${params.query}`;
    default:
      throw new Error("Unknown subscription type");
  }
}
export function splitSubscriptionKey(key: SubscriptionKey): SubscriptionParams {
  const index = key.indexOf(":");
  const type = key.slice(0, index) as SubscriptionParamsType;
  const pathOrQuery = key.slice(index + 1);
  switch (type) {
    case "path":
      return { type, path: pathOrQuery };
    case "query":
      return { type, query: pathOrQuery };
    default:
      throw new Error("Unknown subscription type");
  }
}
