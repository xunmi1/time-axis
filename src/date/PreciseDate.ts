import { format } from './format';

type NumberLike = { valueOf: () => number } | number;

function toNanoseconds(ms: NumberLike) {
  const value = ms.valueOf();
  if (Number.isInteger(value)) return BigInt(value) * 1_000_000n;
  const intPart = Math.trunc(value);
  const fracPart = value - intPart;
  return BigInt(intPart) * 1_000_000n + BigInt(Math.trunc(fracPart * 1_000_000));
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

type ValueType = Exclude<UnitTypeLong, 'date'>;

type ValueUnitType = ValueType | 'dayOfWeek';

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
type ValueManipulateType = `${ValueType}s`;

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

export type PreciseDateInput = bigint | { valueOf: () => bigint };

export class PreciseDate {
  #value: Temporal.ZonedDateTime;

  constructor(nanoseconds: PreciseDateInput, timeZone = defaultFormat.timeZone) {
    this.#value = new Temporal.ZonedDateTime(nanoseconds.valueOf(), timeZone);
  }

  static from(dateTime: PreciseDate | Temporal.ZonedDateTime | Temporal.Instant | NumberLike) {
    if (dateTime instanceof PreciseDate) {
      return new PreciseDate(dateTime.#value.epochNanoseconds, dateTime.#value.timeZoneId);
    }
    if (dateTime instanceof Temporal.ZonedDateTime) {
      return new PreciseDate(dateTime.epochNanoseconds, dateTime.timeZoneId);
    }
    if (dateTime instanceof Temporal.Instant) {
      return new PreciseDate(dateTime.epochNanoseconds);
    }
    return new PreciseDate(toNanoseconds(dateTime));
  }

  get timeZoneId() {
    return this.#value.timeZoneId;
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
    // `Temporal.ZonedDateTime.add()` only accepts integer
    return PreciseDate.from(this.#value.add({ [type]: Math.trunc(value) }));
  }

  subtract(value: number, unit: ManipulateType) {
    const type = toValueType(unit, manipulateMap);
    if (!type) throw new Error(`Unsupported unit: ${unit}`);
    return PreciseDate.from(this.#value.subtract({ [type]: Math.trunc(value) }));
  }

  since(date: PreciseDate, unit: ManipulateType) {
    const type = toValueType(unit, manipulateMap);
    if (!type) throw new Error(`Unsupported unit: ${unit}`);
    return this.#value.since(date.#value, { largestUnit: type })[type];
  }

  endOf(value: number, unit: ValueType) {
    if (value === 0) return new PreciseDate(this);
    if (unit === 'year') {
      const year = Math.ceil(this.get('year') / value) * value;
      return PreciseDate.from(Temporal.ZonedDateTime.from({ year, month: 1, day: 1, timeZone: this.timeZoneId }));
    }
    if (unit === 'month') {
      const monthsInYear = this.#value.monthsInYear;
      if (value >= monthsInYear || monthsInYear % value !== 0) throw new RangeError('Invalid value');
      const month = Math.ceil(this.get('month') / value) * value;
      return PreciseDate.from(
        Temporal.ZonedDateTime.from({ year: this.get('year'), month: month, day: 1, timeZone: this.timeZoneId })
      );
    }
    return PreciseDate.from(this.#value.round({ roundingIncrement: value, smallestUnit: unit, roundingMode: 'ceil' }));
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

  get [Symbol.toStringTag]() {
    return 'PreciseDate';
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default') {
    if (hint === 'number') return this.valueOf();
    if (hint === 'string') return this.toString();
    return this.toString();
  }
}
