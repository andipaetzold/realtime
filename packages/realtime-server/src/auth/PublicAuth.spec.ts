import { PublicAuth } from "./PublicAuth.js";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("PublicAuth", () => {
  it("should return `true`", async () => {
    const auth = new PublicAuth();
    expect(await auth.canEdit()).to.be.true;
  });
});
