import { BasicAuth } from "./BasicAuth.js";

export interface StaticBasicAuthOptions {
  credentials: [userId: string, password: string] | Record<string, string>;
}

export class StaticBasicAuth extends BasicAuth {
  constructor(options: StaticBasicAuthOptions) {
    const credentials = Array.isArray(options.credentials)
      ? { [options.credentials[0]]: options.credentials[1] }
      : options.credentials;

    async function isValid(userIdToCheck: string, passwordToCheck: string) {
      for (const [userId, password] of Object.entries(credentials)) {
        const validUserId = userIdToCheck === userId;
        const validPassword = passwordToCheck === password;
        if (validUserId && validPassword) {
          return true;
        }
      }

      return false;
    }

    super({
      isValid,
    });
  }
}
