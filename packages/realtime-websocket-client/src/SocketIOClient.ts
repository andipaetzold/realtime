import {
  type ClientToServerEvents,
  type CompressedPatch,
  type ServerToClientEvents,
  type SubscriptionParams,
} from "@andipaetzold/realtime-common";
import { Socket, io } from "socket.io-client";

export class SocketIOClient {
  #io: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor(url: string) {
    this.#io = io(url, {
      autoConnect: false,
    });
  }

  get connected() {
    return this.#io.connected;
  }

  connect() {
    this.#io.connect();
  }

  disconnect() {
    this.#io.disconnect();
  }

  addConnectHandler(handler: (recovered: boolean) => void) {
    this.#io.on("connect", () => handler(this.#io.recovered));
  }

  addErrorHandler(handler: (error: Error) => void) {
    this.#io.on("connect_error", handler);
  }

  addDataListener(
    handler: (params: SubscriptionParams, data: unknown) => void
  ) {
    this.#io.on("data", handler);
  }

  addPatchListener(
    handler: (params: SubscriptionParams, patch: CompressedPatch) => void
  ) {
    this.#io.on("patch", handler);
  }

  subscribe(params: SubscriptionParams) {
    this.#io.emit("subscribe", params);
  }

  unsubscribe(params: SubscriptionParams) {
    this.#io.emit("unsubscribe", params);
  }
}
