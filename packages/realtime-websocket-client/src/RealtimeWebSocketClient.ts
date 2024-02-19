import {
  OPERATION_PATH_DATA_PREFIX,
  decompressPatch,
  type CompressedPatch,
  type SubscriptionParams,
} from "@andipaetzold/realtime-common";
import pkg from "fast-json-patch";
import { SocketIOClient } from "./SocketIOClient.js";
import { getSubscriptionKey, splitSubscriptionKey } from "./helpers.js";

const { applyPatch } = pkg;

type Listener<T> = (data: T) => void;
export type SubscriptionKey = `${"path" | "query"}:${string}`;

interface SubscriptionState<T> {
  data: T | undefined;
  listeners: Set<Listener<T>>;
}

export interface RealtimeWebSocketClientOptions {
  url: string;
  onError?: (error: Error) => void;
}

export class RealtimeWebSocketClient {
  #ioClient: SocketIOClient;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #subscriptions = new Map<SubscriptionKey, SubscriptionState<any>>();

  constructor({ url, onError }: RealtimeWebSocketClientOptions) {
    this.#ioClient = new SocketIOClient(url);

    this.#ioClient.addConnectHandler(this.#handleConnect.bind(this));
    this.#ioClient.addDataListener(this.#handleData.bind(this));
    this.#ioClient.addPatchListener(this.#handlePatch.bind(this));

    if (onError) {
      this.#ioClient.addErrorHandler(onError);
    }
  }

  #handleConnect(recovered: boolean) {
    if (!recovered) {
      for (const subscriptionkey of this.#subscriptions.keys()) {
        const params = splitSubscriptionKey(subscriptionkey);
        this.#ioClient.subscribe(params);
      }
    }
  }

  #handleData(params: SubscriptionParams, data: unknown) {
    const subscriptionKey = getSubscriptionKey(params);
    const state = this.#subscriptions.get(subscriptionKey);
    if (!state) {
      return;
    }

    state.data = data;
    this.#emitData(subscriptionKey);
  }

  #handlePatch(params: SubscriptionParams, compressedPatch: CompressedPatch) {
    const subscriptionKey = getSubscriptionKey(params);
    const state = this.#subscriptions.get(subscriptionKey);
    if (!state) {
      return;
    }

    const { data } = state;
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

    state.data = newData;
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
    const existingState: SubscriptionState<T> | undefined =
      this.#subscriptions.get(subscriptionKey);
    if (existingState) {
      // add listener to existing subscription state
      existingState.listeners.add(listener);
      if (existingState.data !== undefined) {
        listener(existingState.data);
      }
    } else {
      // create new subscription
      const newState: SubscriptionState<T> = {
        data: undefined,
        listeners: new Set<Listener<T>>([listener]),
      };
      this.#subscriptions.set(subscriptionKey, newState);

      this.#connectOrDisconnect();
      this.#ioClient.subscribe(params);
    }

    return () => this.#unsubscribe(params, listener);
  }

  #unsubscribe<T>(params: SubscriptionParams, listener: Listener<T>): void {
    const subscriptionKey = getSubscriptionKey(params);
    const state = this.#subscriptions.get(subscriptionKey);
    if (!state) {
      return;
    }

    state.listeners.delete(listener);

    if (state.listeners.size === 0) {
      this.#ioClient.unsubscribe(params);
      this.#subscriptions.delete(subscriptionKey);
    }

    this.#connectOrDisconnect();
  }

  #emitData(subscriptionKey: SubscriptionKey) {
    const state = this.#subscriptions.get(subscriptionKey);
    if (!state) {
      return;
    }

    const { data, listeners } = state;
    if (data === undefined) {
      return;
    }

    for (const listener of listeners) {
      listener(data);
    }
  }

  #connectOrDisconnect() {
    // if the client is already connected/disconnected, nothing happens
    // see https://github.com/socketio/socket.io-client/blob/8cfea8c30b113b0b6987976af9243cba6f537f30/lib/socket.ts#L331
    if (this.#subscriptions.size > 0) {
      this.#ioClient.connect();
    } else {
      this.#ioClient.disconnect();
    }
  }
}
