import {
  OPERATION_PATH_DATA_PREFIX,
  decompressPatch,
  type ClientToServerEvents,
  type CompressedPatch,
  type ServerToClientEvents,
  type SubscriptionParams,
  type SubscriptionParamsType,
} from "@andipaetzold/realtime-common";
import pkg from "fast-json-patch";
import { Socket, io } from "socket.io-client";

const { applyPatch } = pkg;

type Listener<T> = (data: T) => void;
type SubscriptionKey = `${"path" | "query"}:${string}`;

interface SubscriptionState<T> {
  data: T | undefined;
  listeners: Set<Listener<T>>;
}

export interface RealtimeWebSocketClientOptions {
  url: string;
  onError?: (error: Error) => void;
}

export class RealtimeWebSocketClient {
  #io: Socket<ServerToClientEvents, ClientToServerEvents>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #subscriptions = new Map<SubscriptionKey, SubscriptionState<any>>();

  public constructor({ url, onError }: RealtimeWebSocketClientOptions) {
    this.#io = io(url, {
      autoConnect: false,
    });

    this.#io.on("connect", this.#handleConnect.bind(this));
    this.#io.on("data", this.#handleData.bind(this));
    this.#io.on("patch", this.#handlePatch.bind(this));

    if (onError) {
      this.#io.on("connect_error", onError);
    }
  }

  #handleConnect() {
    if (!this.#io.recovered) {
      for (const subscriptionkey of this.#subscriptions.keys()) {
        const params = splitSubscriptionKey(subscriptionkey);
        this.#io.emit("subscribe", params);
      }
    }
  }

  #handleData(params: SubscriptionParams, data: unknown) {
    const subscriptionKey = getSubscriptionKey(params);
    if (!this.#subscriptions.has(subscriptionKey)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#subscriptions.get(subscriptionKey)!.data = data;
    this.#emitData(subscriptionKey);
  }

  #handlePatch(params: SubscriptionParams, compressedPatch: CompressedPatch) {
    const subscriptionKey = getSubscriptionKey(params);
    if (!this.#subscriptions.has(subscriptionKey)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data } = this.#subscriptions.get(subscriptionKey)!;
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
    this.#subscriptions.get(subscriptionKey)!.data = newData;
    this.#emitData(subscriptionKey);
  }

  subscribeByPath<T>(path: string, listener: Listener<T>): () => void {
    return this.#subscribe({ type: "path", path }, listener);
  }

  subscribeByQuery<T>(query: string, listener: Listener<T>): () => void {
    return this.#subscribe({ type: "query", query }, listener);
  }

  #subscribe<T>(params: SubscriptionParams, listener: Listener<T>): () => void {
    const subscriptionKey = getSubscriptionKey(params);
    if (!this.#subscriptions.has(subscriptionKey)) {
      this.#subscriptions.set(subscriptionKey, {
        data: undefined,
        listeners: new Set<Listener<T>>(),
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const state = this.#subscriptions.get(subscriptionKey)!;
    state.listeners.add(listener);
    if (state.data !== undefined) {
      listener(state.data);
    }

    this.#connectOrDisconnect();
    this.#io.emit("subscribe", params);

    return () => this.#unsubscribe(params, listener);
  }

  #unsubscribe<T>(params: SubscriptionParams, listener: Listener<T>): void {
    const subscriptionKey = getSubscriptionKey(params);
    if (this.#subscriptions.has(subscriptionKey)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const state = this.#subscriptions.get(subscriptionKey)!;
      state.listeners.delete(listener);

      if (state.listeners.size === 0) {
        this.#io.emit("unsubscribe", params);
        this.#subscriptions.delete(subscriptionKey);
      }
    }

    this.#connectOrDisconnect();
  }

  #emitData(subscriptionKey: SubscriptionKey) {
    if (!this.#subscriptions.has(subscriptionKey)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data, listeners } = this.#subscriptions.get(subscriptionKey)!;
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

function getSubscriptionKey(params: SubscriptionParams): SubscriptionKey {
  switch (params.type) {
    case "path":
      return `${params.type}:${params.path}`;
    case "query":
      return `${params.type}:${params.query}`;
  }
}

function splitSubscriptionKey(key: SubscriptionKey): SubscriptionParams {
  const index = key.indexOf(":");
  const type = key.slice(0, index) as SubscriptionParamsType;
  const pathOrQuery = key.slice(index + 1);
  switch (type) {
    case "path":
      return { type, path: pathOrQuery };
    case "query":
      return { type, query: pathOrQuery };
  }
}
