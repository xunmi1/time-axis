import { BaseShape } from './BaseShape';
import { setStyle, type Context, type DefaultStyle } from './utils';
import { Vector2D } from './Vector2D';

type Attrs = {
  points: Vector2D[];
};

type Style = {
  fillColor?: DefaultStyle['fillStyle'];
  borderColor?: DefaultStyle['strokeStyle'];
  borderWidth?: DefaultStyle['lineWidth'];
};

export class PolygonShape extends BaseShape<Attrs, Style> {
  get anchor() {
    // anchor is the polygon's centroid
    return calculateCentroid(this.attrs.points) ?? this.attrs.points[0];
  }

  draw(ctx: Context) {
    const points = this.attrs.points;
    if (points.length < 3) return;
    const style = this.style;
    ctx.beginPath();
    setStyle(ctx, 'fillStyle', style.fillColor);
    const borderWidth = style.borderWidth ?? 0;
    setStyle(ctx, 'lineWidth', style.borderWidth);
    points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[0].x, points[0].y);
    ctx.fill();
    if (borderWidth > 0) {
      setStyle(ctx, 'strokeStyle', style.borderColor);
      ctx.stroke();
    }
  }
}

function calculateCentroid(points: Vector2D[]) {
  const vectors = points.concat(points[0]);
  let area = 0;
  let centroidSum = new Vector2D(0, 0);

  vectors.forEach((current, i) => {
    const next = vectors[i + 1];
    if (!next) return;
    const crossProduct = current.cross(next);
    area += crossProduct;
    const contribution = current.add(next).scale(crossProduct);
    centroidSum = centroidSum.add(contribution);
  });
  area = area * 0.5;
  if (Math.abs(area) < Number.EPSILON) return;
  return centroidSum.scale(1 / (6 * area));
}
