import { SortedArray } from './SortedArray';
import type { Shape } from './Shapes';
import type { Context } from './utils';
import type { Vector2DLike } from './Vector2D';

interface BaseShapeOptions<Attrs, Style> {
  attrs: Attrs;
  style?: Style;
  children?: Shape[];
  zIndex?: number;
}

export abstract class BaseShape<Attrs = {}, Style = {}> {
  attrs: Attrs;
  style: Style;
  children?: SortedArray<Shape>;
  zIndex: number;

  constructor(options: BaseShapeOptions<Attrs, Style>) {
    this.attrs = options.attrs;
    this.style = options.style ?? Object.create(null);
    this.children = options.children && createShapeChildren(options.children);
    this.zIndex = options.zIndex ?? 0;
  }

  abstract draw(ctx: Context): void;
  abstract get anchor(): Vector2DLike;
  measure?(ctx: Context): { width: number; height: number; left: number; right: number; top: number; bottom: number };
}

function compareByZIndex(a: BaseShape, b: BaseShape) {
  return a.zIndex - b.zIndex;
}

export function createShapeChildren<T extends BaseShape>(children?: T[]) {
  return new SortedArray<T>(compareByZIndex, children);
}
