import type { Auth } from "./types.js";

export class PublicAuth implements Auth {
  async canEdit() {
    return true;
  }
}
