import type { Auth } from "./types.js";

export class PrivateAuth implements Auth {
  async canEdit() {
    return false;
  }
}
