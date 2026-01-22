type Compare<T> = (a: T, b: T) => number;

export class SortedArray<T> {
  #buffer: T[];
  #compare: Compare<T>;

  constructor(compare: Compare<T>, items?: T[]) {
    this.#buffer = items?.toSorted(compare) ?? [];
    this.#compare = compare;
  }

  get length() {
    return this.#buffer.length;
  }

  at(index: number) {
    return this.#buffer.at(index);
  }

  indexOf(item: T) {
    return this.#buffer.indexOf(item);
  }

  add(item: T) {
    const index = this.#upperBound(item);
    this.#insert(item, index);
    return item;
  }

  remove(item: T) {
    const index = this.#buffer.indexOf(item);
    if (index < 0) return;
    this.#buffer.splice(index, 1);
  }

  reindex(item: T) {
    this.remove(item);
    this.add(item);
  }

  clear() {
    this.#buffer.length = 0;
  }

  forEach(fn: (item: T, index: number) => void) {
    this.#buffer.forEach(fn);
  }

  has(item: T) {
    return this.#buffer.includes(item);
  }

  /** binary search to find index (upper bound of item) */
  #upperBound(item: T) {
    const buffer = this.#buffer;
    const compare = this.#compare;
    let high = buffer.length;
    // fast path for most common cases
    if (high === 0 || compare(buffer[high - 1], item) <= 0) return high;
    let low = 0;
    high = high - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (compare(buffer[middle], item) <= 0) low = middle + 1;
      else high = middle;
    }
    return low;
  }

  #insert(item: T, index: number) {
    if (index <= 0) {
      this.#buffer.unshift(item);
      return;
    }
    if (index === this.#buffer.length) {
      this.#buffer.push(item);
      return;
    }
    this.#buffer.splice(index, 0, item);
  }

  get [Symbol.toStringTag]() {
    return 'SortedArray';
  }
}
