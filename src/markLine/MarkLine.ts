/* eslint-disable max-classes-per-file */
import type { TimeAxis } from '../TimeAxis';
import type { PreciseDate } from '../date';
import { DAY, HOUR, MILLISECOND, MINUTE, SECOND } from '../utils';

declare module '../theme' {
  export interface Theme {
    axis: {
      lineColor: string;
      tickColor: string;
      labelColor: string;
    };
  }
}

export interface MarkLinePlugin {
  base: number;
  draw(x: number, current: PreciseDate): void;
}

export abstract class MarkLine implements MarkLinePlugin {
  static SMALL = 12;

  static MIDDLE = 20;

  static LARGE = 36;

  timeAxis: TimeAxis;

  /** 每一刻度线代表的时长, 单位: 毫秒 */
  abstract base: number;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
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
    this.timeAxis.context.fillStyle = this.timeAxis.theme.axis.labelColor;
    const posY = typeof y === 'number' ? y : y === 'top' ? -8 : MarkLine.LARGE + 12;
    this.timeAxis.context.fillText(text, x, this.timeAxis.baseline + posY);
  }

  abstract draw(x: number, current: PreciseDate): void;
}

/** 1 day */
export class MarkLineDay1 extends MarkLine {
  base = DAY;

  draw(x: number, current: PreciseDate): void {
    // day 是从 1 开始
    const day = current.get('dates');
    if (day === 1) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (day % 5 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (day === 1) {
      if (this.spacing > 6 || current.get('months') % 3 === 0) {
        this.fillText(current.format('YYYY-MM'), x, 'top');
      }
    } else if (this.spacing > 16 && (day === 10 || day === 20)) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (
      (this.spacing > 24 && (day === 1 || day % 5 === 0)) ||
      (this.spacing > 6 && (day === 1 || day === 10 || day === 20)) ||
      day === 1
    ) {
      this.fillText(current.format('MM-DD'), x, 'bottom');
    }
  }
}

/** 1 hour */
export class MarkLineHour1 extends MarkLine {
  base = HOUR;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;

    if (current.isDivisibleBy(DAY)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(HOUR * 4)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(HOUR * (spacing > 16 ? 12 : spacing > 8 ? 24 : spacing > 4 ? 48 : 96))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(HOUR * (spacing > 16 ? 4 : spacing > 7 ? 12 : spacing > 4 ? 24 : 48))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 10 minutes */
export class MarkLineMinutes10 extends MarkLine {
  base = MINUTE * 10;

  draw(x: number, current: PreciseDate): void {
    if (current.isDivisibleBy(HOUR * 6)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(HOUR)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(HOUR * (this.spacing > 8 ? 6 : 12))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(HOUR * (this.spacing > 16 ? 1 : this.spacing > 6 ? 3 : 6))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 1 minute */
export class MarkLineMinute1 extends MarkLine {
  base = MINUTE;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;

    if (current.isDivisibleBy(MINUTE * 120)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(MINUTE * 10)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(MINUTE * (spacing > 8 ? 30 : spacing > 4 ? 60 : 120))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(MINUTE * (spacing > 8 ? 10 : spacing > 4 ? 30 : 60))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 10 seconds */
export class MarkLineSeconds10 extends MarkLine {
  base = SECOND * 10;

  draw(x: number, current: PreciseDate): void {
    if (current.isDivisibleBy(MINUTE * 20)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(MINUTE)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(MINUTE * (this.spacing > 8 ? 5 : this.spacing > 4 ? 10 : 20))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(MINUTE * (this.spacing > 12 ? 1 : this.spacing > 4 ? 5 : 10))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 1 second */
export class MarkLineSecond1 extends MarkLine {
  base = SECOND;

  draw(x: number, current: PreciseDate): void {
    if (current.isDivisibleBy(MINUTE)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(SECOND * 10)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(SECOND * (this.spacing > 16 ? 10 : this.spacing > 8 ? 30 : 60))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(SECOND * (this.spacing > 8 ? 10 : this.spacing > 4 ? 30 : 60))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 100 milliseconds */
export class MarkLineMillseconds100 extends MarkLine {
  base = MILLISECOND * 100;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    if (current.isDivisibleBy(SECOND)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(MILLISECOND * 500)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(SECOND * (spacing > 16 ? 1 : spacing > 4 ? 5 : 10))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(MILLISECOND * (spacing > 20 ? 500 : spacing > 8 ? 1000 : 5000))) {
      this.fillText(current.format('HH:mm:ss.SSS'), x, 'bottom');
    }
  }
}

/** 10 milliseconds */
export class MarkLineMillseconds10 extends MarkLine {
  base = MILLISECOND * 10;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    if (current.isDivisibleBy(MILLISECOND * 100)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(MILLISECOND * 50)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(MILLISECOND * (spacing > 16 ? 100 : spacing > 4 ? 500 : 1000))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(MILLISECOND * (spacing > 20 ? 50 : spacing > 8 ? 100 : 500))) {
      this.fillText(current.format('HH:mm:ss.SSS'), x, 'bottom');
    }
  }
}

/** 1 millisecond */
export class MarkLineMillsecond1 extends MarkLine {
  base = MILLISECOND;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    if (current.isDivisibleBy(MILLISECOND * 10)) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(MILLISECOND * 5)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (
      current.isDivisibleBy(
        MILLISECOND * (spacing > 200 ? 1 : spacing > 50 ? 5 : spacing > 16 ? 10 : spacing > 4 ? 50 : 100)
      )
    ) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
    }

    if (current.isDivisibleBy(MILLISECOND * (spacing > 100 ? 1 : spacing > 20 ? 5 : spacing > 10 ? 10 : 50))) {
      this.fillText(current.format('HH:mm:ss.SSS'), x, 'bottom');
    }
  }
}

export const presetMarkLines = [
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
