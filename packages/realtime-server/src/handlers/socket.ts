import { Socket } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../internal-types.js";
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

    socket.on("data", (path, callback) => {
      logger?.debug(`[${socket.id}] Data`, { path });

      callback(store.get(path));
    });

    socket.on("query", async (query, callback) => {
      logger?.debug(`[${socket.id}] Data`, { query });

      try {
        const result = await store.query(query);
        callback(result);
      } catch (error) {
        logger?.error(`[${socket.id}] Error querying`, { query, error });
      }
    });

    socket.on("subscribe", (path) => {
      logger?.debug(`[${socket.id}] Subscribe`, { path });

      socket.emit("data", path, store.get(path));
      socket.join(rooms.createPathRoom(path));
    });

    socket.on("subscribeQuery", async (query) => {
      logger?.debug(`[${socket.id}] Subscribe query`, { query });

      try {
        socket.emit("dataQuery", query, await store.query(query));
      } catch (error) {
        logger?.error(`[${socket.id}] Error subscribing query`, {
          query,
          error,
        });
      }
      socket.join(rooms.createQueryRoom(query));
    });

    socket.on("unsubscribe", (path: string) => {
      logger?.debug(`[${socket.id}] Unsubscribe`, { path });
      socket.leave(rooms.createPathRoom(path));
    });

    socket.on("unsubscribeQuery", (query) => {
      logger?.debug(`[${socket.id}] Unsubscribe query`, { query });
      socket.leave(rooms.createQueryRoom(query));
    });

    socket.on("disconnect", () => {
      logger?.info(`[${socket.id}] Socket disconnected`);
    });
  };
}
