export type EventName = string | symbol;

export interface Listener {
  (...args: unknown[]): unknown;
}

export type ListenerMap = Record<EventName, Listener>;

export type ListenerOptions = {
  signal?: AbortSignal;
};

export class EventEmitter<T extends ListenerMap> {
  #events = new Map<keyof T, Set<T[keyof T]>>();

  on<K extends keyof T>(eventName: K, listener: T[K], options?: ListenerOptions) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted) return;
      signal.addEventListener('abort', () => this.off(eventName, listener));
    }

    const listeners = this.#events.get(eventName);
    if (listeners) {
      listeners.add(listener);
    } else {
      this.#events.set(eventName, new Set([listener]));
    }
  }

  off<K extends keyof T>(eventName: K, listener: T[K]) {
    const listeners = this.#events.get(eventName);
    if (listeners) listeners.delete(listener);
  }

  once<K extends keyof T>(eventName: K, listener: T[K], options?: ListenerOptions) {
    const wrapper = ((...args) => {
      this.off<K>(eventName, wrapper);
      listener(...args);
    }) as T[K];
    this.on(eventName, wrapper, options);
  }

  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>) {
    const listeners = this.#events.get(eventName);
    if (listeners) listeners.forEach(listener => listener(...args));
  }

  clear() {
    this.#events.clear();
  }
}
