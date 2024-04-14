import {
  CompressedPatch,
  OPERATION_PATH_DATA_PREFIX,
  compressPatch,
  SubscriptionParams,
  SubscriptionParamsType,
} from "@andipaetzold/realtime-common";
import fastJsonPatch from "fast-json-patch";
import { get } from "lodash-es";
import jq from "node-jq";

export function getWithPath(data: any, path: string) {
  const key = pathToKey(path);
  if (key === "") {
    return data;
  } else {
    return get(data, key, null);
  }
}

export async function getWithQuery(data: any, query: string) {
  try {
    return await jq.run(query, data, { input: "json", output: "json" });
  } catch {
    return null;
  }
}

export function pathToKey(path: string): string {
  return (
    path
      .replaceAll("/", ".")
      // leading slash
      .slice(1)
  );
}

export const rooms = {
  createRoom: (params: SubscriptionParams): string => {
    switch (params.type) {
      case "path":
        return `${params.type}:${params.path}`;
      case "query":
        return `${params.type}:${params.query}`;
    }
  },
  getParams: (room: string): SubscriptionParams | undefined => {
    if (!room.includes(":")) {
      return;
    }

    const index = room.indexOf(":");
    const type = room.slice(0, index) as SubscriptionParamsType;
    const pathOrQuery = room.slice(index + 1);
    switch (type) {
      case "path":
        return { type, path: pathOrQuery };
      case "query":
        return { type, query: pathOrQuery };
    }
  },
};

export function createCompressedPatch(
  oldValue: any,
  newValue: any
): CompressedPatch {
  const patch = fastJsonPatch.compare(
    { [OPERATION_PATH_DATA_PREFIX]: oldValue },
    { [OPERATION_PATH_DATA_PREFIX]: newValue }
  );

  return compressPatch(patch);
}
