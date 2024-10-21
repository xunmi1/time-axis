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

export function round(value: number, digits = 0) {
  return Math.floor(value * 10 ** digits)
    .toString()
    .padStart(digits, '0');
}
