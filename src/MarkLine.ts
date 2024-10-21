import type { TimeAxis } from './TimeAxis';
import type { PreciseDate } from './PreciseDate';
import { DAY, HOUR, MILLISECOND, MINUTE, SECOND } from './utils';

export abstract class MarkLine {
  static SMALL = 12;
  static MIDDLE = 20;
  static LARGE = 36;
  timeAxis: TimeAxis;

  /** 每一刻度线代表的时长, 单位: 毫秒 */
  abstract base: number;
  abstract draw(x: number, current: PreciseDate): void;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
  }

  get spacing() {
    return this.timeAxis.spacing;
  }

  drawMarkLine(x: number, y: number, length: number) {
    const context = this.timeAxis.context;
    context.beginPath();
    context.moveTo(x, this.timeAxis.baseline + y);
    context.lineTo(x, this.timeAxis.baseline + y + length);
    context.stroke();
  }

  fillText(text: string, x: number, y: number) {
    this.timeAxis.context.fillText(text, x, this.timeAxis.baseline + y);
  }

  /**
   * 是否是整点时间
   * @description 仅限对天及其以下的单位进行判断（因为年、月单位的分布不均）
   */
  isEvenly(date: PreciseDate, multiple: number) {
    return (date.valueOf() + date.utcOffset()) % multiple === 0;
  }
}

/** 1 day */
export class MarkLineDay1 extends MarkLine {
  base = DAY;

  draw(x: number, current: PreciseDate): void {
    // day 是从 1 开始
    const day = current.get('dates');
    if (day === 1) {
      if (this.spacing > 4 || current.get('months') % 3 === 0) {
        this.fillText(current.format('YYYY-MM'), x, -8);
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (day % 5 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (
      (this.spacing > 34 && (day === 1 || day % 5 === 0)) ||
      (this.spacing > 6 && (day === 1 || day === 10 || day === 20)) ||
      day === 1
    ) {
      this.fillText(current.format('MM-DD'), x, 48);
    }
  }
}

/** 1 hour */
export class MarkLineHour1 extends MarkLine {
  base = HOUR;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;

    if (this.isEvenly(current, DAY)) {
      if (spacing > 6 || current.get('dates') % 2 === 1) {
        this.fillText(current.format('YYYY-MM-DD'), x, -8);
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (this.isEvenly(current, HOUR * 4)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (this.isEvenly(current, HOUR * (spacing > 16 ? 4 : spacing > 7 ? 12 : spacing > 4 ? 24 : 48))) {
      this.fillText(current.format('HH:mm:ss'), x, 48);
    }
  }
}

/** 10 minutes */
export class MarkLineMinutes10 extends MarkLine {
  base = MINUTE * 10;

  draw(x: number, current: PreciseDate): void {
    if (this.isEvenly(current, HOUR * 12)) {
      this.fillText(current.format('YYYY-MM-DD'), x, -8);
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (this.isEvenly(current, HOUR)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (this.isEvenly(current, HOUR * (this.spacing > 12 ? 1 : 6))) {
      this.fillText(current.format('HH:mm:ss'), x, 48);
    }
  }
}

/** 1 minutes */
export class MarkLineMinute1 extends MarkLine {
  base = MINUTE;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;

    if (this.isEvenly(current, MINUTE * (spacing >= 6 ? 30 : 60))) {
      this.fillText(current.format('YYYY-MM-DD'), x, -8);
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (this.isEvenly(current, MINUTE * 10)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (spacing >= 4 && this.isEvenly(current, MINUTE * (spacing > 8 ? 10 : 30))) {
      this.fillText(current.format('HH:mm:ss'), x, 48);
    }
  }
}

/** 10 seconds */
export class MarkLineSeconds10 extends MarkLine {
  base = SECOND * 10;

  draw(x: number, current: PreciseDate): void {
    if (this.isEvenly(current, MINUTE * 10)) {
      this.fillText(current.format('YYYY-MM-DD'), x, -8);
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (this.isEvenly(current, MINUTE)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (this.isEvenly(current, MINUTE * (this.spacing > 12 ? 1 : 5))) {
      this.fillText(current.format('HH:mm:ss'), x, 48);
    }
  }
}

/** 1 seconds */
export class MarkLineSecond1 extends MarkLine {
  base = SECOND;

  draw(x: number, current: PreciseDate): void {
    if (this.isEvenly(current, MINUTE)) {
      this.fillText(current.format('YYYY-MM-DD'), x, -8);
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (this.isEvenly(current, SECOND * 10)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (this.isEvenly(current, MINUTE * (this.spacing > 8 ? 10 : 30))) {
      this.fillText(current.format('HH:mm:ss'), x, 48);
    }
  }
}

/** 100 milliseconds */
export class MarkLineMillseconds100 extends MarkLine {
  base = MILLISECOND * 100;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    if (this.isEvenly(current, MILLISECOND * 1000)) {
      if (spacing > 22 || current.get('seconds') % 5 === 0) {
        this.fillText(current.format('YYYY-MM-DD HH:mm:ss'), x, -8);
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (this.isEvenly(current, MILLISECOND * 500)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (this.isEvenly(current, MILLISECOND * (spacing > 22 ? 500 : spacing > 10 ? 1000 : 2000))) {
      this.fillText(current.format('HH:mm:ss.SSS'), x, 48);
    }
  }
}

/** 10 milliseconds */
export class MarkLineMillseconds10 extends MarkLine {
  base = MILLISECOND * 10;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    if (this.isEvenly(current, MILLISECOND * 100)) {
      if (spacing > 22 || current.get('milliseconds') % 500 === 0) {
        this.fillText(current.format('YYYY-MM-DD HH:mm:ss'), x, -8);
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (this.isEvenly(current, MILLISECOND * 50)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (this.isEvenly(current, MILLISECOND * (spacing > 22 ? 50 : spacing > 10 ? 100 : 200))) {
      this.fillText(current.format('HH:mm:ss.SSS'), x, 48);
    }
  }
}

/** 1 milliseconds */
export class MarkLineMillsecond1 extends MarkLine {
  base = MILLISECOND;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    if (this.isEvenly(current, MILLISECOND * 10)) {
      if (spacing > 22 || current.get('milliseconds') % 50 === 0) {
        this.fillText(current.format('YYYY-MM-DD HH:mm:ss'), x, -8);
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (this.isEvenly(current, MILLISECOND * 5)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (this.isEvenly(current, MILLISECOND * (spacing > 22 ? 5 : spacing > 10 ? 10 : 20))) {
      this.fillText(current.format('HH:mm:ss.SSS'), x, 48);
    }
  }
}
