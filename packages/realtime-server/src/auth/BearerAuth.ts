import type { Request } from "express";
import type { Auth } from "./types.js";

const BEARER_PREFIX = "Bearer ";

export interface BearerAuthOptions {
  isValidToken: (token: string) => Promise<boolean>;
}

export class BearerAuth implements Auth {
  #options: BearerAuthOptions;

  constructor(options: BearerAuthOptions) {
    this.#options = options;
  }

  async canEdit(req: Request) {
    const authHeader = req.headers["authorization"];
    if (typeof authHeader !== "string") {
      return false;
    }

    if (!authHeader.startsWith(BEARER_PREFIX)) {
      return false;
    }

    const headerToken = authHeader.slice(BEARER_PREFIX.length);
    return this.#options.isValidToken(headerToken);
  }
}
