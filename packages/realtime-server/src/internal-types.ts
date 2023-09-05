import type { CompressedPatch } from "@andipaetzold/realtime-common";
import type { Server as HttpServer } from "http";
import type { Http2SecureServer } from "http2";
import type { Server as HttpsServer } from "https";
import type { Server as SocketIOServer } from "socket.io";
import type { Auth } from "./auth";
import type { Logger } from "./types";

export interface OptionsWithDefaults {
  server: HttpServer | HttpsServer | Http2SecureServer;
  path: string;
  initialData: any;
  logger?: Logger;
  auth: Auth;
  cors: {
    origin: string | string[];
  };
}

export interface ServerToClientEvents {
  data: (path: string, data: any) => void;
  dataQuery: (query: string, data: any) => void;
  patch: (path: string, operation: CompressedPatch) => void;
  patchQuery: (query: string, operation: CompressedPatch) => void;
}

export interface ClientToServerEvents {
  subscribe: (path: string) => void;
  subscribeQuery: (query: string) => void;
  unsubscribe: (path: string) => void;
  unsubscribeQuery: (query: string) => void;
  data: (path: string, callback: (data: any) => void) => void;
  query: (query: string, callback: (data: any) => void) => void;
}

export interface InterServerEvents {}

export interface SocketData {}

export type CustomSocketIOServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
