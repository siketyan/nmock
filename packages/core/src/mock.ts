import { init, parse } from "es-module-lexer";

await init;

export interface MockedModule {
  specifier: string;
  resolve(source: string): Record<string, unknown>;
}

export type MockFactory = () => Record<string, unknown>;

export class ManualMockedModule implements MockedModule {
  readonly specifier: string;
  readonly factory: MockFactory;

  constructor(specifier: string, factory: MockFactory) {
    this.specifier = specifier;
    this.factory = factory;
  }

  resolve(): Record<string, unknown> {
    return this.factory();
  }
}

export class AutoMockedModule implements MockedModule {
  readonly specifier: string;
  readonly mockFn: () => unknown;

  constructor(specifier: string, mockFn: () => unknown) {
    this.specifier = specifier;
    this.mockFn = mockFn;
  }

  resolve(source: string): Record<string, unknown> {
    const [, exports] = parse(source);

    return Object.fromEntries(
      exports.map(({ n: name }) => {
        return [name, this.mockFn()];
      }),
    );
  }
}
