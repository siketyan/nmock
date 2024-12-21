import * as assert from "node:assert";
import { describe, it } from "node:test";

import { mock, mocked } from "@nmock/jest";

import { greet } from "./harness/greeter.ts";

mock("./harness/greeter.ts");

describe("Automatic mocking", () => {
  it("Simple", () => {
    mocked(greet).mockReturnValueOnce("I am mocked!");
    assert.equal(greet(), "I am mocked!");
  });
});
