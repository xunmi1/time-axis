import { BaseShape } from './BaseShape';
import { setStyle, type Context, type DefaultStyle } from './utils';
import type { Vector2D } from './Vector2D';

type Attrs = {
  points: Vector2D[];
};

type Style = {
  color?: DefaultStyle['strokeStyle'];
  width?: DefaultStyle['lineWidth'];
};

export class PolylineShape extends BaseShape<Attrs, Style> {
  draw(ctx: Context) {
    const points = this.attrs.points;
    if (points.length < 2) return;
    ctx.beginPath();
    const style = this.style;
    setStyle(ctx, 'strokeStyle', style.color);
    setStyle(ctx, 'lineWidth', style.width);
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }
}
