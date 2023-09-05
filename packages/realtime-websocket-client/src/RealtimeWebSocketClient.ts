import pkg from "fast-json-patch";
import { io, Socket } from "socket.io-client";
import {
  type CompressedPatch,
  decompressPatch,
  OPERATION_PATH_DATA_PREFIX,
} from "@andipaetzold/realtime-common";

const { applyPatch } = pkg;

type Listener<T> = (data: T) => void;

interface SubscriptionState<T> {
  data: T | undefined;
  listeners: Set<Listener<T>>;
}

interface ServerToClientEvents {
  dataQuery: (query: string, data: any) => void;
  patchQuery: (query: string, operation: CompressedPatch) => void;
}

interface ClientToServerEvents {
  subscribeQuery: (query: string) => void;
  unsubscribeQuery: (query: string) => void;
  query: (query: string, callback: (data: any) => void) => void;
}

export interface RealtimeWebSocketClientOptions {
  url: string;
  onError?: (error: Error) => void;
}

export class RealtimeWebSocketClient {
  #io: Socket<ServerToClientEvents, ClientToServerEvents>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #subscriptions = new Map<string, SubscriptionState<any>>();

  public constructor({ url, onError }: RealtimeWebSocketClientOptions) {
    this.#io = io(url, {
      autoConnect: false,
    });

    this.#io.on("connect", this.#handleConnect.bind(this));
    this.#io.on("dataQuery", this.#handleData.bind(this));
    this.#io.on("patchQuery", this.#handlePatch.bind(this));

    if (onError) {
      this.#io.on("connect_error", onError);
    }
  }

  #handleConnect() {
    if (!this.#io.recovered) {
      for (const path of this.#subscriptions.keys()) {
        this.#io.emit("subscribeQuery", path);
      }
    }
  }

  #handleData(path: string, data: unknown) {
    if (!this.#subscriptions.has(path)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#subscriptions.get(path)!.data = data;
    this.#emitData(path);
  }

  #handlePatch(path: string, compressedPatch: CompressedPatch) {
    if (!this.#subscriptions.has(path)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data } = this.#subscriptions.get(path)!;
    if (data === undefined) {
      return;
    }

    const patch = decompressPatch(compressedPatch);
    const {
      newDocument: { [OPERATION_PATH_DATA_PREFIX]: newData },
    } = applyPatch(
      { [OPERATION_PATH_DATA_PREFIX]: data },
      patch,
      undefined,
      false
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#subscriptions.get(path)!.data = newData;
    this.#emitData(path);
  }

  subscribe<T>(path: string, listener: Listener<T>): () => void {
    if (!this.#subscriptions.has(path)) {
      this.#subscriptions.set(path, {
        data: undefined,
        listeners: new Set<Listener<T>>(),
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const state = this.#subscriptions.get(path)!;
    state.listeners.add(listener);
    if (state.data !== undefined) {
      listener(state.data);
    }

    this.#connectOrDisconnect();
    this.#io.emit("subscribeQuery", path);

    return () => this.#unsubscribe(path, listener);
  }

  #unsubscribe<T>(path: string, listener: Listener<T>): void {
    if (this.#subscriptions.has(path)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const state = this.#subscriptions.get(path)!;
      state.listeners.delete(listener);

      if (state.listeners.size === 0) {
        this.#io.emit("unsubscribeQuery", path);
        this.#subscriptions.delete(path);
      }
    }

    this.#connectOrDisconnect();
  }

  #emitData(path: string) {
    if (!this.#subscriptions.has(path)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data, listeners } = this.#subscriptions.get(path)!;
    if (data === undefined) {
      return;
    }

    for (const listener of listeners) {
      listener(data);
    }
  }

  #connectOrDisconnect() {
    if (this.#subscriptions.size > 0) {
      if (this.#io.connected) {
        return;
      }

      this.#io.connect();
    } else {
      if (this.#io.disconnected) {
        return;
      }
      this.#io.disconnect();
    }
  }
}
