import {
  CompressedPatch,
  OPERATION_PATH_DATA_PREFIX,
  compressPatch,
} from "@andipaetzold/realtime-common";
import fastJsonPatch from "fast-json-patch";
import { get } from "lodash-es";
import jq from "node-jq";

export function getWithPath(data: any, path: string) {
  const key = pathToKey(path);
  if (key === "") {
    return data;
  } else {
    return get(data, key);
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

const PATH_ROOM_PREFIX = "path:";
const QUERY_ROOM_PREFIX = "query:";
export const rooms = {
  createPathRoom: (path: string) => `${PATH_ROOM_PREFIX}${path}`,
  createQueryRoom: (query: string) => `${QUERY_ROOM_PREFIX}${query}`,
  isQueryRoom: (room: string) => room.startsWith(QUERY_ROOM_PREFIX),
  getPath: (room: string) => room.slice(PATH_ROOM_PREFIX.length),
  getQuery: (room: string) => room.slice(QUERY_ROOM_PREFIX.length),
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
