import { BaseShape } from './BaseShape';
import { setStyle, type Context, type DefaultStyle } from './utils';
import type { Vector2D } from './Vector2D';

type Attrs = {
  start: Vector2D;
  end: Vector2D;
};

type Style = {
  fillColor?: DefaultStyle['fillStyle'];
  borderColor?: DefaultStyle['strokeStyle'];
  borderWidth?: DefaultStyle['lineWidth'];
};

export class RectShape extends BaseShape<Attrs, Style> {
  get anchor() {
    return this.attrs.start;
  }

  draw(ctx: Context) {
    const style = this.style;
    const attrs = this.attrs;
    ctx.beginPath();
    setStyle(ctx, 'fillStyle', style.fillColor);
    const borderWidth = style.borderWidth ?? 0;
    setStyle(ctx, 'lineWidth', style.borderWidth);
    const diff = attrs.end.subtract(attrs.start);
    ctx.rect(attrs.start.x, attrs.start.y, diff.x, diff.y);
    ctx.fill();
    if (borderWidth > 0) {
      setStyle(ctx, 'strokeStyle', style.borderColor);
      ctx.stroke();
    }
  }
}
