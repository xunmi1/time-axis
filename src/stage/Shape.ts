import type { Context } from './utils';
import { Vector2D, type Vector2DLike } from './Vector2D';
import { Node, type NodeOptions } from './Node';
import type { NodeState } from './NodeState';

export interface ShapeOptions<Attrs, Style> extends NodeOptions {
  attrs: Attrs;
  style?: Style;
}

export abstract class Shape<Attrs = {}, Style = {}> extends Node {
  attrs: Attrs;
  style: Style;

  constructor(options: ShapeOptions<Attrs, Style>) {
    super(options);
    this.attrs = options.attrs;
    this.style = options.style ?? Object.create(null);
  }

  render(ctx: Context, state: NodeState) {
    this.draw(ctx);
    state.reset();

    if (this.children?.length) {
      const anchor = Vector2D.from(this.anchor);
      // make children draw relative to anchor
      translate(ctx, anchor);
      this.children.forEach(child => child.render(ctx, state));
      translate(ctx, anchor.negate());
    }
  }

  abstract draw(ctx: Context): void;
  abstract get anchor(): Vector2DLike;

  measure?(ctx: Context): { width: number; height: number };
}

function translate(ctx: Context, vector: Vector2D) {
  ctx.translate(vector.x, vector.y);
}
