import { Server as IOServer } from "socket.io";
import { createSocketConnectionHandler } from "./handlers/index.js";
import type {
  CustomSocketIOServer,
  OptionsWithDefaults,
} from "./internal-types.js";
import type { Store } from "./types.js";
import {
  createCompressedPatch,
  getWithPath,
  getWithQuery,
  rooms,
} from "./utils.js";

export class SocketIOServer {
  #io: CustomSocketIOServer;

  constructor(options: OptionsWithDefaults, store: Store) {
    this.#io = new IOServer(options.server, {
      cors: {
        origin: options.cors.origin,
        credentials: true,
      },
      serveClient: false,
      path: `${options.path}/socket.io`,
    });

    store.listen((oldData, newData) =>
      this.#handleDataChange(oldData, newData)
    );

    this.#io.on("connection", createSocketConnectionHandler(store));
  }

  async #handleDataChange(oldData: any, newData: any) {
    for (const [pathOrQuery, socketIds] of this.#io.sockets.adapter.rooms) {
      if (socketIds.size === 0) {
        continue;
      }

      if (rooms.isQueryRoom(pathOrQuery)) {
        this.#handleDataChangeForPathQuery(pathOrQuery, oldData, newData);
      } else {
        this.#handleDataChangeForPathRoom(pathOrQuery, oldData, newData);
      }
    }
  }

  async #handleDataChangeForPathQuery(
    room: string,
    oldData: any,
    newData: any
  ): Promise<void> {
    const query = rooms.getQuery(room);
    const oldValue = await getWithQuery(oldData, query);
    const newValue = await getWithQuery(newData, query);

    const patch = createCompressedPatch(oldValue, newValue);
    if (patch.length === 0) {
      return;
    }

    this.#io.to(room).emit("patchQuery", query, patch);
  }

  #handleDataChangeForPathRoom(room: string, oldData: any, newData: any): void {
    const path = rooms.getPath(room);
    const oldValue = getWithPath(oldData, path);
    const newValue = getWithPath(newData, path);

    const patch = createCompressedPatch(oldValue, newValue);
    if (patch.length === 0) {
      return;
    }

    this.#io.to(room).emit("patch", path, patch);
  }
}
