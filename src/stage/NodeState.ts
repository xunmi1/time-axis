import { setStyle, type Context, type DefaultStyle } from './utils';

export class NodeState {
  #context: Context;

  #style: DefaultStyle;

  constructor(context: Context) {
    this.#context = context;
  }

  collect() {
    const ctx = this.#context;
    this.#style = {
      fillStyle: ctx.fillStyle,
      strokeStyle: ctx.strokeStyle,
      lineWidth: ctx.lineWidth,
      lineCap: ctx.lineCap,
      lineJoin: ctx.lineJoin,
      lineDash: ctx.getLineDash(),
      lineDashOffset: ctx.lineDashOffset,
      shadowColor: ctx.shadowColor,
      shadowBlur: ctx.shadowBlur,
      shadowOffsetX: ctx.shadowOffsetX,
      shadowOffsetY: ctx.shadowOffsetY,
      font: ctx.font,
      textAlign: ctx.textAlign,
    };
  }

  reset() {
    const ctx = this.#context;
    const style = this.#style;
    (Object.keys(style) as (keyof DefaultStyle)[]).forEach(key => {
      setStyle(ctx, key, style[key]);
    });
  }
}
