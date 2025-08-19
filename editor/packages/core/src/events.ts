export type EventMap = {
  "state:changed": undefined;
  "history:changed": { canUndo: boolean; canRedo: boolean };
  "command:applied": { type: string; payload: unknown };
};

type Listener<T> = (payload: T) => void;

export class TypedEventEmitter<E extends Record<string, any>> {
  private listeners = new Map<keyof E, Set<Function>>();

  on<K extends keyof E>(event: K, listener: Listener<E[K]>) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener as any);
    this.listeners.set(event, set);
    return () => this.off(event, listener);
  }

  off<K extends keyof E>(event: K, listener: Listener<E[K]>) {
    const set = this.listeners.get(event);
    if (set) set.delete(listener as any);
  }

  emit<K extends keyof E>(event: K, payload: E[K]) {
    const set = this.listeners.get(event);
    if (set) for (const l of set) (l as Listener<E[K]>)(payload);
  }

  clear() {
    this.listeners.clear();
  }
}

