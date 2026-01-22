import { Shape } from './Shape';
import { setStyle, type Context, type DefaultStyle } from './utils';
import type { Vector2D } from './Vector2D';

type Attrs = {
  start: Vector2D;
  end: Vector2D;
};

type Style = {
  color?: DefaultStyle['strokeStyle'];
  lineWidth?: DefaultStyle['lineWidth'];
};

export class LineShape extends Shape<Attrs, Style> {
  get anchor() {
    return this.attrs.start;
  }
  draw(ctx: Context) {
    const style = this.style;
    const attrs = this.attrs;
    ctx.beginPath();
    setStyle(ctx, 'strokeStyle', style.color);
    setStyle(ctx, 'lineWidth', style.lineWidth);
    ctx.moveTo(attrs.start.x, attrs.start.y);
    ctx.lineTo(attrs.end.x, attrs.end.y);
    ctx.stroke();
  }
}
