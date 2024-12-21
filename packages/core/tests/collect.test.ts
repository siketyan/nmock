import * as assert from "node:assert";
import { describe, it } from "node:test";

import { Registry } from "@nmock/core";

describe("Mocker.collect", () => {
  it("collects a mock without any options", () => {
    const registry = new Registry({
      client: undefined as any,
      mockerName: "mock",
      mockerModuleName: "@nmock/dummy",
    });

    const source = `
import { mock } from "@nmock/dummy";

mock("./greeter.js");
    `.trim();

    registry.collect(source);

    assert.deepEqual(registry.find("./greeter.js"), {
      code: 'mock("./greeter.js")',
      mockerName: "mock",
    });
  });

  it("collects a mock with renamed import", () => {
    const registry = new Registry({
      client: undefined as any,
      mockerName: "mock",
      mockerModuleName: "@nmock/dummy",
    });

    const source = `
import { mock as myMock } from "@nmock/dummy";

myMock("./greeter.js");
    `.trim();

    registry.collect(source);

    assert.deepEqual(registry.find("./greeter.js"), {
      code: 'myMock("./greeter.js")',
      mockerName: "myMock",
    });
  });

  it("collects a mock with factory", () => {
    const registry = new Registry({
      client: undefined as any,
      mockerName: "mock",
      mockerModuleName: "@nmock/dummy",
    });

    const source = `
import { mock } from "@nmock/dummy";

mock("./greeter.js", () => ({
  greet: () => "I am mocked!",
}));
    `.trim();

    registry.collect(source);

    assert.deepEqual(registry.find("./greeter.js"), {
      code: `
mock("./greeter.js", () => ({
  greet: () => "I am mocked!",
}))`.trim(),
      mockerName: "mock",
    });
  });
});
