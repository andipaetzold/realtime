import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@andipaetzold/realtime-common";
import type { Server as HttpServer } from "http";
import type { Http2SecureServer } from "http2";
import type { Server as HttpsServer } from "https";
import type { Server as SocketIOServer } from "socket.io";
import type { Auth } from "./auth/index.js";
import type { Logger } from "./types.js";

export interface OptionsWithDefaults {
  server: HttpServer | HttpsServer | Http2SecureServer;
  path: string;
  initialData: any;
  logger: Logger | undefined;
  auth: Auth;
  cors: {
    origin: string | string[];
  };
  adminUI: {
    enabled: boolean;
    auth:
      | false
      | {
          type: "basic";
          username: string;
          password: string;
        };
  };
}

export interface InterServerEvents {}

export interface SocketData {}

export type CustomSocketIOServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
