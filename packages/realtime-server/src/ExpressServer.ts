import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import {
  handleDELETEData,
  handleGETData,
  handlePATCHData,
  handlePUTData,
} from "./handlers/index.js";
import type { OptionsWithDefaults } from "./internal-types.js";
import { auth } from "./middleware/auth.js";
import type { Store } from "./types.js";

export class ExpressServer {
  constructor(options: OptionsWithDefaults, store: Store) {
    const app = express();
    app.locals["store"] = store;
    app.locals["logger"] = options.logger;

    app.use(
      cors({
        origin: options.cors.origin,
        credentials: true,
      })
    );
    app.use(
      bodyParser.json({
        // we need to accept number and string as body
        strict: false,
      })
    );

    const path = `${options.path}/data`;
    app
      .route(path)
      .get(handleGETData)
      .put(auth(options), handlePUTData)
      .patch(auth(options), handlePATCHData)
      .delete(auth(options), handleDELETEData);

    options.server.addListener("request", app);
  }
}
