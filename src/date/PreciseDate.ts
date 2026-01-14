import { format } from './format';

type NumberLike = { valueOf: () => number } | number;
function toNanoseconds(ms: NumberLike) {
  return BigInt(ms.valueOf()) * 1_000_000n;
}

type UnitTypeShort = 'us' | 'ns' | 'ms' | 's' | 'm' | 'h' | 'D' | 'M' | 'y' | 'd';
type UnitTypeLong =
  | 'nanosecond'
  | 'microsecond'
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year'
  | 'date';

export type UnitType = UnitTypeLong | `${UnitTypeLong}s` | UnitTypeShort;

type ValueUnitType = Exclude<UnitTypeLong, 'date'> | 'dayOfWeek';

const unitMap = new Map<ValueUnitType, UnitType[]>([
  ['year', ['y', 'year', 'years']],
  ['month', ['M', 'month', 'months']],
  ['day', ['D', 'date', 'dates']],
  ['hour', ['h', 'hour', 'hours']],
  ['minute', ['m', 'minute', 'minutes']],
  ['second', ['s', 'second', 'seconds']],
  ['millisecond', ['ms', 'millisecond', 'milliseconds']],
  ['microsecond', ['us', 'microsecond', 'microseconds']],
  ['nanosecond', ['ns', 'nanosecond', 'nanoseconds']],
  ['dayOfWeek', ['d', 'day', 'days']],
]);

export type ManipulateType = Exclude<UnitType, 'D' | 'date' | 'dates'>;
type ValueManipulateType = `${Exclude<UnitTypeLong, 'date'>}s`;

const manipulateMap = new Map<ValueManipulateType, ManipulateType[]>([
  ['years', ['y', 'year', 'years']],
  ['months', ['M', 'month', 'months']],
  ['days', ['d', 'day', 'days']],
  ['hours', ['h', 'hour', 'hours']],
  ['minutes', ['m', 'minute', 'minutes']],
  ['seconds', ['s', 'second', 'seconds']],
  ['milliseconds', ['ms', 'millisecond', 'milliseconds']],
  ['microseconds', ['us', 'microsecond', 'microseconds']],
  ['nanoseconds', ['ns', 'nanosecond', 'nanoseconds']],
]);

function toValueType<Type, ValueType>(
  unit: NoInfer<Type>,
  map: Map<ValueType, readonly Type[]>
): ValueType | undefined {
  const iterator = map.entries();
  while (true) {
    const next = iterator.next();
    if (next.done) return;
    const [key, list] = next.value;
    if (list.includes(unit)) return key;
  }
}

const defaultFormat = Intl.DateTimeFormat().resolvedOptions();

function divideWithCeil(dividend: bigint, divisor: bigint) {
  if (divisor === 0n) throw new RangeError('Cannot divide by zero');
  return (dividend + divisor - 1n) / divisor;
}

export type PreciseDateInput = bigint | { valueOf: () => bigint };

export class PreciseDate {
  #value: Temporal.ZonedDateTime;

  constructor(nanoseconds: PreciseDateInput) {
    this.#value = new Temporal.ZonedDateTime(nanoseconds.valueOf(), defaultFormat.timeZone);
  }

  static from(dateTime: Temporal.ZonedDateTime | Temporal.Instant | NumberLike) {
    if (dateTime instanceof Temporal.ZonedDateTime || dateTime instanceof Temporal.Instant)
      return new PreciseDate(dateTime.epochNanoseconds);
    return new PreciseDate(toNanoseconds(dateTime));
  }

  get [Symbol.toStringTag]() {
    return 'PreciseDate';
  }

  utcOffset() {
    return this.#value.offsetNanoseconds;
  }

  format(template: string) {
    return format(this.#value, defaultFormat.locale, template);
  }

  get(unit: UnitType) {
    const type = toValueType(unit, unitMap);
    if (!type) throw new Error(`Unsupported unit: ${unit}`);
    return this.#value[type];
  }

  set(unit: UnitType, value: number) {
    const type = toValueType(unit, unitMap);
    if (!type) throw new Error(`Unsupported unit: ${unit}`);
    if (type === 'dayOfWeek') {
      return PreciseDate.from(this.#value.add({ days: value - this.#value.dayOfWeek }));
    }
    return PreciseDate.from(this.#value.with({ [type]: value }));
  }

  add(value: number, unit: ManipulateType) {
    const type = toValueType(unit, manipulateMap);
    if (!type) throw new Error(`Unsupported unit: ${unit}`);
    return PreciseDate.from(this.#value.add({ [type]: value }, { overflow: 'reject' }));
  }

  subtract(value: number, unit: ManipulateType) {
    const type = toValueType(unit, manipulateMap);
    if (!type) throw new Error(`Unsupported unit: ${unit}`);
    return PreciseDate.from(this.#value.subtract({ [type]: value }, { overflow: 'reject' }));
  }

  isDivisibleBy(divisor: number) {
    return (this.valueOf() + BigInt(this.utcOffset())) % toNanoseconds(divisor) === 0n;
  }

  endOf(value: number) {
    if (value === 0) return new PreciseDate(this);
    const offset = BigInt(this.utcOffset());
    const nanoValue = toNanoseconds(value);
    return new PreciseDate(divideWithCeil(this.valueOf() + offset, nanoValue) * nanoValue - offset);
  }

  valueOf() {
    return this.#value.epochNanoseconds;
  }

  toString() {
    return this.#value.toString();
  }

  toLocaleString(locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
    return this.#value.toLocaleString(locales, options);
  }

  toJSON() {
    return this.#value.toJSON();
  }
}
