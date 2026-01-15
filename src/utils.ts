/** 1 millisecond */
export const MILLISECOND = 1;
/** 1 second */
export const SECOND = 1000 * MILLISECOND;
/** 1 minute */
export const MINUTE = 60 * SECOND;
/** 1 hour */
export const HOUR = 60 * MINUTE;
/** 1 day */
export const DAY = 24 * HOUR;

/**
 * `Promise.withResolvers` polyfill
 */
export function withResolvers<T>() {
  if (Promise.withResolvers != null) return Promise.withResolvers<T>();
  let resolve: PromiseWithResolvers<T>['resolve'];
  let reject: PromiseWithResolvers<T>['reject'];
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  // @ts-expect-error
  return { promise, resolve, reject };
}

type Numeric = number | bigint;

export function inRange<T extends Numeric>(value: T, min: T, max: T) {
  return value >= min && value <= max;
}

export function clamp<T extends Numeric>(value: T, min: T, max: T) {
  return value < min ? min : value > max ? max : value;
}

/** Bind method to `this` (class method decorator) */
export function bound<This, Args extends unknown[], Return>(
  method: (this: This, ...args: Args) => Return,
  ctx: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const methodName = ctx.name;
  if (ctx.static || ctx.kind !== 'method') {
    throw new TypeError(`Cannot bound ${ctx.kind} '${String(methodName)}'`);
  }
  if (ctx.metadata[methodName]) return;
  ctx.metadata[methodName] = true;

  if (ctx.private) {
    ctx.addInitializer(function () {
      ctx.metadata.instance ??= this;
    });
    return function (...args: Args) {
      return method.call(ctx.metadata.instance as This, ...args);
    };
  } else {
    ctx.addInitializer(function () {
      // @ts-expect-error
      this[methodName] = method.bind(this);
    });
  }
}
