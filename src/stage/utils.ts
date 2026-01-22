type PickKeys<T, R> = {
  [P in keyof T]: R extends T[P] ? P : T[P] extends R ? P : never;
}[keyof T];

export type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export type DefaultStyle = Partial<Pick<Context, PickKeys<Context, string | number | boolean>>> & {
  lineDash?: Iterable<number>;
};

export function setStyle<T extends keyof DefaultStyle>(ctx: Context, key: T, value: DefaultStyle[T]) {
  if (value == null) return;
  if (key === 'lineDash') return ctx.setLineDash(value as number[]);
  // @ts-expect-error
  if (ctx[key] !== value) ctx[key] = value;
}
