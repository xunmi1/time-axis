import type { TimeAxis } from '../TimeAxis';
import { PreciseDate } from '../date';
import { Vector2D } from '../stage';

declare module '../theme' {
  export interface Theme {
    axis: {
      tickColor: string;
      labelColor: string;
    };
  }
}

export const unitTypes = ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'] as const;
type UnitType = (typeof unitTypes)[number];

export abstract class MarkLine {
  static SMALL = 12;

  static MIDDLE = 20;

  static LARGE = 36;

  timeAxis: TimeAxis;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
  }

  /** 标准基础值, 依此基础进行浮动, 用于 MarkLine 之间的比较 */
  get base() {
    return Number(new PreciseDate(0n).add(this.increment, this.unit).valueOf());
  }

  get spacing() {
    return this.timeAxis.spacing;
  }

  drawMarkLine(x: number, y: number, length: number) {
    const start = new Vector2D(x, this.timeAxis.baseline + y);
    this.timeAxis.addNode({
      type: 'line',
      attrs: { start, end: start.add(0, length) },
      style: { color: this.timeAxis.theme.axis.tickColor },
    });
  }

  fillText(date: PreciseDate, x: number, level: 'primary' | 'secondary') {
    const offsetY = level === 'primary' ? -8 : MarkLine.LARGE + 12;
    const text = this.formatter(date, level);
    this.timeAxis.addNode({
      type: 'text',
      attrs: { start: new Vector2D(x, this.timeAxis.baseline + offsetY), text },
      style: { color: this.timeAxis.theme.axis.labelColor },
    });
  }

  /** 每一刻度线代表的时长, 单位: 毫秒 */
  abstract readonly unit: UnitType;
  abstract readonly increment: number;
  abstract draw(x: number, current: PreciseDate): void;
  abstract formatter(date: PreciseDate, level: 'primary' | 'secondary'): string;
}
