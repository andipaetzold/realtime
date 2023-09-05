import type { Patch, RealtimeRESTClientOptions } from "./types.js";
import ky from "ky";

export class RealtimeRESTClient {
  #kyInstance: typeof ky;

  constructor(options: RealtimeRESTClientOptions) {
    this.#kyInstance = ky.create({
      prefixUrl: options.prefixUrl,
      headers: {
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    });
  }

  async get<T = unknown>(path: string): Promise<T> {
    return await this.#kyInstance
      .get("data", {
        searchParams: { path },
      })
      .json<T>();
  }

  async put(path: string, data: unknown) {
    await this.#kyInstance.put("data", {
      searchParams: { path },
      json: data,
    });
  }

  async patch(path: string, patch: Patch) {
    await this.#kyInstance.patch("data", {
      searchParams: { path },
      json: patch,
    });
  }

  async delete(path: string) {
    await this.#kyInstance.delete("data", {
      searchParams: { path },
    });
  }
}
