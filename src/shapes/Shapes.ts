import type { SortedArray } from './SortedArray';
import { BaseShape, createShapeChildren } from './BaseShape';
import { LineShape } from './LineShape';
import { PolylineShape } from './PolylineShape';
import { RectShape } from './RectShape';
import { PolygonShape } from './PolygonShape';
import { TextShape } from './TextShape';
import { setStyle, type Context, type DefaultStyle } from './utils';
import { Vector2D } from './Vector2D';

/** exportable shapes type */
export interface ShapeMap {
  line: typeof LineShape;
  polyline: typeof PolylineShape;
  rect: typeof RectShape;
  polygon: typeof PolygonShape;
  text: typeof TextShape;
}

export type ShapeType = keyof ShapeMap;

export type Shape<T = ShapeType> = T extends ShapeType ? InstanceType<ShapeMap[T]> : never;

type ShapeConstructor<T = ShapeType> = {
  new (...arg: any): Shape<T>;
};

type ShapeParams<T extends ShapeType> = ConstructorParameters<ShapeMap[T]>[0];

type CreateShapeParams<T = ShapeType> = T extends ShapeType
  ? Omit<ShapeParams<T>, 'children'> & { type: T; children?: CreateShape[] }
  : never;

export type CreateShape<T = ShapeType> = Shape<T> | CreateShapeParams<T>;

const buildInShapes = {
  line: LineShape,
  polyline: PolylineShape,
  rect: RectShape,
  polygon: PolygonShape,
  text: TextShape,
} as const;

export class Shapes {
  #shapeMap: Map<ShapeType, ShapeConstructor>;
  #shapes: SortedArray<Shape>;
  #context: Context;

  #defaultStyle: DefaultStyle;

  constructor(context: Context) {
    this.#context = context;
    this.#shapes = createShapeChildren();
    this.#shapeMap = new Map(Object.entries(buildInShapes) as [ShapeType, ShapeConstructor][]);
  }

  use<T extends ShapeType>(type: T, Ctor: ShapeConstructor) {
    this.#shapeMap.set(type, Ctor);
    return this;
  }

  draw() {
    this.#shapes.forEach(shape => this.#draw(shape));
  }

  #draw(shape: Shape) {
    shape.draw(this.#context);
    this.#resetToDefaultStyle();

    if (shape.children?.length) {
      const anchor = Vector2D.from(shape.anchor);
      // make children draw relative to anchor
      this.#context.translate(anchor.x, anchor.y);
      shape.children.forEach(child => this.#draw(child));
      const anchorNegated = anchor.negate();
      this.#context.translate(anchorNegated.x, anchorNegated.y);
    }
  }

  create<T extends ShapeType>(params: CreateShape<T>): Shape<T> {
    if (params instanceof BaseShape) return params;
    const { type, ...shape } = params;
    const Ctor = this.#shapeMap.get(type) as ShapeConstructor<T> | undefined;
    if (!Ctor) throw new Error(`Unsupported shape type: ${type}`);
    if (shape.children) {
      shape.children = shape.children.map(child => this.create(child));
    }
    return new Ctor(shape);
  }

  add(shapeOrParams: CreateShape) {
    const shape = this.create(shapeOrParams);
    this.#shapes.add(shape);
    return shape;
  }

  remove(shape: Shape) {
    this.#shapes.remove(shape);
  }

  clear() {
    this.#shapes.clear();
  }

  measure(shape: Shape) {
    return shape.measure?.(this.#context);
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
