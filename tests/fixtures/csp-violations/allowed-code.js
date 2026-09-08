export function scheduleFunctionCallback(task) {
  setTimeout(task, 0);
  setInterval(task, 1000);
}

export async function loadLocalModule() {
  return import('./remote-code.js');
}
