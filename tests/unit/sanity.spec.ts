import { describe, expect, it } from "vitest";

describe("toolchain sanity", () => {
  it("should run inside the vitest + typescript toolchain", () => {
    expect(1 + 1).toBe(2);
  });
});
