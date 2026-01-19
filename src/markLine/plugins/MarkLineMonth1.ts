import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 1 month */
export class MarkLineMonth1 extends MarkLine {
  readonly unit = 'month';
  readonly increment = 1;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY') : date.format('MM');
  }

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
        this.fillText(current, x, 'primary');
      }
    }

    if (
      (spacing > 24 && month % 3 === 1) ||
      (spacing > 8 && month % 6 === 1) ||
      (spacing > 4 ? month % 12 === 1 : year % 2 === 0 && month % 12 === 1)
    ) {
      this.fillText(current, x, 'secondary');
    }
  }
}
