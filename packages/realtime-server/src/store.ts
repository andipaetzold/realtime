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
    delete: (path: string): void => {
      const key = pathToKey(path);

      if (key === "") {
        throw new Error("Cannot delete root.");
      }
      const oldData = structuredClone(data);

      const lastSlashIndex = path.lastIndexOf("/");
      const parentPath = path.slice(0, lastSlashIndex);
      const lastPath = path.slice(lastSlashIndex + 1);

      const parent = getWithPath(data, parentPath);
      if (typeof parent !== "object" || parent === null) {
        return
      }

      if (Array.isArray(parent)) {
        if (isNaN(Number(lastPath))) {
          return;
        }

        parent.splice(Number(lastPath), 1);
      } else {
        delete parent[lastPath];
      }

      emitListeners(oldData, data);
    },
    listen(listener: Listener): () => void {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
}
