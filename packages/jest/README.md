# @nmock/jest

![NPM Version](https://img.shields.io/npm/v/%40nmock%2Fjest?logo=npm)

Jest compatible module mocking for node:test runner.

## Installation

```shell
npm add -D @nmock/jest
```

## Usage

Add `--import @nmock/jest/register` option to the Node.js command line.

```shell
node --test --import @nmock/jest/register './tests/**/*.test.ts'
```

If you are testing a TypeScript project, you can combine it with `--experimental-strip-types`.

```shell
node --test --experimental-strip-types --import @nmock/jest/register './tests/**/*.test.ts'
```

Or, you can use a 3rd-party hook to resolve modules, such as `@swc-node/register`.

```shell
node --test --import @swc-node/register/esm-register --import @nmock/jest/register './tests/**/*/.test.ts'
```

> [!WARNING]
> Make sure you import the 3rd-party hook **BEFORE** `@nmock/jest/register` as ESM customisation hooks are chained
> against the imported order.

## Advanced Usage

If you want to customise how to install the hook, you can use your own module with the programmatic API.

```ts
import { install } from "@nmock/jest";

install({
  globals: true, // Enable the global `jest` object
})
```

## Writing mocks

### Automatic mocking

Call `mock()` with only the module name to be mocked, then all exported functions will be mocked automatically.

```ts
import { mock } from "@nmock/jest";

mock("./your-module.js");
```

### Manual mocking

Call `mock()` with a factory function to define how to mock the module.

```ts
import { mock } from "@nmock/jest";

mock("./your-module.js", () => ({
  doSomething: () => {
    console.log("doSomething was called!");

    return "Hello, world!";
  },
}));
```

## Limitations

- As `mock()` calls will be executed outside the module, any other symbols cannot be referenced from the mock.
  - This behaviour is similar to [`vi.mock`](https://vitest.dev/api/vi.html#vi-mock).
- Some other APIs including `requireActual` are not implemented yet.
