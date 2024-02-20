import { BearerAuth } from "./BearerAuth.js";

export interface StaticBearerAuthOptions {
  tokenOrTokens: string | string[];
}

export class StaticBearerAuth extends BearerAuth {
  constructor(options: StaticBearerAuthOptions) {
    const tokens =
      typeof options.tokenOrTokens === "string"
        ? [options.tokenOrTokens]
        : options.tokenOrTokens;

    async function isValidToken(tokenToCheck: string) {
      for (const token of tokens) {
        if (token === tokenToCheck) {
          return true;
        }
      }

      return false;
    }

    super({
      isValidToken,
    });
  }
}
