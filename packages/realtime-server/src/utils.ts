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
