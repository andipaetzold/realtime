import { expect } from "chai";
import type { Request } from "express";
import { describe, it } from "mocha";
import { BearerAuth } from "./BearerAuth.js";

describe("BearerAuth", () => {
  it("with valid header", async () => {
    const auth = new BearerAuth({
      isValidToken: async (t) => t === "token",
    });
    expect(
      await auth.canEdit({
        headers: { authorization: "Bearer token" },
      } as Request)
    ).to.be.true;
    expect(
      await auth.canEdit({
        headers: { authorization: "Bearer wrong token" },
      } as Request)
    ).to.be.false;
  });

  it("missing header", async () => {
    const auth = new BearerAuth({ isValidToken: async () => true });
    expect(await auth.canEdit({ headers: {} } as Request)).to.be.false;
  });

  it("invalid header", async () => {
    const auth = new BearerAuth({ isValidToken: async () => true });
    expect(
      await auth.canEdit({
        headers: { authorization: "Whatever token" },
      } as Request)
    ).to.be.false;
  });
});
