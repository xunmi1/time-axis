import type { TimeAxis } from '../TimeAxis';
import { PreciseDate } from '../date';

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
    const y1 = this.timeAxis.baseline + y;
    this.timeAxis.addShape({
      type: 'line',
      attrs: { x1: x, y1, x2: x, y2: y1 + length },
      style: { stroke: this.timeAxis.theme.axis.tickColor },
    });
  }

  fillText(date: PreciseDate, x: number, level: 'primary' | 'secondary') {
    const offsetY = level === 'primary' ? -8 : MarkLine.LARGE + 12;
    const text = this.formatter(date, level);

    this.timeAxis.addShape({
      type: 'text',
      attrs: { x, y: this.timeAxis.baseline + offsetY, text },
      style: { fill: this.timeAxis.theme.axis.labelColor },
    });
  }

  /** 每一刻度线代表的时长, 单位: 毫秒 */
  abstract readonly unit: UnitType;
  abstract readonly increment: number;
  abstract draw(x: number, current: PreciseDate): void;
  abstract formatter(date: PreciseDate, level: 'primary' | 'secondary'): string;
}
