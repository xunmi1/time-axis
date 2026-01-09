import type { PreciseDate } from '../PreciseDate';
import { DAY, HOUR, MILLISECOND, MINUTE, SECOND } from '../utils';

import { MarkLine } from './MarkLine';

/** 1 day */
export class MarkLineDay1 extends MarkLine {
  base = DAY;

  draw(x: number, current: PreciseDate): void {
    // day 是从 1 开始
    const day = current.get('dates');
    if (day === 1) {
      if (this.spacing > 4 || current.get('months') % 3 === 0) {
        this.fillText(current.format('YYYY-MM'), x, 'top');
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
      if (spacing > 6 || current.get('dates') % 2 === 1) {
        this.fillText(current.format('YYYY-MM-DD'), x, 'top');
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (current.isDivisibleBy(HOUR * 4)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
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
    if (current.isDivisibleBy(HOUR * 12)) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(HOUR)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(HOUR * (this.spacing > 12 ? 1 : 6))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 1 minute */
export class MarkLineMinute1 extends MarkLine {
  base = MINUTE;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;

    if (current.isDivisibleBy(MINUTE * (spacing >= 6 ? 30 : 60))) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(MINUTE * 10)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (spacing >= 4 && current.isDivisibleBy(MINUTE * (spacing > 8 ? 10 : 30))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 10 seconds */
export class MarkLineSeconds10 extends MarkLine {
  base = SECOND * 10;

  draw(x: number, current: PreciseDate): void {
    if (current.isDivisibleBy(MINUTE * 10)) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(MINUTE)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(MINUTE * (this.spacing > 12 ? 1 : 5))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 1 second */
export class MarkLineSecond1 extends MarkLine {
  base = SECOND;

  draw(x: number, current: PreciseDate): void {
    if (current.isDivisibleBy(MINUTE)) {
      this.fillText(current.format('YYYY-MM-DD'), x, 'top');
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (current.isDivisibleBy(SECOND * 10)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(SECOND * (this.spacing > 8 ? 10 : 30))) {
      this.fillText(current.format('HH:mm:ss'), x, 'bottom');
    }
  }
}

/** 100 milliseconds */
export class MarkLineMillseconds100 extends MarkLine {
  base = MILLISECOND * 100;

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    if (current.isDivisibleBy(MILLISECOND * 1000)) {
      if (spacing > 22 || current.isDivisibleBy(MILLISECOND * 5000)) {
        this.fillText(current.format('YYYY-MM-DD HH:mm:ss'), x, 'top');
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (current.isDivisibleBy(MILLISECOND * 500)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(MILLISECOND * (spacing > 22 ? 500 : spacing > 10 ? 1000 : 2000))) {
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
      if (spacing > 22 || current.isDivisibleBy(MILLISECOND * 500)) {
        this.fillText(current.format('YYYY-MM-DD HH:mm:ss'), x, 'top');
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (current.isDivisibleBy(MILLISECOND * 50)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(MILLISECOND * (spacing > 22 ? 50 : spacing > 10 ? 100 : 200))) {
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
      if (spacing > 22 || current.isDivisibleBy(MILLISECOND * 50)) {
        this.fillText(current.format('YYYY-MM-DD HH:mm:ss'), x, 'top');
        this.drawMarkLine(x, -4, MarkLine.LARGE);
      } else {
        this.drawMarkLine(x, 0, MarkLine.LARGE - 4);
      }
    } else if (current.isDivisibleBy(MILLISECOND * 5)) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (current.isDivisibleBy(MILLISECOND * (spacing > 22 ? 5 : spacing > 10 ? 10 : 20))) {
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
