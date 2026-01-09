import dayjs from 'dayjs';
import type { Dayjs, UnitType } from 'dayjs';
import { MINUTE, round } from './utils';

export class PreciseDate {
  #value: Dayjs;

  #decimal = 0;

  constructor(input: { valueOf: () => number }) {
    const value = input.valueOf();
    this.#value = dayjs(value);
    this.#decimal = value - this.#value.valueOf();
  }

  valueOf() {
    return this.#value.valueOf() + this.#decimal;
  }

  utcOffset() {
    return this.#value.utcOffset() * MINUTE;
  }

  format(template: string) {
    const decimal = this.#decimal;
    // `dayjs` 不支持超过三个 `S` 字符, 其代表比毫秒更低的单位, 需要进行补充
    return this.#value.format(template.replace(/(?<=S{3})(S+)/g, match => round(decimal, match.length)));
  }

  get(unit: UnitType) {
    return this.#value.get(unit);
  }

  set(unit: UnitType, value: number) {
    return new PreciseDate(this.#value.set(unit, value).valueOf() + this.#decimal);
  }

  isDivisibleBy(divisor: number) {
    return (this.valueOf() + this.utcOffset()) % divisor === 0;
  }
}
