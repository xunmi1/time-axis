import { BaseShape } from './BaseShape';
import { LineShape } from './LineShape';
import { PolylineShape } from './PolylineShape';
import { RectShape } from './RectShape';
import { TriangleShape } from './TriangleShape';
import { TextShape } from './TextShape';
import { setStyle, type Context, type DefaultStyle } from './utils';

export interface ShapeMap {
  line: typeof LineShape;
  polyline: typeof PolylineShape;
  rect: typeof RectShape;
  triangle: typeof TriangleShape;
  text: typeof TextShape;
}

export type ShapeType = keyof ShapeMap;

export type Shape = InstanceType<ShapeMap[ShapeType]>;

type ShapeConstructor = {
  new (...arg: any): Shape;
};

export type CreateShape = Shape | (ConstructorParameters<ShapeMap[ShapeType]>[0] & { type: ShapeType });

const buildInShapes = {
  line: LineShape,
  polyline: PolylineShape,
  rect: RectShape,
  triangle: TriangleShape,
  text: TextShape,
} as const;

export class Shapes {
  #shapeMap: Map<ShapeType, ShapeConstructor> = new Map();
  #shapeQueue = new Set<Shape>();
  #context: Context;

  #defaultStyle: DefaultStyle;

  constructor(context: Context) {
    this.#context = context;
    this.#shapeMap = new Map(Object.entries(buildInShapes) as [ShapeType, ShapeConstructor][]);
  }

  use<T extends ShapeType>(type: T, shape: ShapeConstructor) {
    this.#shapeMap.set(type, shape);
    return this;
  }

  draw(shape: Shape) {
    shape.draw(this.#context);
    this.#resetToDefaultStyle();
  }

  drawAll() {
    this.#shapeQueue.forEach(shape => this.draw(shape));
  }

  create(shapeOrParams: CreateShape) {
    if (shapeOrParams instanceof BaseShape) return shapeOrParams;
    const { type, ...rest } = shapeOrParams;
    const Ctor = this.#shapeMap.get(type);
    if (Ctor) return new Ctor(rest);
  }

  add(shapeOrParams: CreateShape) {
    const shape = this.create(shapeOrParams);
    if (shape) this.#shapeQueue.add(shape);
  }

  remove(shape: Shape) {
    this.#shapeQueue.delete(shape);
  }

  clear() {
    this.#shapeQueue.clear();
  }

  measure(shapeOrParams: CreateShape) {
    const shape = this.create(shapeOrParams);
    return shape?.measure?.(this.#context);
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
