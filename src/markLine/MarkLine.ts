/* eslint-disable max-classes-per-file */
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

export interface MarkLinePlugin {
  readonly unit: UnitType;
  readonly increment: number;
  draw(x: number, current: PreciseDate): void;
}

export abstract class MarkLine implements MarkLinePlugin {
  static SMALL = 12;

  static MIDDLE = 20;

  static LARGE = 36;

  timeAxis: TimeAxis;

  /** 每一刻度线代表的时长, 单位: 毫秒 */
  abstract readonly unit: UnitType;
  abstract readonly increment: number;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
  }

  /** 标准基础值, 用于 MarkLine 之间的比较 */
  get base() {
    // 标准基础值, 依此基础进行浮动
    return Number(new PreciseDate(0n).add(this.increment, this.unit).valueOf());
  }

  get spacing() {
    return this.timeAxis.spacing;
  }

  drawMarkLine(x: number, y: number, length: number) {
    this.timeAxis.context.strokeStyle = this.timeAxis.theme.axis.tickColor;
    const context = this.timeAxis.context;
    context.beginPath();
    context.moveTo(x, this.timeAxis.baseline + y);
    context.lineTo(x, this.timeAxis.baseline + y + length);
    context.stroke();
  }

  fillText(text: string, x: number, y: 'top' | 'bottom' | number) {
    const context = this.timeAxis.context;
    context.fillStyle = this.timeAxis.theme.axis.labelColor;
    const posY = typeof y === 'number' ? y : y === 'top' ? -8 : MarkLine.LARGE + 12;
    this.timeAxis.context.fillText(text, x, this.timeAxis.baseline + posY);
  }

  abstract draw(x: number, current: PreciseDate): void;
}

/** 1 year */
export class MarkLineYear1 extends MarkLine {
  readonly unit = 'year';
  readonly increment = 1;

  draw(x: number, current: PreciseDate): void {
    const year = current.get('year');
    if (year % 10 === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (year % 5 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }
    const spacing = this.spacing;
    if ((spacing > 10 && year % 10 === 0) || (spacing > 4 ? year % 50 === 0 : year % 100 === 0)) {
      this.fillText(current.format('YYYY'), x, 'top');
    }

    if ((spacing > 12 && year % 5 === 0) || (spacing > 6 ? year % 10 === 0 : year % 20 === 0)) {
      this.fillText(current.format('YYYY'), x, 'bottom');
    }
  }
}

/** 1 month */
export class MarkLineMonth1 extends MarkLine {
  readonly unit = 'month';
  readonly increment = 1;

  draw(x: number, current: PreciseDate): void {
    // day 是从 1 开始
    const month = current.get('month');
    if (month === 1) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (month === 7) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    const year = current.get('year');
    const spacing = this.spacing;

    if (month === 1) {
      if (spacing > 12 || (spacing > 4 ? year % 5 === 0 : year % 10 === 0)) {
        this.fillText(current.format('YYYY'), x, 'top');
      }
    }

    if (
      (spacing > 24 && month % 3 === 1) ||
      (spacing > 8 && month % 6 === 1) ||
      (spacing > 4 ? month % 12 === 1 : year % 2 === 0 && month % 12 === 1)
    ) {
      this.fillText(current.format('MM'), x, 'bottom');
    }
  }
}

/** 1 day */
export class MarkLineDay1 extends MarkLine {
  readonly unit = 'day';
  readonly increment = 1;

  draw(x: number, current: PreciseDate): void {
    // day 是从 1 开始
    const day = current.get('date');
    if (day === 1) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (day % 5 === 1) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (day === 1) {
      if (this.spacing > 6 || current.get('month') % 3 === 0) {
        this.fillText(current.format('YYYY-MM'), x, 'top');
      }
    } else if (this.spacing > 16 && (day === 11 || day === 21)) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }
    const spacing = this.spacing;

    if (
      (spacing > 24 && (day === 1 || day % 5 === 1)) ||
      (spacing > 6 ? day === 1 || day === 11 || day === 21 : day === 1)
    ) {
      this.fillText(current.format('MM-DD'), x, 'bottom');
    }
  }
}

/** 1 hour */
export class MarkLineHour1 extends MarkLine {
  readonly unit = 'hour';
  readonly increment = 1;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const hour = current.get('hour');

    if (hour === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (hour % 4 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }
    const day = current.get('date');

    if (
      (spacing > 16 && hour % 12 === 0) ||
      (spacing > 8 && hour === 0) ||
      (spacing > 4 ? hour === 0 && day % 2 === 1 && day !== 31 : hour === 0 && day % 4 === 1)
    ) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (
      (spacing > 16 && hour % 4 === 0) ||
      (spacing > 8 && hour % 12 === 0) ||
      (spacing > 3 ? hour === 0 : hour === 0 && day % 2 === 1 && day !== 31)
    ) {
      this.fillText(current.format('HH:mm'), x, 'bottom');
    }
  }
}

