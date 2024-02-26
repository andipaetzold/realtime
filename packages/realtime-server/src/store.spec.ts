import { describe } from "mocha";
import { createStore } from "./store.js";
import { expect } from "chai";

describe("createStore", () => {
  describe("delete", () => {
    it("fails for root", () => {
      const store = createStore({ a: "a" });
      expect(() => store.delete("")).to.throw();
      expect(store.get("")).to.deep.equal({ a: "a" });
    });

    it("delete from object", () => {
      const store = createStore({ a: { b: "b" }, z: "z" });
      store.delete("/a/b");
      expect(store.get("")).to.deep.equal({ a: {}, z: "z" });
    });

    it("delete from root", () => {
      const store = createStore({ a: "a", b: "b" });
      store.delete("/a");
      expect(store.get("")).to.deep.equal({ b: "b" });
    });

    it("delete from array", () => {
      const store = createStore({ a: [0, 1, 2, 3] });
      store.delete("/a/2");
      expect(store.get("")).to.deep.equal({ a: [0, 1, 3] });
    });
  });
});
