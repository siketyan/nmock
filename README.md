# nmock: Easy module mocking for Node.js Test Runner

This project adds easy module mocking to your `node:test` runner including:

- Hoisted module mocks (you don't need to use dynamic imports)
- Automatic mocking
- Manual mocking with factory functions
- Compatible APIs with other test frameworks

## APIs

You can choose how to mock modules via installing any of these APIs.
Installation and usage may differ across APIs you choose.

> [!NOTE]
> Only `@nmock/jest` is available for now. `@nmock/vi` will be added later! (pull requests are welcome)

### `@nmock/jest`: Jest compatible API

See [packages/jest](./packages/jest) for details.
