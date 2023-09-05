import type { Operation } from "fast-json-patch";

export type CompressedPatch = CompressedOperation[];
export type CompressedOperation =
  | [0, string, unknown]
  | [1, string]
  | [2, string, unknown]
  | [3, string, string]
  | [4, string, string];

export function compressPatch(patch: Operation[]): CompressedPatch {
  return patch.map(compressOperation);
}

export function compressOperation(operation: Operation): CompressedOperation {
  switch (operation.op) {
    case "add":
      return [0, operation.path, operation.value];
    case "remove":
      return [1, operation.path];
    case "replace":
      return [2, operation.path, operation.value];
    case "move":
      return [3, operation.path, operation.from];
    case "copy":
      return [4, operation.path, operation.from];
  }

  throw new Error(`Unknown operation "${operation.op}"`);
}

export function decompressPatch(patch: CompressedPatch): Operation[] {
  return patch.map(decompressOperation);
}

export function decompressOperation(operation: CompressedOperation): Operation {
  switch (operation[0]) {
    case 0:
      return { op: "add", path: operation[1], value: operation[2] };
    case 1:
      return { op: "remove", path: operation[1] };
    case 2:
      return { op: "replace", path: operation[1], value: operation[2] };
    case 3:
      return { op: "move", path: operation[1], from: operation[2] };
    case 4:
      return { op: "copy", path: operation[1], from: operation[2] };
  }
}
