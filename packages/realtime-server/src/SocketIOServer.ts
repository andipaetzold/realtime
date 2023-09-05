import {
  OPERATION_PATH_DATA_PREFIX,
  compressPatch,
} from "@andipaetzold/realtime-common";
import { compare } from "fast-json-patch";
import { Server as IOServer } from "socket.io";
import { QUERY_PREFIX } from "./constants.js";
import { createSocketConnectionHandler } from "./handlers/index.js";
import type {
  CustomSocketIOServer,
  OptionsWithDefaults,
} from "./internal-types.js";
import type { Store } from "./types.js";
import { getWithPath } from "./utils.js";

export class SocketIOServer {
  #io: CustomSocketIOServer;

  constructor(options: OptionsWithDefaults, store: Store) {
    this.#io = new IOServer(options.server, {
      // @ts-expect-error `cors` is missing in `SocketOption` ¯\_(ツ)_/¯
      cors: {
        origin: options.cors.origin,
        credentials: true,
      },
      serveClient: false,
      path: `${options.path}/socket.io`,
    });

    store.listen(this.#handleDataChange);

    this.#io.on("connection", createSocketConnectionHandler(store));
  }

  #handleDataChange(oldData: any, newData: any) {
    for (const [pathOrQuery, socketIds] of this.#io.sockets.adapter.rooms) {
      if (socketIds.size === 0) {
        continue;
      }

      const isQuery = pathOrQuery.startsWith(QUERY_PREFIX);

      const oldValue = isQuery
        ? getWithPath(oldData, pathOrQuery.slice(6))
        : getWithPath(oldData, pathOrQuery);
      const newValue = isQuery
        ? getWithPath(newData, pathOrQuery.slice(6))
        : getWithPath(newData, pathOrQuery);
      const patch = compare(
        { [OPERATION_PATH_DATA_PREFIX]: oldValue },
        { [OPERATION_PATH_DATA_PREFIX]: newValue }
      );

      if (patch.length === 0) {
        continue;
      }

      const compressedPatch = compressPatch(patch);
      if (isQuery) {
        this.#io
          .to(pathOrQuery)
          .emit(
            "patchQuery",
            pathOrQuery.slice(QUERY_PREFIX.length),
            compressedPatch
          );
      } else {
        this.#io.to(pathOrQuery).emit("patch", pathOrQuery, compressedPatch);
      }
    }
  }
}
