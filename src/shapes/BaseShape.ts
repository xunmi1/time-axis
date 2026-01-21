import type { Shape } from './Shapes';
import type { Context } from './utils';
import type { Vector2DLike } from './Vector2D';

export abstract class BaseShape<Attrs = {}, Style = {}> {
  attrs: Attrs;
  style: Style;
  children?: Shape[];

  constructor(options: { attrs: Attrs; style?: Style; children?: Shape[] }) {
    this.attrs = options.attrs;
    this.style = options.style ?? Object.create(null);
    this.children = options.children;
  }

  abstract draw(ctx: Context): void;
  abstract get anchor(): Vector2DLike;
  measure?(ctx: Context): { width: number; height: number; left: number; right: number; top: number; bottom: number };
}
