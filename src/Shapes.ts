import { measureText } from './utils';

type PickKeys<T, R> = {
  [P in keyof T]: R extends T[P] ? P : T[P] extends R ? P : never;
}[keyof T];

type Context = CanvasRenderingContext2D;

type DefaultStyle = Partial<Pick<Context, PickKeys<Context, string | number | boolean>>> & {
  lineDash?: Iterable<number>;
};

export type ShapeType = Shape['type'];

interface Base {
  type: ShapeType;
  attrs: Record<string, unknown>;
  style?: Record<string, unknown>;
}

export interface ShapeLine extends Base {
  type: 'line';
  attrs: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  style?: {
    stroke?: string;
    lineWidth?: number;
  };
}

export interface ShapeRect extends Base {
  type: 'rect';
  attrs: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style?: {
    fill?: string;
    stroke?: string;
    borderWidth?: number;
  };
}

export interface ShapeTriangle extends Base {
  type: 'triangle';
  attrs: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
  };
  style?: {
    fill?: string;
    stroke?: string;
    borderWidth?: number;
  };
}

export interface ShapeText extends Base {
  type: 'text';
  attrs: {
    x: number;
    y: number;
    text: string;
  };
  style?: {
    fill?: string;
    font?: string;
    align?: CanvasTextAlign;
  };
}

export interface ShapePath extends Base {
  type: 'path';
  attrs: {
    paths: number[];
  };
  style?: {
    stroke?: string;
    lineWidth?: number;
  };
}

export type Shape = ShapeLine | ShapeTriangle | ShapeRect | ShapePath | ShapeText;

export class Shapes {
  #value = new Set<Shape>();
  #context: CanvasRenderingContext2D;
  #defaultStyle: DefaultStyle = {};

  constructor(context: CanvasRenderingContext2D) {
    this.#context = context;
  }

  get size() {
    return this.#value.size;
  }

  add(shape: Shape) {
    this.#value.add(shape);
  }

  remove(shape: Shape) {
    this.#value.delete(shape);
  }

  clear() {
    this.#value.clear();
  }

  [Symbol.iterator]() {
    return this.#value[Symbol.iterator]();
  }

  get [Symbol.toStringTag]() {
    return 'Shapes';
  }

  forEach(fn: (shape: Shape) => void) {
    this.#value.forEach(fn);
  }

  drawLine(shape: ShapeLine) {
    const ctx = this.#context;
    const { attrs, style = {} } = shape;
    ctx.beginPath();
    setStyle(ctx, 'strokeStyle', style.stroke);
    setStyle(ctx, 'lineWidth', style.lineWidth);
    ctx.moveTo(attrs.x1, attrs.y1);
    ctx.lineTo(attrs.x2, attrs.y2);
    ctx.stroke();
  }

  drawTriangle(shape: ShapeTriangle) {
    const ctx = this.#context;
    const { attrs, style = {} } = shape;
    ctx.beginPath();
    setStyle(ctx, 'fillStyle', style.fill);
    const borderWidth = style.borderWidth ?? 0;
    setStyle(ctx, 'lineWidth', borderWidth);
    ctx.moveTo(attrs.x1, attrs.y1);
    ctx.lineTo(attrs.x2, attrs.y2);
    ctx.lineTo(attrs.x3, attrs.y3);
    ctx.lineTo(attrs.x1, attrs.y1);
    ctx.fill();
    if (borderWidth > 0) {
      setStyle(ctx, 'strokeStyle', style.stroke);
      ctx.stroke();
    }
  }

  drawRect(shape: ShapeRect) {
    const ctx = this.#context;
    const { attrs, style = {} } = shape;
    ctx.beginPath();
    setStyle(ctx, 'fillStyle', style.fill);
    const borderWidth = style.borderWidth ?? 0;
    setStyle(ctx, 'lineWidth', style.borderWidth);
    ctx.rect(attrs.x, attrs.y, attrs.width, attrs.height);
    ctx.fill();
    if (borderWidth > 0) {
      setStyle(ctx, 'strokeStyle', style.stroke);
      ctx.stroke();
    }
  }

  drawText(shape: ShapeText) {
    const ctx = this.#context;
    const { attrs, style = {} } = shape;
    setStyle(ctx, 'fillStyle', style.fill);
    setStyle(ctx, 'font', style.font);
    setStyle(ctx, 'textAlign', style.align);

    ctx.fillText(attrs.text, attrs.x, attrs.y);
  }

  drawPath(shape: ShapePath) {
    const ctx = this.#context;
    const { attrs, style = {} } = shape;
    ctx.beginPath();
    setStyle(ctx, 'strokeStyle', style.stroke);
    setStyle(ctx, 'lineWidth', style.lineWidth);
    ctx.moveTo(attrs.paths[0], attrs.paths[1]);
    for (let i = 2; i < attrs.paths.length; i += 2) {
      ctx.lineTo(attrs.paths[i], attrs.paths[i + 1]);
    }
    ctx.stroke();
  }

  draw(shape: Shape) {
    switch (shape.type) {
      case 'line':
        this.drawLine(shape);
        break;
      case 'triangle':
        this.drawTriangle(shape);
        break;
      case 'rect':
        this.drawRect(shape);
        break;
      case 'path':
        this.drawPath(shape);
        break;
      case 'text':
        this.drawText(shape);
        break;
    }
    this.#resetToDefaultStyle();
  }

  drawAll() {
    this.forEach(shape => this.draw(shape));
  }

  measure(shape: Shape) {
    if (shape.type === 'text') {
      const ctx = this.#context;
      const { attrs, style = {} } = shape;
      setStyle(ctx, 'font', style.font);
      const rect = measureText(ctx, attrs.text);
      setStyle(ctx, 'font', this.#defaultStyle.font);
      return rect;
    }
  }

  collectDefaultStyle() {
    const ctx = this.#context;
    this.#defaultStyle = {
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

  #resetToDefaultStyle() {
    const ctx = this.#context;
    const style = this.#defaultStyle;
    (Object.keys(style) as (keyof DefaultStyle)[]).forEach(key => {
      setStyle(ctx, key, style[key]);
    });
  }
}

function setStyle<T extends keyof DefaultStyle>(ctx: Context, key: T, value: DefaultStyle[T]) {
  if (value == null) return;
  if (key === 'lineDash') return ctx.setLineDash(value as number[]);
  // @ts-expect-error
  if (ctx[key] !== value) ctx[key] = value;
}
