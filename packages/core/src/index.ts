import { parse } from "acorn";
import { full as walkFull } from "acorn-walk";

import { isCallExpression, isIdentifier, isImportDeclaration, isImportSpecifier, isLiteral } from "./ast.js";
import { createMockedModule } from "./factory.js";
import type { Client } from "./transport.js";

export { Evaluator } from "./evaluator.js";
export { AutoMockedModule, ManualMockedModule, type MockFactory, type MockedModule } from "./mock.js";
export { Client, Server } from "./transport.js";

export interface Mock {
  code: string;
  mockerName: string;
}

export interface RegistryOptions {
  /**
   * Communication client between threads to evaluate code in the main thread.
   */
  client: Client;

  /**
   * Name of the mock() stub. It can be renamed in an import specifier (`import { mock as myMock }`).
   */
  mockerName: string;

  /**
   * Where the mock() stub will be imported from.
   */
  mockerModuleName: string;
}

export class Registry {
  readonly #client: Client;
  readonly #mockerName: string;
  readonly #mockerModuleName: string;

  readonly #mockMap = new Map<string, Mock>();

  constructor(options: RegistryOptions) {
    this.#client = options.client;
    this.#mockerName = options.mockerName;
    this.#mockerModuleName = options.mockerModuleName;
  }

  /**
   * Collect all mocking code from the source and saves to the map.
   */
  async collect(source: string): Promise<void> {
    const program = parse(source, {
      ecmaVersion: "latest",
      sourceType: "module",
    });

    let mockerName = this.#mockerName;

    walkFull(program, (node) => {
      if (isImportDeclaration(node)) {
        if (node.source.value !== this.#mockerModuleName) return;

        for (const specifier of node.specifiers) {
          if (
            isImportSpecifier(specifier) &&
            isIdentifier(specifier.imported) &&
            specifier.imported.name === this.#mockerName
          ) {
            mockerName = specifier.local.name;
          }
        }
      } else if (isCallExpression(node)) {
        if (!isIdentifier(node.callee) || node.callee.name !== mockerName) return;
        if (!isLiteral(node.arguments[0]) || typeof node.arguments[0].value !== "string") return;

        const specifier = node.arguments[0].value;

        this.#mockMap.set(specifier, {
          code: source.slice(node.start, node.end),
          mockerName,
        });
      }
    });
  }

  /**
   * Resolve the specifier that is specified by the mocking code to the URL.
   */
  resolveUrl(specifier: string, url: string): void {
    const mock = this.#mockMap.get(specifier);
    if (mock) {
      this.#mockMap.set(url, mock);
      this.#mockMap.delete(specifier);
    }
  }

  /**
   * Finds a mock by the specifier or the URL.
   */
  find(specifierOrUrl: string): Mock | undefined {
    return this.#mockMap.get(specifierOrUrl);
  }

  /**
   * Evaluate the mocking code (if found) and returns the mocked module source.
   */
  async mock(url: string, source: string): Promise<string | undefined> {
    const mocking = this.find(url);
    if (!mocking) {
      return undefined;
    }

    const response = await this.#client.evaluate({
      url,
      code: mocking.code,
      mockerName: mocking.mockerName,
      originalSource: source,
    });

    return createMockedModule(url, response.exports);
  }
}
