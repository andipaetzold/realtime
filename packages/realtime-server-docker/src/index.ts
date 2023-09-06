import {
  PrivateAuth,
  Server,
  StaticBearerAuth,
} from "@andipaetzold/realtime-server";
import { createServer } from "http";
import { config } from "./config.js";
import { readData, saveData } from "./persistence.js";

const initialData = await readData();

const httpServer = createServer();

const server = new Server({
  server: httpServer,
  auth: config.authToken
    ? new StaticBearerAuth({
        tokenOrTokens: config.authToken,
      })
    : new PrivateAuth(),
  cors: {
    origin: config.corsOrigin,
  },
  logger: {
    error: console.error,
    info: console.log,
    debug: console.log,
  },
  initialData,
});

const intervalHandle = setInterval(() => {
  console.log("[Server] Saving data");
  saveData(server.store.get(""));
}, 60 * 1_000);

httpServer.listen(config.port, () => {
  console.log(`[Server] Running on port ${config.port}`);
});

process.on("SIGTERM", () => {
  console.debug("[Server] SIGTERM signal received: closing HTTP server");
  httpServer.close(() => {
    console.debug("[Server] HTTP server closed");
  });

  clearInterval(intervalHandle);
});
