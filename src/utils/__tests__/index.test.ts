import { describe, it, expect } from "vitest";
import * as utilsIndex from "../index";
import { syncContentfulToLocal } from "../syncContentfulToLocal";
import { syncModelsToContentful } from "../syncModelsToContentful";
import { ContentModel, CreateOrEditContentTypeFunction } from "../../types";

describe("Utils Index", () => {
  it("should export syncContentfulToLocal function", () => {
    expect(utilsIndex.syncContentfulToLocal).toBe(syncContentfulToLocal);
    expect(typeof utilsIndex.syncContentfulToLocal).toBe("function");
  });

  it("should export syncModelsToContentful function", () => {
    expect(utilsIndex.syncModelsToContentful).toBe(syncModelsToContentful);
    expect(typeof utilsIndex.syncModelsToContentful).toBe("function");
  });

  it("should export all expected functions and types", () => {
    expect(utilsIndex).toHaveProperty("syncContentfulToLocal");
    expect(utilsIndex).toHaveProperty("syncModelsToContentful");

    // Verify the functions are actually functions
    expect(typeof utilsIndex.syncContentfulToLocal).toBe("function");
    expect(typeof utilsIndex.syncModelsToContentful).toBe("function");
  });

  it("should have the correct number of exports", () => {
    const exports = Object.keys(utilsIndex);
    expect(exports).toHaveLength(2);
    expect(exports).toContain("syncContentfulToLocal");
    expect(exports).toContain("syncModelsToContentful");
  });
});
