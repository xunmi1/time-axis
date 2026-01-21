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
  get anchor() {
    return this.attrs.points[0];
  }

  draw(ctx: Context) {
    const points = this.attrs.points;
    if (points.length < 2) return;
    ctx.beginPath();

    const style = this.style;
    setStyle(ctx, 'strokeStyle', style.color);
    setStyle(ctx, 'lineWidth', style.width);
    points.forEach((point, i) => {
      if (i === 0) ctx.lineTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
}
