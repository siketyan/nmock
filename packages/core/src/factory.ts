export function createMockedModule(url: string, exports: string[]): string {
  return exports
    .map((name) => `export const ${name} = globalThis.__nmock__.get(${JSON.stringify(url)})[${JSON.stringify(name)}];`)
    .join("\n");
}