/** 10 minutes */
export class MarkLineMinutes10 extends MarkLine {
  readonly unit = 'minute';
  readonly increment = 10;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const hour = current.get('hour');
    const minute = current.get('minute');
    if (hour % 6 === 0 && minute === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (minute === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (minute === 0) {
      if (
        (spacing > 12 && hour % 3 === 0) ||
        (spacing > 6 && hour % 6 === 0) ||
        (spacing > 4 ? hour % 12 === 0 : hour % 24 === 0)
      ) {
        this.fillText(current.format('YYYY-MM-DD'), x, 'top');
      }
    }

    if (minute === 0) {
      if (spacing > 16 || (spacing > 8 && hour % 1 === 0) || (spacing > 4 ? hour % 3 === 0 : hour % 6 === 0)) {
        this.fillText(current.format('HH:mm'), x, 'bottom');
      }
    }
  }
}

/** 1 minute */
export class MarkLineMinute1 extends MarkLine {
  readonly unit = 'minute';
  readonly increment = 1;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const minute = current.get('minute');
    const hour = current.get('hour');

    if (minute === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (minute % 10 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if ((spacing > 8 && minute % 30 === 0) || (spacing > 4 ? minute === 0 : minute === 0 && hour % 2 === 0)) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (spacing > 6 ? minute % 10 === 0 : minute % 30 === 0) {
      this.fillText(current.format('HH:mm'), x, 'bottom');
    }
  }
}

/** 10 seconds */
export class MarkLineSeconds10 extends MarkLine {
  readonly unit = 'second';
  readonly increment = 10;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const minute = current.get('minute');
    const second = current.get('second');
    if (second === 0 && minute % 5 === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (second === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (second === 0) {
      if ((spacing > 8 && minute % 5 === 0) || (spacing > 4 ? minute % 10 === 0 : minute % 20 === 0)) {
        this.fillText(current.format('YYYY-MM-DD'), x, 'top');
      }
    }

    if (second === 0) {
      if (spacing > 8 || minute % 5 === 0) {
        this.fillText(current.format('HH:mm'), x, 'bottom');
      }
    }
  }
}

/** 1 second */
export class MarkLineSecond1 extends MarkLine {
  readonly unit = 'second';
  readonly increment = 1;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const second = current.get('second');
    if (second === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (second % 10 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if ((spacing > 16 && second % 10 === 0) || (spacing > 8 ? second % 30 === 0 : second === 0)) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (spacing > 6 ? second % 10 === 0 : second % 30 === 0) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 100 milliseconds */
export class MarkLineMillseconds100 extends MarkLine {
  readonly unit = 'millisecond';
  readonly increment = 100;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const millisecond = current.get('millisecond');
    const second = current.get('second');
    if (millisecond === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (millisecond % 500 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (millisecond === 0) {
      if (spacing > 16 || (spacing > 4 ? second % 5 === 0 : second % 10 === 0)) {
        this.fillText(current.format('YYYY-MM-DD HH:mm'), x, 'top');
      }
    }

    if (
      (spacing > 12 && millisecond % 500 === 0) ||
      (spacing > 6 ? millisecond === 0 : millisecond === 0 && second % 2 === 0)
    ) {
      this.fillText(current.format('ss.S'), x, 'bottom');
    }
  }
}

/** 10 milliseconds */
export class MarkLineMillseconds10 extends MarkLine {
  readonly unit = 'millisecond';
  readonly increment = 10;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const millisecond = current.get('millisecond');

    if (millisecond % 100 === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (millisecond % 50 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if ((spacing > 16 && millisecond % 100 === 0) || (spacing > 4 ? millisecond % 500 === 0 : millisecond === 0)) {
      this.fillText(current.format('YYYY-MM-DD HH:mm'), x, 'top');
    }

    if ((spacing > 12 && millisecond % 50 === 0) || (spacing > 6 ? millisecond % 100 === 0 : millisecond % 500 === 0)) {
      this.fillText(current.format('ss.SS'), x, 'bottom');
    }
  }
}

/** 1 millisecond */
export class MarkLineMillsecond1 extends MarkLine {
  readonly unit = 'millisecond';
  readonly increment = 1;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const millisecond = current.get('millisecond');

    if (millisecond % 10 === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (millisecond % 5 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if ((spacing > 16 && millisecond % 10 === 0) || (spacing > 4 ? millisecond % 50 === 0 : millisecond % 100 === 0)) {
      this.fillText(current.format('YYYY-MM-DD HH:mm'), x, 'top');
    }

    if (
      spacing > 60 ||
      (spacing > 12 && millisecond % 5 === 0) ||
      (spacing > 6 ? millisecond % 10 === 0 : millisecond % 50 === 0)
    ) {
      this.fillText(current.format('ss.SSS'), x, 'bottom');
    }
  }
}

export const presetMarkLines = [
  MarkLineYear1,
  MarkLineMonth1,
  MarkLineDay1,
  MarkLineHour1,
  MarkLineMinutes10,
  MarkLineMinute1,
  MarkLineSeconds10,
  MarkLineSecond1,
  MarkLineMillseconds100,
  MarkLineMillseconds10,
  MarkLineMillsecond1,
];
