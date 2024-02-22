import { PrivateAuth } from "./PrivateAuth.js";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("PrivateAuth", () => {
  it("should return `false`", async () => {
    const auth = new PrivateAuth();
    expect(await auth.canEdit()).to.be.false;
  });
});
