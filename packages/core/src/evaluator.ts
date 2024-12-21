import { addModuleObject, initGlobals } from "./globals.js";
import type { MockedModule } from "./mock.js";

initGlobals();

type Mocker = (...args: any[]) => unknown;

export class Evaluator {
  readonly #mocker: Mocker;

  constructor(mocker: Mocker) {
    this.#mocker = mocker;
  }

  /**
   * Evaluate the module to get the list of exports and the mocked value.
   * The list will be returned to the client (ESM hook) to know what symbols needs to be exported.
   * The mocked values is added to the globals to be retrieved from the mocked exports later.
   */
  evaluate(url: string, code: string, mockerName: string, originalSource: string): string[] {
    const mod: MockedModule = new Function(mockerName, `"use strict"; return (${code});`)(this.#mocker);
    const obj = mod.resolve(originalSource);

    addModuleObject(url, obj);

    return Object.keys(obj);
  }
}
