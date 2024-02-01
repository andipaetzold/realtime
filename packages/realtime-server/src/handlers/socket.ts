import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@andipaetzold/realtime-common";
import { Socket } from "socket.io";
import type { InterServerEvents, SocketData } from "../internal-types.js";
import type { Logger, Store } from "../types.js";
import { rooms } from "../utils.js";

export function createSocketConnectionHandler(store: Store, logger?: Logger) {
  return (
    socket: Socket<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >
  ) => {
    logger?.debug(`[${socket.id}] Socket connected`);

    socket.on("get", async (params, callback) => {
      logger?.debug(`[${socket.id}] Get`, { params });

      switch (params.type) {
        case "path":
          callback(store.get(params.path));
          break;

        case "query":
          try {
            const result = await store.query(params.query);
            callback(result);
          } catch (error) {
            logger?.error(`[${socket.id}] Error querying`, { params, error });
          }
          break;
      }
    });

    socket.on("subscribe", async (params) => {
      logger?.debug(`[${socket.id}] Subscribe`, { params });

      switch (params.type) {
        case "path":
          socket.emit("data", params, store.get(params.path));
          break;

        case "query":
          try {
            socket.emit("data", params, await store.query(params.query));
          } catch (error) {
            logger?.error(`[${socket.id}] Error subscribing query`, {
              params,
              error,
            });
          }
          break;
      }

      socket.join(rooms.createRoom(params));
    });

    socket.on("unsubscribe", (params) => {
      logger?.debug(`[${socket.id}] Unsubscribe`, { params });
      socket.leave(rooms.createRoom(params));
    });

    socket.on("disconnect", () => {
      logger?.info(`[${socket.id}] Socket disconnected`);
    });
  };
}
