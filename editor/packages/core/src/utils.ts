export function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object") {
    Object.freeze(obj);
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val && typeof val === "object" && !Object.isFrozen(val)) deepFreeze(val);
    }
  }
  return obj;
}

export function move<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const copy = [...arr];
  const [spliced] = copy.splice(from, 1);
  copy.splice(to, 0, spliced);
  return copy;
}

export function now() {
  return Date.now();
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
