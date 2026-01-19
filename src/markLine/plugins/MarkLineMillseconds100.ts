import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 100 milliseconds */
export class MarkLineMillseconds100 extends MarkLine {
  readonly unit = 'millisecond';
  readonly increment = 100;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM-DD HH:mm:ss') : date.format('ss.S');
  }

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
        this.fillText(current, x, 'primary');
      }
    }

    if (
      (spacing > 12 && millisecond % 500 === 0) ||
      (spacing > 6 ? millisecond === 0 : millisecond === 0 && second % 2 === 0)
    ) {
      this.fillText(current, x, 'secondary');
    }
  }
}
