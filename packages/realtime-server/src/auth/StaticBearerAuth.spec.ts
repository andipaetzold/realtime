import type { Request } from "express";
import { StaticBearerAuth } from "./StaticBearerAuth.js";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("StaticBearerAuth", () => {
  it("with single token", async () => {
    const auth = new StaticBearerAuth({
      tokenOrTokens: "token",
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

  it("with multiple tokens", async () => {
    const auth = new StaticBearerAuth({
      tokenOrTokens: ["token1", "token2"],
    });
    expect(
      await auth.canEdit({
        headers: { authorization: "Bearer token1" },
      } as Request)
    ).to.be.true;
    expect(
      await auth.canEdit({
        headers: { authorization: "Bearer token2" },
      } as Request)
    ).to.be.true;
    expect(
      await auth.canEdit({
        headers: { authorization: "Bearer token3" },
      } as Request)
    ).to.be.false;
  });

  it("missing header", async () => {
    const auth = new StaticBearerAuth({
      tokenOrTokens: "token",
    });
    expect(await auth.canEdit({ headers: {} } as Request)).to.be.false;
  });

  it("invalid header", async () => {
    const auth = new StaticBearerAuth({
      tokenOrTokens: "token",
    });
    expect(
      await auth.canEdit({
        headers: { authorization: "Whatever token" },
      } as Request)
    ).to.be.false;
  });
});
