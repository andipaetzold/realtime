import type { Operation } from "fast-json-patch";
import type { Server as HttpServer } from "http";
import type { Http2SecureServer } from "http2";
import type { Server as HttpsServer } from "https";
import type { Auth } from "./auth/index.js";

export interface Options {
  server: HttpServer | HttpsServer | Http2SecureServer;
  path?: string | undefined;
  initialData?: any | undefined;
  logger?: Logger | undefined;
  auth?: Auth | undefined;
  cors?:
    | {
        origin: string | string[];
      }
    | undefined;
  adminUI?:
    | {
        enabled: boolean;
        auth:
          | false
          | {
              username: string;
              password: string;
            };
      }
    | undefined;
}

export interface Store {
  get<T = any>(path: string): T;
  query<T = any>(query: string): Promise<T>;
  set(path: string, value: any): void;
  patch(patch: Operation[]): void;
  delete(path: string): void;
  listen(listener: Listener): () => void;
}

export type Listener = (oldData: any, newData: any) => void;

export interface Logger {
  debug: (message?: any, ...optionalParams: any[]) => void;
  info: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
}
