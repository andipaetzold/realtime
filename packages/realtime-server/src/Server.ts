import { ExpressServer } from "./ExpressServer.js";
import { SocketIOServer } from "./SocketIOServer.js";
import { PrivateAuth } from "./index.js";
import type { OptionsWithDefaults } from "./internal-types.js";
import { createStore } from "./store.js";
import type { Options, Store } from "./types.js";

export class Server {
  #store: Store;

  constructor(options: Options) {
    const optionsWithDefaults: OptionsWithDefaults = {
      server: options.server,
      initialData: structuredClone(options.initialData ?? {}),
      path: preparePath(options.path ?? ""),
      auth: options.auth ?? new PrivateAuth(),
      cors: structuredClone(options.cors ?? { origin: "*" }),
    };

    this.#store = createStore(optionsWithDefaults);

    new ExpressServer(optionsWithDefaults, this.#store);
    new SocketIOServer(optionsWithDefaults, this.#store);
  }

  get store() {
    return this.#store;
  }
}

function preparePath(path: string): string {
  if (path.length === 0) {
    return "";
  }

  return path.startsWith("/") ? path : `/${path}`;
}
