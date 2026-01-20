import { BaseShape } from './BaseShape';
import { setStyle, type Context, type DefaultStyle } from './utils';
import type { Vector2D } from './Vector2D';

type Attrs = {
  a: Vector2D;
  b: Vector2D;
  c: Vector2D;
};

type Style = {
  fillColor?: DefaultStyle['fillStyle'];
  borderColor?: DefaultStyle['strokeStyle'];
  borderWidth?: DefaultStyle['lineWidth'];
};

export class TriangleShape extends BaseShape<Attrs, Style> {
  draw(ctx: Context) {
    const style = this.style;
    const attrs = this.attrs;
    ctx.beginPath();
    ctx.beginPath();
    setStyle(ctx, 'fillStyle', style.fillColor);
    const borderWidth = style.borderWidth ?? 0;
    setStyle(ctx, 'lineWidth', borderWidth);
    ctx.moveTo(attrs.a.x, attrs.a.y);
    ctx.lineTo(attrs.b.x, attrs.b.y);
    ctx.lineTo(attrs.c.x, attrs.c.y);
    ctx.lineTo(attrs.a.x, attrs.a.y);
    ctx.fill();
    if (borderWidth > 0) {
      setStyle(ctx, 'strokeStyle', style.borderColor);
      ctx.stroke();
    }
  }
}
