export function createBeforeCallHook<Fn extends (...args: Parameters<Fn>) => ReturnType<Fn>>(
  fn: Fn,
  hook: (original: Fn, ...args: Parameters<Fn>) => ReturnType<Fn>,
): Fn {
  return ((...args: Parameters<Fn>) => {
    return hook(fn, ...args);
  }) as Fn;
}

export function createAfterCallHook<Fn extends (...args: Parameters<Fn>) => ReturnType<Fn>>(
  fn: Fn,
  hook: (original: Fn, result: ReturnType<Fn>, ...args: Parameters<Fn>) => ReturnType<Fn>,
): Fn {
  return ((...args: Parameters<Fn>) => {
    const result = fn(...args);
    return hook(fn, result, ...args);
  }) as Fn;
}

export type HookableFunction<Fn extends (...args: unknown[]) => unknown> = {
  addBeforeHook(hook: (original: Fn, ...args: Parameters<Fn>) => ReturnType<Fn>): void;
  addAfterHook(hook: (original: Fn, result: ReturnType<Fn>, ...args: Parameters<Fn>) => ReturnType<Fn>): void;
} & Fn;

export function makeFunctionHookable<Fn extends (...args: unknown[]) => unknown>(fn: Fn): HookableFunction<Fn> {
  const beforeHooks: Array<(original: Fn, ...args: Parameters<Fn>) => ReturnType<Fn>> = [];
  const afterHooks: Array<(original: Fn, result: ReturnType<Fn>, ...args: Parameters<Fn>) => ReturnType<Fn>> = [];

  const hookableFunction = ((...args: Parameters<Fn>): ReturnType<Fn> => {
    let result: ReturnType<Fn>;

    for (const beforeHook of beforeHooks) {
      result = beforeHook(fn, ...args);
    }
    result = fn(...args) as ReturnType<Fn>;
    for (const afterHook of afterHooks) {
      result = afterHook(fn, result, ...args);
    }

    return result;
  }) as HookableFunction<Fn>;

  hookableFunction.addBeforeHook = (hook: (original: Fn, ...args: Parameters<Fn>) => ReturnType<Fn>) => {
    beforeHooks.push(hook);
  };

  hookableFunction.addAfterHook = (
    hook: (original: Fn, result: ReturnType<Fn>, ...args: Parameters<Fn>) => ReturnType<Fn>,
  ) => {
    afterHooks.push(hook);
  };

  return hookableFunction;
}
