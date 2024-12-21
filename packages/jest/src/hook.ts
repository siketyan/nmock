import type { InitializeHook, LoadHook, ResolveHook } from "node:module";
import type { MessagePort } from "node:worker_threads";

import { Client, Registry } from "@nmock/core";

let registry: Registry;

export interface RegisterOptions {
  transport: MessagePort;
}

export const initialize: InitializeHook<RegisterOptions> = async (opts) => {
  const client = new Client(opts.transport);

  registry = new Registry({
    client,
    mockerName: "mock",
    mockerModuleName: "@nmock/jest",
  });
};

export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
  const resolved = await nextResolve(specifier, context);

  // Map the specifier in the registry to the resolved URL.
  registry.resolveUrl(specifier, resolved.url);

  return resolved;
};

export const load: LoadHook = async (url, context, nextLoad) => {
  const { format, source } = await nextLoad(url, context);
  if (format !== "module" && format !== ("module-typescript" as any)) {
    return { format, source };
  }

  // If the module is to be mocked, evaluate the code and create a mocked module.
  const mock = await registry.mock(url, String(source));
  if (mock) {
    return { format, source: mock };
  }

  // Otherwise, collect all mocking code (i.e. mock() calls) from the source.
  await registry.collect(String(source));

  return { format, source };
};
