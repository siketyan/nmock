import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";

import {
  AutoMockedModule,
  Evaluator,
  ManualMockedModule,
  type MockFactory,
  type MockedModule,
  Server,
} from "@nmock/core";
import { ModuleMocker } from "jest-mock";

import type { RegisterOptions } from "./hook.js";

let isInstalled = false;

const mocker = new ModuleMocker(globalThis);

export function mock(moduleName: string, factory?: () => unknown): MockedModule {
  if (!isInstalled) {
    throw new Error(
      "@nmock/jest is not properly installed. Make sure you import @nmock/jest/register before the test module.",
    );
  }

  if (factory) {
    return new ManualMockedModule(moduleName, factory as MockFactory);
  }

  return new AutoMockedModule(moduleName, fn);
}

export const mocked: typeof mocker.mocked = mocker.mocked.bind(mocker);

export const isMockFunction: typeof mocker.isMockFunction = mocker.isMockFunction.bind(mocker);

export const fn: typeof mocker.fn = mocker.fn.bind(mocker);

export const spyOn: typeof mocker.spyOn = mocker.spyOn.bind(mocker);

export const clearAllMocks: typeof mocker.clearAllMocks = mocker.clearAllMocks.bind(mocker);

export const resetAllMocks: typeof mocker.resetAllMocks = mocker.resetAllMocks.bind(mocker);

export const restoreAllMocks: typeof mocker.restoreAllMocks = mocker.restoreAllMocks.bind(mocker);

export const jest = {
  mock,
  mocked,
  fn,
  spyOn,
  clearAllMocks,
  resetAllMocks,
  restoreAllMocks,
};

export interface Options {
  /**
   * Install the `jest` variable to the global, so `jest.mock()` will work without any imports.
   */
  globals?: boolean;
}

export function install({ globals = false }: Options = {}): void {
  if (isInstalled) {
    throw new Error("@nmock/jest is already installed. Install it twice can cause an unexpected behaviour.");
  }

  const { port1, port2 } = new MessageChannel();

  // Create a server to evaluate mocks in the main thread instead of the sub thread that runs the ESM hook.
  new Server(port1, {
    evaluator: new Evaluator(mock),
  });

  // Make sure the Node.js process to exit after all tests are done, regardless the remaining channel.
  port1.unref();

  // Now we register the ESM customisation hook, passing another port to communicate between threads.
  register<RegisterOptions>("./hook.js", {
    parentURL: import.meta.url,
    data: { transport: port2 },
    transferList: [port2],
  });

  if (globals) {
    Object.assign(globalThis, { jest });
  }

  isInstalled = true;
}
