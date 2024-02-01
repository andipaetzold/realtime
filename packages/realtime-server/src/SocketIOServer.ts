import type {
  SubscriptionParamsPath,
  SubscriptionParamsQuery,
} from "@andipaetzold/realtime-common";
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
    for (const [room, socketIds] of this.#io.sockets.adapter.rooms) {
      if (socketIds.size === 0) {
        continue;
      }

      const params = rooms.getParams(room);
      switch (params.type) {
        case "path":
          this.#handleDataChangeForPath(params, oldData, newData);
          break;

        case "query":
          this.#handleDataChangeForQuery(params, oldData, newData);
          break;
      }
    }
  }

  #handleDataChangeForPath(
    params: SubscriptionParamsPath,
    oldData: any,
    newData: any
  ): void {
    const oldValue = getWithPath(oldData, params.path);
    const newValue = getWithPath(newData, params.path);

    const patch = createCompressedPatch(oldValue, newValue);
    if (patch.length === 0) {
      return;
    }

    this.#io.to(rooms.createRoom(params)).emit("patch", params, patch);
  }

  async #handleDataChangeForQuery(
    params: SubscriptionParamsQuery,
    oldData: any,
    newData: any
  ): Promise<void> {
    const oldValue = await getWithQuery(oldData, params.query);
    const newValue = await getWithQuery(newData, params.query);

    const patch = createCompressedPatch(oldValue, newValue);
    if (patch.length === 0) {
      return;
    }

    this.#io.to(rooms.createRoom(params)).emit("patch", params, patch);
  }
}
