import type { Request } from "express";
import type { Auth } from "./types.js";

const BASIC_PREFIX = "Basic ";

export interface BasicAuthOptions {
  isValid: (userId: string, password: string) => Promise<boolean>;
}

export class BasicAuth implements Auth {
  #options: BasicAuthOptions;

  constructor(options: BasicAuthOptions) {
    this.#options = options;
  }

  async canEdit(req: Request) {
    const authHeader = req.headers["authorization"];
    if (typeof authHeader !== "string") {
      return false;
    }

    if (!authHeader.startsWith(BASIC_PREFIX)) {
      return false;
    }

    const credentials = authHeader.slice(BASIC_PREFIX.length);
    const decodedCredentials = Buffer.from(credentials, "base64").toString();
    const [userId, password] = decodedCredentials.split(":");

    if (typeof userId !== "string" || typeof password !== "string") {
      return false;
    }

    return this.#options.isValid(userId, password);
  }
}
