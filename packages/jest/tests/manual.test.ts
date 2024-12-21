import assert from "node:assert";
import { describe, it } from "node:test";

import { mock } from "@nmock/jest";

import { greet } from "./harness/greeter.ts";

mock("./harness/greeter.ts", () => ({
  greet: () => "I am mocked!",
}));

describe("Manual mocking", () => {
  it("Simple", () => {
    assert.equal(greet(), "I am mocked!");
  });
});
