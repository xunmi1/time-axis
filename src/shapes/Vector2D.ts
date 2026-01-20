type Component = 'x' | 'y';
type Vector2DArray = [x: number, y: number];
type Vector2DLike = Vector2DArray | Record<Component, number> | Vector2D;

/** 二维向量 */
export class Vector2D {
  readonly x;

  readonly y;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static from(value: Vector2DLike) {
    if (Array.isArray(value)) return new Vector2D(value[0], value[1]);
    return new Vector2D(value.x, value.y);
  }

  map(operator: (value: number, component: Component) => number) {
    return new Vector2D(operator(this.x, 'x'), operator(this.y, 'y'));
  }

  zipWith(operator: (a: number, b: number) => number, ...rest: [vector: Vector2D] | Vector2DArray) {
    const vector = rest.length === 2 ? new Vector2D(...rest) : rest[0];
    return this.map((v, k) => operator(v, vector[k]));
  }

  add(...rest: [vector: Vector2D] | Vector2DArray) {
    return this.zipWith((a, b) => a + b, ...rest);
  }

  subtract(...rest: [vector: Vector2D] | Vector2DArray) {
    return this.zipWith((a, b) => a - b, ...rest);
  }

  multiply(...rest: [vector: Vector2D] | Vector2DArray) {
    return this.zipWith((a, b) => a * b, ...rest);
  }

  scale(k: number) {
    return this.map(v => v * k);
  }

  /**
   * Project—zero out the other components.
   */
  project(component: Component) {
    return this.map((v, k) => (k === component ? v : 0));
  }

  clamp(min: Vector2D, max: Vector2D) {
    return this.map((v, k) => (v < min[k] ? min[k] : v > max[k] ? max[k] : v));
  }

  negate() {
    return this.map(v => -v);
  }

  get [Symbol.toStringTag]() {
    return 'Vector2D';
  }

  *[Symbol.iterator](): Iterator<number> {
    yield this.x;
    yield this.y;
  }

  toString() {
    return `Vector2D(${this.x}, ${this.y})`;
  }

  valueOf() {
    throw new TypeError('Vector2D is not a primitive value');
  }

  toJSON(): Vector2DArray {
    return [this.x, this.y];
  }
}
