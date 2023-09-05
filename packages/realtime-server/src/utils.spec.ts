import { getWithPath, pathToKey } from "./utils.js";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("getWithPath", () => {
  it("gets values from paths", () => {
    expect(getWithPath({ a: "a" }, "/")).to.deep.equal({ a: "a" });
    expect(getWithPath({ a: "a" }, "/a")).to.equal("a");
    expect(getWithPath({ a: { b: "b" } }, "/a/b")).to.equal("b");
    expect(getWithPath({ a: { b: { c: "c" } } }, "/a/b/c")).to.equal("c");
  });
});

describe("pathToKey", () => {
  it("converts paths to keys", () => {
    expect(pathToKey("/")).to.equal("");
    expect(pathToKey("/a")).to.equal("a");
    expect(pathToKey("/a/b")).to.equal("a.b");
    expect(pathToKey("/a/b/c")).to.equal("a.b.c");
  });
});
