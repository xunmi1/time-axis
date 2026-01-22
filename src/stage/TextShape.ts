import { Shape } from './Shape';
import { setStyle, type Context, type DefaultStyle } from './utils';
import type { Vector2D } from './Vector2D';

type Attrs = {
  start: Vector2D;
  text: string;
};

type Style = {
  color?: DefaultStyle['fillStyle'];
  font?: DefaultStyle['font'];
  align?: DefaultStyle['textAlign'];
};

export class TextShape extends Shape<Attrs, Style> {
  get anchor() {
    return this.attrs.start;
  }
  draw(ctx: Context) {
    const style = this.style;
    const attrs = this.attrs;
    setStyle(ctx, 'fillStyle', style.color);
    setStyle(ctx, 'font', style.font);
    setStyle(ctx, 'textAlign', style.align);
    ctx.fillText(attrs.text, attrs.start.x, attrs.start.y);
  }

  measure(ctx: Context) {
    const style = this.style;
    const attrs = this.attrs;
    const font = ctx.font;
    setStyle(ctx, 'font', style.font);
    const rect = measureText(ctx, attrs.text);
    setStyle(ctx, 'font', font);
    return rect;
  }
}

export function measureText(ctx: Context, text: string) {
  const metrics = ctx.measureText(text);
  return {
    height: Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent),
    width: Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight),
    left: metrics.actualBoundingBoxLeft,
    right: metrics.actualBoundingBoxRight,
    top: metrics.actualBoundingBoxAscent,
    bottom: metrics.actualBoundingBoxDescent,
  };
}
