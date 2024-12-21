declare global {
  var __nmock__: Map<string, Record<string, unknown>>;
}

export function initGlobals(): void {
  globalThis.__nmock__ = new Map();
}

/**
 * Add an object that represents exported symbols in a module.
 * The added exports can be referenced from the mocked module to get the value.
 */
export function addModuleObject(url: string, obj: Record<string, unknown>): void {
  globalThis.__nmock__.set(url, obj);
}
