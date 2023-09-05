import fastJsonPatch, { type Operation } from "fast-json-patch";
import { set } from "lodash-es";
import type { Store } from "./types.js";
import { getWithPath, getWithQuery, pathToKey } from "./utils.js";

const { applyPatch } = fastJsonPatch;
type Listener = (oldData: any, newData: any) => void;

export function createStore(initialData: any): Store {
  let data = structuredClone(initialData);

  const listeners = new Set<Listener>();

  function emitListeners(oldData: any, newData: any) {
    for (const listener of listeners) {
      listener(oldData, newData);
    }
  }

  return {
    get(path: string): any {
      return getWithPath(data, path);
    },
    async query(query: string): Promise<any> {
      return await getWithQuery(data, query);
    },
    set(path: string, value: any): void {
      const key = pathToKey(path);

      if (typeof value !== "object" && key === "") {
        throw new Error("Cannot set root to a non-object value.");
      }

      const oldData = structuredClone(data);

      if (key === "") {
        data = value;
      } else {
        set(data, key, value);
      }
      emitListeners(oldData, data);
    },
    patch(patch: Operation[]): void {
      const { newDocument: newData } = applyPatch(
        data,
        patch,
        undefined,
        false
      );
      emitListeners(newData, data);
    },
    listen(listener: Listener): () => void {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
}
